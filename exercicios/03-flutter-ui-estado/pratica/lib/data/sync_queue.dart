// lib/data/sync_queue.dart
//
// FILA DE SINCRONIZAÇÃO — escritas feitas offline ficam guardadas e são enviadas na volta da rede.
//
// TASK 15: regras de conflito do enqueue() e o flush().
// Os testes estão em test/offline_test.dart (NÃO edite).
import 'dart:convert';
import 'key_value_store.dart';

/// Uma operação pendente: "favoritar" (add=true) ou "desfavoritar" (add=false) um filme.
class PendingOp {
  final String id; // único por operação (ex.: timestamp + movieId)
  final int movieId;
  final bool add;
  const PendingOp({required this.id, required this.movieId, required this.add});

  Map<String, dynamic> toJson() => {'id': id, 'movieId': movieId, 'add': add};
  factory PendingOp.fromJson(Map<String, dynamic> j) =>
      PendingOp(id: j['id'] as String, movieId: j['movieId'] as int, add: j['add'] as bool);
}

class SyncQueue {
  static const queueKey = 'sync_queue_v1';
  final KeyValueStore store;
  SyncQueue(this.store);

  // ── PRONTO: ler e gravar a fila no armário ───────────────────────────────────────────
  Future<List<PendingOp>> pending() async {
    final raw = await store.read(queueKey);
    if (raw == null) return [];
    return (json.decode(raw) as List)
        .map((e) => PendingOp.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> _save(List<PendingOp> ops) =>
      store.write(queueKey, json.encode(ops.map((o) => o.toJson()).toList()));

  Future<void> enqueue(PendingOp op) async {
    final ops = await pending();

    // (pronto) idempotente: o mesmo id nunca entra duas vezes.
    if (ops.any((o) => o.id == op.id)) return;

    // ── TASK 15a · regras de conflito ────────────────────────────────────────────────────
    // A fila nunca guarda mais de uma operação por filme (as regras abaixo garantem isso),
    // então basta olhar a pendente do mesmo filme, se houver.
    final i = ops.indexWhere((o) => o.movieId == op.movieId);
    if (i != -1) {
      if (ops[i].add == op.add) return; // mesma ação: já está na fila, não duplica
      // ação oposta (add × remove): uma desfaz a outra → o servidor nem precisa saber.
      // Remove só a antiga; a ordem das operações dos OUTROS filmes fica intacta.
      ops.removeAt(i);
      await _save(ops);
      return;
    }

    ops.add(op); // (pronto) sem conflito: vai pro fim da fila
    await _save(ops);
  }

  // ── TASK 15b — flush ─────────────────────────────────────────────────────────────────
  // Envia NA ORDEM. A cada sucesso remove da fila E persiste (se o app fechar no meio, o que
  // já foi não é reenviado). No 1º erro para: o resto fica na fila, na mesma ordem, e o erro
  // NÃO sobe (a próxima volta da rede tenta de novo). Devolve quantas foram enviadas.
  Future<int> flush(Future<void> Function(PendingOp op) send) async {
    final ops = await pending();
    var sent = 0;
    while (ops.isNotEmpty) {
      try {
        await send(ops.first);
      } catch (_) {
        break; // para no 1º erro — não pula para a próxima (manteria a ordem errada no servidor)
      }
      ops.removeAt(0);
      sent++;
      await _save(ops); // persiste a cada sucesso
    }
    return sent;
  }
}

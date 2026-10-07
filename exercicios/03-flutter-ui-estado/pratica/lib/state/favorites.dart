// lib/state/favorites.dart
//
// Ex2 (TASK 2): estado compartilhado de favoritos com Riverpod (local).
// Ex4 (TASK 7): mesmo provider, mas sincronizado com Firestore (cloud).

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart'; // debugPrint
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ── Ex2 · TASK 2 (local) → Ex4 · TASK 7 (Firestore) ─────────────────────────────────────────────
// Mesma interface do TASK 2 (Set<int> + toggle/clear), mas a fonte de verdade agora é o documento
// `favorites/meus-favoritos` no Firestore. A UI continua igual: só lê/escreve o provider.
const _favDoc = 'favorites/meus-favoritos'; // 1 documento por aluno (seu projeto = seu Firestore)

class FavoritesNotifier extends Notifier<Set<int>> {
  @override
  Set<int> build() {
    _load(); // dispara a leitura async; o state começa vazio até o Firestore responder
    return {};
  }

  Future<void> _load() async {
    try {
      final doc = await FirebaseFirestore.instance.doc(_favDoc).get();
      // `as num` + toInt(): na web os números chegam do JS e podem não ser `int` em Dart
      final ids = (doc.data()?['ids'] as List<dynamic>?)?.map((e) => (e as num).toInt()) ?? const <int>[];
      state = ids.toSet();
    } catch (e) {
      // offline sem cache, ou `flutter test` ("No Firebase App" — esperado): mantém vazio.
      // `permission-denied` = revise as REGRAS do Firestore.
      debugPrint('Firestore (ler): $e');
    }
  }

  Future<void> _persist(Set<int> next) async {
    try {
      await FirebaseFirestore.instance.doc(_favDoc).set({'ids': next.toList()});
    } catch (e) {
      // offline, ou `flutter test` — o estado local (otimista) já refletiu a mudança na UI.
      debugPrint('Firestore (gravar): $e');
    }
  }

  // estado imutável: cria um NOVO Set a cada mudança (é a troca de objeto que notifica a UI)
  void toggle(int id) {
    final next = state.contains(id) ? ({...state}..remove(id)) : {...state, id};
    state = next; // UI reage na hora (otimista)
    _persist(next); // grava no Firestore em paralelo
  }

  void clear() {
    state = {}; // usado pelo botão "limpar" (TASK 6)
    _persist({});
  }
}

final favoritesProvider =
    NotifierProvider<FavoritesNotifier, Set<int>>(FavoritesNotifier.new);

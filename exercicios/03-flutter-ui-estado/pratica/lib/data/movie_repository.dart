// lib/data/movie_repository.dart
//
// O REPOSITÓRIO é a "fonte da verdade" da lista de filmes: a UI nunca fala com a API direto.
// Offline-first = a tela mostra o que tem NO APARELHO primeiro e atualiza quando a rede deixa.
//
// TASK 13 (🧑‍💻 EM CASA · médio): cache-first — emitir o cache e, em seguida, o dado fresco.
// TASK 14 (🧑‍💻 EM CASA · médio): validade do cache (TTL) — não buscar de novo se ainda está fresco.
//
// Os testes estão em test/offline_test.dart (NÃO edite). Rode: flutter test test/offline_test.dart
import 'dart:convert';
import '../models/movie.dart';
import 'key_value_store.dart';
import 'remote_movie_source.dart';

/// Cache salvo no aparelho: a lista + QUANDO foi salva.
class CacheEntry {
  final DateTime savedAt;
  final List<Movie> movies;
  const CacheEntry(this.savedAt, this.movies);
}

enum CacheStatus { none, fresh, stale }

class MovieRepository {
  static const cacheKey = 'movies_cache_v1';

  final MovieSource remote;
  final KeyValueStore store;
  final Duration ttl; // quanto tempo o cache é considerado "fresco"
  final DateTime Function() now; // relógio injetável (os testes usam um relógio falso)

  MovieRepository({
    required this.remote,
    required this.store,
    this.ttl = const Duration(minutes: 10),
    DateTime Function()? now,
  }) : now = now ?? DateTime.now;

  // ── PRONTO: ler e gravar o cache (usa Movie.toJson/fromJson da TASK 12) ──────────────
  Future<CacheEntry?> readCache() async {
    final raw = await store.read(cacheKey);
    if (raw == null) return null;
    try {
      final j = json.decode(raw) as Map<String, dynamic>;
      return CacheEntry(
        DateTime.parse(j['savedAt'] as String),
        (j['movies'] as List).map((m) => Movie.fromJson(m as Map<String, dynamic>)).toList(),
      );
    } catch (_) {
      return null; // cache corrompido = como se não existisse
    }
  }

  Future<void> writeCache(List<Movie> movies) => store.write(
        cacheKey,
        json.encode({
          'savedAt': now().toIso8601String(),
          'movies': movies.map((m) => m.toJson()).toList(),
        }),
      );

  // ── TASK 14 — validade do cache (TTL) ───────────────────────────────────────────────
  //   none  → não há cache;
  //   fresh → salvo há MENOS que `ttl`;
  //   stale → mais velho que `ttl` (ou exatamente `ttl`: com ttl = 0 o cache nunca é fresco).
  // Usa `now()` (não DateTime.now()): é o que deixa o teste controlar o relógio.
  Future<CacheStatus> cacheStatus() async {
    final cache = await readCache();
    if (cache == null) return CacheStatus.none;
    final age = now().difference(cache.savedAt);
    return age < ttl ? CacheStatus.fresh : CacheStatus.stale;
  }

  // ── TASK 13 — cache-first (stale-while-revalidate) + TASK 14 (não revalida se fresco) ──
  //   1. emite o cache NA HORA (a tela não espera a rede);
  //   2. cache fresco → para aqui, sem chamar a API;
  //   3. senão busca na API; deu certo → grava e emite o fresco;
  //   4. OfflineException: com cache, engole (a tela segue com o cache);
  //      sem cache, deixa subir (a tela mostra "sem dados").
  Stream<List<Movie>> watchMovies() async* {
    final cache = await readCache();
    if (cache != null) {
      yield cache.movies;
      if (await cacheStatus() == CacheStatus.fresh) return;
    }

    try {
      final fresh = await remote.fetchMovies();
      await writeCache(fresh);
      yield fresh;
    } on OfflineException {
      if (cache == null) rethrow;
    }
  }
}

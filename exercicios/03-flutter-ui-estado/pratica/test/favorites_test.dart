// Ex3 · TASK 9 — teste unitário do `favoritesProvider` ISOLADO (sem UI) com ProviderContainer.
// ProviderContainer = um "mini-app" só com os providers, sem tela nenhuma.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:filmes_flutter/state/favorites.dart';

void main() {
  test('favoritos: começa vazio, toggle adiciona/remove e clear esvazia', () {
    final c = ProviderContainer();
    addTearDown(c.dispose);

    expect(c.read(favoritesProvider), isEmpty);

    c.read(favoritesProvider.notifier).toggle(1);
    expect(c.read(favoritesProvider).contains(1), isTrue);

    c.read(favoritesProvider.notifier).toggle(1); // de novo → remove
    expect(c.read(favoritesProvider).contains(1), isFalse);

    c.read(favoritesProvider.notifier).toggle(1);
    c.read(favoritesProvider.notifier).toggle(2);
    expect(c.read(favoritesProvider), {1, 2});

    c.read(favoritesProvider.notifier).clear();
    expect(c.read(favoritesProvider), isEmpty);
  });

  test('favoritos: cada toggle gera um NOVO Set (estado imutável)', () {
    final c = ProviderContainer();
    addTearDown(c.dispose);

    final antes = c.read(favoritesProvider);
    c.read(favoritesProvider.notifier).toggle(7);
    final depois = c.read(favoritesProvider);

    expect(identical(antes, depois), isFalse, reason: 'Riverpod só notifica quando o state é outro objeto');
    expect(antes, isEmpty); // o Set antigo não foi mutado
  });
}

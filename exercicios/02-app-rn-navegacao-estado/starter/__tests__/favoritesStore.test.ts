// __tests__/favoritesStore.test.ts
//
// ATIVIDADE 2 — testes do useFavoritesStore (Zustand + persist manual MMKV).
// Gerados com auxílio de IA e revisados.
//
// No Jest o react-native-mmkv usa um mock em memória automaticamente
// (detecta JEST_WORKER_ID), então dá pra verificar o que foi gravado.

import { useFavoritesStore, STORAGE_KEY } from '../src/store/favoritesStore';
import { mmkvStorage } from '../src/storage/mmkv';

describe('favoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ ids: [] });
  });

  test('toggle adiciona id se não existe', () => {
    useFavoritesStore.getState().toggle(42);
    expect(useFavoritesStore.getState().ids).toEqual([42]);
  });

  test('toggle remove id se existe', () => {
    const { toggle } = useFavoritesStore.getState();
    toggle(42);
    toggle(42);
    expect(useFavoritesStore.getState().ids).toEqual([]);
  });

  test('isFavorite retorna true após add e false pra id ausente', () => {
    useFavoritesStore.getState().add(7);
    expect(useFavoritesStore.getState().isFavorite(7)).toBe(true);
    expect(useFavoritesStore.getState().isFavorite(8)).toBe(false);
  });

  test('add não duplica id já favoritado', () => {
    const { add } = useFavoritesStore.getState();
    add(1);
    add(1);
    expect(useFavoritesStore.getState().ids).toEqual([1]);
  });

  test('remove tira só o id informado', () => {
    const { add, remove } = useFavoritesStore.getState();
    add(1);
    add(2);
    add(3);
    remove(2);
    expect(useFavoritesStore.getState().ids).toEqual([1, 3]);
  });

  test('clear esvazia ids', () => {
    const { add, clear } = useFavoritesStore.getState();
    add(1);
    add(2);
    clear();
    expect(useFavoritesStore.getState().ids).toEqual([]);
  });

  test('persiste ids no storage a cada mudança', () => {
    const { add, toggle } = useFavoritesStore.getState();
    add(10);
    toggle(20);
    expect(JSON.parse(mmkvStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([10, 20]);
  });

  test('carrega ids do storage ao iniciar (sobrevive a reload)', () => {
    jest.isolateModules(() => {
      jest.doMock('../src/storage/mmkv', () => ({
        mmkvStorage: {
          getItem: () => JSON.stringify([5, 6]),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
      }));
      const { useFavoritesStore: freshStore } = require('../src/store/favoritesStore');
      expect(freshStore.getState().ids).toEqual([5, 6]);
    });
  });

  test('storage corrompido não quebra o app (começa vazio)', () => {
    jest.isolateModules(() => {
      jest.doMock('../src/storage/mmkv', () => ({
        mmkvStorage: { getItem: () => '{json inválido', setItem: jest.fn(), removeItem: jest.fn() },
      }));
      const { useFavoritesStore: freshStore } = require('../src/store/favoritesStore');
      expect(freshStore.getState().ids).toEqual([]);
    });
  });
});

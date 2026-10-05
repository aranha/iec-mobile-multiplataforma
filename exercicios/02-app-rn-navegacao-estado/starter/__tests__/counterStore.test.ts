// __tests__/counterStore.test.ts
//
// Testes do useCounterStore (Zustand) — gerados com auxílio de IA e revisados.

import { useCounterStore } from '../src/store/counterStore';

describe('counterStore', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  test('increment aumenta count em 1', () => {
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(1);
  });

  test('decrement diminui count em 1', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(1);
  });

  test('decrement a partir de 0 resulta em valor negativo (sem clamp)', () => {
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(-1);
  });

  test('reset volta count pra 0 após mutações', () => {
    const { increment, decrement, reset } = useCounterStore.getState();
    increment();
    increment();
    decrement();
    reset();
    expect(useCounterStore.getState().count).toBe(0);
  });

  test('100 increments seguidos resultam em count=100', () => {
    const { increment } = useCounterStore.getState();
    for (let i = 0; i < 100; i++) increment();
    expect(useCounterStore.getState().count).toBe(100);
  });
});

// src/components/SwipeableCard.tsx
//
// ATIVIDADE 2 — TASK 8 (Opção B — Card swipe)
//
// Arrasta o card na horizontal. Ao soltar além do THRESHOLD:
//   → direita: chama onSwipeRight (favoritar) e o card volta com spring
//   ← esquerda: card sai da tela e chama onSwipeLeft (descartar)
// Abaixo do threshold o card volta pra posição original.
//
// Gesture.Pan() (gesture-handler v2) substitui o useAnimatedGestureHandler,
// deprecado no Reanimated 3. Os callbacks do gesto são worklets (UI thread);
// pra chamar funções JS (store, setState) usamos runOnJS.
//
// SwipeGuard: na web o gesture-handler não cancela o Pressable de dentro do
// card, então soltar o mouse no fim do arrasto também dispararia o onPress
// (navegar pro detalhe). O card filho consulta useSwipeGuard() e ignora o
// toque se um swipe acabou de acontecer.

import { ReactNode, createContext, useContext, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const THRESHOLD = 120;
const PRESS_BLOCK_MS = 300;

type SwipeGuard = { wasSwiping: () => boolean };
const SwipeGuardContext = createContext<SwipeGuard | null>(null);

/** Dentro de um SwipeableCard: true se o toque atual é o fim de um arrasto. */
export const useSwipeGuard = () => useContext(SwipeGuardContext);

type Props = {
  children: ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
};

export default function SwipeableCard({ children, onSwipeRight, onSwipeLeft }: Props) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  // Estado JS (não shared value): só o onPress, na JS thread, lê isso.
  const swiping = useRef(false);
  const lastSwipeEnd = useRef(0);
  const markStart = () => {
    swiping.current = true;
  };
  const markEnd = () => {
    swiping.current = false;
    lastSwipeEnd.current = Date.now();
  };
  const guard = useMemo<SwipeGuard>(
    () => ({
      wasSwiping: () => swiping.current || Date.now() - lastSwipeEnd.current < PRESS_BLOCK_MS,
    }),
    []
  );

  const pan = Gesture.Pan()
    // só ativa com movimento horizontal → não rouba o scroll vertical da FlatList
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onStart(() => {
      runOnJS(markStart)();
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > THRESHOLD) {
        runOnJS(onSwipeRight)();
        translateX.value = withSpring(0);
      } else if (e.translationX < -THRESHOLD) {
        translateX.value = withTiming(-width, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    })
    .onFinalize((_e, success) => {
      // success = o gesto chegou a ativar (houve arrasto de verdade)
      if (success) runOnJS(markEnd)();
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${interpolate(translateX.value, [-width, 0, width], [-8, 0, 8])}deg` },
    ],
  }));

  // Fundo revelado durante o arrasto: opacidade cresce até o threshold.
  const favBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, THRESHOLD], [0, 1], 'clamp'),
  }));
  const discardBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-THRESHOLD, 0], [1, 0], 'clamp'),
  }));

  return (
    <SwipeGuardContext.Provider value={guard}>
      <View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.bg, styles.favBg, favBgStyle]}>
          <Text style={styles.bgText}>❤️ Favoritar</Text>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.bg, styles.discardBg, discardBgStyle]}>
          <Text style={styles.bgText}>Descartar ✕</Text>
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, cardStyle]}>{children}</Animated.View>
        </GestureDetector>
      </View>
    </SwipeGuardContext.Provider>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff' },
  bg: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24 },
  favBg: { backgroundColor: '#ffe3e8', justifyContent: 'flex-start' },
  discardBg: { backgroundColor: '#e6e6e6', justifyContent: 'flex-end' },
  bgText: { fontSize: 16, fontWeight: '600', color: '#333' },
});

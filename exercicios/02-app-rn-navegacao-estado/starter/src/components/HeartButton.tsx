// src/components/HeartButton.tsx
//
// ATIVIDADE 2 — TASK 8 (Opção A — Heart pop)
//
// Ao tocar: escala 1 → 1.4 → 1 (withTiming + withSpring) + rotação leve.
// Os valores vivem em shared values e o estilo é calculado num worklet
// (useAnimatedStyle) → a animação roda na UI thread, sem passar pela JS thread.
//
// Doc: https://docs.swmansion.com/react-native-reanimated/

import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  active: boolean;
  onPress: () => void;
  size?: number;
};

export default function HeartButton({ active, onPress, size = 24 }: Props) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Worklet: o plugin Babel do Reanimated marca essa função pra rodar na UI thread.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePress = (e: GestureResponderEvent) => {
    // não deixa o toque "vazar" pro Pressable do card (que navega pro detalhe)
    e.stopPropagation();
    scale.value = withSequence(withTiming(1.4, { duration: 120 }), withSpring(1, { damping: 4 }));
    rotation.value = withSequence(
      withTiming(-15, { duration: 80 }),
      withTiming(15, { duration: 80 }),
      withSpring(0, { damping: 6 })
    );
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Animated.Text style={[{ fontSize: size }, animatedStyle]}>{active ? '❤️' : '🤍'}</Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 8 },
});

import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, motion, radii } from '@/theme';

interface Props {
  size?: number;
  color?: string;
  /** Amplitude du scale (ex. 1.015 pour la jauge, 1.08 pour la pulsation d'analyse). */
  scaleTo?: number;
  durationMs?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Cercle en respiration lente permanente (scale 1 → scaleTo en boucle).
 * Utilisé par la jauge Détox Score et l'écran d'analyse.
 * S'immobilise si « Réduire les animations » est actif.
 */
export function BreathingCircle({
  size = 200,
  color = colors.primary,
  scaleTo = motion.breatheScaleTo,
  durationMs = motion.breatheDurationMs,
  children,
  style,
}: Props) {
  const reduce = useReduceMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduce) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withTiming(scaleTo, { duration: durationMs, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [durationMs, reduce, scale, scaleTo]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radii.pill, backgroundColor: color },
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', justifyContent: 'center' },
});

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, easingBezier, radii, spacing } from '@/theme';

interface Props {
  /** Progression 0 → 1. */
  progress: number;
  /** Libellé de phase (jamais de pourcentage chiffré : le chiffre décourage). */
  phaseLabel: string;
}

/** Barre de progression du quiz : remplissage continu + libellé de phase. */
export function QuizProgress({ progress, phaseLabel }: Props) {
  const reduceMotion = useReduceMotion();
  const width = useSharedValue(progress);

  useEffect(() => {
    width.value = reduceMotion
      ? progress
      : withTiming(progress, { duration: 450, easing: (t) => t });
  }, [progress, reduceMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, width.value)) * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      >
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
        {phaseLabel}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  label: { letterSpacing: 0.4 },
});

// easingBezier importé pour cohérence future des courbes (fill linéaire ici,
// volontairement continu et sans à-coups).
void easingBezier;

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { BreathingCircle } from './BreathingCircle';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** Score 0 → 100. L'anneau se remplit en proportion. */
  score: number;
  size?: number;
  children?: React.ReactNode;
}

/**
 * L'anneau du Détox Score : un cercle pêche qui se remplit jusqu'au score,
 * autour de la jauge qui respire. Le remplissage s'anime à chaque ouverture —
 * elle VOIT sa progression, pas juste un chiffre.
 */
export function ScoreRing({ score, size = 176, children }: Props) {
  const reduce = useReduceMotion();
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    const target = Math.max(0, Math.min(1, score / 100));
    progress.value = reduce
      ? target
      : withDelay(
          250,
          withTiming(target, { duration: 1100, easing: Easing.out(Easing.cubic) }),
        );
  }, [score, progress, reduce]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Piste discrète */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surfaceRaised}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Remplissage pêche : la couleur de la progression, exclusivement. */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accentWarm}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.inner}>
        <BreathingCircle size={size - stroke * 2 - 14} color={colors.surface}>
          {children}
        </BreathingCircle>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

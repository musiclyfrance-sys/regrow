import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, spacing } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const W = 300;
const H = 110;
// La courbe descend vite au début (le plan agit tout de suite),
// puis s'aplatit doucement : « il prend de moins en moins de place ».
const CURVE = `M 0 14 C 60 18, 90 52, 150 74 C 200 90, 250 98, ${W} 102`;
const CURVE_LENGTH = 340; // approximation confortable pour le tracé progressif

/**
 * La courbe de guérison : « la place que {ex} occupe dans ta tête », de J0 à
 * J+90. Elle se DESSINE sous ses yeux — la promesse devient visuelle.
 */
export function HealingCurve({ exName }: { exName: string }) {
  const reduce = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = reduce
      ? 1
      : withDelay(
          400,
          withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) }),
        );
  }, [progress, reduce]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CURVE_LENGTH * (1 - progress.value),
  }));

  return (
    <View style={styles.card}>
      <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
        LA PLACE QUE {exName.toUpperCase()} OCCUPE DANS TA TÊTE
      </AppText>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <SvgGradient id="curve" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.danger} />
            <Stop offset="0.55" stopColor={colors.accentWarm} />
            <Stop offset="1" stopColor={colors.success} />
          </SvgGradient>
        </Defs>
        <AnimatedPath
          d={CURVE}
          stroke="url(#curve)"
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CURVE_LENGTH}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.axis}>
        <AppText variant="caption" color={colors.danger}>Aujourd'hui</AppText>
        <AppText variant="caption" color={colors.textSecondary}>J+30</AppText>
        <AppText variant="caption" color={colors.textSecondary}>J+60</AppText>
        <AppText variant="caption" color={colors.success}>J+90</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  label: { letterSpacing: 0.8 },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
});

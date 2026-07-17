import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, radii, spacing, themedStyles } from '@/theme';

interface Props {
  /** Nombre de questions répondues (0 → total). */
  questionsDone: number;
  /** Nombre de questions par phase (ex. [10, 14, 14, 9]). */
  segments: number[];
  /** Libellé de phase (jamais de pourcentage : le chiffre décourage). */
  phaseLabel: string;
  /** Petit encouragement contextuel (affiché sous la phase). */
  encouragement?: string;
}

/**
 * Barre de progression vivante : un segment par phase, remplissage continu,
 * pointe lumineuse qui pulse sur le segment actif, segments terminés qui
 * s'illuminent. La progression se SENT, sans jamais afficher de chiffre.
 */
export function QuizProgress({ questionsDone, segments, phaseLabel, encouragement }: Props) {
  const reduce = useReduceMotion();

  // Découpe la progression globale en progression par segment.
  let remaining = questionsDone;
  const fills = segments.map((count) => {
    const done = Math.max(0, Math.min(count, remaining));
    remaining -= done;
    return count > 0 ? done / count : 0;
  });
  const activeIndex = fills.findIndex((f) => f < 1);
  const currentSegment = activeIndex === -1 ? segments.length - 1 : activeIndex;

  return (
    <View style={styles.container}>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: segments.reduce((a, b) => a + b, 0),
          now: questionsDone,
        }}
      >
        {segments.map((count, i) => (
          <Segment
            key={i}
            flex={count}
            fill={fills[i] ?? 0}
            complete={(fills[i] ?? 0) >= 1}
            active={i === currentSegment}
            reduce={reduce}
          />
        ))}
      </View>

      {/* Le libellé de phase « pop » à chaque changement de phase. */}
      <Animated.View key={phaseLabel} entering={reduce ? FadeIn.duration(0) : FadeInDown.duration(350)}>
        <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
          {phaseLabel}
        </AppText>
      </Animated.View>

      {encouragement && (
        <Animated.View entering={reduce ? FadeIn.duration(0) : FadeIn.delay(250).duration(400)}>
          <AppText variant="caption" color={colors.accentWarm} style={styles.encouragement}>
            {encouragement}
          </AppText>
        </Animated.View>
      )}
    </View>
  );
}

function Segment({
  flex,
  fill,
  complete,
  active,
  reduce,
}: {
  flex: number;
  fill: number;
  complete: boolean;
  active: boolean;
  reduce: boolean;
}) {
  const width = useSharedValue(fill);
  const pulse = useSharedValue(1);

  useEffect(() => {
    width.value = reduce ? fill : withTiming(fill, { duration: 450 });
  }, [fill, reduce, width]);

  useEffect(() => {
    if (!active || reduce) {
      pulse.value = 1;
      return;
    }
    // La pointe respire : le quiz est vivant, pas une corvée administrative.
    pulse.value = withRepeat(
      withTiming(1.6, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [active, pulse, reduce]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, width.value)) * 100}%`,
  }));
  const dotStyle = useAnimatedStyle(() => ({
    left: `${Math.max(0, Math.min(1, width.value)) * 100}%`,
    transform: [{ translateX: -4 }, { scale: pulse.value }],
  }));

  return (
    <View style={[styles.segment, { flex }]}>
      <Animated.View
        style={[
          styles.fill,
          complete && styles.fillComplete,
          fillStyle,
        ]}
      />
      {active && fill > 0.02 && (
        <Animated.View style={[styles.tip, dotStyle]} />
      )}
    </View>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  container: { gap: spacing.sm },
  track: { flexDirection: 'row', gap: 5 },
  segment: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'visible',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  fillComplete: { backgroundColor: colors.primarySoft },
  tip: {
    position: 'absolute',
    top: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
  },
  label: { letterSpacing: 0.4 },
  encouragement: { letterSpacing: 0.3 },
}));

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { BREATH_DURATIONS_MIN, BREATH_PATTERNS, BreathPattern } from '@/config/library';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { colors, radii, spacing, tints } from '@/theme';

/**
 * Respiration guidée — un cercle qui respire avec toi.
 * Trois rythmes selon le besoin, une durée au choix, et c'est tout.
 */
export default function BreatheScreen() {
  const router = useRouter();
  const [pattern, setPattern] = useState<BreathPattern | null>(null);
  const [durationMin, setDurationMin] = useState<number>(3);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <ScreenContainer center>
        <View style={styles.doneBlock}>
          <AppText variant="title" center>
            C’est fini, et tu l’as fait.
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center>
            Ton corps vient de redescendre d’un cran. Garde cette sensation.
          </AppText>
        </View>
        <View style={styles.bottomActions}>
          <PrimaryButton label="Encore une fois" variant="ghost" onPress={() => setDone(false)} />
          <PrimaryButton label="Je me sens mieux" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  if (pattern) {
    return (
      <BreathSession
        pattern={pattern}
        durationMin={durationMin}
        onStop={() => setPattern(null)}
        onDone={() => {
          setPattern(null);
          setDone(true);
        }}
      />
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="title">Respiration</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Choisis ce dont tu as besoin, le cercle te guide.
        </AppText>
      </View>

      <View style={styles.patternList}>
        {BREATH_PATTERNS.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            onPress={() => {
              haptics.selection();
              track('breath_started', { pattern: p.id, durationMin });
              setPattern(p);
            }}
            style={({ pressed }) => [styles.patternCard, pressed && styles.pressed]}
          >
            <AppText variant="heading">{p.name}</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {p.purpose}
            </AppText>
            <AppText variant="caption" color={colors.primarySoft}>
              {p.phases.map((ph) => `${ph.label} ${ph.seconds}`).join(' · ')}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.durationBlock}>
        <AppText variant="caption" color={colors.textSecondary} style={styles.durationLabel}>
          DURÉE
        </AppText>
        <View style={styles.durationRow}>
          {BREATH_DURATIONS_MIN.map((m) => (
            <Pressable
              key={m}
              accessibilityRole="button"
              onPress={() => {
                haptics.soft();
                setDurationMin(m);
              }}
              style={[styles.durationPill, durationMin === m && styles.durationPillActive]}
            >
              <AppText
                variant="bodyMedium"
                color={durationMin === m ? colors.background : colors.textPrimary}
              >
                {m} min
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.bottomActions}>
        <PrimaryButton label="‹ Retour" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

function BreathSession({
  pattern,
  durationMin,
  onStop,
  onDone,
}: {
  pattern: BreathPattern;
  durationMin: number;
  onStop: () => void;
  onDone: () => void;
}) {
  const reduce = useReduceMotion();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(pattern.phases[0]!.seconds);
  const [totalLeft, setTotalLeft] = useState(durationMin * 60);
  const scale = useSharedValue(0.6);
  const doneRef = useRef(false);

  const phase = pattern.phases[phaseIdx]!;

  // Le cercle suit la phase : gonfle, se retient, se vide.
  useEffect(() => {
    if (reduce) return;
    const target = phase.motion === 'grow' ? 1 : phase.motion === 'shrink' ? 0.6 : scale.value;
    if (phase.motion !== 'hold') {
      scale.value = withTiming(target, {
        duration: phase.seconds * 1000,
        easing: Easing.inOut(Easing.ease),
      });
    }
    haptics.soft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIdx]);

  useEffect(() => {
    const t = setInterval(() => {
      setTotalLeft((tl) => tl - 1);
      setPhaseLeft((pl) => {
        if (pl > 1) return pl - 1;
        setPhaseIdx((i) => {
          const next = (i + 1) % pattern.phases.length;
          setPhaseLeft(pattern.phases[next]!.seconds);
          return next;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (totalLeft <= 0 && !doneRef.current) {
      doneRef.current = true;
      haptics.streak();
      track('breath_completed', { pattern: pattern.id, durationMin });
      onDone();
    }
  }, [totalLeft, onDone, pattern.id, durationMin]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const min = Math.floor(Math.max(totalLeft, 0) / 60);
  const sec = Math.max(totalLeft, 0) % 60;

  return (
    <ScreenContainer center>
      <View style={styles.sessionTop}>
        <AppText variant="caption" color={colors.textSecondary}>
          {`${pattern.name} · ${min}:${String(sec).padStart(2, '0')}`}
        </AppText>
      </View>

      <View style={styles.circleWrap}>
        <View style={styles.circleHalo} />
        <Animated.View style={[styles.circle, circleStyle]} />
        <View style={styles.circleLabel} pointerEvents="none">
          <AppText variant="title" center>
            {phase.label}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center>
            {phaseLeft > 0 ? phaseLeft : phase.seconds}
          </AppText>
        </View>
      </View>

      <View style={styles.bottomActions}>
        <PrimaryButton label="Arrêter" variant="ghost" onPress={onStop} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  pressed: { opacity: 0.85 },
  patternList: { gap: spacing.md, marginTop: spacing.xxl },
  patternCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  durationBlock: { marginTop: spacing.xxl, gap: spacing.md },
  durationLabel: { letterSpacing: 1.2 },
  durationRow: { flexDirection: 'row', gap: spacing.md },
  durationPill: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
  },
  durationPillActive: { backgroundColor: colors.primary },

  sessionTop: { position: 'absolute', top: spacing.huge + spacing.lg },
  circleWrap: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center' },
  circleHalo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: radii.pill,
    backgroundColor: tints.lavender,
  },
  circle: {
    width: 220,
    height: 220,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    opacity: 0.85,
  },
  circleLabel: { position: 'absolute', alignItems: 'center', gap: spacing.xs },

  doneBlock: { gap: spacing.md, paddingHorizontal: spacing.md },
  bottomActions: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 24,
    right: 24,
    gap: spacing.md,
  },
});

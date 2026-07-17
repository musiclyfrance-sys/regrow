import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppText, BreathingCircle, PrimaryButton, ScreenContainer } from '@/components';
import { MEDITATIONS, Meditation } from '@/config/library';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { colors, radii, spacing } from '@/theme';

/**
 * Méditations guidées par le texte — pas de voix, des phrases qui se posent
 * une par une, au rythme prévu. Parfait la nuit, sans son.
 */
export default function MeditateScreen() {
  const router = useRouter();
  const [meditation, setMeditation] = useState<Meditation | null>(null);

  if (meditation) {
    return (
      <MeditationPlayer
        meditation={meditation}
        onClose={() => setMeditation(null)}
        onDone={() => {
          setMeditation(null);
          router.back();
        }}
      />
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="title">Méditer</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Des séances courtes, guidées par le texte, sans son.
        </AppText>
      </View>

      <View style={styles.list}>
        {MEDITATIONS.map((m) => (
          <Pressable
            key={m.id}
            accessibilityRole="button"
            onPress={() => {
              haptics.selection();
              track('meditation_started', { meditation: m.id });
              setMeditation(m);
            }}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardText}>
              <AppText variant="heading">{m.name}</AppText>
              <AppText variant="body" color={colors.textSecondary}>
                {m.purpose}
              </AppText>
            </View>
            <View style={styles.badge}>
              <AppText variant="caption" color={colors.primarySoft}>
                {m.minutes} min
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.bottomActions}>
        <PrimaryButton label="‹ Retour" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

function MeditationPlayer({
  meditation,
  onClose,
  onDone,
}: {
  meditation: Meditation;
  onClose: () => void;
  onDone: () => void;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = meditation.steps[stepIdx]!;
  const totalSeconds = meditation.steps.reduce((acc, s) => acc + s.seconds, 0);
  const elapsed = meditation.steps.slice(0, stepIdx).reduce((acc, s) => acc + s.seconds, 0);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (stepIdx < meditation.steps.length - 1) {
        haptics.soft();
        setStepIdx(stepIdx + 1);
      } else {
        haptics.streak();
        track('meditation_completed', { meditation: meditation.id });
        setFinished(true);
      }
    }, step.seconds * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stepIdx, meditation, step.seconds]);

  if (finished) {
    return (
      <ScreenContainer center>
        <View style={styles.doneBlock}>
          <AppText variant="title" center>
            C’était tout ce qu’il fallait faire.
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center>
            Reste encore un instant dans ce calme si tu peux.
          </AppText>
        </View>
        <View style={styles.bottomActions}>
          <PrimaryButton label="Terminer" onPress={onDone} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer center>
      <View style={styles.playerTop}>
        <AppText variant="caption" color={colors.textSecondary}>
          {meditation.name}
        </AppText>
        {/* Barre de progression discrète. */}
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${Math.round((elapsed / totalSeconds) * 100)}%` }]}
          />
        </View>
      </View>

      <BreathingCircle size={120} color={colors.surfaceRaised} scaleTo={1.1} durationMs={4000} />

      <Animated.View
        key={stepIdx}
        entering={FadeIn.duration(600)}
        exiting={FadeOut.duration(300)}
        style={styles.stepBlock}
      >
        <AppText variant="heading" center>
          {step.text}
        </AppText>
      </Animated.View>

      <View style={styles.bottomActions}>
        <PrimaryButton label="Arrêter" variant="ghost" onPress={onClose} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  pressed: { opacity: 0.85 },
  list: { gap: spacing.md, marginTop: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardText: { flex: 1, gap: spacing.xs },
  badge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },

  playerTop: {
    position: 'absolute',
    top: spacing.huge + spacing.lg,
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: spacing.md,
  },
  progressTrack: {
    alignSelf: 'stretch',
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radii.pill },
  stepBlock: { marginTop: spacing.xxxl, paddingHorizontal: spacing.lg, minHeight: 90 },

  doneBlock: { gap: spacing.md, paddingHorizontal: spacing.md },
  bottomActions: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 24,
    right: 24,
    gap: spacing.md,
  },
});

import { useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText, PillOption, PrimaryButton, ScreenContainer } from '@/components';
import { CONTACT_OPTIONS, MOODS, questionOfDay } from '@/config/checkin';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { DailyInsight, generateInsight } from '@/lib/insight';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { selectExName, resolveText, useQuizStore } from '@/state/quizStore';
import {
  ContactDeclaration,
  selectStreakDays,
  useStreakStore,
} from '@/state/streakStore';

type Step = 'mood' | 'question' | 'contact' | 'broken' | 'insight';

/**
 * Le check-in du soir : 3 étapes en 2 minutes, puis l'insight du jour en
 * récompense. Si un contact est déclaré, écran sans culpabilisation d'abord.
 */
export default function CheckinScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });
  const question = useMemo(() => questionOfDay(), []);

  const addCheckin = useStreakStore((s) => s.addCheckin);
  const setLastInsightAngle = useStreakStore((s) => s.setLastInsightAngle);
  const lastAngle = useStreakStore((s) => s.lastInsightAngle);
  const checkins = useStreakStore((s) => s.checkins);
  const startDate = useStreakStore((s) => s.startDate);
  const lastContactDate = useStreakStore((s) => s.lastContactDate);

  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [insight, setInsight] = useState<DailyInsight | null>(null);

  const finish = async (contact: ContactDeclaration) => {
    addCheckin({
      mood: mood ?? 3,
      questionId: question.id,
      answer: answer ?? '',
      contact,
    });
    track('checkin_completed');
    const broke = contact === 'i_wrote' || contact === 'we_met';
    if (broke) {
      track('streak_broken');
      haptics.warning();
      setStep('broken');
    } else {
      haptics.soft();
      await showInsight();
    }
  };

  const showInsight = async () => {
    const streak = selectStreakDays({ startDate, lastContactDate });
    const result = await generateInsight({
      ex,
      streak,
      mood: mood ?? 3,
      checkins,
      lastAngle,
    });
    setLastInsightAngle(result.angle);
    setInsight(result);
    setStep('insight');
  };

  const shareInsight = async () => {
    if (!insight) return;
    await Share.share({ message: `${insight.text}\n\nRegrow` });
    track('insight_shared');
  };

  return (
    <ScreenContainer>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close}>
        <AppText variant="body" color={colors.textSecondary}>✕</AppText>
      </Pressable>

      {step === 'mood' && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.stepWrap}>
          <AppText variant="title" style={styles.prompt}>
            Ce soir, tu te sens comment ?
          </AppText>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <Pressable
                key={m.value}
                accessibilityLabel={m.label}
                onPress={() => {
                  haptics.selection();
                  setMood(m.value);
                }}
                style={[styles.mood, mood === m.value && styles.moodSelected]}
              >
                <AppText style={styles.moodFace}>{m.face}</AppText>
              </Pressable>
            ))}
          </View>
          {mood != null && (
            <AppText variant="body" color={colors.textSecondary} center>
              {MOODS.find((m) => m.value === mood)?.label}
            </AppText>
          )}
          <View style={styles.bottom}>
            <PrimaryButton
              label="Continuer"
              disabled={mood == null}
              onPress={() => setStep('question')}
            />
          </View>
        </Animated.View>
      )}

      {step === 'question' && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.stepWrap}>
          <AppText variant="title" style={styles.prompt}>
            {resolveText(question.prompt, ex)}
          </AppText>
          <View style={styles.options}>
            {question.options.map((o) => (
              <PillOption
                key={o.value}
                label={o.label}
                selected={answer === o.value}
                onPress={() => {
                  setAnswer(o.value);
                  setTimeout(() => setStep('contact'), 350);
                }}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {step === 'contact' && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.stepWrap}>
          <AppText variant="title" style={styles.prompt}>
            Et côté contact avec {ex}, aujourd’hui ?
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.helper}>
            L’honnêteté ici, c’est ce qui fait avancer. Personne ne juge.
          </AppText>
          <View style={styles.options}>
            {CONTACT_OPTIONS.map((o) => (
              <PillOption
                key={o.value}
                label={o.label}
                selected={false}
                onPress={() => finish(o.value)}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {step === 'broken' && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.centerWrap}>
          <AppText variant="title" center>
            Un contact ne remet pas ton travail à zéro.
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSecondary} center style={styles.helper}>
            Ton compteur repart, et ton Détox Score garde 80 % de sa valeur. Ce que
            tu as construit reste construit.
          </AppText>
          <View style={styles.bottom}>
            <PrimaryButton label="On continue" onPress={showInsight} />
          </View>
        </Animated.View>
      )}

      {step === 'insight' && insight && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.centerWrap}>
          <AppText variant="caption" color={colors.accentWarm} style={styles.insightLabel}>
            TON CONSEIL DU JOUR
          </AppText>
          <View style={styles.insightCard}>
            <AppText variant="bodyLarge" style={styles.insightText}>
              {insight.text}
            </AppText>
          </View>
          <View style={styles.bottom}>
            <PrimaryButton label="Partager" variant="ghost" onPress={shareInsight} />
            <PrimaryButton label="Bonne nuit" onPress={() => router.back()} />
          </View>
        </Animated.View>
      )}
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  close: { position: 'absolute', top: spacing.xl, right: spacing.xxl, zIndex: 10 },
  stepWrap: { flex: 1, paddingTop: spacing.huge * 1.5, gap: spacing.lg },
  centerWrap: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  prompt: {},
  helper: {},
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  mood: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  moodSelected: { borderColor: colors.borderActive, backgroundColor: colors.surface },
  moodFace: { fontSize: 26, lineHeight: 34 },
  options: { gap: spacing.md, marginTop: spacing.md },
  bottom: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    gap: spacing.md,
  },
  insightLabel: { letterSpacing: 1, textAlign: 'center' },
  insightCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xxl,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentWarm,
  },
  insightText: { lineHeight: 27 },
}));

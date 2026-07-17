import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  ActionCard,
  AppText,
  CountUpText,
  ScoreRing,
  ScreenContainer,
  ShareCardSheet,
} from '@/components';
import { challengeOfDay, MILESTONE_DAYS } from '@/config/challenges';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { armNotifications } from '@/lib/notifications';
import { colors, fonts, radii, spacing } from '@/theme';
import { useAppStore } from '@/state/appStore';
import { useCapsuleStore } from '@/state/capsuleStore';
import { resolveText, selectExName, useQuizStore } from '@/state/quizStore';
import {
  selectProgramDay,
  selectStreakDays,
  selectTodayChallengeDone,
  selectTodayCheckin,
  useStreakStore,
} from '@/state/streakStore';

/** Salutation selon l'heure — l'app vit surtout la nuit. */
function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bonjour';
  if (h >= 12 && h < 18) return 'Bel après-midi';
  if (h >= 18 && h < 22) return 'Bonsoir';
  return 'Toujours debout';
}

/**
 * Home — le rituel quotidien. Salutation personnalisée, streak qui roule,
 * anneau Détox Score, les 2 actions du jour (check-in, défi) en cartes
 * clairement cliquables, panic button flottant.
 */
export default function HomeScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });
  const userName = useAppStore((s) => s.userName);

  const startDate = useStreakStore((s) => s.startDate);
  const lastContactDate = useStreakStore((s) => s.lastContactDate);
  const detoxScore = useStreakStore((s) => s.detoxScore);
  const checkins = useStreakStore((s) => s.checkins);
  const challengeDoneDates = useStreakStore((s) => s.challengeDoneDates);
  const lastMilestoneCelebrated = useStreakStore((s) => s.lastMilestoneCelebrated);
  const celebrateMilestone = useStreakStore((s) => s.celebrateMilestone);
  const ensureStarted = useStreakStore((s) => s.ensureStarted);
  const registerOpen = useStreakStore((s) => s.registerOpen);
  const capsules = useCapsuleStore((s) => s.capsules);

  const streakDays = selectStreakDays({ startDate, lastContactDate });
  const todayCheckin = selectTodayCheckin({ checkins });
  const programDay = selectProgramDay(startDate);
  const challengeDone = selectTodayChallengeDone(challengeDoneDates);
  const { challenge } = challengeOfDay(programDay);

  const reachedMilestone = MILESTONE_DAYS.includes(streakDays) ? streakDays : null;
  const [sharingMilestone, setSharingMilestone] = useState<number | null>(null);

  useEffect(() => {
    ensureStarted();
    if (registerOpen()) haptics.streak();
    if (reachedMilestone && reachedMilestone > lastMilestoneCelebrated) {
      celebrateMilestone(reachedMilestone);
      track('streak_milestone', { day: reachedMilestone });
    }
    armNotifications({
      weakHour: String(profile.weakHour ?? '23'),
      exName: ex,
      startDate,
      capsuleUnlocks: capsules.map((c) => c.unlockAt),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Salutation personnalisée + réglages. */}
        <View style={styles.topBar}>
          <View>
            <AppText variant="title">
              {greeting()}
              {userName ? `, ${userName}` : ''}.
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Jour {programDay} de ton programme.
            </AppText>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={10}
            accessibilityLabel="Réglages"
            style={styles.gear}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Circle cx={12} cy={12} r={3.2} stroke={colors.textSecondary} strokeWidth={1.8} fill="none" />
              <Path
                d="M12 2.8v2.4M12 18.8v2.4M4.2 12H1.8M22.2 12h-2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"
                stroke={colors.textSecondary}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        {/* Streak — le chiffre roule jusqu'au total. */}
        <Animated.View entering={FadeInUp.duration(500)} style={styles.streakBlock}>
          <CountUpText value={streakDays} style={styles.streakNumber} />
          <AppText variant="body" color={colors.textSecondary}>
            {streakDays > 1 ? 'jours' : 'jour'} sans contact
          </AppText>
        </Animated.View>

        {/* Détox Score : anneau pêche + jauge qui respire. */}
        <View style={styles.gaugeBlock}>
          <ScoreRing score={detoxScore}>
            <CountUpText value={detoxScore} durationMs={1100} style={styles.gaugeScore} />
            <AppText variant="caption" color={colors.textSecondary}>
              Détox Score
            </AppText>
          </ScoreRing>
        </View>

        {/* Milestone du jour : la carte à partager. */}
        {reachedMilestone != null && (
          <ActionCard
            eyebrow={`PALIER · J${reachedMilestone}`}
            title={`${reachedMilestone} jours sans lui écrire.`}
            cta="Voir ma carte"
            accentColor={colors.accentWarm}
            onPress={() => setSharingMilestone(reachedMilestone)}
          />
        )}

        {/* Les 2 actions du jour — clairement cliquables. */}
        <ActionCard
          eyebrow="CHECK-IN DU SOIR"
          eyebrowColor={colors.primarySoft}
          title="Comment tu vas, vraiment ?"
          cta="Commencer · 2 min"
          done={!!todayCheckin}
          doneLabel="Fait ✓ · à demain soir"
          accentColor={colors.primary}
          onPress={() => router.push('/checkin')}
        />

        <ActionCard
          eyebrow="DÉFI DU JOUR"
          title={resolveText(challenge.text, ex)}
          cta="Relever le défi"
          done={challengeDone}
          doneLabel="Fait ✓ · +3 au Détox Score"
          accentColor={colors.accentWarm}
          onPress={() => router.push('/(tabs)/journey')}
        />

        <AppText variant="caption" color={colors.textSecondary} center style={styles.hint}>
          Tu penses à {ex} ? Le bouton en bas est là pour ça.
        </AppText>
      </ScrollView>

      {/* Panic button flottant — accessible en 1 tap. */}
      <Pressable
        style={styles.panic}
        onPress={() => router.push('/panic')}
        accessibilityLabel="Bouton panique"
      >
        <AppText variant="buttonLabel" color={colors.textPrimary}>
          Besoin d'aide, là
        </AppText>
      </Pressable>

      {sharingMilestone != null && (
        <ShareCardSheet
          variant={sharingMilestone >= 90 ? 'healing' : 'milestone'}
          value={sharingMilestone}
          onDone={() => setSharingMilestone(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
    paddingBottom: 120,
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gear: { padding: spacing.sm, marginTop: spacing.xs },
  streakBlock: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  streakNumber: {
    fontFamily: fonts.serifSemibold,
    fontSize: 64,
    lineHeight: 70,
    color: colors.accentWarm,
    textAlign: 'center',
  },
  gaugeBlock: { alignItems: 'center' },
  gaugeScore: {
    fontFamily: fonts.serifSemibold,
    fontSize: 40,
    lineHeight: 46,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  hint: { marginTop: spacing.sm },
  panic: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xxl,
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
});

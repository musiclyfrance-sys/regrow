import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActionCard,
  AppText,
  CountUpText,
  ScreenContainer,
  ShareCardSheet,
} from '@/components';
import { challengeOfDay, MILESTONE_DAYS, PHASES } from '@/config/challenges';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radii, spacing } from '@/theme';
import { resolveText, selectExName, useQuizStore } from '@/state/quizStore';
import {
  selectProgramDay,
  selectStreakDays,
  selectTodayChallengeDone,
  useStreakStore,
} from '@/state/streakStore';

/**
 * La Glow-Up Era, rangée en 3 blocs clairs :
 * 1. Le défi du jour (la seule action attendue aujourd'hui)
 * 2. Les paliers — grille de 9 badges, carte partageable quand atteint
 * 3. Les 3 phases du programme avec leur progression
 */
export default function JourneyScreen() {
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });

  const startDate = useStreakStore((s) => s.startDate);
  const lastContactDate = useStreakStore((s) => s.lastContactDate);
  const challengeDoneDates = useStreakStore((s) => s.challengeDoneDates);
  const completeChallenge = useStreakStore((s) => s.completeChallenge);

  const programDay = selectProgramDay(startDate);
  const streakDays = selectStreakDays({ startDate, lastContactDate });
  const todayDone = selectTodayChallengeDone(challengeDoneDates);
  const { challenge, phase } = challengeOfDay(programDay);

  const [sharingDay, setSharingDay] = useState<number | null>(null);

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <AppText variant="caption" color={colors.accentWarm} style={styles.eraLabel}>
            TA GLOW-UP ERA
          </AppText>
          <View style={styles.dayLine}>
            <AppText variant="title">Jour</AppText>
            <CountUpText value={programDay} style={styles.dayNumber} />
            <AppText variant="title" color={colors.textSecondary}>/ 90</AppText>
          </View>
          <AppText variant="body" color={colors.textSecondary}>
            Phase en cours : {phase}
          </AppText>
        </View>

        {/* 1 · Le défi du jour */}
        <ActionCard
          eyebrow="DÉFI DU JOUR"
          title={resolveText(challenge.text, ex)}
          cta="Marquer comme fait"
          done={todayDone}
          doneLabel="Fait ✓ · +3 au Détox Score"
          accentColor={colors.accentWarm}
          onPress={() => {
            completeChallenge();
            haptics.streak();
          }}
        />

        {/* 2 · Les paliers */}
        <View style={styles.section}>
          <AppText variant="heading">Tes paliers</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Chaque palier atteint débloque une carte à partager. Touche-la.
          </AppText>
          <View style={styles.milestoneGrid}>
            {MILESTONE_DAYS.map((day) => {
              const reached = streakDays >= day;
              return (
                <Pressable
                  key={day}
                  disabled={!reached}
                  onPress={() => {
                    haptics.selection();
                    setSharingDay(day);
                  }}
                  accessibilityLabel={`Palier ${day} jours${reached ? ', atteint' : ''}`}
                  style={[styles.milestone, reached && styles.milestoneReached]}
                >
                  <AppText
                    style={[styles.milestoneDay, reached && styles.milestoneDayReached]}
                  >
                    J{day}
                  </AppText>
                  <AppText
                    variant="caption"
                    color={reached ? colors.background : colors.textSecondary}
                  >
                    {reached ? 'Atteint ✓' : `Dans ${day - streakDays} j`}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 3 · Les 3 phases */}
        <View style={styles.section}>
          <AppText variant="heading">Le programme</AppText>
          {PHASES.map((p) => {
            const daysInPhase = Math.max(0, Math.min(programDay, p.to) - p.from + 1);
            const total = p.to - p.from + 1;
            const pct = daysInPhase / total;
            const current = programDay >= p.from && programDay <= p.to;
            return (
              <View key={p.label} style={[styles.phaseCard, current && styles.phaseCurrent]}>
                <View style={styles.phaseTop}>
                  <AppText variant="bodyMedium" color={current ? colors.textPrimary : colors.textSecondary}>
                    {p.label}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    J{p.from} → J{p.to}
                  </AppText>
                </View>
                <View style={styles.phaseTrack}>
                  <View
                    style={[
                      styles.phaseFill,
                      { width: `${Math.round(pct * 100)}%` },
                      pct >= 1 && { backgroundColor: colors.success },
                    ]}
                  />
                </View>
                <AppText variant="caption" color={colors.textSecondary}>
                  {pct >= 1
                    ? 'Phase terminée ✓'
                    : current
                      ? `${daysInPhase} jour${daysInPhase > 1 ? 's' : ''} sur ${total}`
                      : 'À venir'}
                </AppText>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {sharingDay != null && (
        <ShareCardSheet
          variant={sharingDay >= 90 ? 'healing' : 'milestone'}
          value={sharingDay}
          onDone={() => setSharingDay(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.xxl,
  },
  header: { gap: spacing.xs },
  eraLabel: { letterSpacing: 2 },
  dayLine: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  dayNumber: {
    fontFamily: fonts.serifSemibold,
    fontSize: 44,
    lineHeight: 50,
    color: colors.accentWarm,
  },
  section: { gap: spacing.md },
  milestoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  milestone: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  milestoneReached: { backgroundColor: colors.accentWarm },
  milestoneDay: {
    fontFamily: fonts.serifSemibold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textSecondary,
  },
  milestoneDayReached: { color: colors.background },
  phaseCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  phaseCurrent: { borderColor: colors.border },
  phaseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phaseTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  phaseFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.accentWarm,
  },
});

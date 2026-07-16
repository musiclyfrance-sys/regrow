import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import {
  AppText,
  CountUpText,
  PrimaryButton,
  ScreenContainer,
  ShareCardSheet,
} from '@/components';
import { challengeOfDay, MILESTONE_DAYS, PHASES } from '@/config/challenges';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radii, spacing } from '@/theme';
import { resolveText, selectExName, useQuizStore } from '@/state/quizStore';
import {
  selectProgramDay,
  selectTodayChallengeDone,
  useStreakStore,
} from '@/state/streakStore';

interface DayRow {
  day: number;
  isToday: boolean;
  isPast: boolean;
  isMilestone: boolean;
  phaseStart: string | null;
}

/**
 * La Glow-Up Era : le programme 90 jours en timeline, un défi concret par
 * jour. Le défi du jour est mis en avant ; les milestones donnent une carte
 * partageable ; chaque défi complété nourrit le Détox Score.
 */
export default function JourneyScreen() {
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });

  const startDate = useStreakStore((s) => s.startDate);
  const challengeDoneDates = useStreakStore((s) => s.challengeDoneDates);
  const completeChallenge = useStreakStore((s) => s.completeChallenge);

  const programDay = selectProgramDay(startDate);
  const todayDone = selectTodayChallengeDone(challengeDoneDates);
  const { challenge, phase } = challengeOfDay(programDay);

  const [sharingDay, setSharingDay] = useState<number | null>(null);

  const rows = useMemo<DayRow[]>(
    () =>
      Array.from({ length: 90 }, (_, i) => {
        const day = i + 1;
        const phaseDef = PHASES.find((p) => day === p.from);
        return {
          day,
          isToday: day === programDay,
          isPast: day < programDay,
          isMilestone: MILESTONE_DAYS.includes(day),
          phaseStart: phaseDef ? phaseDef.label : null,
        };
      }),
    [programDay],
  );

  const markDone = () => {
    completeChallenge();
    haptics.streak();
  };

  const renderRow = useCallback(
    ({ item }: { item: DayRow }) => (
      <View>
        {item.phaseStart && (
          <AppText variant="caption" color={colors.primarySoft} style={styles.phaseHeader}>
            {item.phaseStart.toUpperCase()}
          </AppText>
        )}
        <View style={[styles.row, item.isToday && styles.rowToday]}>
          <View
            style={[
              styles.dayDot,
              item.isPast && styles.dayDotPast,
              item.isToday && styles.dayDotToday,
              item.isMilestone && styles.dayDotMilestone,
            ]}
          >
            <AppText
              variant="caption"
              color={item.isToday ? colors.background : colors.textSecondary}
            >
              {item.day}
            </AppText>
          </View>
          <View style={styles.rowContent}>
            {item.isToday ? (
              <AppText variant="bodyMedium">Aujourd'hui — ton défi t'attend au-dessus.</AppText>
            ) : item.isMilestone ? (
              <AppText variant="body" color={colors.textSecondary}>
                Milestone : J{item.day}
                {item.isPast ? ' — atteint 🎉' : ''}
              </AppText>
            ) : (
              <AppText variant="body" color={colors.textSecondary}>
                {item.isPast ? 'Passé' : 'À venir'}
              </AppText>
            )}
          </View>
          {item.isMilestone && item.isPast && (
            <Pressable onPress={() => setSharingDay(item.day)} hitSlop={8}>
              <AppText variant="caption" color={colors.accentWarm}>
                Ma carte →
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    ),
    [],
  );

  return (
    <ScreenContainer padded={false}>
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.day)}
        renderItem={renderRow}
        initialNumToRender={15}
        windowSize={7}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="caption" color={colors.accentWarm} style={styles.eraLabel}>
              TA GLOW-UP ERA
            </AppText>
            <View style={styles.dayLine}>
              <AppText variant="title">Jour</AppText>
              <CountUpText value={programDay} style={styles.dayNumber} />
              <AppText variant="title" color={colors.textSecondary}>/ 90</AppText>
            </View>
            <AppText variant="caption" color={colors.textSecondary}>
              Phase : {phase}
            </AppText>

            {/* Le défi du jour — la seule carte qui compte. */}
            <View style={[styles.todayCard, todayDone && styles.todayCardDone]}>
              <AppText variant="caption" color={colors.accentWarm}>
                DÉFI DU JOUR
              </AppText>
              <AppText variant="heading">{resolveText(challenge.text, ex)}</AppText>
              {todayDone ? (
                <AppText variant="bodyMedium" color={colors.success}>
                  ✓ Fait. +3 au Détox Score.
                </AppText>
              ) : (
                <PrimaryButton label="C'est fait" onPress={markDone} />
              )}
            </View>
          </View>
        }
      />

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
  list: { paddingHorizontal: 24, paddingTop: spacing.xl, paddingBottom: spacing.huge },
  header: { gap: spacing.sm, marginBottom: spacing.xl },
  eraLabel: { letterSpacing: 2 },
  dayLine: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  dayNumber: {
    fontFamily: fonts.serifSemibold,
    fontSize: 44,
    lineHeight: 50,
    color: colors.accentWarm,
  },
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderActive,
  },
  todayCardDone: { borderColor: 'transparent', opacity: 0.85 },
  phaseHeader: { letterSpacing: 1.5, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowToday: {
    backgroundColor: colors.surface,
    borderRadius: radii.card / 2,
    paddingHorizontal: spacing.sm,
  },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotPast: { backgroundColor: colors.surfaceRaised },
  dayDotToday: { backgroundColor: colors.primary },
  dayDotMilestone: { borderWidth: 1.5, borderColor: colors.accentWarm },
  rowContent: { flex: 1 },
});

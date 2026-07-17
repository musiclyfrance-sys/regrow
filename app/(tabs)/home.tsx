import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  ActionCard,
  AppText,
  CountUpText,
  LibraryIcon,
  ScoreRing,
  ScreenContainer,
  ShareCardSheet,
} from '@/components';
import type { LibraryIconName } from '@/components/LibraryIcon';
import { challengeOfDay, MILESTONE_DAYS } from '@/config/challenges';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { armNotifications } from '@/lib/notifications';
import { colors, fonts, radii, spacing, tints } from '@/theme';
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

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface WeekDay {
  label: string;
  /** Jour déjà tenu (dans la série sans contact). */
  held: boolean;
  isToday: boolean;
  isFuture: boolean;
}

/** La semaine en cours, lundi en tête, avec les jours tenus cochés. */
function computeWeek(streakDays: number): WeekDay[] {
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7; // Lundi = 0.
  return DAY_LABELS.map((label, i) => {
    const diff = todayIdx - i; // Jours d'écart avec aujourd'hui (positif = passé).
    return {
      label,
      isToday: i === todayIdx,
      isFuture: diff < 0,
      held: diff >= 0 && diff < streakDays,
    };
  });
}

function CheckMark({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path
        d="m5 12.5 4.5 4.5L19 7.5"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Petit raccourci rond vers un outil de la Bibliothèque. */
function ToolTile({
  icon,
  label,
  tint,
  color,
  onPress,
}: {
  icon: LibraryIconName;
  label: string;
  tint: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [styles.toolTile, pressed && styles.pressed]}
    >
      <View style={[styles.toolCircle, { backgroundColor: tint }]}>
        <LibraryIcon name={icon} color={color} size={22} />
      </View>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * Home — le rituel quotidien, en blocs clairs : semaine cochée, série et
 * Détox Score réunis, actions du soir, raccourcis vers les outils doux,
 * retour à l'autopsie, panic button flottant.
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
  const week = computeWeek(streakDays);

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

        {/* La carte principale : semaine cochée + série + Détox Score. */}
        <Animated.View entering={FadeInUp.duration(500)} style={styles.heroCard}>
          <View style={styles.weekRow}>
            {week.map((d, i) => (
              <View key={i} style={styles.weekDay}>
                <View
                  style={[
                    styles.weekCircle,
                    d.held && styles.weekCircleHeld,
                    d.isToday && styles.weekCircleToday,
                  ]}
                >
                  {d.held ? <CheckMark color={colors.background} /> : null}
                </View>
                <AppText
                  variant="caption"
                  color={d.isToday ? colors.textPrimary : colors.textSecondary}
                >
                  {d.label}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <CountUpText value={streakDays} style={styles.streakNumber} />
              <AppText variant="body" color={colors.textSecondary}>
                {streakDays > 1 ? 'jours' : 'jour'} sans contact
              </AppText>
            </View>
            <ScoreRing score={detoxScore} size={108}>
              <CountUpText value={detoxScore} durationMs={1100} style={styles.gaugeScore} />
              <AppText variant="caption" color={colors.textSecondary}>
                Détox
              </AppText>
            </ScoreRing>
          </View>
        </Animated.View>

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

        {/* Les 2 actions du soir. */}
        <View style={styles.section}>
          <AppText variant="heading">Ce soir</AppText>
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
        </View>

        {/* Raccourcis vers les outils doux. */}
        <View style={styles.section}>
          <AppText variant="heading">Un moment pour toi</AppText>
          <View style={styles.toolsRow}>
            <ToolTile
              icon="breath"
              label="Respirer"
              tint={tints.lavender}
              color={colors.primarySoft}
              onPress={() => router.push('/breathe')}
            />
            <ToolTile
              icon="sound"
              label="Sons"
              tint={tints.sage}
              color={colors.success}
              onPress={() => router.push('/sounds')}
            />
            <ToolTile
              icon="journal"
              label="Journal"
              tint={tints.lavender}
              color={colors.primary}
              onPress={() => router.push('/journal')}
            />
            <ToolTile
              icon="quote"
              label="Citations"
              tint={tints.peach}
              color={colors.accentWarm}
              onPress={() => router.push('/quotes')}
            />
          </View>
        </View>

        {/* Relire l'autopsie. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptics.selection();
            router.push('/rapport');
          }}
          style={({ pressed }) => [styles.reportRow, pressed && styles.pressed]}
        >
          <View style={[styles.reportIcon, { backgroundColor: tints.peach }]}>
            <LibraryIcon name="report" color={colors.accentWarm} size={20} />
          </View>
          <View style={styles.reportText}>
            <AppText variant="bodyMedium">Relire ton autopsie</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Pour les soirs où tu doutes de ta décision.
            </AppText>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="m9 5 7 7-7 7"
              stroke={colors.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>

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
  pressed: { opacity: 0.85 },

  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: spacing.xs },
  weekCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekCircleHeld: { backgroundColor: colors.accentWarm },
  weekCircleToday: { borderWidth: 2, borderColor: colors.primarySoft },
  heroDivider: { height: 1, backgroundColor: colors.border },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  heroLeft: { gap: spacing.xs },
  streakNumber: {
    fontFamily: fonts.serifSemibold,
    fontSize: 56,
    lineHeight: 62,
    color: colors.accentWarm,
    // Largeur bornée : sur le web, un champ texte prend sinon une largeur
    // par défaut énorme qui pousse l'anneau hors de l'écran.
    width: 140,
  },
  gaugeScore: {
    fontFamily: fonts.serifSemibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
    textAlign: 'center',
    width: 72,
  },

  section: { gap: spacing.md },
  toolsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  toolTile: { alignItems: 'center', gap: spacing.sm, width: 72 },
  toolCircle: {
    width: 54,
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportText: { flex: 1, gap: 2 },

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

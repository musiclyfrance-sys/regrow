import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { AppText, ScreenContainer } from '@/components';
import { MOODS } from '@/config/checkin';
import { colors, fonts, radii, spacing, themedStyles } from '@/theme';
import {
  Checkin,
  selectProgramDay,
  selectStreakDays,
  useStreakStore,
} from '@/state/streakStore';

const CHART_W = 300;
const CHART_H = 96;

/**
 * Progrès — la preuve visible du chemin parcouru.
 * Courbe d'humeur des 14 derniers jours (une série, trait fin, dernier point
 * mis en avant), tuiles de stats, et les derniers check-ins.
 */
export default function ProgressScreen() {
  const startDate = useStreakStore((s) => s.startDate);
  const lastContactDate = useStreakStore((s) => s.lastContactDate);
  const checkins = useStreakStore((s) => s.checkins);
  const challengesDone = useStreakStore((s) => s.challengesDone);

  const programDay = selectProgramDay(startDate);
  const streakDays = selectStreakDays({ startDate, lastContactDate });

  const recent = useMemo(() => checkins.slice(-14), [checkins]);
  const lastSeven = useMemo(() => [...checkins].slice(-7).reverse(), [checkins]);

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="title">Tes progrès</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          La guérison ne se sent pas jour par jour. Elle se voit semaine par
          semaine — la preuve ci-dessous.
        </AppText>

        {/* Courbe d'humeur (14 derniers check-ins). */}
        <View style={styles.card}>
          <AppText variant="caption" color={colors.textSecondary} style={styles.cardLabel}>
            TON HUMEUR — 14 DERNIERS CHECK-INS
          </AppText>
          {recent.length >= 2 ? (
            <MoodChart checkins={recent} />
          ) : (
            <AppText variant="body" color={colors.textSecondary} style={styles.empty}>
              Encore {2 - recent.length} check-in{recent.length === 0 ? 's' : ''} et ta
              courbe apparaît ici. Chaque soir compte.
            </AppText>
          )}
        </View>

        {/* Tuiles de stats. */}
        <View style={styles.tiles}>
          <StatTile value={streakDays} label="jours sans contact" />
          <StatTile value={programDay} label="jours de programme" />
          <StatTile value={checkins.length} label="check-ins faits" />
          <StatTile value={challengesDone} label="défis relevés" />
        </View>

        {/* Derniers check-ins. */}
        <View style={styles.card}>
          <AppText variant="caption" color={colors.textSecondary} style={styles.cardLabel}>
            TES DERNIERS SOIRS
          </AppText>
          {lastSeven.length === 0 ? (
            <AppText variant="body" color={colors.textSecondary} style={styles.empty}>
              Ton premier check-in t'attend ce soir.
            </AppText>
          ) : (
            lastSeven.map((c) => <CheckinRow key={c.date} checkin={c} />)
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

/** Courbe : une série, trait 2px lavande, dernier point souligné en pêche. */
function MoodChart({ checkins }: { checkins: Checkin[] }) {
  const points = checkins.map((c, i) => {
    const x = (i / Math.max(1, checkins.length - 1)) * (CHART_W - 16) + 8;
    // humeur 1 (bas) → 5 (haut), marges de 10.
    const y = CHART_H - 10 - ((c.mood - 1) / 4) * (CHART_H - 20);
    return { x, y };
  });
  const last = points[points.length - 1]!;

  return (
    <View>
      <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Le dernier point — là où elle en est. */}
        <Circle cx={last.x} cy={last.y} r={4.5} fill={colors.accentWarm} />
      </Svg>
      <View style={styles.chartAxis}>
        <AppText variant="caption" color={colors.textSecondary}>
          {MOODS[0]!.label}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {MOODS[4]!.label}
        </AppText>
      </View>
    </View>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.tile}>
      <AppText style={styles.tileValue}>{value}</AppText>
      <AppText variant="caption" color={colors.textSecondary} center>
        {label}
      </AppText>
    </View>
  );
}

function CheckinRow({ checkin }: { checkin: Checkin }) {
  const mood = MOODS.find((m) => m.value === checkin.mood);
  const date = new Date(`${checkin.date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
  });
  const contactLabel =
    checkin.contact === 'none'
      ? 'zéro contact'
      : checkin.contact === 'they_wrote'
        ? 'il/elle a écrit'
        : checkin.contact === 'i_wrote'
          ? 'tu as écrit'
          : 'vous vous êtes vus';

  return (
    <View style={styles.checkinRow}>
      <AppText style={styles.checkinFace}>{mood?.face ?? '·'}</AppText>
      <View style={styles.checkinInfo}>
        <AppText variant="bodyMedium">{date}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {mood?.label} · {contactLabel}
        </AppText>
      </View>
      {checkin.contact === 'none' && (
        <AppText variant="caption" color={colors.success}>
          ✓
        </AppText>
      )}
    </View>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardLabel: { letterSpacing: 1 },
  empty: { paddingVertical: spacing.md },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  tileValue: {
    fontFamily: fonts.serifSemibold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.accentWarm,
  },
  checkinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkinFace: { fontSize: 22, lineHeight: 28 },
  checkinInfo: { flex: 1, gap: 1 },
}));

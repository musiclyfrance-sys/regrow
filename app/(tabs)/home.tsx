import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AppText, CountUpText, ScoreRing, ScreenContainer } from '@/components';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radii, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import {
  selectStreakDays,
  selectTodayCheckin,
  useStreakStore,
} from '@/state/streakStore';

/**
 * Home — le rituel quotidien. Streak en très grand, jauge Détox Score qui
 * respire, check-in du jour, défi Glow-Up, panic button flottant en 1 tap.
 * L'incrément du jour déclenche l'animation + l'haptique au premier lancement.
 */
export default function HomeScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });

  const startDate = useStreakStore((s) => s.startDate);
  const lastContactDate = useStreakStore((s) => s.lastContactDate);
  const detoxScore = useStreakStore((s) => s.detoxScore);
  const checkins = useStreakStore((s) => s.checkins);
  const ensureStarted = useStreakStore((s) => s.ensureStarted);
  const registerOpen = useStreakStore((s) => s.registerOpen);

  const streakDays = selectStreakDays({ startDate, lastContactDate });
  const todayCheckin = selectTodayCheckin({ checkins });

  useEffect(() => {
    ensureStarted();
    // Premier lancement du jour : haptique médium avec l'anim d'entrée.
    if (registerOpen()) haptics.streak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Streak — le chiffre ROULE de 0 jusqu'au total : elle voit sa victoire grimper. */}
        <Animated.View entering={FadeInUp.duration(500)} style={styles.streakBlock}>
          <CountUpText value={streakDays} style={styles.streakNumber} />
          <AppText variant="body" color={colors.textSecondary}>
            {streakDays > 1 ? 'jours' : 'jour'} sans contact
          </AppText>
        </Animated.View>

        {/* Détox Score : l'anneau pêche se remplit jusqu'au score, la jauge respire. */}
        <View style={styles.gaugeBlock}>
          <ScoreRing score={detoxScore}>
            <CountUpText value={detoxScore} durationMs={1100} style={styles.gaugeScore} />
            <AppText variant="caption" color={colors.textSecondary}>
              Détox Score
            </AppText>
          </ScoreRing>
        </View>

        {/* Check-in du jour : fait ou à faire. */}
        <Card onPress={() => !todayCheckin && router.push('/checkin')} done={!!todayCheckin}>
          {todayCheckin ? (
            <>
              <AppText variant="caption" color={colors.success}>
                CHECK-IN FAIT ✓
              </AppText>
              <AppText variant="heading">À demain soir. Tiens bon.</AppText>
            </>
          ) : (
            <>
              <AppText variant="heading">Ton check-in du soir</AppText>
              <AppText variant="body" color={colors.textSecondary}>
                2 minutes. Ton insight du jour t'attend juste après.
              </AppText>
            </>
          )}
        </Card>

        {/* Défi Glow-Up du jour. */}
        <Card onPress={() => router.push('/(tabs)/journey')}>
          <AppText variant="caption" color={colors.accentWarm}>
            DÉFI DU JOUR
          </AppText>
          <AppText variant="heading">Sors 20 minutes, sans ton téléphone.</AppText>
        </Card>

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
    </ScreenContainer>
  );
}

function Card({
  children,
  onPress,
  done,
}: {
  children: React.ReactNode;
  onPress: () => void;
  done?: boolean;
}) {
  return (
    <Pressable style={[styles.card, done && styles.cardDone]} onPress={onPress}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: spacing.huge, paddingBottom: 120, gap: spacing.xxl },
  streakBlock: { alignItems: 'center', gap: spacing.xs },
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  cardDone: { opacity: 0.75 },
  hint: { marginTop: spacing.md },
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

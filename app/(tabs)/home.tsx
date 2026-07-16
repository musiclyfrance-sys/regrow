import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, BreathingCircle, ScreenContainer } from '@/components';
import { colors, radii, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';

/**
 * Home — le rituel quotidien. Streak no-contact en grand, jauge Détox Score qui
 * respire, carte check-in, carte défi Glow-Up. Panic button flottant permanent.
 *
 * (Squelette du MVP : streak/score/défis seront branchés sur les données réelles
 * de rétention dans les lots suivants — voir l'ordre de build.)
 */
export default function HomeScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });

  // Valeurs de démonstration en attendant le moteur de rétention.
  const streakDays = 1;
  const detoxScore = 12;

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Streak */}
        <View style={styles.streakBlock}>
          <AppText style={styles.streakNumber}>{streakDays}</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {streakDays > 1 ? 'jours' : 'jour'} sans contact
          </AppText>
        </View>

        {/* Jauge Détox Score (respiration lente) */}
        <View style={styles.gaugeBlock}>
          <BreathingCircle size={160} color={colors.surfaceRaised}>
            <AppText style={styles.gaugeScore}>{detoxScore}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Détox Score
            </AppText>
          </BreathingCircle>
        </View>

        {/* Check-in du jour */}
        <Card onPress={() => router.push('/checkin')}>
          <AppText variant="heading">Ton check-in du soir</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            2 minutes. Ton insight du jour t'attend juste après.
          </AppText>
        </Card>

        {/* Défi Glow-Up */}
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

function Card({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: spacing.huge, paddingBottom: 120, gap: spacing.xxl },
  streakBlock: { alignItems: 'center', gap: spacing.xs },
  streakNumber: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 64,
    lineHeight: 70,
    color: colors.accentWarm,
  },
  gaugeBlock: { alignItems: 'center' },
  gaugeScore: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 40,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
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

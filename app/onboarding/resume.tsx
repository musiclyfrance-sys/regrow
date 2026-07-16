import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { colors, spacing } from '@/theme';
import { useQuizStore } from '@/state/quizStore';

/**
 * Écran de reprise — l'utilisatrice retrouve son autopsie exactement où elle
 * l'avait laissée (tolérance réseau / fermeture d'app).
 */
export default function ResumeScreen() {
  const router = useRouter();
  const index = useQuizStore((s) => s.index);

  const resume = () =>
    router.replace({ pathname: '/onboarding/quiz/[step]', params: { step: String(index) } });

  return (
    <ScreenContainer center>
      <View style={styles.content}>
        <AppText variant="title" center>
          Ton autopsie t'attend là où tu l'as laissée.
        </AppText>
        <AppText variant="body" color={colors.textSecondary} center>
          Rien n'est perdu. On reprend au bon endroit.
        </AppText>
      </View>
      <View style={styles.action}>
        <PrimaryButton label="Reprendre" onPress={resume} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingHorizontal: spacing.lg },
  action: { position: 'absolute', bottom: spacing.huge, left: 24, right: 24 },
});

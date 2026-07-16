import { Linking, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { colors, spacing } from '@/theme';

/**
 * Écran ressources — affiché dès qu'un signal de détresse est détecté
 * (classifieur local OU flag IA / SAFETY_EXIT). Interrompt la fonctionnalité
 * en cours. L'événement est loggé côté appelant, SANS le contenu du message.
 */
export default function RessourcesScreen() {
  const router = useRouter();

  return (
    <ScreenContainer center>
      <View style={styles.content}>
        <AppText variant="title" center>
          Ce que tu traverses dépasse ce qu'une app peut porter.
        </AppText>
        <AppText variant="bodyLarge" color={colors.textSecondary} center style={styles.body}>
          Le 3114 est là, gratuit, 24h/24. Des personnes formées répondent, sans jugement.
          Tu peux revenir ici quand tu veux.
        </AppText>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Appeler le 3114" onPress={() => Linking.openURL('tel:3114')} />
        <PrimaryButton label="Revenir plus tard" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingHorizontal: spacing.md },
  body: {},
  actions: { position: 'absolute', bottom: spacing.huge, left: 24, right: 24, gap: spacing.md },
});

import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ScreenContainer } from './ScreenContainer';
import { colors, spacing } from '@/theme';

/**
 * Écran « prochainement » — placeholder honnête pour les features des lots
 * suivants (ordre de build 5→10). Évite tout écran mort pendant le MVP.
 */
export function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <ScreenContainer center>
      <View style={styles.content}>
        <AppText variant="title" center>
          {title}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} center>
          {subtitle}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary} center style={styles.tag}>
          Bientôt disponible
        </AppText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingHorizontal: spacing.lg },
  tag: { marginTop: spacing.lg, letterSpacing: 0.5 },
});

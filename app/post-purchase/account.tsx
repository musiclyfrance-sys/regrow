import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { useAppStore } from '@/state/appStore';

/**
 * Post-achat — un seul écran. Sécuriser l'espace (Sign in with Apple), sans
 * jamais bloquer l'accès au rapport. « Plus tard » reste possible.
 */
export default function AccountScreen() {
  const router = useRouter();
  const setHasAccount = useAppStore((s) => s.setHasAccount);

  const goReport = () => router.replace('/report');

  const signInApple = async () => {
    try {
      await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });
      // La liaison réelle session anonyme → identité se fait côté Supabase.
      setHasAccount(true);
      goReport();
    } catch {
      // Annulation : on n'insiste pas, l'accès n'est jamais bloqué.
    }
  };

  return (
    <ScreenContainer center>
      <View style={styles.content}>
        <AppText variant="title" center>
          Ton programme est débloqué.
        </AppText>
        <AppText variant="bodyLarge" color={colors.textSecondary} center style={styles.body}>
          Sécurise ton espace pour ne jamais perdre ton autopsie ni ton compteur.
        </AppText>
      </View>

      <View style={styles.actions}>
        {Platform.OS === 'ios' ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={radii.pill}
            style={styles.appleButton}
            onPress={signInApple}
          />
        ) : (
          <PrimaryButton label="Créer mon espace sécurisé" onPress={signInApple} />
        )}
        <PrimaryButton label="Plus tard" variant="ghost" onPress={goReport} />
      </View>
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  content: { gap: spacing.md, paddingHorizontal: spacing.sm },
  body: {},
  actions: { position: 'absolute', bottom: spacing.huge, left: 24, right: 24, gap: spacing.md },
  appleButton: { height: 56, width: '100%' },
}));

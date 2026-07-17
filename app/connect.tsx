import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { restore } from '@/lib/purchases';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { useAppStore } from '@/state/appStore';

/**
 * Connexion — pour celle qui revient (nouveau téléphone, réinstallation).
 * Deux portes : Sign in with Apple (retrouve son espace) ou la restauration
 * d'achats. Les nouvelles passent par le quiz, jamais par ici.
 */
export default function ConnectScreen() {
  const router = useRouter();
  const setEntitled = useAppStore((s) => s.setEntitled);
  const setHasAccount = useAppStore((s) => s.setHasAccount);
  const [busy, setBusy] = useState(false);

  const signInApple = async () => {
    try {
      await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      // La récupération réelle de l'espace (Supabase) arrive avec le backend.
      setHasAccount(true);
      setEntitled(true);
      router.replace('/(tabs)/home');
    } catch {
      // Annulation : on n'insiste pas.
    }
  };

  const onRestore = async () => {
    setBusy(true);
    const res = await restore();
    setBusy(false);
    if (res.status === 'success') {
      setEntitled(true);
      router.replace('/(tabs)/home');
    } else {
      Alert.alert(
        'Aucun achat trouvé',
        res.message ?? 'Vérifie que tu es connectée au bon compte Apple.',
      );
    }
  };

  return (
    <ScreenContainer center>
      <View style={styles.content}>
        <AppText variant="title" center>
          Contente de te revoir.
        </AppText>
        <AppText variant="bodyLarge" color={colors.textSecondary} center>
          Retrouve ton autopsie, ton compteur et ton programme, exactement là où tu
          les avais laissés.
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
          <PrimaryButton label="Retrouver mon espace" onPress={signInApple} />
        )}
        <PrimaryButton
          label="Restaurer mes achats"
          variant="ghost"
          loading={busy}
          onPress={onRestore}
        />
        <PrimaryButton label="‹ Retour" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  content: { gap: spacing.md, paddingHorizontal: spacing.sm },
  actions: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 24,
    right: 24,
    gap: spacing.md,
  },
  appleButton: { height: 56, width: '100%' },
}));

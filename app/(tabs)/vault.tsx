import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { colors, radii, spacing } from '@/theme';
import {
  selectDaysLeft,
  selectVaultStatus,
  useVaultStore,
} from '@/state/vaultStore';

const HOLD_MS = 10_000;

/**
 * Le coffre-fort. Avant verrouillage : import et aperçu. Après : le nombre
 * d'éléments, la date de J+90, rien d'autre. Déverrouillage anticipé possible
 * en maintenant 10 s (friction volontaire). À J+90 : Récupérer ou Brûler.
 */
export default function VaultScreen() {
  const router = useRouter();
  const itemUris = useVaultStore((s) => s.itemUris);
  const lockedAt = useVaultStore((s) => s.lockedAt);
  const unlockAt = useVaultStore((s) => s.unlockAt);
  const addItems = useVaultStore((s) => s.addItems);
  const lock = useVaultStore((s) => s.lock);
  const unlockEarly = useVaultStore((s) => s.unlockEarly);
  const recover = useVaultStore((s) => s.recover);

  const status = selectVaultStatus({ itemUris, lockedAt, unlockAt });
  const daysLeft = selectDaysLeft(unlockAt);
  const [earlyMode, setEarlyMode] = useState(false);
  const [denied, setDenied] = useState(false);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setDenied(true);
      return;
    }
    setDenied(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      addItems(result.assets.map((a) => a.uri));
      haptics.selection();
    }
  };

  const lockVault = () => {
    lock();
    track('vault_locked', { items: itemUris.length });
    haptics.soft();
  };

  // ─────────── Déverrouillage anticipé : maintenir 10 s ───────────
  if (earlyMode && status === 'locked') {
    return (
      <HoldToUnlock
        daysLeft={daysLeft}
        onCancel={() => setEarlyMode(false)}
        onUnlocked={() => {
          track('vault_unlock_attempted', { early: true, daysLeft });
          unlockEarly();
          setEarlyMode(false);
        }}
      />
    );
  }

  // ─────────── J+90 atteint : Récupérer ou Brûler ───────────
  if (status === 'ready') {
    return (
      <ScreenContainer center>
        <View style={styles.centerContent}>
          <AppText variant="title" center>
            90 jours, tu y es.
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSecondary} center>
            {itemUris.length} souvenir{itemUris.length > 1 ? 's' : ''} t'attendent.
            À toi de choisir ce qu'on en fait.
          </AppText>
        </View>
        <View style={styles.bottomBar}>
          <PrimaryButton
            label="Tout brûler"
            variant="danger"
            onPress={() => router.push('/cremation')}
          />
          <PrimaryButton
            label="Récupérer mes souvenirs"
            variant="ghost"
            onPress={() => {
              track('vault_recovered');
              recover();
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  // ─────────── Verrouillé : compte + date, rien d'autre ───────────
  if (status === 'locked') {
    const unlockDate = unlockAt
      ? new Date(unlockAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
        })
      : '';
    return (
      <ScreenContainer center>
        <View style={styles.centerContent}>
          <AppText style={styles.lockIcon}>🔒</AppText>
          <AppText variant="title" center>
            Tu as mis {itemUris.length} souvenir{itemUris.length > 1 ? 's' : ''} sous clé.
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSecondary} center>
            Le coffre s'ouvrira le {unlockDate}. D'ici là, il travaille pour toi.
          </AppText>
          <AppText variant="caption" color={colors.accentWarm} center>
            J-{daysLeft}
          </AppText>
        </View>
        <View style={styles.bottomBar}>
          <Pressable onPress={() => setEarlyMode(true)} style={styles.earlyLink}>
            <AppText variant="caption" color={colors.textSecondary} center>
              Déverrouiller en avance
            </AppText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // ─────────── Collecte : import + verrouillage ───────────
  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="title">Ton coffre-fort</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Range ici les photos et captures qui te font retomber. Une fois le
          coffre verrouillé, elles seront hors de portée jusqu'à J+90, sans
          être perdues.
        </AppText>

        {denied && (
          <View style={styles.deniedCard} accessibilityRole="alert">
            <AppText variant="body" color={colors.textPrimary}>
              L'accès aux photos est désactivé. Pour l'autoriser : Réglages →
              Regrow → Photos.
            </AppText>
          </View>
        )}

        {itemUris.length > 0 && (
          <View style={styles.grid}>
            {itemUris.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.thumb} />
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <PrimaryButton
            label={itemUris.length ? 'Ajouter d’autres photos' : 'Importer des photos'}
            variant="ghost"
            onPress={pickImages}
          />
          {itemUris.length > 0 && (
            <PrimaryButton
              label={`Verrouiller le coffre (${itemUris.length})`}
              onPress={lockVault}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─────────── Friction volontaire : maintenir 10 secondes ───────────
function HoldToUnlock({
  daysLeft,
  onCancel,
  onUnlocked,
}: {
  daysLeft: number;
  onCancel: () => void;
  onUnlocked: () => void;
}) {
  const progress = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const start = () => {
    setHolding(true);
    haptics.warning();
    progress.value = withTiming(1, { duration: HOLD_MS });
    timer.current = setTimeout(onUnlocked, HOLD_MS);
  };

  const stop = () => {
    setHolding(false);
    if (timer.current) clearTimeout(timer.current);
    progress.value = withTiming(0, { duration: 300 });
  };

  return (
    <ScreenContainer center>
      <View style={styles.centerContent}>
        <AppText variant="title" center>
          Tu es sûre. Vraiment.
        </AppText>
        <AppText variant="bodyLarge" color={colors.textSecondary} center>
          Il reste {daysLeft} jours. Tout ce que tu as mis à l'abri va redevenir
          accessible, y compris ce qui fait mal.
        </AppText>
        {holding && (
          <AppText variant="caption" color={colors.danger} center>
            Maintiens encore… c'est long, c'est fait exprès.
          </AppText>
        )}
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.holdTrack}>
          <Animated.View style={[styles.holdFill, barStyle]} />
          <Pressable
            onPressIn={start}
            onPressOut={stop}
            style={styles.holdButton}
            accessibilityLabel="Maintenir 10 secondes pour déverrouiller"
          >
            <AppText variant="buttonLabel" color={colors.textPrimary}>
              Maintenir pour déverrouiller
            </AppText>
          </Pressable>
        </View>
        <PrimaryButton label="Finalement, on laisse fermé" variant="ghost" onPress={onCancel} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: spacing.huge, paddingBottom: spacing.huge, gap: spacing.lg },
  centerContent: { gap: spacing.lg, paddingHorizontal: spacing.sm, alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: spacing.xl, left: 24, right: 24, gap: spacing.md },
  lockIcon: { fontSize: 44, lineHeight: 52 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: 96, height: 96, borderRadius: radii.card / 2, backgroundColor: colors.surfaceRaised },
  actions: { gap: spacing.md, marginTop: spacing.md },
  deniedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  earlyLink: { alignItems: 'center', paddingVertical: spacing.md },
  holdTrack: {
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  holdFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.danger,
    opacity: 0.5,
  },
  holdButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});

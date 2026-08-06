import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AppText, PrimaryButton, ScreenContainer, ShareCardSheet } from '@/components';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, gradients, motion, radii, spacing, themedStyles } from '@/theme';
import { useVaultStore } from '@/state/vaultStore';

const { height: SCREEN_H } = Dimensions.get('window');

/**
 * La cérémonie de crémation — 8 secondes :
 * les souvenirs s'assombrissent, des braises montent, haptique long,
 * 2 s de silence visuel, puis le Certificat de crémation.
 * La suppression est réelle et définitive.
 */
export default function CremationScreen() {
  const router = useRouter();
  const burn = useVaultStore((s) => s.burn);
  const itemCount = useVaultStore((s) => s.itemUris.length);
  const reduce = useReduceMotion();

  const [phase, setPhase] = useState<'burning' | 'silence' | 'certificate'>('burning');
  const [count] = useState(itemCount);
  const [sharing, setSharing] = useState(false);

  const darken = useSharedValue(0);

  useEffect(() => {
    haptics.heavy();
    darken.value = withTiming(1, {
      duration: reduce ? 0 : motion.cremationMs - 2000,
      easing: Easing.in(Easing.ease),
    });

    const toSilence = setTimeout(
      () => setPhase('silence'),
      reduce ? 300 : motion.cremationMs - 2000,
    );
    const toCertificate = setTimeout(
      () => {
        burn(); // Suppression réelle et définitive.
        track('vault_burned', { items: count });
        haptics.soft();
        setPhase('certificate');
      },
      reduce ? 600 : motion.cremationMs,
    );
    return () => {
      clearTimeout(toSilence);
      clearTimeout(toCertificate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const veilStyle = useAnimatedStyle(() => ({ opacity: darken.value * 0.9 }));

  if (phase === 'certificate') {
    const today = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return (
      <ScreenContainer center>
        <Animated.View entering={FadeIn.duration(600)} style={styles.certWrap}>
          <View style={styles.certificate}>
            <AppText variant="caption" color={colors.accentWarm} center style={styles.certLabel}>
              CERTIFICAT DE CRÉMATION
            </AppText>
            <AppText variant="title" center>
              {count} souvenir{count > 1 ? 's' : ''} rendu{count > 1 ? 's' : ''} au passé.
            </AppText>
            <AppText variant="body" color={colors.textSecondary} center>
              90 jours de travail. Une page tournée pour de vrai, le {today}.
            </AppText>
            <View style={styles.certLine} />
            <AppText variant="caption" color={colors.textSecondary} center>
              Regrow
            </AppText>
          </View>
        </Animated.View>
        <View style={styles.bottomBar}>
          <PrimaryButton label="Partager" variant="ghost" onPress={() => setSharing(true)} />
          <PrimaryButton label="Continuer ma vie" onPress={() => router.replace('/(tabs)/home')} />
        </View>
        {sharing && (
          <ShareCardSheet
            variant="cremation"
            value={count}
            onDone={() => setSharing(false)}
          />
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer center padded={false}>
      {/* Les souvenirs qui s'assombrissent (représentés par des vignettes). */}
      <View style={styles.memories}>
        {Array.from({ length: Math.min(9, Math.max(3, count)) }).map((_, i) => (
          <View key={i} style={styles.memory} />
        ))}
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.veil, veilStyle]} />

      {/* Braises qui montent depuis le bas. */}
      {!reduce && phase === 'burning' && <Embers />}

      {/* Dégradé ember en bas de l'écran. */}
      {phase === 'burning' && (
        <LinearGradient
          colors={[...gradients.ember].reverse() as [string, string]}
          style={styles.emberGlow}
          pointerEvents="none"
        />
      )}

      {phase === 'silence' && (
        <View style={styles.silence} pointerEvents="none" />
      )}
    </ScreenContainer>
  );
}

/** Particules de braise : petites lueurs qui montent en boucle. */
function Embers() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 14 }).map((_, i) => (
        <Ember key={i} index={i} />
      ))}
    </View>
  );
}

function Ember({ index }: { index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 280,
      withRepeat(
        withTiming(1, { duration: 2600 + (index % 5) * 500, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: -progress.value * SCREEN_H * 0.9 },
      { translateX: Math.sin(progress.value * 6 + index) * 18 },
    ],
    opacity: 1 - progress.value,
  }));

  const left = (index * 61) % 100;
  const size = 4 + (index % 3) * 3;

  return (
    <Animated.View
      style={[
        styles.ember,
        { left: `${left}%`, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  memories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.huge,
  },
  memory: {
    width: 88,
    height: 88,
    borderRadius: radii.card / 2,
    backgroundColor: colors.surfaceRaised,
  },
  veil: { backgroundColor: colors.background },
  emberGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    opacity: 0.35,
  },
  ember: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#F4A98C',
  },
  silence: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background },
  certWrap: { width: '100%', paddingHorizontal: 24 },
  certificate: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xxl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 169, 140, 0.35)',
  },
  certLabel: { letterSpacing: 2 },
  certLine: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  bottomBar: { position: 'absolute', bottom: spacing.xl, left: 24, right: 24, gap: spacing.md },
}));

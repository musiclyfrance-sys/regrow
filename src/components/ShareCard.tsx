import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { colors, fonts, gradients, radii, spacing } from '@/theme';

/**
 * Cartes partageables — capturées en image 1080×1920 (format story).
 * Trois modèles : milestone de streak, certificat de crémation, certificat de
 * guérison J+90. Fond de marque, lavande et pêche, filigrane discret.
 * Chaque partage est un canal d'acquisition : la qualité visuelle compte.
 */

export type ShareCardVariant = 'milestone' | 'cremation' | 'healing';

interface Props {
  variant: ShareCardVariant;
  /** Jours de streak (milestone) ou nombre d'éléments brûlés (crémation). */
  value: number;
  date?: string;
}

// Rendu à l'échelle 1/3 (360×640), capturé en 1080×1920 via pixelRatio 3.
const W = 360;
const H = 640;

export const ShareCard = forwardRef<View, Props>(function ShareCard(
  { variant, value, date },
  ref,
) {
  const displayDate =
    date ??
    new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      {/* Halo discret en haut : lavande pour les jalons, ember pour le feu. */}
      <LinearGradient
        colors={
          variant === 'cremation'
            ? ['rgba(224,94,63,0.28)', 'rgba(19,16,25,0)']
            : ['rgba(167,139,250,0.22)', 'rgba(19,16,25,0)']
        }
        style={styles.halo}
      />

      <View style={styles.content}>
        {variant === 'milestone' && (
          <>
            <AppText style={styles.label}>SANS LUI ÉCRIRE</AppText>
            <AppText style={styles.bigNumber}>{value}</AppText>
            <AppText style={styles.bigCaption}>
              {value > 1 ? 'jours' : 'jour'}
            </AppText>
            <View style={styles.divider} />
            <AppText style={styles.subtitle}>
              Chaque jour, il prend moins de place.
            </AppText>
          </>
        )}

        {variant === 'cremation' && (
          <>
            <AppText style={[styles.label, { color: colors.accentWarm }]}>
              CERTIFICAT DE CRÉMATION
            </AppText>
            <AppText style={styles.title}>
              {value} souvenir{value > 1 ? 's' : ''} rendu{value > 1 ? 's' : ''} au passé.
            </AppText>
            <View style={styles.emberLine}>
              <LinearGradient
                colors={[...gradients.ember]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emberFill}
              />
            </View>
            <AppText style={styles.subtitle}>
              Une page tournée pour de vrai, le {displayDate}.
            </AppText>
          </>
        )}

        {variant === 'healing' && (
          <>
            <AppText style={[styles.label, { color: colors.success }]}>
              CERTIFICAT DE GUÉRISON
            </AppText>
            <AppText style={styles.bigNumber}>90</AppText>
            <AppText style={styles.bigCaption}>jours</AppText>
            <View style={styles.divider} />
            <AppText style={styles.subtitle}>
              Reconstruite. Pas réparée — reconstruite.
            </AppText>
            <AppText style={styles.dateText}>{displayDate}</AppText>
          </>
        )}
      </View>

      {/* Filigrane discret. */}
      <AppText style={styles.watermark}>Regrow</AppText>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: W,
    height: H,
    backgroundColor: colors.background,
    borderRadius: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: { position: 'absolute', top: 0, left: 0, right: 0, height: H * 0.45 },
  content: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.huge,
  },
  label: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    letterSpacing: 4,
    color: colors.primarySoft,
    textAlign: 'center',
  },
  bigNumber: {
    fontFamily: fonts.serifSemibold,
    fontSize: 150,
    lineHeight: 160,
    color: colors.accentWarm,
    textAlign: 'center',
  },
  bigCaption: {
    fontFamily: fonts.serifMedium,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: -spacing.lg,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.serifSemibold,
    fontSize: 30,
    lineHeight: 40,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  divider: {
    width: 56,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    marginVertical: spacing.md,
  },
  emberLine: {
    width: 120,
    height: 3,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  emberFill: { flex: 1 },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dateText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    fontFamily: fonts.serifMedium,
    fontSize: 15,
    color: 'rgba(245,241,232,0.4)',
    letterSpacing: 1,
  },
});

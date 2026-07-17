import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import {
  AppText,
  HealingCurve,
  PrimaryButton,
  ScreenContainer,
} from '@/components';
import { track } from '@/lib/analytics';
import { colors, radii, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import { useAppStore } from '@/state/appStore';

/**
 * Le teaser, en 2 temps — parce qu'on ne vend pas un rapport, on vend une
 * reconstruction :
 *   1. LA PREUVE : le verdict offert + les chapitres réels floutés.
 *   2. LE PROGRAMME : 90 jours pour le sortir de sa tête, des rituels courts,
 *      les outils — puis seulement le paywall.
 */
export default function TeaserScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });
  const report = useAppStore((s) => s.report);
  const [step, setStep] = useState<'proof' | 'program'>('proof');

  useEffect(() => {
    track('teaser_viewed');
  }, []);

  const openPaywall = (section?: string) => {
    if (section) track('teaser_card_tapped', { section });
    router.push('/paywall');
  };

  // ─────────── Temps 2 : LE PROGRAMME ───────────
  if (step === 'program') {
    return (
      <ScreenContainer padded={false}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(350)} style={styles.programHeader}>
            <AppText variant="caption" color={colors.accentWarm} style={styles.badge}>
              TON PROGRAMME PERSONNALISÉ
            </AppText>
            <AppText variant="display">
              90 jours pour le sortir de ta tête.
            </AppText>
            <AppText variant="bodyLarge" color={colors.textSecondary}>
              Pas de thérapie interminable. Des rituels courts, calibrés sur tes
              réponses — 2 minutes le soir suffisent. Et jour après jour, {ex}
              prend moins de place. Mécaniquement.
            </AppText>
          </Animated.View>

          <HealingCurve exName={ex} />

          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={f.title}
                entering={FadeInDown.delay(150 + i * 90).duration(300)}
                style={styles.featureRow}
              >
                <View style={styles.featureIcon}>
                  <FeatureIcon name={f.icon} />
                </View>
                <View style={styles.featureText}>
                  <AppText variant="bodyMedium">{f.title}</AppText>
                  <AppText variant="body" color={colors.textSecondary}>
                    {f.desc.replaceAll('{ex}', ex)}
                  </AppText>
                </View>
              </Animated.View>
            ))}
          </View>

          <View style={styles.reassure}>
            <AppText variant="body" color={colors.textSecondary} center>
              Ton autopsie et ton plan sont déjà prêts. Ils t'attendent derrière
              cette porte.
            </AppText>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Débloquer mon programme" onPress={() => openPaywall()} />
          <Pressable onPress={() => setStep('proof')} style={styles.backLink}>
            <AppText variant="caption" color={colors.textSecondary} center>
              ‹ Revoir mon verdict
            </AppText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // ─────────── Temps 1 : LA PREUVE ───────────
  const sections = [
    { key: 'attachement', title: `Le style d'attachement de ${ex}`, text: report?.attachement_ex },
    { key: 'pattern', title: 'Ton pattern à toi', text: report?.pattern_utilisatrice },
    { key: 'dynamique', title: 'La dynamique qui vous a tués', text: report?.dynamique },
    { key: 'parts', title: 'Sa part et ta part', text: report?.parts },
    { key: 'redflags', title: 'Les red flags que tu avais vus', text: report?.red_flags?.join('\n') },
  ];

  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.pad}>
            <AppText variant="caption" color={colors.primarySoft} style={styles.badge}>
              2 400 MOTS D'ANALYSE · 6 CHAPITRES
            </AppText>
            <AppText variant="title" style={styles.reportTitle}>
              L'autopsie de ton histoire avec {ex}
            </AppText>

            {/* Verdict global — entièrement lisible : le cadeau de bonne foi. */}
            <View style={styles.verdictCard}>
              <AppText variant="caption" color={colors.textSecondary} style={styles.verdictLabel}>
                TON VERDICT — OFFERT
              </AppText>
              <AppText variant="heading" color={colors.textPrimary}>
                {report?.verdict_global ?? '…'}
              </AppText>
            </View>

            {sections.map((s) => (
              <Pressable key={s.key} onPress={() => openPaywall(s.key)} style={styles.card}>
                <AppText variant="heading" style={styles.cardTitle}>
                  {s.title}
                </AppText>
                <View style={styles.blurWrap}>
                  <AppText variant="body" color={colors.textSecondary} numberOfLines={4}>
                    {s.text ?? ''}
                  </AppText>
                  {/* Vrai texte derrière un blur — pas un placeholder. */}
                  <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
                </View>
              </Pressable>
            ))}

            <AppText variant="body" color={colors.textSecondary} center style={styles.more}>
              Et ce rapport n'est que le jour 1.
            </AppText>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Voir ce qui m'attend" onPress={() => setStep('program')} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const FEATURES = [
  {
    icon: 'checkin' as const,
    title: 'Le check-in du soir · 2 min',
    desc: 'Un rituel court à ton heure faible, qui désamorce l’envie d’écrire. Avec un insight nouveau chaque jour.',
  },
  {
    icon: 'shield' as const,
    title: 'Le crash test de message',
    desc: 'Le message que tu brûles d’envoyer à {ex} ? Envoie-le ici, et vois comment ça finirait vraiment.',
  },
  {
    icon: 'lock' as const,
    title: 'Le coffre-fort à souvenirs',
    desc: 'Photos et captures sous clé jusqu’à J+90. Puis tu choisis : récupérer, ou brûler.',
  },
  {
    icon: 'flame' as const,
    title: 'La streak et les défis',
    desc: 'Chaque jour tenu se voit. Chaque palier se célèbre. Ta reconstruction devient visible.',
  },
];

function FeatureIcon({ name }: { name: 'checkin' | 'shield' | 'lock' | 'flame' }) {
  const stroke = { stroke: colors.primary, strokeWidth: 1.8, fill: 'none' as const };
  const round = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'checkin':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M12 21a9 9 0 1 1 9-9" {...stroke} {...round} />
          <Path d="m9 12 2.2 2.2L21 4" {...stroke} {...round} />
        </Svg>
      );
    case 'shield':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" {...stroke} {...round} />
        </Svg>
      );
    case 'lock':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M6 11h12v9H6z" {...stroke} {...round} />
          <Path d="M9 11V8a3 3 0 0 1 6 0v3" {...stroke} {...round} />
        </Svg>
      );
    case 'flame':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-1.5.5-3 1.5-4.5C9 9 10.5 10 12 10c0-3 0-5 0-7Z"
            {...stroke}
            {...round}
          />
        </Svg>
      );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: spacing.xl },
  pad: { paddingHorizontal: 24, paddingTop: spacing.xl, paddingBottom: spacing.huge, gap: spacing.lg },
  badge: { letterSpacing: 1.2 },
  reportTitle: { marginBottom: spacing.sm },
  verdictCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  verdictLabel: { letterSpacing: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardTitle: {},
  blurWrap: { position: 'relative', overflow: 'hidden', borderRadius: radii.card },
  more: { marginTop: spacing.sm },
  footer: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backLink: { paddingVertical: spacing.xs },
  programHeader: { gap: spacing.md },
  features: { gap: spacing.lg },
  featureRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.card / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, gap: 2 },
  reassure: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
});

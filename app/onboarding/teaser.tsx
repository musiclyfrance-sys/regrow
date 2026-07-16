import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { track } from '@/lib/analytics';
import { colors, radii, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import { useAppStore } from '@/state/appStore';

/**
 * Teaser du rapport — révélation partielle.
 * Le verdict global est ENTIÈREMENT lisible (cadeau de bonne foi). Les 6 sections
 * affichent leur vrai contenu, mais flouté. Tout tap sur une carte → paywall.
 */
export default function TeaserScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });
  const report = useAppStore((s) => s.report);

  useEffect(() => {
    track('teaser_viewed');
  }, []);

  const openPaywall = (section?: string) => {
    if (section) track('teaser_card_tapped', { section });
    router.push('/paywall');
  };

  const sections = [
    { key: 'attachement', title: `Le style d'attachement de ${ex}`, text: report?.attachement_ex },
    { key: 'pattern', title: 'Ton pattern à toi', text: report?.pattern_utilisatrice },
    { key: 'dynamique', title: 'La dynamique qui vous a tués', text: report?.dynamique },
    { key: 'parts', title: 'Sa part et ta part', text: report?.parts },
    { key: 'redflags', title: 'Les red flags que tu avais vus', text: report?.red_flags?.join('\n') },
    { key: 'plan', title: 'Ton plan des 90 prochains jours', text: report?.plan_90_jours?.map((p) => `${p.phase}\n${p.objectif}`).join('\n\n') },
  ];

  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.pad}>
            <AppText variant="caption" color={colors.primarySoft} style={styles.badge}>
              2 400 MOTS D'ANALYSE
            </AppText>
            <AppText variant="title" style={styles.reportTitle}>
              L'autopsie de ton histoire avec {ex}
            </AppText>

            {/* Verdict global — entièrement lisible. */}
            <View style={styles.verdictCard}>
              <AppText variant="caption" color={colors.textSecondary} style={styles.verdictLabel}>
                LE VERDICT
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
                  <AppText variant="body" color={colors.textSecondary} numberOfLines={5}>
                    {s.text ?? ''}
                  </AppText>
                  {/* Vrai texte derrière un blur — pas un placeholder. */}
                  <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
                </View>
                <AppText variant="caption" color={colors.primary} style={styles.lockHint}>
                  Touche pour débloquer
                </AppText>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Débloquer mon rapport" onPress={() => openPaywall()} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  pad: { paddingHorizontal: 24, paddingTop: spacing.xl, paddingBottom: spacing.huge, gap: spacing.lg },
  badge: { letterSpacing: 1 },
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
  blurWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.card,
  },
  lockHint: { letterSpacing: 0.3 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

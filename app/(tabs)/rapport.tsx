import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText, ScreenContainer } from '@/components';
import { colors, radii, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import { useAppStore } from '@/state/appStore';

/**
 * Rapport — l'autopsie, relisible à tout moment. Elle a payé pour ce texte :
 * il reste à portée de main, surtout les soirs de doute (« relis ton verdict »).
 */
export default function RapportScreen() {
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });
  const report = useAppStore((s) => s.report);

  if (!report) {
    return (
      <ScreenContainer center>
        <AppText variant="body" color={colors.textSecondary} center>
          Ton rapport apparaîtra ici dès qu'il sera généré.
        </AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color={colors.textSecondary} style={styles.hint}>
          À relire les soirs où tu doutes. Rien n'a changé depuis.
        </AppText>
        <AppText variant="display" style={styles.title}>
          L'autopsie de ton histoire avec {ex}
        </AppText>

        <View style={styles.verdict}>
          <AppText variant="heading">{report.verdict_global}</AppText>
        </View>

        <Section title={`Le style d'attachement de ${ex}`} body={report.attachement_ex} />
        <Section title="Ton pattern à toi" body={report.pattern_utilisatrice} />
        <Section title="La dynamique qui vous a tués" body={report.dynamique} />
        <Section title="Sa part et ta part" body={report.parts} />

        <View style={styles.section}>
          <AppText variant="heading">Les red flags que tu avais vus</AppText>
          {report.red_flags.map((rf, i) => (
            <View key={i} style={styles.flagRow}>
              <View style={styles.flagDot} />
              <AppText variant="body" style={styles.flagText}>
                {rf}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="title">Ton plan des 90 prochains jours</AppText>
          {report.plan_90_jours.map((phase, i) => (
            <View key={i} style={styles.phaseCard}>
              <AppText variant="heading" color={colors.primarySoft}>
                {phase.phase}
              </AppText>
              <AppText variant="body" color={colors.textSecondary}>
                {phase.objectif}
              </AppText>
              {phase.actions.map((a, j) => (
                <AppText key={j} variant="body" style={styles.action}>
                  · {a}
                </AppText>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="bodyLarge" style={styles.sectionBody}>
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.xxl,
  },
  hint: { letterSpacing: 0.4 },
  title: { marginTop: -spacing.md },
  verdict: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  section: { gap: spacing.md },
  sectionBody: { lineHeight: 26 },
  flagRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginTop: 8,
  },
  flagText: { flex: 1 },
  phaseCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  action: { lineHeight: 24 },
});

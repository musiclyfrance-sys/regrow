import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { colors, radii, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import { useAppStore } from '@/state/appStore';

const WEAK_HOUR_LABEL: Record<string, string> = {
  '7': '7h',
  '13': 'midi',
  '19': '19h',
  '23': '23h',
  '2': 'au milieu de la nuit',
};

/**
 * Le rapport complet — page éditoriale scrollable. Titre Gooper, intertitres,
 * plan 90 jours en timeline. Le bouton final demande la permission notif
 * (à ce moment précis, jamais avant) via un pré-écran d'explication.
 */
export default function ReportScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });
  const report = useAppStore((s) => s.report);
  const [askNotif, setAskNotif] = useState(false);

  const weakHour = WEAK_HOUR_LABEL[String(profile.weakHour ?? '23')] ?? '23h';

  const startDay1 = async () => {
    // Pré-écran affiché → l'utilisatrice a compris, on demande la permission.
    await Notifications.requestPermissionsAsync();
    router.replace('/(tabs)/home');
  };

  if (!report) {
    return (
      <ScreenContainer center>
        <AppText variant="body" color={colors.textSecondary}>
          Chargement de ton rapport…
        </AppText>
      </ScreenContainer>
    );
  }

  if (askNotif) {
    return (
      <ScreenContainer center>
        <View style={styles.notifContent}>
          <AppText variant="title" center>
            Je peux te tenir la main.
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSecondary} center style={styles.notifBody}>
            Aux heures où c'est le plus dur. Tu as dit que c'était vers {weakHour}.
          </AppText>
        </View>
        <View style={styles.notifActions}>
          <PrimaryButton label="Activer les rappels" onPress={startDay1} />
          <PrimaryButton
            label="Pas maintenant"
            variant="ghost"
            onPress={() => router.replace('/(tabs)/home')}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
          <AppText variant="heading" style={styles.sectionTitle}>
            Les red flags que tu avais vus
          </AppText>
          {report.red_flags.map((rf, i) => (
            <View key={i} style={styles.flagRow}>
              <AppText variant="body" color={colors.danger}>
                ⚑
              </AppText>
              <AppText variant="body" style={styles.flagText}>
                {rf}
              </AppText>
            </View>
          ))}
        </View>

        {/* Plan 90 jours — timeline verticale. */}
        <View style={styles.section}>
          <AppText variant="title" style={styles.sectionTitle}>
            Ton plan des 90 prochains jours
          </AppText>
          {report.plan_90_jours.map((phase, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineDotCol}>
                <View style={styles.timelineDot} />
                {i < report.plan_90_jours.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <AppText variant="heading" color={colors.primarySoft}>
                  {phase.phase}
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.phaseGoal}>
                  {phase.objectif}
                </AppText>
                {phase.actions.map((a, j) => (
                  <AppText key={j} variant="body" style={styles.action}>
                    · {a}
                  </AppText>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Commencer le jour 1" onPress={() => setAskNotif(true)} />
      </View>
    </ScreenContainer>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading" style={styles.sectionTitle}>
        {title}
      </AppText>
      <AppText variant="bodyLarge" color={colors.textPrimary} style={styles.sectionBody}>
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: spacing.xl, paddingBottom: spacing.huge, gap: spacing.xxl },
  title: {},
  verdict: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  section: { gap: spacing.md },
  sectionTitle: {},
  sectionBody: { lineHeight: 26 },
  flagRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  flagText: { flex: 1 },
  timelineItem: { flexDirection: 'row', gap: spacing.lg },
  timelineDotCol: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accentWarm, marginTop: 6 },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: spacing.xs },
  timelineContent: { flex: 1, gap: spacing.sm, paddingBottom: spacing.xl },
  phaseGoal: {},
  action: { lineHeight: 24 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notifContent: { gap: spacing.md, paddingHorizontal: spacing.sm },
  notifBody: {},
  notifActions: { position: 'absolute', bottom: spacing.huge, left: 24, right: 24, gap: spacing.md },
});

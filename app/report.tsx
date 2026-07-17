import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AppText, PrimaryButton, ReportPager, ScreenContainer } from '@/components';
import { colors, spacing, themedStyles } from '@/theme';
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
 * Première lecture du rapport — en chapitres feuilletables (jamais un mur de
 * texte). Le dernier chapitre se termine par « Commencer le jour 1 », qui
 * déclenche la demande de notification (à ce moment précis, jamais avant).
 */
export default function ReportScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });
  const report = useAppStore((s) => s.report);
  const [askNotif, setAskNotif] = useState(false);

  const weakHour = WEAK_HOUR_LABEL[String(profile.weakHour ?? '23')] ?? '23h';

  const startDay1 = async () => {
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
          <AppText variant="bodyLarge" color={colors.textSecondary} center>
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
      <ReportPager
        report={report}
        exName={ex}
        finalAction={{ label: 'Commencer le jour 1', onPress: () => setAskNotif(true) }}
      />
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  notifContent: { gap: spacing.md, paddingHorizontal: spacing.sm },
  notifActions: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 24,
    right: 24,
    gap: spacing.md,
  },
}));

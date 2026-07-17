import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { AppText, ReportPager, ScreenContainer } from '@/components';
import { colors, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import { useAppStore } from '@/state/appStore';

/**
 * Rapport — l'autopsie relisible à tout moment, feuilletable par chapitres.
 * Son ancre des soirs de doute. Accessible depuis l'accueil et le parcours.
 */
export default function RapportScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });
  const report = useAppStore((s) => s.report);

  return (
    <ScreenContainer padded={false}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Retour"
          style={styles.backBtn}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="m14 6-6 6 6 6"
              stroke={colors.textPrimary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>
        <AppText variant="caption" color={colors.textSecondary} style={styles.topLabel}>
          TON AUTOPSIE
        </AppText>
        <View style={styles.backBtn} />
      </View>

      {report ? (
        <ReportPager report={report} exName={ex} />
      ) : (
        <View style={styles.empty}>
          <AppText variant="body" color={colors.textSecondary} center>
            Ton rapport apparaîtra ici dès qu'il sera généré.
          </AppText>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backBtn: { padding: spacing.sm, width: 38 },
  topLabel: { letterSpacing: 1.4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
});

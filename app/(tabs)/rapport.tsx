import { AppText, ReportPager, ScreenContainer } from '@/components';
import { colors } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import { useAppStore } from '@/state/appStore';

/**
 * Rapport — l'autopsie relisible à tout moment, feuilletable par chapitres.
 * Son ancre des soirs de doute.
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
      <ReportPager report={report} exName={ex} />
    </ScreenContainer>
  );
}

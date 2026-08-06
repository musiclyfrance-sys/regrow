import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppText,
  PrimaryButton,
  QuizProgress,
  ScreenContainer,
} from '@/components';
import { QUIZ } from '@/config/quiz';
import { PHASE_LABELS } from '@/config/quizTypes';
import { colors, spacing, themedStyles } from '@/theme';
import { useQuizStore } from '@/state/quizStore';

/**
 * Reprise — elle retrouve son autopsie EXACTEMENT où elle l'a laissée,
 * avec sa progression visible. Aucune question à refaire.
 */
export default function ResumeScreen() {
  const router = useRouter();
  const index = useQuizStore((s) => s.index);

  const questionsDone = QUIZ.slice(0, index).filter((s) => s.kind === 'question').length;
  const total = QUIZ.filter((s) => s.kind === 'question').length;
  const current = QUIZ[Math.min(index, QUIZ.length - 1)];
  const phaseLabel = current ? PHASE_LABELS[current.phase] : '';
  const segments = (() => {
    const counts = [0, 0, 0, 0];
    for (const s of QUIZ) if (s.kind === 'question') counts[s.phase - 1]! += 1;
    return counts;
  })();

  const resume = () =>
    router.replace({ pathname: '/onboarding/quiz/[step]', params: { step: String(index) } });

  return (
    <ScreenContainer center>
      <View style={styles.content}>
        <AppText variant="title" center>
          Ton autopsie t'attend là où tu l'as laissée.
        </AppText>
        <AppText variant="body" color={colors.textSecondary} center>
          {questionsDone} réponse{questionsDone > 1 ? 's' : ''} déjà enregistrée
          {questionsDone > 1 ? 's' : ''} sur {total}. Rien n'est perdu.
        </AppText>
        <View style={styles.progress}>
          <QuizProgress
            questionsDone={questionsDone}
            segments={segments}
            phaseLabel={phaseLabel}
          />
        </View>
      </View>
      <View style={styles.action}>
        <PrimaryButton label="Reprendre où j'en étais" onPress={resume} />
      </View>
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  content: { gap: spacing.lg, paddingHorizontal: spacing.sm, width: '100%' },
  progress: { marginTop: spacing.md },
  action: { position: 'absolute', bottom: spacing.huge, left: 24, right: 24 },
}));

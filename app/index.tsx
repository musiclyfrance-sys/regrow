import { Redirect } from 'expo-router';
import { useAppStore } from '@/state/appStore';
import { useQuizStore } from '@/state/quizStore';

/**
 * Point d'entrée : route l'utilisatrice selon son avancement.
 * - déjà cliente → l'app (home)
 * - quiz terminé, pas encore payé → teaser
 * - quiz commencé au milieu → écran de reprise (reprise exacte)
 * - sinon → écran hook
 */
export default function Index() {
  const entitled = useAppStore((s) => s.entitled);
  const started = useQuizStore((s) => s.started);
  const completed = useQuizStore((s) => s.completed);
  const index = useQuizStore((s) => s.index);

  if (entitled) return <Redirect href="/(tabs)/home" />;
  if (completed) return <Redirect href="/onboarding/teaser" />;
  if (started && index > 0) return <Redirect href="/onboarding/resume" />;
  return <Redirect href="/onboarding/hook" />;
}

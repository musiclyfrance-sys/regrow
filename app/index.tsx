import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@/theme';
import { useAppStore } from '@/state/appStore';
import { useQuizStore } from '@/state/quizStore';

/** Vrai quand les mémoires persistées sont relues (règle : jamais rediriger avant). */
function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    useAppStore.persist.hasHydrated() && useQuizStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const check = () => {
      if (useAppStore.persist.hasHydrated() && useQuizStore.persist.hasHydrated()) {
        setHydrated(true);
      }
    };
    const offApp = useAppStore.persist.onFinishHydration(check);
    const offQuiz = useQuizStore.persist.onFinishHydration(check);
    check();
    return () => {
      offApp();
      offQuiz();
    };
  }, []);

  return hydrated;
}

/**
 * Point d'entrée : route l'utilisatrice selon son avancement.
 * - déjà cliente → l'app (home)
 * - quiz terminé, pas encore payé → teaser
 * - quiz commencé au milieu → écran de reprise (reprise exacte)
 * - sinon → écran hook
 * On attend la relecture de la mémoire avant de rediriger, sinon une cliente
 * peut voir flasher l'écran d'accueil du funnel à chaque ouverture.
 */
export default function Index() {
  const hydrated = useStoresHydrated();
  const entitled = useAppStore((s) => s.entitled);
  const started = useQuizStore((s) => s.started);
  const completed = useQuizStore((s) => s.completed);
  const index = useQuizStore((s) => s.index);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  if (entitled) return <Redirect href="/(tabs)/home" />;
  if (completed) return <Redirect href="/onboarding/teaser" />;
  if (started && index > 0) return <Redirect href="/onboarding/resume" />;
  return <Redirect href="/onboarding/hook" />;
}

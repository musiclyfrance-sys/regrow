import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { QUIZ } from '@/config/quiz';
import { ProfileVar, QuestionStep } from '@/config/quizTypes';
import { StorageKeys } from '@/lib/storage';

/** Valeur d'une réponse selon le type de question. */
export type AnswerValue = string | string[] | number | null;

interface QuizState {
  /** Réponses indexées par id de question. */
  answers: Record<string, AnswerValue>;
  /** Variables de profil capturées (exName, weakHour, …). */
  profile: Partial<Record<ProfileVar, AnswerValue>>;
  /** Index courant dans le tableau QUIZ (questions + interludes). */
  index: number;
  /** L'autopsie a été démarrée au moins une fois. */
  started: boolean;
  /** Le quiz a été entièrement terminé. */
  completed: boolean;

  start: () => void;
  setAnswer: (question: QuestionStep, value: AnswerValue) => void;
  next: () => void;
  goTo: (index: number) => void;
  reset: () => void;
}

/**
 * Store du quiz, persisté localement (tolérance réseau).
 *
 * Reprise EXACTE : `index` et `answers` sont sauvegardés à chaque réponse, donc
 * l'utilisatrice retombe pile où elle était après une fermeture de l'app.
 */
export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      answers: {},
      profile: {},
      index: 0,
      started: false,
      completed: false,

      start: () => set({ started: true }),

      setAnswer: (question, value) => {
        const answers = { ...get().answers, [question.id]: value };
        const profile = { ...get().profile };
        if (question.capture) profile[question.capture] = value;
        set({ answers, profile });
      },

      next: () => {
        const { index } = get();
        const nextIndex = Math.min(index + 1, QUIZ.length);
        set({
          index: nextIndex,
          completed: nextIndex >= QUIZ.length,
        });
      },

      goTo: (index) => set({ index: Math.max(0, Math.min(index, QUIZ.length)) }),

      reset: () =>
        set({
          answers: {},
          profile: {},
          index: 0,
          started: false,
          completed: false,
        }),
    }),
    {
      name: StorageKeys.quizDraft,
      storage: createJSONStorage(() => AsyncStorage),
      // On ne persiste que l'essentiel à la reprise.
      partialize: (s) => ({
        answers: s.answers,
        profile: s.profile,
        index: s.index,
        started: s.started,
        completed: s.completed,
      }),
    },
  ),
);

/** Prénom de l'ex, avec repli neutre tant qu'il n'est pas saisi. */
export function selectExName(state: Pick<QuizState, 'profile'>): string {
  const raw = state.profile.exName;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : 'ton ex';
}

/** Remplace {ex} par le prénom (ou le repli) dans un texte du quiz. */
export function resolveText(template: string, exName: string): string {
  return template.replaceAll('{ex}', exName);
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AutopsyReport } from '@/lib/ai';

interface AppState {
  /** L'utilisatrice a débloqué le rapport (achat RevenueCat validé). */
  entitled: boolean;
  /** Rapport d'autopsie généré (mocké ou réel). */
  report: AutopsyReport | null;
  /** Un compte (Sign in with Apple) a été lié à la session. */
  hasAccount: boolean;
  /** Prénom choisi par l'utilisatrice (optionnel, APRÈS l'achat — jamais avant). */
  userName: string | null;

  setEntitled: (v: boolean) => void;
  setReport: (r: AutopsyReport | null) => void;
  setHasAccount: (v: boolean) => void;
  setUserName: (name: string | null) => void;
}

/**
 * État applicatif transverse (accès, rapport, compte).
 * Le rapport est persisté pour ne jamais être reperdu après l'achat.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      entitled: false,
      report: null,
      hasAccount: false,
      userName: null,
      setEntitled: (v) => set({ entitled: v }),
      setReport: (r) => set({ report: r }),
      setHasAccount: (v) => set({ hasAccount: v }),
      setUserName: (name) => set({ userName: name?.trim() || null }),
    }),
    {
      name: 'regrow.app.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

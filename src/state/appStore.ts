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

  setEntitled: (v: boolean) => void;
  setReport: (r: AutopsyReport | null) => void;
  setHasAccount: (v: boolean) => void;
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
      setEntitled: (v) => set({ entitled: v }),
      setReport: (r) => set({ report: r }),
      setHasAccount: (v) => set({ hasAccount: v }),
    }),
    {
      name: 'regrow.app.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

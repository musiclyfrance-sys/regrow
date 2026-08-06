import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ThemeMode } from './palettes';

/**
 * Choix nuit / jour — persisté, nuit par défaut (l'app vit surtout la nuit).
 * La bascule vit sur l'accueil (icône soleil / lune).
 */

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'nuit',
      toggleMode: () => set({ mode: get().mode === 'nuit' ? 'jour' : 'nuit' }),
    }),
    { name: 'regrow.theme.v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Lecture directe du mode courant, hors composant React. */
export function currentMode(): ThemeMode {
  return useThemeStore.getState().mode;
}

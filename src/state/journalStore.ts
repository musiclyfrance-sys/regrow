import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Journal libre — entrées locales, jamais envoyées à un serveur.
 * C'est l'endroit où écrire le message qu'on n'enverra pas.
 */

export interface JournalEntry {
  id: string;
  /** ISO date-time de création. */
  createdAt: string;
  text: string;
}

interface JournalState {
  entries: JournalEntry[];
  addEntry: (text: string) => void;
  removeEntry: (id: string) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const entry: JournalEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          text: trimmed,
        };
        set({ entries: [entry, ...get().entries] });
      },
      removeEntry: (id) => set({ entries: get().entries.filter((e) => e.id !== id) }),
    }),
    { name: 'regrow.journal.v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Amorces proposées quand la page est blanche. */
export const JOURNAL_PROMPTS = [
  'Ce que j’aurais envie de lui dire ce soir, sans l’envoyer.',
  'Ce qui a été moins dur aujourd’hui qu’hier.',
  'Ce que je ne veux plus jamais accepter.',
];

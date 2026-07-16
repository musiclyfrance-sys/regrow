import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { env } from './env';
import { supabase } from './supabase';
import { isSafetyExit } from './distress';

/**
 * Simulateur d'ex — règles produit strictes :
 * - 3 sessions max par 7 jours glissants, compteur visible.
 * - 12 échanges max, puis il conclut de lui-même.
 * - Si détresse détectée (locale ou IA) : sortie immédiate vers les ressources.
 * En mode mock : réponses locales crédibles selon le profil (évitant par défaut).
 */

export const WEEKLY_QUOTA = 3;
export const MAX_EXCHANGES = 12;

interface QuotaState {
  /** Timestamps (ms) des sessions démarrées. */
  sessions: number[];
  registerSession: () => void;
}

export const useSimulatorQuota = create<QuotaState>()(
  persist(
    (set, get) => ({
      sessions: [],
      registerSession: () => set({ sessions: [...get().sessions, Date.now()] }),
    }),
    { name: 'regrow.simulator.v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Sessions utilisées sur les 7 derniers jours glissants. */
export function usedThisWeek(sessions: number[]): number {
  const weekAgo = Date.now() - 7 * 86_400_000;
  return sessions.filter((t) => t > weekAgo).length;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Réponses mock : évasives, cohérentes avec un profil évitant. ────────────
const MOCK_REPLIES = [
  'Hey. Ça fait bizarre que tu écrives.',
  "Je sais pas trop quoi te dire là-dessus honnêtement.",
  'Oui enfin, c’est plus compliqué que ça.',
  "J'ai pas mal de trucs en ce moment, je peux pas trop parler.",
  'Je vois ce que tu veux dire. Mais je sais pas.',
  "Franchement j'ai pas envie de revenir sur tout ça.",
  'Peut-être. On verra.',
  "C'est pas contre toi. C'est juste que voilà.",
  'Je te souhaite le meilleur, vraiment.',
  'Il faut que j’y aille là.',
  'Prends soin de toi.',
];

const MOCK_CLOSING = 'Bon, faut vraiment que j’y aille. Salut.';

/**
 * Réponse du simulateur. Mock : réponse évasive du cru local.
 * Réel : Edge Function `simulator` (le client intercepte SAFETY_EXIT).
 */
export async function simulatorReply(
  messages: ChatMessage[],
  profile: { ex: string; patterns: unknown },
): Promise<{ text: string; safetyExit: boolean; closing: boolean }> {
  const exchangeCount = messages.filter((m) => m.role === 'user').length;
  const mustClose = exchangeCount >= MAX_EXCHANGES;

  if (env.mockMode || !supabase) {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 1200));
    const text = mustClose
      ? MOCK_CLOSING
      : MOCK_REPLIES[Math.min(exchangeCount - 1, MOCK_REPLIES.length - 1)]!;
    return { text, safetyExit: false, closing: mustClose };
  }

  const { data, error } = await supabase.functions.invoke<{ reply: string }>(
    'simulator',
    { body: { profile, messages } },
  );
  if (error || !data?.reply) {
    return { text: MOCK_CLOSING, safetyExit: false, closing: true };
  }
  const safetyExit = isSafetyExit(data.reply);
  return { text: data.reply, safetyExit, closing: mustClose };
}

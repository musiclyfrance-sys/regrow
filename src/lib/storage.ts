import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistance locale tolérante au réseau.
 *
 * Le quiz sauvegarde chaque réponse ici : si l'utilisatrice quitte l'app, elle
 * reprend EXACTEMENT où elle en était. Aucune donnée personnelle ne quitte
 * l'appareil avant le paiement (promesse « anonyme » de l'écran hook).
 *
 * Note : AsyncStorage suffit pour le brouillon de quiz (non sensible). Les
 * données réellement sensibles (capsules, coffre) passent par le storage
 * chiffré Supabase côté serveur, jamais par ici.
 */
export const storage = {
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async setJSON(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Best-effort : une écriture ratée ne doit jamais bloquer l'UI.
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

/** Clés de stockage centralisées (évite les collisions et les fautes de frappe). */
export const StorageKeys = {
  quizDraft: 'regrow.quiz.draft.v1',
  onboardingSeen: 'regrow.onboarding.seen.v1',
  entitlement: 'regrow.entitlement.v1',
  streak: 'regrow.streak.v1',
} as const;

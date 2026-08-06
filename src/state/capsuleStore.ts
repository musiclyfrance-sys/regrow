import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * La Capsule : un message vocal de 60 s max qu'elle s'adresse à elle-même.
 * Scellée dès l'enregistrement, restituée 30 jours plus tard. Après écoute,
 * on l'invite à enregistrer la suivante (J+30 → J+60 → J+90).
 *
 * MVP : fichier local. Le chiffrage + envoi Supabase arrive avec le backend
 * (d'où l'invitation forte à créer un compte avant d'enregistrer).
 */

export interface Capsule {
  uri: string;
  recordedAt: string; // ISO
  unlockAt: string; // ISO (J+30 après enregistrement)
  playedAt: string | null;
}

interface CapsuleState {
  capsules: Capsule[];
  addCapsule: (uri: string) => void;
  markPlayed: (uri: string) => void;
}

const LOCK_DAYS = 30;

export const useCapsuleStore = create<CapsuleState>()(
  persist(
    (set, get) => ({
      capsules: [],

      addCapsule: (uri) => {
        const now = new Date();
        const unlock = new Date(now.getTime() + LOCK_DAYS * 86_400_000);
        set({
          capsules: [
            ...get().capsules,
            {
              uri,
              recordedAt: now.toISOString(),
              unlockAt: unlock.toISOString(),
              playedAt: null,
            },
          ],
        });
      },

      markPlayed: (uri) =>
        set({
          capsules: get().capsules.map((c) =>
            c.uri === uri ? { ...c, playedAt: new Date().toISOString() } : c,
          ),
        }),
    }),
    { name: 'regrow.capsule.v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** La capsule prête à être écoutée (déverrouillée, pas encore jouée). */
export function selectReadyCapsule(capsules: Capsule[]): Capsule | null {
  const now = Date.now();
  return (
    capsules.find((c) => !c.playedAt && new Date(c.unlockAt).getTime() <= now) ?? null
  );
}

/** La capsule encore scellée la plus récente. */
export function selectSealedCapsule(capsules: Capsule[]): Capsule | null {
  const now = Date.now();
  const sealed = capsules.filter((c) => new Date(c.unlockAt).getTime() > now);
  return sealed[sealed.length - 1] ?? null;
}

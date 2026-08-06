import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Le coffre-fort : photos et captures mises sous clé jusqu'à J+90.
 *
 * Règles produit :
 * - Une fois verrouillé : nombre d'éléments + date de déverrouillage, rien
 *   d'autre. Aucune preview possible.
 * - Déverrouillage anticipé possible mais avec friction volontaire (maintenir
 *   10 secondes) et l'événement est enregistré.
 * - À J+90 : Récupérer ou Brûler. Brûler = suppression réelle et définitive.
 *
 * MVP : les fichiers restent locaux (URIs). Le chiffrage et l'envoi vers le
 * stockage sécurisé Supabase arrivent avec le lot backend.
 */

export type VaultStatus = 'collecting' | 'locked' | 'ready' | 'burned' | 'recovered';

interface VaultState {
  itemUris: string[];
  lockedAt: string | null; // ISO
  unlockAt: string | null; // ISO (J+90)

  addItems: (uris: string[]) => void;
  removeItem: (uri: string) => void;
  lock: () => void;
  /** Déverrouillage anticipé (après la friction de 10 s). */
  unlockEarly: () => void;
  burn: () => void;
  recover: () => void;
  reset: () => void;
}

const VAULT_DAYS = 90;

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      itemUris: [],
      lockedAt: null,
      unlockAt: null,

      addItems: (uris) =>
        set({ itemUris: [...new Set([...get().itemUris, ...uris])] }),

      removeItem: (uri) =>
        set({ itemUris: get().itemUris.filter((u) => u !== uri) }),

      lock: () => {
        const now = new Date();
        const unlock = new Date(now.getTime() + VAULT_DAYS * 86_400_000);
        set({ lockedAt: now.toISOString(), unlockAt: unlock.toISOString() });
      },

      unlockEarly: () => set({ lockedAt: null, unlockAt: null }),

      // Suppression réelle : on efface tout, définitivement.
      burn: () => set({ itemUris: [], lockedAt: null, unlockAt: null }),

      recover: () => set({ lockedAt: null, unlockAt: null }),

      reset: () => set({ itemUris: [], lockedAt: null, unlockAt: null }),
    }),
    { name: 'regrow.vault.v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Statut dérivé du coffre. */
export function selectVaultStatus(s: {
  itemUris: string[];
  lockedAt: string | null;
  unlockAt: string | null;
}): VaultStatus {
  if (!s.lockedAt) return 'collecting';
  if (s.unlockAt && Date.now() >= new Date(s.unlockAt).getTime()) return 'ready';
  return 'locked';
}

/** Jours restants avant J+90. */
export function selectDaysLeft(unlockAt: string | null): number {
  if (!unlockAt) return 0;
  return Math.max(0, Math.ceil((new Date(unlockAt).getTime() - Date.now()) / 86_400_000));
}

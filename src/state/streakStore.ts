import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Moteur de rétention : streak no-contact + Détox Score + check-ins.
 *
 * Règles produit :
 * - La streak = jours écoulés depuis le dernier contact déclaré (ou le début).
 * - Un contact déclaré remet la streak à zéro MAIS le Détox Score garde 80 %
 *   de sa valeur (jamais de retour à zéro : la punition totale fait
 *   désinstaller).
 * - Le score monte avec les check-ins (+2), les jours tenus (+1/jour) et les
 *   défis complétés (+3), plafonné à 100.
 */

export type ContactDeclaration = 'none' | 'they_wrote' | 'i_wrote' | 'we_met';

export interface Checkin {
  /** Date locale AAAA-MM-JJ. */
  date: string;
  mood: number; // 1..5
  questionId: string;
  answer: string;
  contact: ContactDeclaration;
}

interface StreakState {
  /** Début du programme (première ouverture post-rapport). */
  startDate: string | null;
  /** Dernier contact déclaré (remet la streak à zéro). */
  lastContactDate: string | null;
  /** Dernière ouverture (pour détecter le premier lancement du jour). */
  lastOpenDate: string | null;
  detoxScore: number;
  checkins: Checkin[];
  challengesDone: number;
  /** Angle du dernier insight (pour ne jamais répéter deux jours de suite). */
  lastInsightAngle: string | null;

  ensureStarted: () => void;
  /** true si c'est la première ouverture du jour (déclenche l'anim de streak). */
  registerOpen: () => boolean;
  addCheckin: (c: Omit<Checkin, 'date'>) => void;
  completeChallenge: () => void;
  setLastInsightAngle: (angle: string) => void;
}

export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 86_400_000));
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      startDate: null,
      lastContactDate: null,
      lastOpenDate: null,
      detoxScore: 10, // petit socle de départ : elle a déjà fait l'autopsie
      checkins: [],
      challengesDone: 0,
      lastInsightAngle: null,

      ensureStarted: () => {
        if (!get().startDate) set({ startDate: todayISO() });
      },

      registerOpen: () => {
        const today = todayISO();
        const { lastOpenDate, startDate, detoxScore } = get();
        if (lastOpenDate === today) return false;
        // Premier lancement du jour : +1 au score par jour tenu depuis l'ouverture précédente.
        const gained =
          lastOpenDate && startDate ? Math.min(3, daysBetween(lastOpenDate, today)) : 1;
        set({
          lastOpenDate: today,
          detoxScore: Math.min(100, detoxScore + gained),
        });
        return true;
      },

      addCheckin: (c) => {
        const today = todayISO();
        const { checkins, detoxScore } = get();
        // Un seul check-in par jour : le dernier remplace.
        const rest = checkins.filter((x) => x.date !== today);
        const brokeStreak = c.contact === 'i_wrote' || c.contact === 'we_met';
        set({
          checkins: [...rest, { ...c, date: today }].slice(-30), // 30 derniers jours
          // +2 pour le check-in ; si contact déclaré : le score garde 80 %.
          detoxScore: brokeStreak
            ? Math.max(5, Math.round(detoxScore * 0.8))
            : Math.min(100, detoxScore + 2),
          lastContactDate: brokeStreak ? today : get().lastContactDate,
        });
      },

      completeChallenge: () =>
        set({
          challengesDone: get().challengesDone + 1,
          detoxScore: Math.min(100, get().detoxScore + 3),
        }),

      setLastInsightAngle: (angle) => set({ lastInsightAngle: angle }),
    }),
    {
      name: 'regrow.streak.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Streak courante en jours (dérivée, jamais stockée : pas de désynchro). */
export function selectStreakDays(s: {
  startDate: string | null;
  lastContactDate: string | null;
}): number {
  const base = s.lastContactDate ?? s.startDate;
  if (!base) return 0;
  return daysBetween(base, todayISO());
}

/** Le check-in du jour est-il fait ? */
export function selectTodayCheckin(s: { checkins: Checkin[] }): Checkin | null {
  return s.checkins.find((c) => c.date === todayISO()) ?? null;
}

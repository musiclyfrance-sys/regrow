import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import {
  CAPSULE_MESSAGE,
  DAILY_MESSAGES,
  MILESTONES,
  WEAK_HOUR_TO_HOUR,
} from '@/config/notifications';

/**
 * Programmation des notifications locales.
 *
 * Règles :
 * - UNE notification par jour maximum (hors capsules) : les jours de milestone
 *   n'ont pas de message quotidien.
 * - Tout est reprogrammé à chaque ouverture de l'app (annule puis replanifie) :
 *   les messages restent frais et les données à jour.
 * - iOS limite à 64 notifications programmées : on planifie 21 jours de
 *   rendez-vous quotidiens + les milestones + les capsules (large marge).
 * - Aucun contenu personnel dans les notifications, seulement le prénom.
 */

export type NotificationFamily = 'daily' | 'milestone' | 'capsule' | 'sensitive';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ArmInput {
  /** Valeur de l'heure faible du quiz ('7' | '13' | '19' | '23' | '2'). */
  weakHour: string;
  exName: string;
  /** Début du programme (ISO) — sert à placer les milestones. */
  startDate: string | null;
  /** Dates de retour des capsules (ISO). */
  capsuleUnlocks: string[];
}

function atHour(date: Date, hour: number): Date {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * (Re)programme toutes les notifications. À appeler à chaque ouverture.
 * No-op silencieux si la permission n'est pas accordée.
 */
export async function armNotifications(input: ArmInput): Promise<void> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    const hour = WEAK_HOUR_TO_HOUR[input.weakHour] ?? 23;
    const now = new Date();
    const busyDays = new Set<string>();

    // 1) Milestones de streak (prioritaires sur le message quotidien).
    if (input.startDate) {
      const start = new Date(`${input.startDate}T00:00:00`);
      for (const m of MILESTONES) {
        const when = atHour(
          new Date(start.getTime() + m.day * 86_400_000),
          hour,
        );
        if (when <= now) continue;
        busyDays.add(dayKey(when));
        await Notifications.scheduleNotificationAsync({
          content: {
            title: m.title,
            body: m.body,
            data: { family: 'milestone' satisfies NotificationFamily, day: m.day },
          },
          trigger: { type: SchedulableTriggerInputTypes.DATE, date: when },
        });
      }
    }

    // 2) Le rendez-vous quotidien : 21 prochains jours, en sautant les milestones.
    const startIndex = now.getDate() + now.getMonth() * 31; // rotation stable
    for (let i = 0; i < 21; i++) {
      const when = atHour(new Date(now.getTime() + i * 86_400_000), hour);
      if (when <= now) continue;
      if (busyDays.has(dayKey(when))) continue;
      const msg = DAILY_MESSAGES[(startIndex + i) % DAILY_MESSAGES.length]!;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body
            .replaceAll('{ex}', input.exName)
            .replaceAll('{hour}', `${hour}h`),
          data: { family: 'daily' satisfies NotificationFamily },
        },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: when },
      });
    }

    // 3) Les retours de capsule (hors quota quotidien, à 20 h).
    for (const unlock of input.capsuleUnlocks) {
      const when = atHour(new Date(unlock), 20);
      if (when <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: CAPSULE_MESSAGE.title,
          body: CAPSULE_MESSAGE.body,
          data: { family: 'capsule' satisfies NotificationFamily },
        },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: when },
      });
    }
  } catch {
    // Une erreur de programmation ne doit jamais faire planter l'app.
  }
}

/**
 * Écoute les ouvertures de notification pour l'analytics (famille uniquement,
 * jamais de contenu). Retourne la fonction de désabonnement.
 */
export function listenNotificationOpens(
  onOpen: (family: NotificationFamily) => void,
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const family = response.notification.request.content.data?.family as
      | NotificationFamily
      | undefined;
    if (family) onOpen(family);
  });
  return () => sub.remove();
}

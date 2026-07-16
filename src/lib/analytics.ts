import PostHog from 'posthog-react-native';
import { env, hasPostHog } from './env';

/**
 * Analytics produit (PostHog).
 *
 * RÈGLE ABSOLUE : aucun contenu personnel ne part jamais dans l'analytics —
 * ni réponses de quiz, ni messages, ni vocaux. Uniquement des noms d'événements
 * et des métadonnées non identifiantes (numéro d'étape, produit, famille de
 * notification…).
 *
 * En mode mock (ou sans clé), on log en console et rien ne sort de l'appareil.
 */

// Événements exhaustifs du produit (sections 6 & 9 de la spec).
export type AnalyticsEvent =
  // Hook
  | 'hook_viewed'
  | 'hook_cta_tapped'
  // Quiz
  | 'quiz_started'
  | 'quiz_phase_completed'
  | 'quiz_micro_verdict_viewed'
  | 'quiz_completed'
  | 'quiz_abandoned'
  // Teaser / paywall
  | 'teaser_viewed'
  | 'teaser_card_tapped'
  | 'paywall_viewed'
  | 'paywall_option_selected'
  | 'paywall_purchase_started'
  | 'paywall_purchase_completed'
  | 'paywall_dismissed'
  | 'intro_offer_viewed'
  | 'intro_offer_purchased'
  // Rétention
  | 'app_opened'
  | 'checkin_completed'
  | 'insight_shared'
  | 'streak_broken'
  | 'streak_milestone'
  | 'notification_opened'
  // Panic / simulateur
  | 'panic_pressed'
  | 'panic_breathing_completed'
  | 'simulator_started'
  | 'simulator_completed'
  | 'simulator_quota_reached'
  // Coffre / capsule
  | 'vault_locked'
  | 'vault_unlock_attempted'
  | 'vault_burned'
  | 'vault_recovered'
  | 'capsule_recorded'
  | 'capsule_played'
  // Réglages
  | 'settings_delete_account';

type Props = Record<string, string | number | boolean | undefined>;

let client: PostHog | null = null;

export function initAnalytics() {
  if (env.mockMode || !hasPostHog) return;
  client = new PostHog(env.posthogKey, { host: env.posthogHost });
}

export function track(event: AnalyticsEvent, props?: Props) {
  if (env.mockMode || !client) {
    if (__DEV__) console.log(`[analytics:mock] ${event}`, props ?? {});
    return;
  }
  client.capture(event, props);
}

/** Associe la session anonyme à un identifiant stable APRÈS le paiement/compte. */
export function identify(distinctId: string) {
  if (env.mockMode || !client) return;
  client.identify(distinctId);
}

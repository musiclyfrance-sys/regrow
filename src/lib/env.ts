import Constants from 'expo-constants';

type Extra = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  revenueCatApiKeyIos: string;
  posthogKey: string;
  posthogHost: string;
  mockMode: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

/**
 * Accès centralisé et typé à la configuration runtime.
 * `mockMode` permet de développer tout le funnel sans aucune clé (IA, achats,
 * analytics simulés).
 */
export const env = {
  supabaseUrl: extra.supabaseUrl ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? '',
  revenueCatApiKeyIos: extra.revenueCatApiKeyIos ?? '',
  posthogKey: extra.posthogKey ?? '',
  posthogHost: extra.posthogHost ?? 'https://eu.i.posthog.com',
  /** true par défaut : rien ne casse sans clés. */
  mockMode: extra.mockMode ?? true,
} as const;

/** true si un service réel est configurable (clé présente ET pas en mock). */
export const hasSupabase = !!env.supabaseUrl && !!env.supabaseAnonKey;
export const hasRevenueCat = !!env.revenueCatApiKeyIos;
export const hasPostHog = !!env.posthogKey;

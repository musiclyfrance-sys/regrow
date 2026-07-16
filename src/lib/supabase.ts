import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabase } from './env';

/**
 * Client Supabase (auth anonyme, Postgres, storage chiffré — région UE).
 *
 * L'utilisatrice démarre en session ANONYME liée à l'appareil : aucun compte
 * avant le paiement. Sign in with Apple n'est proposé qu'après l'achat, pour
 * lier cette session anonyme à une identité sans jamais bloquer l'accès.
 *
 * En mode mock / sans clé, `supabase` est `null` : tout le funnel fonctionne
 * quand même sur données locales.
 */
export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/** Ouvre (ou réutilise) une session anonyme liée à l'appareil. No-op en mock. */
export async function ensureAnonymousSession(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error) return null;
  return anon.user?.id ?? null;
}

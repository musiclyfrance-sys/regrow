import { env } from './env';
import { supabase } from './supabase';
import type { Checkin } from '@/state/streakStore';

/**
 * L'Insight du jour — la récompense variable du check-in.
 * Angle différent chaque jour, jamais deux fois le même d'affilée.
 * En mode mock : généré localement à partir du profil et des check-ins.
 * En réel : Edge Function `insight` (IA côté serveur uniquement).
 */

export interface DailyInsight {
  angle: string;
  text: string;
}

type MockBuilder = (ctx: {
  ex: string;
  streak: number;
  mood: number;
  checkins: Checkin[];
}) => string;

const MOCK_ANGLES: { angle: string; build: MockBuilder }[] = [
  {
    angle: 'memoire_selective',
    build: ({ ex }) =>
      `Ce soir, ta mémoire va sûrement te repasser le meilleur de ${ex} en boucle, en coupant tout le reste au montage. C'est normal : le cerveau garde les pics et efface les creux. Mais souviens-toi que tu n'as pas quitté un best-of, tu as quitté la version complète. Un souvenir n'est pas une preuve, c'est une publicité.`,
  },
  {
    angle: 'progression',
    build: ({ streak }) =>
      streak > 0
        ? `Il y a ${streak} jour${streak > 1 ? 's' : ''}, tu pensais peut-être ne pas tenir une soirée. Tu as tenu ${streak} jour${streak > 1 ? 's' : ''}. Personne ne le voit de l'extérieur, mais toi tu sais ce que chaque soir t'a coûté. La discrétion d'une victoire ne diminue pas sa valeur.`
        : `Aujourd'hui compte comme un début, pas comme un échec. Tu es revenue ici au lieu de faire semblant que ça allait. C'est exactement comme ça qu'on repart : sans se mentir.`,
  },
  {
    angle: 'idealisation',
    build: ({ ex }) =>
      `Le manque de ${ex} que tu ressens n'est pas la preuve que c'était la bonne personne. C'est la preuve que tu es capable d'attachement — et ça, ça te suit partout, y compris loin de ${ex}. Tu ne pleures pas une personne parfaite, tu pleures la place qu'elle occupait.`,
  },
  {
    angle: 'recadrage',
    build: ({ mood }) =>
      mood <= 2
        ? `Ce soir c'est lourd, et tu n'as pas à faire semblant du contraire. Mais une soirée difficile n'est pas une rechute : c'est une soirée. Demain, ton seul travail sera de te lever. Le reste suivra. Tenir, certains soirs, c'est déjà tout faire.`
        : `Tu as remarqué ? Il y a des moments dans ta journée où tu n'as pas pensé à tout ça. Ils sont encore courts, mais ils existent. La guérison ne fait pas de bruit : elle élargit ces moments-là, un par un.`,
  },
  {
    angle: 'energie',
    build: ({ ex }) =>
      `Toute l'énergie que tu mettais à décoder les silences de ${ex}, tu l'as encore. Elle ne demande qu'à changer d'adresse. Chaque fois que tu la rediriges vers toi — un repas correct, une amie rappelée, vingt minutes dehors — tu récupères ce qui t'appartenait déjà.`,
  },
  {
    angle: 'attente',
    build: ({ ex }) =>
      `Attendre un signe de ${ex}, c'est laisser quelqu'un d'absent décider de tes soirées. Le silence, lui, t'a déjà donné sa réponse. Ce que tu attends n'arrivera peut-être jamais — mais ce que tu construis, personne ne peut te le retirer.`,
  },
];

function pickAngle(lastAngle: string | null, dayOfYear: number) {
  const pool = MOCK_ANGLES.filter((a) => a.angle !== lastAngle);
  return pool[dayOfYear % pool.length]!;
}

export async function generateInsight(input: {
  ex: string;
  streak: number;
  mood: number;
  checkins: Checkin[];
  lastAngle: string | null;
}): Promise<DailyInsight> {
  if (!env.mockMode && supabase) {
    const { data, error } = await supabase.functions.invoke<{ insight: string }>(
      'insight',
      {
        body: {
          profileSummary: { ex: input.ex },
          programDay: input.streak,
          recentCheckins: input.checkins.slice(-7),
          todayState: { mood: input.mood },
          lastAngle: input.lastAngle,
        },
      },
    );
    if (!error && data?.insight) return { angle: 'ia', text: data.insight };
    // En cas d'erreur réseau, on retombe sur le mock : jamais d'écran vide.
  }
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  const picked = pickAngle(input.lastAngle, dayOfYear);
  return { angle: picked.angle, text: picked.build(input) };
}

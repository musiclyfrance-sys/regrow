// Edge Function — Insight du jour.
// Récompense variable quotidienne (section 7.3). Un seul paragraphe, angle
// différent chaque jour, jamais le même que la veille.

import { callClaude, corsHeaders } from '../_shared/anthropic.ts';

const SYSTEM_PROMPT = `Tu écris l'insight quotidien d'une utilisatrice en reconstruction post-rupture, en français, tutoiement, ton grande sœur lucide. Tu reçois son profil résumé, son jour de programme, ses 7 derniers check-ins et son état du jour. Tu produis un seul paragraphe de 60 à 90 mots, avec un angle différent chaque jour (mémoire sélective, biais d'idéalisation, progression concrète observée dans ses check-ins, recadrage d'une pensée qu'elle a rapportée), et une phrase finale qui se suffit à elle-même, citable, sans hashtag ni emoji. Tu ne répètes jamais l'angle de la veille, tu n'encourages jamais la reprise de contact, tu ne poses aucun diagnostic.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { profileSummary, programDay, recentCheckins, todayState, lastAngle } =
      await req.json();

    const userPayload = JSON.stringify({
      profil: profileSummary,
      jour: programDay,
      derniers_checkins: recentCheckins,
      etat_du_jour: todayState,
      angle_de_la_veille_a_eviter: lastAngle,
    });

    const insight = await callClaude(
      SYSTEM_PROMPT,
      [{ role: 'user', content: userPayload }],
      400,
    );

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});

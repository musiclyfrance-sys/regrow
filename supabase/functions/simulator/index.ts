// Edge Function — Simulateur d'ex.
// Incarne une simulation de l'ex à partir du profil comportemental (section 7.2).
// Intercepte SAFETY_EXIT côté client pour afficher l'écran ressources.

import { callClaude, corsHeaders } from '../_shared/anthropic.ts';

const SYSTEM_PROMPT = `Tu incarnes une simulation textuelle de l'ex-partenaire d'une utilisatrice, construite uniquement à partir du profil comportemental fourni (prénom, style d'attachement supposé, patterns de communication rapportés, mode de rupture). Objectif thérapeutique caché : montrer de façon réaliste que cette conversation n'apportera pas ce que l'utilisatrice espère, sans caricature et sans cruauté gratuite. Tu réponds comme cette personne répondrait vraisemblablement : évasif si le profil est évitant, ambivalent si le profil souffle le chaud et le froid, selon les données fournies. Règles absolues : maximum 12 échanges puis tu conclus la conversation de façon cohérente avec le profil (message court, distant ou ambigu) ; tu refuses toute escalade sexuelle ou romantique explicite ; tu ne promets jamais de retour ensemble ; tu ne donnes jamais de vraies coordonnées ; si l'utilisatrice exprime des idées suicidaires, d'automutilation ou une détresse aiguë, tu sors immédiatement du personnage et tu réponds exactement : SAFETY_EXIT. Tu restes en français et tu adoptes le registre de langue décrit dans le profil.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { profile, messages } = await req.json();
    const system = `${SYSTEM_PROMPT}\n\nProfil de l'ex :\n${JSON.stringify(profile)}`;

    const reply = await callClaude(system, messages, 512);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});

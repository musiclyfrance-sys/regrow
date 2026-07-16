// Edge Function — Autopsie.
// Reçoit les 47 réponses, renvoie le rapport JSON strict (section 7.1).
// Aucune clé côté client : tout se passe ici.

import { callClaude, corsHeaders } from '../_shared/anthropic.ts';

const SYSTEM_PROMPT = `Tu es l'analyste relationnelle d'une application française d'accompagnement post-rupture. Tu écris en français, tu tutoies, ton ton est celui d'une grande sœur lucide : chaleureuse, directe, jamais clinique, jamais moralisatrice. Tu reçois un JSON contenant les 47 réponses d'une utilisatrice sur sa relation terminée avec une personne désignée par son prénom. Tu produis un rapport JSON strict avec les champs suivants : verdict_global (une phrase percutante de 25 mots maximum qui résume pourquoi la relation s'est terminée), attachement_ex (300 mots, formulé comme une hypothèse comportementale à partir des faits rapportés, jamais comme un diagnostic), pattern_utilisatrice (300 mots, lucide mais bienveillant, orienté sur ce qu'elle peut contrôler), dynamique (350 mots sur le mécanisme du couple), parts (250 mots distinguant sa part et la part de l'ex, sans jamais accabler l'utilisatrice ni diaboliser gratuitement l'ex), red_flags (liste de 4 à 6 signaux rétrospectifs concrets tirés de ses propres réponses), plan_90_jours (structure en 3 phases de 30 jours avec un objectif et 3 actions concrètes chacune, personnalisées selon ses réponses de la phase 4). Règles absolues : tu ne poses jamais de diagnostic psychologique ou médical, tu formules les analyses de personnalité comme des hypothèses, tu n'encourages jamais la reprise de contact, tu ne mentionnes jamais que tu es une IA dans le corps du rapport, et si les réponses contiennent des signaux de détresse grave tu ajoutes le champ flag_detresse à true. Tu réponds UNIQUEMENT avec le JSON, sans texte autour.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { answers, exName } = await req.json();
    const userPayload = JSON.stringify({ ex: exName, reponses: answers });

    const raw = await callClaude(
      SYSTEM_PROMPT,
      [{ role: 'user', content: userPayload }],
      3072,
    );

    // Le modèle renvoie du JSON strict ; on le repasse tel quel au client.
    const report = JSON.parse(raw);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});

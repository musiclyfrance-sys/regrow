/**
 * Classifieur de détresse (garde-fou de sécurité — section 8).
 *
 * Analyse tous les inputs libres (check-ins, simulateur, questions ouvertes)
 * par liste de motifs en français, EN PLUS des flags renvoyés par l'IA
 * (flag_detresse, SAFETY_EXIT). Tout déclenchement doit interrompre la
 * fonctionnalité en cours et afficher l'écran ressources (3114).
 *
 * Volontairement prudent : mieux vaut un faux positif (afficher les ressources
 * à tort) qu'un faux négatif. L'événement est loggé SANS le contenu du message.
 */

// Motifs (normalisés sans accents, minuscules). Couvre idées suicidaires,
// automutilation et mise en danger. Liste à faire relire par un professionnel
// avant mise en production.
const PATTERNS: RegExp[] = [
  /\bme suicider\b/,
  /\bme tuer\b/,
  /\ben finir\b/,
  /\bplus envie de vivre\b/,
  /\bje veux mourir\b/,
  /\bje veux plus vivre\b/,
  /\bmettre fin a mes jours\b/,
  /\bme faire du mal\b/,
  /\bme mutiler\b/,
  /\bme scarifier\b/,
  /\bme couper\b/,
  /\bplus la force de vivre\b/,
  /\bpartir pour de bon\b/,
  /\bdisparaitre pour toujours\b/,
  /\bplus de raison de vivre\b/,
  /\bje sers a rien\b/,
  /\bsauter du\b/,
  /\bavaler des\b.*\bmedicament/,
];

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .replace(/\s+/g, ' ')
    .trim();
}

/** true si l'input libre contient un signal de détresse grave. */
export function detectsDistress(input: string): boolean {
  if (!input) return false;
  const text = normalize(input);
  return PATTERNS.some((p) => p.test(text));
}

/** Sentinelle renvoyée par le simulateur IA quand il sort du rôle. */
export const SAFETY_EXIT = 'SAFETY_EXIT';

export function isSafetyExit(aiMessage: string): boolean {
  return aiMessage.trim().toUpperCase().includes(SAFETY_EXIT);
}

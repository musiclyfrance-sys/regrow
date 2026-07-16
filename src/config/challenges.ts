/**
 * La Glow-Up Era — un défi concret par jour, 90 jours.
 * 3 phases de 30 jours (mêmes noms que le plan du rapport). Les défis tournent
 * dans la banque de leur phase : concrets, faisables le jour même, jamais
 * culpabilisants. Chaque défi complété nourrit le Détox Score (+3).
 */

export interface Challenge {
  /** Peut contenir {ex}. */
  text: string;
}

export const PHASES = [
  { from: 1, to: 30, label: "Couper l'hémorragie" },
  { from: 31, to: 60, label: 'Reprendre du terrain' },
  { from: 61, to: 90, label: 'Refermer' },
] as const;

/** Phase 1 (J1-30) : désintoxication, protection, apaisement. */
const PHASE_1: Challenge[] = [
  { text: 'Mets {ex} en sourdine partout : plus aucune story, aucun statut visible.' },
  { text: 'Sors 20 minutes, sans ton téléphone. Juste marcher.' },
  { text: 'Range une chose chez toi qui te fait penser à lui. Une seule, pas tout.' },
  { text: 'Écris 3 choses que tu ne supportais plus. Garde la liste pour les soirs de doute.' },
  { text: 'Change ton fond d’écran pour une photo de toi que tu aimes.' },
  { text: 'Prépare-toi un vrai repas ce soir. Assiette, table, pas de téléphone.' },
  { text: 'Supprime son numéro des favoris. Pas le numéro — juste le raccourci.' },
  { text: 'Douche longue, playlist forte. Les deux en même temps.' },
  { text: 'Note l’heure où c’était le plus dur aujourd’hui. Observe : elle recule.' },
  { text: 'Dis à UNE personne de confiance où tu en es vraiment.' },
  { text: 'Mets tes photos de couple dans le coffre de l’app. Elles y sont bien.' },
  { text: 'Couche-toi 30 minutes plus tôt ce soir. Le sommeil, c’est de la guérison gratuite.' },
  { text: 'Bois 1,5 L d’eau aujourd’hui. Ton corps encaisse, aide-le.' },
  { text: 'Trouve un endroit où {ex} n’est jamais allé avec toi. Vas-y cette semaine.' },
  { text: 'Écris le message que tu meurs d’envoyer. Dans tes notes. N’envoie rien.' },
];

/** Phase 2 (J31-60) : réinvestir l'énergie vers soi et son monde. */
const PHASE_2: Challenge[] = [
  { text: 'Réactive une amitié mise de côté pendant la relation. Un message suffit.' },
  { text: 'Fais 20 minutes de sport, n’importe lequel. La colère est un bon carburant.' },
  { text: 'Écris la lettre jamais envoyée. Tout ce que tu voulais dire. Puis range-la.' },
  { text: 'Planifie un truc pour le week-end qui n’a rien à voir avec lui.' },
  { text: 'Apprends un truc nouveau pendant 15 minutes : recette, langue, n’importe.' },
  { text: 'Trie une habitude de stalking : bloque, masque ou désabonne un compte relié à lui.' },
  { text: 'Rachète un petit truc que tu t’interdisais « parce qu’il n’aimait pas ».' },
  { text: 'Prends-toi en photo aujourd’hui. Dans 60 jours tu verras la différence.' },
  { text: 'Dis oui à une invitation que tu aurais refusée le mois dernier.' },
  { text: 'Écris 3 choses que tu as retrouvées depuis la rupture (du temps, des amies, de la place).' },
  { text: 'Réaménage un coin de ta chambre. Ton lit ne doit plus être « votre » lit.' },
  { text: 'Une soirée entière sans regarder ton téléphone après 21 h. Tu peux.' },
  { text: 'Appelle quelqu’un qui te fait rire. Pas pour parler de lui. Pour rire.' },
  { text: 'Fais une liste de 5 choses que tu veux vivre dans les 6 mois. Sans personne dedans.' },
  { text: 'Cuisine pour quelqu’un que tu aimes bien. Le soin, ça se redirige.' },
];

/** Phase 3 (J61-90) : refermer, ancrer, se projeter. */
const PHASE_3: Challenge[] = [
  { text: 'Relis ton verdict du premier jour. Note ce qui a changé dans ta façon de le lire.' },
  { text: 'Écris ce que tu ne veux plus JAMAIS accepter. C’est ton nouveau standard.' },
  { text: 'Pardonne-toi un truc. Un seul. Dis-le à voix haute.' },
  { text: 'Planifie un objectif pour le mois prochain qui te fait un peu peur.' },
  { text: 'Raconte ton histoire à quelqu’un comme si c’était du passé. Remarque : c’en est.' },
  { text: 'Fais le tri final : ce qui reste de lui chez toi, tu le donnes, jettes ou coffres.' },
  { text: 'Écris une lettre à la toi d’il y a 90 jours. Dis-lui qu’elle va y arriver.' },
  { text: 'Va boire un verre ou un café seule, en terrasse. Tête haute.' },
  { text: 'Liste 3 red flags que tu reconnaîtras au premier regard maintenant.' },
  { text: 'Offre-toi un vrai cadeau de fin de programme. Tu l’as gagné.' },
  { text: 'Supprime les captures d’écran de vos conversations qui traînent encore.' },
  { text: 'Décris la relation que tu veux la prochaine fois. Exigeante et précise.' },
  { text: 'Remercie une personne qui t’a portée pendant ces 90 jours.' },
  { text: 'Prépare ta réponse si {ex} revient un jour. Écris-la. Tu seras prête, pas surprise.' },
  { text: 'Danse sur TA chanson. Celle d’avant lui, ou celle d’après.' },
];

const BANKS = [PHASE_1, PHASE_2, PHASE_3];

/** Le défi d'un jour de programme donné (1 → 90). */
export function challengeOfDay(programDay: number): { challenge: Challenge; phase: string } {
  const day = Math.max(1, Math.min(90, programDay));
  const phaseIndex = day <= 30 ? 0 : day <= 60 ? 1 : 2;
  const bank = BANKS[phaseIndex]!;
  const withinPhase = (day - 1) % 30;
  return {
    challenge: bank[withinPhase % bank.length]!,
    phase: PHASES[phaseIndex]!.label,
  };
}

/** Jours de milestone (badges sur la timeline). */
export const MILESTONE_DAYS = [3, 7, 14, 21, 30, 45, 60, 75, 90];

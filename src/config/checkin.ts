/**
 * Banque du check-in quotidien : humeurs, questions rotatives, déclarations.
 * Une seule question par jour, choisie par rotation sur le jour de l'année.
 */

export const MOODS = [
  { value: 1, face: '😞', label: 'Au fond du trou' },
  { value: 2, face: '😔', label: 'Pas fort' },
  { value: 3, face: '😐', label: 'Ça flotte' },
  { value: 4, face: '🙂', label: 'Plutôt ok' },
  { value: 5, face: '😌', label: 'Étonnamment bien' },
] as const;

export interface DailyQuestion {
  id: string;
  /** Peut contenir {ex}. */
  prompt: string;
  options: { value: string; label: string }[];
}

export const QUESTIONS: DailyQuestion[] = [
  {
    id: 'thoughts_count',
    prompt: 'Tu as pensé à {ex} combien de fois aujourd’hui, honnêtement ?',
    options: [
      { value: 'zero', label: 'Pas une seule fois' },
      { value: 'few', label: 'Quelques fois' },
      { value: 'often', label: 'Trop souvent' },
      { value: 'nonstop', label: 'Non-stop' },
    ],
  },
  {
    id: 'almost_wrote',
    prompt: 'Tu as failli lui écrire aujourd’hui ?',
    options: [
      { value: 'no', label: 'Non, même pas envie' },
      { value: 'thought', label: 'J’y ai pensé, sans plus' },
      { value: 'typed', label: 'J’ai écrit puis effacé' },
      { value: 'close', label: 'J’étais à deux doigts' },
    ],
  },
  {
    id: 'stalk_today',
    prompt: 'Ses réseaux, tu y es allée aujourd’hui ?',
    options: [
      { value: 'no', label: 'Non, pas ouvert' },
      { value: 'once', label: 'Une fois, vite fait' },
      { value: 'several', label: 'Plusieurs fois' },
      { value: 'blocked', label: 'Impossible, j’ai bloqué' },
    ],
  },
  {
    id: 'best_moment',
    prompt: 'C’est quoi le moment le moins lourd de ta journée ?',
    options: [
      { value: 'morning', label: 'Le matin, au réveil' },
      { value: 'friends', label: 'Un moment avec quelqu’un' },
      { value: 'busy', label: 'Quand j’étais occupée' },
      { value: 'none', label: 'Aucun, journée plombée' },
    ],
  },
  {
    id: 'body_state',
    prompt: 'Ton corps, il dit quoi ce soir ?',
    options: [
      { value: 'tense', label: 'Noué, tendu' },
      { value: 'tired', label: 'Épuisé' },
      { value: 'ok', label: 'Ça va, il tient' },
      { value: 'light', label: 'Plus léger qu’hier' },
    ],
  },
  {
    id: 'memory_type',
    prompt: 'Quand tu penses à {ex}, c’est plutôt les bons ou les mauvais souvenirs ?',
    options: [
      { value: 'good', label: 'Les bons, ça idéalise' },
      { value: 'bad', label: 'Les mauvais, ça énerve' },
      { value: 'mixed', label: 'Les deux mélangés' },
      { value: 'fading', label: 'Ça devient flou' },
    ],
  },
  {
    id: 'ate_today',
    prompt: 'Tu as mangé correctement aujourd’hui ?',
    options: [
      { value: 'yes', label: 'Oui, des vrais repas' },
      { value: 'bits', label: 'Des bouts, par-ci par-là' },
      { value: 'no', label: 'Presque rien' },
      { value: 'too_much', label: 'Trop, pour combler' },
    ],
  },
  {
    id: 'tomorrow',
    prompt: 'Demain, tu as un truc rien que pour toi de prévu ?',
    options: [
      { value: 'yes', label: 'Oui, un vrai truc' },
      { value: 'small', label: 'Un petit truc' },
      { value: 'no', label: 'Non, rien' },
      { value: 'will', label: 'Non, mais je vais en trouver un' },
    ],
  },
];

/** Question du jour : rotation stable sur le jour de l'année. */
export function questionOfDay(date = new Date()): DailyQuestion {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return QUESTIONS[dayOfYear % QUESTIONS.length]!;
}

export const CONTACT_OPTIONS = [
  { value: 'none', label: 'Aucun contact' },
  { value: 'they_wrote', label: 'Il/elle a écrit' },
  { value: 'i_wrote', label: 'J’ai écrit' },
  { value: 'we_met', label: 'On s’est vus' },
] as const;

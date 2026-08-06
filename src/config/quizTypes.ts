/**
 * Types du moteur de quiz d'autopsie.
 *
 * Le quiz est ENTIÈREMENT piloté par la donnée (src/config/quiz.ts) : le moteur
 * (app/onboarding/quiz/[step].tsx) ne connaît que ces types, jamais le contenu.
 */

export type Phase = 1 | 2 | 3 | 4;

export const PHASE_LABELS: Record<Phase, string> = {
  1: 'Les faits',
  2: 'La relation',
  3: 'Toi maintenant',
  4: "L'engagement",
};

/** Variables de profil capturées pendant le quiz (personnalisation + IA). */
export type ProfileVar =
  | 'exName' // prénom (ou surnom) de l'ex → alimente {ex} partout ensuite
  | 'relationDuration'
  | 'breakupMode'
  | 'timeSince'
  | 'contactStatus'
  | 'weakHour' // heure des moments les plus durs → calibre les notifications
  | 'goal'
  | 'deadline'
  | 'moveOnScore'; // « sur 10, à quel point tu veux passer à autre chose »

export type QuestionType =
  | 'single' // choix unique en pilules
  | 'multiple' // choix multiple
  | 'scale' // échelle 1→5, slider émotionnel
  | 'text' // saisie courte (prénom de l'ex, durée) uniquement
  | 'date'; // sélecteur de date

export interface Option {
  value: string;
  label: string;
}

export interface QuestionStep {
  kind: 'question';
  /** Identifiant stable (clé de réponse). */
  id: string;
  /** Numéro d'étape 1→47 (porté par l'analytics du funnel). */
  step: number;
  phase: Phase;
  type: QuestionType;
  /** Peut contenir le token {ex} — résolu au rendu avec le prénom saisi. */
  prompt: string;
  /** Sous-texte optionnel (contexte, réassurance). */
  helper?: string;
  options?: Option[];
  /** Bornes du slider émotionnel (labels aux extrémités). */
  scaleLabels?: [string, string];
  /** Valeur max du slider (défaut 5). La dernière question va jusqu'à 10. */
  scaleMax?: number;
  /** Placeholder + longueur max pour les saisies texte. */
  placeholder?: string;
  maxLength?: number;
  /** Rend la réponse facultative (avance possible sans sélection). */
  optional?: boolean;
  /** Ajoute une pilule « Autre » si aucune réponse ne colle (choix unique). */
  allowOther?: boolean;
  /** Stocke la réponse dans une variable de profil réutilisable. */
  capture?: ProfileVar;
}

/** Interlude plein écran sans question (micro-verdict ou social proof). */
export interface InterludeStep {
  kind: 'interlude';
  id: string;
  phase: Phase;
  variant: 'micro_verdict' | 'social_proof' | 'stat';
  /** Titre / corps ; peut contenir {ex}. Pour un micro-verdict par règles,
   *  `compute` prend le dessus sur `body`. */
  title?: string;
  body: string;
  /** Témoignage (social proof). */
  author?: string;
  /**
   * Verdict partiel généré par RÈGLES LOCALES à partir des réponses déjà
   * données (aucun appel réseau). Renvoie le texte à afficher.
   */
  compute?: (answers: Record<string, unknown>, ex: string) => string;
  /** Auto-avance après ce délai (ms) pour les social proof ; sinon bouton. */
  autoAdvanceMs?: number;
}

export type QuizStep = QuestionStep | InterludeStep;

/**
 * Regrow — Design System (source unique de vérité).
 *
 * Mode sombre uniquement (seul mode du MVP : l'app s'utilise la nuit, au lit).
 * Toute couleur, espacement, rayon, durée et courbe de l'app vient d'ici.
 * Aucune valeur codée en dur ailleurs.
 */

// ─── Couleurs ────────────────────────────────────────────────────────────────
export const colors = {
  /** Prune presque noir — fond principal. */
  background: '#131019',
  /** Cartes et feuilles modales. */
  surface: '#1D1827',
  /** Éléments interactifs au repos. */
  surfaceRaised: '#262033',

  /** Lavande — actions principales et éléments de marque. */
  primary: '#A78BFA',
  /** Lavande claire — hover, secondaires, contours actifs. */
  primarySoft: '#C4B5FD',

  /** Pêche — EXCLUSIVEMENT les moments de progression (streak, jauge, milestones). */
  accentWarm: '#F4A98C',

  /** Crème — texte principal. */
  textPrimary: '#F5F1E8',
  /** Mauve grisé — texte secondaire. */
  textSecondary: '#A79FB3',

  /** Sauge — validations douces. */
  success: '#9DC4A8',
  /** Rouge désaturé — RÉSERVÉ au panic button et aux alertes. */
  danger: '#E07A6B',

  /** Blanc translucide pour surlignage de citations dans le rapport. */
  highlight: 'rgba(167, 139, 250, 0.18)',

  /** Séparateurs discrets. */
  border: 'rgba(245, 241, 232, 0.08)',
  borderActive: '#A78BFA',

  /** Surcouches / voiles. */
  scrim: 'rgba(19, 16, 25, 0.72)',
} as const;

/**
 * Teintes translucides — fonds des pastilles et blocs de la Bibliothèque.
 * Toujours associées à leur couleur pleine (lavande, pêche, sauge, crème).
 */
export const tints = {
  lavender: 'rgba(167, 139, 250, 0.16)',
  peach: 'rgba(244, 169, 140, 0.16)',
  sage: 'rgba(157, 196, 168, 0.16)',
  cream: 'rgba(245, 241, 232, 0.08)',
} as const;

/** Dégradé ember — RÉSERVÉ à la cérémonie de crémation. */
export const gradients = {
  ember: ['#F4A98C', '#E05E3F'] as const,
  /** Voile de révélation partielle sur le teaser / paywall. */
  reveal: ['rgba(19,16,25,0)', 'rgba(19,16,25,0.96)'] as const,
} as const;

// ─── Typographie ─────────────────────────────────────────────────────────────
/**
 * Doyle : titres et verdicts (côté éditorial / journal intime).
 * General Sans : interface et corps, graisses 400–600.
 * Fichiers locaux dans assets/fonts (voir src/theme/useAppFonts.ts).
 */
export const fonts = {
  serifMedium: 'Doyle-Medium',
  serifSemibold: 'Doyle-Bold',
  sansRegular: 'GeneralSans-Regular',
  sansMedium: 'GeneralSans-Medium',
  sansSemibold: 'GeneralSans-Semibold',
} as const;

/**
 * Échelle typographique : 32/26/18/17/15/13, interlignage généreux (≥1.4 sur
 * les corps). Doyle est réservée aux grands titres (display, title) ; les
 * petits titres passent en General Sans Semibold pour une lecture nette.
 */
export const type = {
  display: { fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 40 },
  title: { fontFamily: fonts.serifSemibold, fontSize: 26, lineHeight: 34 },
  heading: { fontFamily: fonts.sansSemibold, fontSize: 18, lineHeight: 26 },
  bodyLarge: { fontFamily: fonts.sansRegular, fontSize: 17, lineHeight: 25 },
  body: { fontFamily: fonts.sansRegular, fontSize: 15, lineHeight: 23 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19 },
  // Variantes de graisse pour le corps.
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 23 },
  buttonLabel: { fontFamily: fonts.sansSemibold, fontSize: 17, lineHeight: 22 },
} as const;

// ─── Espacements (grille en multiples de 4) ──────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

/** Marge d'écran standard. */
export const screenPadding = 24;

// ─── Rayons ──────────────────────────────────────────────────────────────────
export const radii = {
  card: 20,
  sheet: 28,
  pill: 999,
} as const;

// ─── Animation & haptique ────────────────────────────────────────────────────
/**
 * Règle : chaque animation a une fonction, aucune n'est décorative.
 * Toute animation se coupe si « Réduire les animations » d'iOS est actif
 * (voir src/hooks/useReduceMotion.ts).
 */
export const motion = {
  // Transitions du quiz : slide horizontal + fondu, courbe douce, jamais de bounce.
  quizTransitionMs: 250,
  // Sélection d'une réponse : scale 0.97 → 1, puis avance auto après 350 ms.
  selectScaleFrom: 0.97,
  autoAdvanceMs: 350,
  // Micro-verdicts / social proof affichés en interlude automatique.
  socialProofMs: 2500,
  // Écran d'analyse : 6 messages × 1500 ms = ~9 s (labor illusion).
  analysisStepMs: 1500,
  analysisSlowThresholdMs: 15000,
  // Jauge de guérison : respiration lente permanente (scale 1 → 1.015 sur 3 s).
  breatheScaleTo: 1.015,
  breatheDurationMs: 3000,
  // Croix de fermeture du paywall après 3 s.
  paywallCloseDelayMs: 3000,
  // Crémation : séquence cinématique de 8 s.
  cremationMs: 8000,
} as const;

// Bezier « douce » partagée (jamais de rebond).
export const easingBezier = [0.22, 1, 0.36, 1] as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;

export const theme = {
  colors,
  tints,
  gradients,
  fonts,
  type,
  spacing,
  screenPadding,
  radii,
  motion,
  easingBezier,
} as const;

export type Theme = typeof theme;
export default theme;

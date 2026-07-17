/**
 * Regrow — Design System (source unique de vérité).
 *
 * Deux modes : NUIT (défaut, prune profonde) et JOUR (clair et vif), voir
 * src/theme/palettes.ts. Toute couleur, espacement, rayon, durée et courbe de
 * l'app vient d'ici. Aucune valeur codée en dur ailleurs.
 *
 * Comment ça marche :
 * - `colors`, `tints`, `gradients` : lectures DYNAMIQUES (suivent le mode) —
 *   à utiliser dans le rendu (props JSX).
 * - `themedStyles(...)` : pour les StyleSheet de module — la feuille est
 *   recalculée par mode, l'app se remonte à la bascule (racine, clé = mode).
 */

import { Gradients, Palette, palettes, ThemeMode, ThemeTokens, Tints } from './palettes';
import { currentMode } from './themeStore';

function tokens(): ThemeTokens {
  return palettes[currentMode()];
}

/** Crée un objet dont chaque propriété relit la palette du mode courant. */
function dynamicTokens<T extends object>(pick: (t: ThemeTokens) => T): T {
  const out = {} as T;
  for (const key of Object.keys(pick(palettes.nuit)) as (keyof T)[]) {
    Object.defineProperty(out, key, {
      enumerable: true,
      get: () => pick(tokens())[key],
    });
  }
  return out;
}

// ─── Couleurs (dynamiques : suivent le mode nuit / jour) ─────────────────────
export const colors: Palette = dynamicTokens((t) => t.colors);

/** Teintes translucides — fonds des pastilles et blocs. */
export const tints: Tints = dynamicTokens((t) => t.tints);

/** Dégradés. Ember : RÉSERVÉ à la cérémonie de crémation. */
export const gradients: Gradients = dynamicTokens((t) => t.gradients);

export { palettes } from './palettes';
export type { Palette, ThemeMode, ThemeTokens, Tints } from './palettes';

// ─── Feuilles de style par mode ──────────────────────────────────────────────
/**
 * Enrobe une feuille de style dépendante du thème. La fabrique reçoit les
 * tokens du mode courant et la feuille est mise en cache par mode. L'objet
 * retourné se lit exactement comme un StyleSheet classique (`styles.card`).
 */
export function themedStyles<T extends object>(factory: (t: ThemeTokens) => T): T {
  const cache: Partial<Record<ThemeMode, T>> = {};
  const resolve = (): T => {
    const mode = currentMode();
    if (!cache[mode]) cache[mode] = factory(palettes[mode]);
    return cache[mode]!;
  };
  return new Proxy({} as T, {
    get: (_, prop) => resolve()[prop as keyof T],
    ownKeys: () => Reflect.ownKeys(resolve() as object),
    getOwnPropertyDescriptor: (_, prop) =>
      Reflect.getOwnPropertyDescriptor(resolve() as object, prop),
  });
}

// ─── Typographie ─────────────────────────────────────────────────────────────
/**
 * Doyle : réservée aux grands titres (display, title) et aux grands chiffres.
 * General Sans : petits titres en Semibold, interface et corps en 400–500.
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
 * les corps).
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

export type ColorToken = keyof Palette;
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

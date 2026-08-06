/**
 * Regrow — les deux palettes de l'app.
 *
 * NUIT (défaut) : prune profonde, lavande, pêche. L'app s'utilise surtout la
 * nuit, au lit. JOUR : les mêmes rôles de couleurs, en version vive et
 * lumineuse, pour celles qui préfèrent un écran clair.
 * Chaque token garde exactement le même rôle dans les deux modes.
 */

export type ThemeMode = 'nuit' | 'jour';

export interface Palette {
  /** Fond principal. */
  background: string;
  /** Cartes et feuilles modales. */
  surface: string;
  /** Éléments interactifs au repos. */
  surfaceRaised: string;
  /** Lavande — actions principales et éléments de marque. */
  primary: string;
  /** Lavande secondaire — hover, contours actifs. */
  primarySoft: string;
  /** Pêche — EXCLUSIVEMENT les moments de progression. */
  accentWarm: string;
  /** Texte principal. */
  textPrimary: string;
  /** Texte secondaire. */
  textSecondary: string;
  /** Validations douces. */
  success: string;
  /** RÉSERVÉ au panic button et aux alertes. */
  danger: string;
  /** Surlignage de citations dans le rapport. */
  highlight: string;
  /** Séparateurs discrets. */
  border: string;
  borderActive: string;
  /** Surcouches / voiles. */
  scrim: string;
}

export interface Tints {
  lavender: string;
  peach: string;
  sage: string;
  cream: string;
}

export interface Gradients {
  ember: readonly [string, string];
  reveal: readonly [string, string];
}

export interface ThemeTokens {
  colors: Palette;
  tints: Tints;
  gradients: Gradients;
}

const nuit: ThemeTokens = {
  colors: {
    background: '#131019',
    surface: '#1D1827',
    surfaceRaised: '#262033',
    primary: '#A78BFA',
    primarySoft: '#C4B5FD',
    accentWarm: '#F4A98C',
    textPrimary: '#F5F1E8',
    textSecondary: '#A79FB3',
    success: '#9DC4A8',
    danger: '#E07A6B',
    highlight: 'rgba(167, 139, 250, 0.18)',
    border: 'rgba(245, 241, 232, 0.08)',
    borderActive: '#A78BFA',
    scrim: 'rgba(19, 16, 25, 0.72)',
  },
  tints: {
    lavender: 'rgba(167, 139, 250, 0.16)',
    peach: 'rgba(244, 169, 140, 0.16)',
    sage: 'rgba(157, 196, 168, 0.16)',
    cream: 'rgba(245, 241, 232, 0.08)',
  },
  gradients: {
    ember: ['#F4A98C', '#E05E3F'] as const,
    reveal: ['rgba(19,16,25,0)', 'rgba(19,16,25,0.96)'] as const,
  },
};

const jour: ThemeTokens = {
  colors: {
    background: '#FAF6EF',
    surface: '#FFFFFF',
    surfaceRaised: '#F1EBFA',
    primary: '#7C56F5',
    primarySoft: '#9F7DFF',
    accentWarm: '#EE7A48',
    textPrimary: '#241B33',
    textSecondary: '#6F6584',
    success: '#3E8E5A',
    danger: '#D65A45',
    highlight: 'rgba(124, 86, 245, 0.14)',
    border: 'rgba(36, 27, 51, 0.10)',
    borderActive: '#7C56F5',
    scrim: 'rgba(250, 246, 239, 0.80)',
  },
  tints: {
    lavender: 'rgba(124, 86, 245, 0.12)',
    peach: 'rgba(238, 122, 72, 0.14)',
    sage: 'rgba(62, 142, 90, 0.12)',
    cream: 'rgba(36, 27, 51, 0.06)',
  },
  gradients: {
    ember: ['#F4A98C', '#E05E3F'] as const,
    reveal: ['rgba(250,246,239,0)', 'rgba(250,246,239,0.97)'] as const,
  },
};

export const palettes: Record<ThemeMode, ThemeTokens> = { nuit, jour };

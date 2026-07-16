import { useFonts } from 'expo-font';

/**
 * Charge les polices de marque : Gooper (titres) + General Sans (corps).
 * Retourne `true` quand elles sont prêtes ; le splash reste affiché avant.
 * Note : les fichiers Gooper sont des versions d'essai — licence à acheter
 * avant toute publication.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    'Gooper-Medium': require('../../assets/fonts/Gooper-Medium.otf'),
    'Gooper-SemiBold': require('../../assets/fonts/Gooper-SemiBold.otf'),
    'GeneralSans-Regular': require('../../assets/fonts/GeneralSans-Regular.ttf'),
    'GeneralSans-Medium': require('../../assets/fonts/GeneralSans-Medium.ttf'),
    'GeneralSans-Semibold': require('../../assets/fonts/GeneralSans-Semibold.ttf'),
  });
  return loaded;
}

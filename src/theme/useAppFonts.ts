import { useFonts } from 'expo-font';

/**
 * Charge les polices de marque : Doyle (titres) + General Sans (corps).
 * Retourne `true` quand elles sont prêtes ; le splash reste affiché avant.
 * Vérifier la licence de chaque police avant publication sur l'App Store.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    'Doyle-Medium': require('../../assets/fonts/Doyle-Medium.ttf'),
    'Doyle-Bold': require('../../assets/fonts/Doyle-Bold.ttf'),
    'GeneralSans-Regular': require('../../assets/fonts/GeneralSans-Regular.ttf'),
    'GeneralSans-Medium': require('../../assets/fonts/GeneralSans-Medium.ttf'),
    'GeneralSans-Semibold': require('../../assets/fonts/GeneralSans-Semibold.ttf'),
  });
  return loaded;
}

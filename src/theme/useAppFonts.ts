import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';

/**
 * Charge les polices de marque (Fraunces + Inter).
 * Retourne `true` quand elles sont prêtes ; le splash reste affiché avant.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  return loaded;
}

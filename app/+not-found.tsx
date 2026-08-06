import { Redirect } from 'expo-router';

/**
 * Route inconnue (deep link cassé, URL web hors app) → retour au point
 * d'entrée, qui redirige selon l'avancement. Jamais d'écran mort.
 */
export default function NotFound() {
  return <Redirect href="/" />;
}

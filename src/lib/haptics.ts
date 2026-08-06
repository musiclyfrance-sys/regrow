import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Retours haptiques centralisés. Chaque appel a une intention produit précise.
 * Sans effet sur le web (pas de moteur haptique dans un navigateur).
 */
let enabled = Platform.OS !== 'web';

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

export const haptics = {
  /** Sélection d'une réponse dans le quiz. */
  selection() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  /** Changement de message sur l'écran d'analyse. */
  tick() {
    if (enabled) Haptics.selectionAsync();
  },
  /** Incrément de streak. */
  streak() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  /** Validation douce (check-in complété, fausse alerte du panic). */
  soft() {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  /** Crémation : haptique long (déclenché en séquence par l'écran dédié). */
  heavy() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  /** Alerte / erreur. */
  warning() {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};

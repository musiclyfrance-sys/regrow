import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Reflète le réglage iOS « Réduire les animations ».
 * Toute animation de l'app doit se couper (ou se réduire à un fondu instantané)
 * quand ce hook renvoie `true`.
 */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduce(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReduce(enabled),
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduce;
}

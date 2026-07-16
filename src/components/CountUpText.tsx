import { useEffect } from 'react';
import { TextInput, TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  /** Valeur cible : le chiffre « roule » de l'ancienne valeur vers celle-ci. */
  value: number;
  durationMs?: number;
  style?: TextStyle | TextStyle[];
  suffix?: string;
}

/**
 * Chiffre qui compte en montant (streak, Détox Score…).
 * Le mouvement rend la progression tangible : on VOIT le chiffre grimper.
 * Affichage immédiat si « Réduire les animations » est actif.
 */
export function CountUpText({ value, durationMs = 900, style, suffix = '' }: Props) {
  const reduce = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = reduce
      ? value
      : withTiming(value, { duration: durationMs, easing: Easing.out(Easing.cubic) });
  }, [value, durationMs, progress, reduce]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${Math.round(progress.value)}${suffix}`,
    defaultValue: `${Math.round(progress.value)}${suffix}`,
  }));

  return (
    <AnimatedInput
      editable={false}
      animatedProps={animatedProps}
      style={[{ padding: 0 }, style]}
      accessibilityLabel={`${value}${suffix}`}
    />
  );
}

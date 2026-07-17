import { useEffect, useState } from 'react';
import { Platform, Text, TextInput, TextStyle } from 'react-native';
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
  // Sur le web (démo), la mise à jour du champ animé n'est pas fiable :
  // on anime le chiffre côté JS, même rendu, fiabilité garantie.
  if (Platform.OS === 'web') {
    return <WebCountUp value={value} durationMs={durationMs} style={style} suffix={suffix} />;
  }
  return <NativeCountUp value={value} durationMs={durationMs} style={style} suffix={suffix} />;
}

function WebCountUp({ value, durationMs = 900, style, suffix = '' }: Props) {
  const reduce = useReduceMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      return;
    }
    const start = Date.now();
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(value * eased));
      if (p >= 1) clearInterval(t);
    }, 40);
    return () => clearInterval(t);
  }, [value, durationMs, reduce]);

  return (
    <Text style={style} accessibilityLabel={`${value}${suffix}`}>
      {shown}
      {suffix}
    </Text>
  );
}

function NativeCountUp({ value, durationMs = 900, style, suffix = '' }: Props) {
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

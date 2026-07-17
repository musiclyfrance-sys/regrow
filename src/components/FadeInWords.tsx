import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, type as typeScale, themedStyles } from '@/theme';

interface Props {
  text: string;
  /** Durée totale d'apparition (répartie mot par mot). */
  totalMs?: number;
  variant?: keyof typeof typeScale;
  color?: string;
  onDone?: () => void;
}

function Word({ word, delay, reduce }: { word: string; delay: number; reduce: boolean }) {
  const opacity = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    opacity.value = withDelay(delay, withTiming(1, { duration: 320 }));
  }, [delay, opacity, reduce]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={style}>
      <AppText variant="display" color={colors.textPrimary}>
        {word + ' '}
      </AppText>
    </Animated.View>
  );
}

/**
 * Fait apparaître une phrase mot par mot en fondu (écran hook).
 * Se coupe (affichage immédiat) si « Réduire les animations » est actif.
 */
export function FadeInWords({ text, totalMs = 2000, onDone }: Props) {
  const reduce = useReduceMotion();
  const words = text.split(' ');
  const perWord = totalMs / Math.max(1, words.length);

  useEffect(() => {
    const t = setTimeout(onDone ?? (() => {}), reduce ? 0 : totalMs);
    return () => clearTimeout(t);
  }, [onDone, reduce, totalMs]);

  return (
    <View style={styles.wrap}>
      {words.map((w, i) => (
        <Word key={`${w}-${i}`} word={w} delay={i * perWord} reduce={reduce} />
      ))}
    </View>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
}));

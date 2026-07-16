import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { haptics } from '@/lib/haptics';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, radii, spacing } from '@/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Affiche une puce de sélection (choix multiple). */
  multiple?: boolean;
}

/**
 * Pilule de réponse. À la sélection : scale 0.97 → 1 + haptique léger.
 * L'avance automatique (350 ms) est gérée par l'écran de quiz, pas ici.
 */
export function PillOption({ label, selected, onPress, multiple }: Props) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    haptics.selection();
    if (!reduceMotion) {
      scale.value = withSequence(
        withTiming(0.97, { duration: 90 }),
        withTiming(1, { duration: 160 }),
      );
    }
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole={multiple ? 'checkbox' : 'radio'}
        accessibilityState={{ selected }}
        onPress={handlePress}
        style={[styles.pill, selected && styles.pillSelected]}
      >
        <AppText
          variant="bodyMedium"
          color={selected ? colors.textPrimary : colors.textSecondary}
          style={styles.label}
        >
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  pillSelected: {
    borderColor: colors.borderActive,
    backgroundColor: colors.surface,
  },
  label: { lineHeight: 22 },
});

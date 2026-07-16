import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { haptics } from '@/lib/haptics';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, radii, spacing } from '@/theme';

interface Props {
  value: number | null;
  onChange: (value: number) => void;
  max?: number; // défaut 5
  labels?: [string, string]; // extrémités bas / haut
}

/**
 * Slider émotionnel (1 → max). Chaque cran donne un haptique léger, et les
 * points s'allument en rebondissant doucement — la sélection se SENT.
 */
export function EmotionScale({ value, onChange, max = 5, labels }: Props) {
  const steps = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {steps.map((n) => (
          <Pressable
            key={n}
            accessibilityRole="adjustable"
            accessibilityLabel={`${n} sur ${max}`}
            accessibilityState={{ selected: value === n }}
            onPress={() => {
              haptics.selection();
              onChange(n);
            }}
            style={styles.hit}
          >
            <Dot active={value != null && n <= value} current={value === n} />
          </Pressable>
        ))}
      </View>
      {labels && (
        <View style={styles.labels}>
          <AppText variant="caption" color={colors.textSecondary}>
            {labels[0]}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {labels[1]}
          </AppText>
        </View>
      )}
    </View>
  );
}

function Dot({ active, current }: { active: boolean; current: boolean }) {
  const reduce = useReduceMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduce) {
      scale.value = current ? 1.25 : 1;
      return;
    }
    // Rebond doux à l'allumage — jamais de bounce agressif.
    scale.value = withSpring(current ? 1.3 : active ? 1.08 : 1, {
      damping: 12,
      stiffness: 180,
    });
  }, [active, current, reduce, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        styles.dot,
        active && styles.dotActive,
        current && styles.dotCurrent,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hit: { padding: spacing.sm },
  dot: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dotActive: { backgroundColor: colors.primarySoft },
  dotCurrent: { borderColor: colors.textPrimary },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
});

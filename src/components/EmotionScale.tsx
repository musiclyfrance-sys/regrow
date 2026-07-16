import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { haptics } from '@/lib/haptics';
import { colors, radii, spacing } from '@/theme';

interface Props {
  value: number | null;
  onChange: (value: number) => void;
  max?: number; // défaut 5
  labels?: [string, string]; // extrémités bas / haut
}

/**
 * Slider émotionnel discret (1 → max). Chaque cran donne un haptique léger.
 * Simple, tactile, lisible d'un pouce dans le noir.
 */
export function EmotionScale({ value, onChange, max = 5, labels }: Props) {
  const steps = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {steps.map((n) => {
          const active = value != null && n <= value;
          const isCurrent = value === n;
          return (
            <Pressable
              key={n}
              accessibilityRole="adjustable"
              accessibilityLabel={`${n} sur ${max}`}
              accessibilityState={{ selected: isCurrent }}
              onPress={() => {
                haptics.selection();
                onChange(n);
              }}
              style={styles.hit}
            >
              <View
                style={[
                  styles.dot,
                  active && styles.dotActive,
                  isCurrent && styles.dotCurrent,
                ]}
              />
            </Pressable>
          );
        })}
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
  dotCurrent: {
    borderColor: colors.textPrimary,
    transform: [{ scale: 1.25 }],
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
});

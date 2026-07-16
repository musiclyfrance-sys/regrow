import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AppText } from './AppText';
import { haptics } from '@/lib/haptics';
import { colors, radii, spacing } from '@/theme';

interface Props {
  /** Étiquette du dessus (« CHECK-IN DU SOIR »). */
  eyebrow: string;
  eyebrowColor?: string;
  title: string;
  /** Ligne d'action explicite (« Commencer · 2 min »). Masquée si done. */
  cta?: string;
  /** État accompli : la carte se calme, plus d'appel à l'action. */
  done?: boolean;
  doneLabel?: string;
  /** Couleur de la bordure d'accent (indique la priorité). */
  accentColor?: string;
  onPress: () => void;
}

/**
 * Carte d'action principale : ÉVIDEMMENT cliquable.
 * Bordure d'accent, ligne d'action avec flèche, enfoncement au toucher +
 * haptique. Une fois faite : état apaisé, sans appel à l'action.
 */
export function ActionCard({
  eyebrow,
  eyebrowColor = colors.accentWarm,
  title,
  cta,
  done,
  doneLabel = 'Fait pour aujourd’hui ✓',
  accentColor = colors.primary,
  onPress,
}: Props) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: done }}
        onPressIn={() => {
          if (!done) scale.value = withSpring(0.97, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        onPress={() => {
          if (done) return;
          haptics.selection();
          onPress();
        }}
        style={[
          styles.card,
          { borderColor: done ? 'transparent' : accentColor },
          done && styles.cardDone,
        ]}
      >
        <AppText variant="caption" color={done ? colors.success : eyebrowColor} style={styles.eyebrow}>
          {eyebrow}
        </AppText>
        <AppText variant="heading">{title}</AppText>

        {done ? (
          <AppText variant="bodyMedium" color={colors.success}>
            {doneLabel}
          </AppText>
        ) : cta ? (
          <View style={styles.ctaRow}>
            <AppText variant="buttonLabel" color={accentColor}>
              {cta}
            </AppText>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke={accentColor}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1.5,
  },
  cardDone: { opacity: 0.8 },
  eyebrow: { letterSpacing: 1.2 },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});

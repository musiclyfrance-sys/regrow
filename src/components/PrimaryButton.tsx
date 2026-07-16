import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { haptics } from '@/lib/haptics';
import { colors, radii, spacing } from '@/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  style?: ViewStyle;
}

/**
 * Bouton pilule principal. Feedback de pression (scale) + haptique léger.
 * Le scale est instantané et discret : c'est un feedback, pas une décoration.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  fullWidth = true,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.danger
        : 'transparent';
  const labelColor = variant === 'ghost' ? colors.textSecondary : colors.background;

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        disabled={disabled || loading}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        onPress={() => {
          if (disabled || loading) return;
          haptics.selection();
          onPress();
        }}
        style={[
          styles.button,
          { backgroundColor: bg },
          variant === 'ghost' && styles.ghost,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <AppText variant="buttonLabel" color={labelColor}>
            {label}
          </AppText>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  button: {
    minHeight: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  ghost: { minHeight: 44 },
  disabled: { opacity: 0.4 },
});

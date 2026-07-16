import { Text, TextProps, TextStyle } from 'react-native';
import { colors, type as typeScale } from '@/theme';

type Variant = keyof typeof typeScale;

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

/**
 * Texte standardisé sur l'échelle typographique du design system.
 * Toujours passer par ce composant plutôt que <Text> brut.
 */
export function AppText({
  variant = 'body',
  color = colors.textPrimary,
  center,
  style,
  ...rest
}: AppTextProps) {
  const base = typeScale[variant] as TextStyle;
  return (
    <Text
      {...rest}
      // Empêche la mise à l'échelle système d'exploser les mises en page.
      maxFontSizeMultiplier={1.3}
      style={[base, { color }, center && { textAlign: 'center' }, style]}
    />
  );
}

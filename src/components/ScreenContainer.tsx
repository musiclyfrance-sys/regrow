import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, screenPadding, themedStyles } from '@/theme';

interface Props {
  children: ReactNode;
  /** Applique la marge d'écran horizontale standard (24). */
  padded?: boolean;
  center?: boolean;
  edges?: readonly Edge[];
  style?: ViewStyle;
  backgroundColor?: string;
}

/** Conteneur d'écran : fond du design system + safe area + marges standard. */
export function ScreenContainer({
  children,
  padded = true,
  center,
  edges = ['top', 'bottom'],
  style,
  backgroundColor = colors.background,
}: Props) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor }]} edges={edges}>
      <View
        style={[
          styles.inner,
          padded && { paddingHorizontal: screenPadding },
          center && styles.center,
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
}));

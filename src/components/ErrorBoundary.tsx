import { Component, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { colors, spacing, themedStyles } from '@/theme';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Filet de sécurité : si un écran plante (surtout pendant le funnel), on
 * affiche un message doux avec un bouton pour repartir — jamais d'écran mort.
 * Un plantage au milieu du parcours = une utilisatrice perdue.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <View style={styles.content}>
            <AppText variant="title" center>
              Petit couac de notre côté.
            </AppText>
            <AppText variant="body" color={colors.textSecondary} center>
              Rien de perdu : tes réponses sont bien gardées. On reprend ?
            </AppText>
          </View>
          <View style={styles.action}>
            <PrimaryButton
              label="Reprendre"
              onPress={() => this.setState({ hasError: false })}
            />
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: { gap: spacing.md },
  action: { position: 'absolute', bottom: spacing.huge, left: 24, right: 24 },
}));

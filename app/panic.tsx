import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, BreathingCircle, PrimaryButton, ScreenContainer } from '@/components';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { colors, spacing, themedStyles } from '@/theme';

/**
 * Panic button — modale immédiate qui respire avec l'utilisatrice.
 * 3 choix : écrire (→ simulateur), respirer 60 s, fausse alerte.
 */
export default function PanicScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'choice' | 'breathing'>('choice');

  useEffect(() => {
    track('panic_pressed');
  }, []);

  if (mode === 'breathing') {
    return <BreathingExercise onDone={() => router.back()} />;
  }

  return (
    <ScreenContainer center>
      <AppText variant="title" center style={styles.headline}>
        Respire un instant, tu es à deux gestes de tout garder intact.
      </AppText>

      <View style={styles.actions}>
        <PrimaryButton
          label="Je veux lui écrire"
          variant="ghost"
          onPress={() => router.replace('/simulator')}
        />
        <PrimaryButton
          label="Je veux juste que ça passe"
          onPress={() => setMode('breathing')}
        />
        <PrimaryButton
          label="Fausse alerte"
          variant="ghost"
          onPress={() => {
            haptics.soft();
            router.back();
          }}
        />
      </View>
    </ScreenContainer>
  );
}

function BreathingExercise({ onDone }: { onDone: () => void }) {
  const [remaining, setRemaining] = useState(60);

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          haptics.soft();
          track('panic_breathing_completed');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <ScreenContainer center>
      <BreathingCircle size={220} color={colors.surfaceRaised} scaleTo={1.18} durationMs={4000}>
        <AppText variant="display" color={colors.textPrimary}>
          {remaining}
        </AppText>
      </BreathingCircle>
      <AppText variant="body" color={colors.textSecondary} center style={styles.breatheHint}>
        Inspire… souffle. Encore un instant, puis ça sera passé.
      </AppText>
      {remaining === 0 && (
        <View style={styles.doneBtn}>
          <PrimaryButton label="Je me sens mieux" onPress={onDone} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  headline: { paddingHorizontal: spacing.md },
  actions: { position: 'absolute', bottom: spacing.huge, left: 24, right: 24, gap: spacing.md },
  breatheHint: { marginTop: spacing.huge, paddingHorizontal: spacing.lg },
  doneBtn: { position: 'absolute', bottom: spacing.huge, left: 24, right: 24 },
}));

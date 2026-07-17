import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText, FadeInWords, PrimaryButton, ScreenContainer } from '@/components';
import { track } from '@/lib/analytics';
import { useQuizStore } from '@/state/quizStore';
import { colors, spacing } from '@/theme';

/**
 * Écran Hook — la première seconde de l'app.
 * Pas de bienvenue, pas de carrousel, pas de demande de notif.
 * Une phrase forte en fondu mot à mot, puis un seul bouton.
 */
export default function HookScreen() {
  const router = useRouter();
  const start = useQuizStore((s) => s.start);
  const goTo = useQuizStore((s) => s.goTo);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    track('hook_viewed');
  }, []);

  const onStart = () => {
    track('hook_cta_tapped');
    start();
    goTo(0);
    router.push({ pathname: '/onboarding/quiz/[step]', params: { step: '0' } });
  };

  return (
    <ScreenContainer center>
      <View style={styles.phrase}>
        <FadeInWords
          text="Tu veux comprendre pourquoi c'est vraiment fini ?"
          totalMs={2000}
          onDone={() => setShowCta(true)}
        />
      </View>

      {showCta && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.ctaBlock}>
          <PrimaryButton label="Commencer l'autopsie" onPress={onStart} fullWidth={false} />
          <AppText
            variant="caption"
            color={colors.textSecondary}
            center
            style={styles.reassurance}
          >
            8 minutes. Anonyme. Sans compte.
          </AppText>
          <PrimaryButton
            label="J'ai déjà un compte"
            variant="ghost"
            fullWidth={false}
            onPress={() => router.push('/connect')}
          />
        </Animated.View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  phrase: { paddingHorizontal: spacing.md },
  ctaBlock: {
    position: 'absolute',
    bottom: spacing.huge,
    alignItems: 'center',
    gap: spacing.lg,
  },
  reassurance: { letterSpacing: 0.3 },
});

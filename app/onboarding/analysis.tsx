import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppText, BreathingCircle, ScreenContainer } from '@/components';
import { generateAutopsy } from '@/lib/ai';
import { haptics } from '@/lib/haptics';
import { colors, motion, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import { useAppStore } from '@/state/appStore';

/**
 * Écran d'analyse — labor illusion (~9 s).
 * Une seule visualisation (cercle lavande qui pulse) + messages d'état enchaînés.
 * L'appel IA réel est lancé en parallèle ; on ne coupe jamais la séquence avant
 * la fin. Cette théâtralisation augmente la valeur perçue du rapport.
 */
const STATUS_MESSAGES = (ex: string) => [
  'Lecture de tes 47 réponses',
  'Reconstruction de la chronologie',
  `Analyse de ses habitudes`,
  'Analyse de tes propres habitudes',
  'Croisement avec 12 000 autopsies similaires',
  'Rédaction de ton rapport',
];

export default function AnalysisScreen() {
  const router = useRouter();
  const answers = useQuizStore((s) => s.answers);
  const profile = useQuizStore((s) => s.profile);
  const exName = selectExName({ profile });
  const setReport = useAppStore((s) => s.setReport);

  const messages = STATUS_MESSAGES(exName);
  const [messageIndex, setMessageIndex] = useState(0);
  const [slow, setSlow] = useState(false);
  const reportReady = useRef(false);
  const sequenceDone = useRef(false);

  // Lance l'appel IA réel en parallèle de la théâtralisation.
  useEffect(() => {
    let mounted = true;
    generateAutopsy({ answers, exName }).then((report) => {
      if (!mounted) return;
      setReport(report);
      reportReady.current = true;
      maybeFinish();
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Séquence de messages (1,5 s chacun) + haptique à chaque changement.
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((i) => {
        const next = i + 1;
        if (next >= messages.length) {
          clearInterval(timer);
          sequenceDone.current = true;
          maybeFinish();
          return i;
        }
        haptics.tick();
        return next;
      });
    }, motion.analysisStepMs);

    const slowTimer = setTimeout(() => setSlow(true), motion.analysisSlowThresholdMs);

    return () => {
      clearInterval(timer);
      clearTimeout(slowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On part vers le teaser seulement quand la séquence ET l'IA sont prêtes.
  const maybeFinish = () => {
    if (sequenceDone.current && reportReady.current) {
      router.replace('/onboarding/teaser');
    }
  };

  return (
    <ScreenContainer center>
      <BreathingCircle size={180} color={colors.primary} scaleTo={1.08} durationMs={1400}>
        <View />
      </BreathingCircle>

      <View style={styles.messageWrap}>
        <Animated.View key={messageIndex} entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)}>
          <AppText variant="heading" center color={colors.textPrimary}>
            {messages[messageIndex]}
          </AppText>
        </Animated.View>
        {slow && (
          <AppText variant="body" center color={colors.textSecondary} style={styles.slow}>
            L'analyse est plus dense que prévu, encore quelques secondes.
          </AppText>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  messageWrap: {
    position: 'absolute',
    bottom: spacing.huge * 2,
    left: spacing.xxl,
    right: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  slow: { marginTop: spacing.md },
});

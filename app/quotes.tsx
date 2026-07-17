import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { LibraryIcon } from '@/components/LibraryIcon';
import { QUOTES } from '@/config/library';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { useJournalStore } from '@/state/journalStore';
import { colors, radii, spacing, tints } from '@/theme';

/**
 * Citations — une phrase à la fois, celle du jour d'abord.
 * On peut la garder dans son journal ou en tirer une autre.
 */
export default function QuotesScreen() {
  const router = useRouter();
  const addEntry = useJournalStore((s) => s.addEntry);
  const dayIndex = Math.floor(Date.now() / 86_400_000) % QUOTES.length;
  const [index, setIndex] = useState(dayIndex);
  const [saved, setSaved] = useState(false);

  const next = () => {
    haptics.soft();
    setSaved(false);
    setIndex((i) => (i + 1) % QUOTES.length);
    track('quote_next');
  };

  const keep = () => {
    if (saved) return;
    haptics.streak();
    addEntry(`« ${QUOTES[index]!} »`);
    setSaved(true);
    track('quote_saved');
  };

  return (
    <ScreenContainer center>
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, { backgroundColor: tints.peach }]}>
          <LibraryIcon name="quote" color={colors.accentWarm} size={26} />
        </View>
      </View>

      <Animated.View key={index} entering={FadeIn.duration(450)} style={styles.quoteBlock}>
        <AppText variant="title" center>
          {QUOTES[index]}
        </AppText>
        {index === dayIndex && (
          <AppText variant="caption" color={colors.textSecondary} center>
            La phrase de ce soir.
          </AppText>
        )}
      </Animated.View>

      <View style={styles.bottomActions}>
        <PrimaryButton
          label={saved ? 'Gardée dans ton journal ✓' : 'Garder dans mon journal'}
          variant="ghost"
          onPress={keep}
        />
        <PrimaryButton label="Une autre" onPress={next} />
        <PrimaryButton label="‹ Retour" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: { position: 'absolute', top: spacing.huge + spacing.xl },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteBlock: { gap: spacing.lg, paddingHorizontal: spacing.md },
  bottomActions: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 24,
    right: 24,
    gap: spacing.md,
  },
});

import { Stack } from 'expo-router';
import { colors, motion } from '@/theme';

/** Pile d'onboarding : transitions slide horizontal + fondu, jamais de bounce. */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: motion.quizTransitionMs,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="hook" options={{ animation: 'fade' }} />
      <Stack.Screen name="quiz/[step]" />
      <Stack.Screen name="analysis" options={{ animation: 'fade' }} />
      <Stack.Screen name="teaser" options={{ animation: 'fade' }} />
    </Stack>
  );
}

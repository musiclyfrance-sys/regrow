import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, useAppFonts, useThemeStore } from '@/theme';
import { ErrorBoundary } from '@/components';
import { initAnalytics, track } from '@/lib/analytics';
import { listenNotificationOpens } from '@/lib/notifications';
import { ensureAnonymousSession } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  // Bascule nuit / jour : la clé force un redessin complet avec la palette.
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    // Session anonyme dès le lancement (aucun compte demandé) + analytics.
    initAnalytics();
    ensureAnonymousSession();
    track('app_opened');
    // Suivi des ouvertures de notification (famille uniquement, jamais le contenu).
    return listenNotificationOpens((family) =>
      track('notification_opened', { family }),
    );
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView key={mode} style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <ErrorBoundary>
        <StatusBar style={mode === 'nuit' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="paywall" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="connect" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="post-purchase/account" options={{ animation: 'fade' }} />
          <Stack.Screen name="report" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="panic"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
          <Stack.Screen name="checkin" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="simulator" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="capsule" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen
            name="cremation"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
          <Stack.Screen name="rapport" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="breathe" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          <Stack.Screen name="meditate" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          <Stack.Screen name="quotes" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="journal" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="sounds" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="article/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="ressources"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
        </Stack>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

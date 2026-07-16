import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, useAppFonts } from '@/theme';
import { initAnalytics, track } from '@/lib/analytics';
import { ensureAnonymousSession } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    // Session anonyme dès le lancement (aucun compte demandé) + analytics.
    initAnalytics();
    ensureAnonymousSession();
    track('app_opened');
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
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
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
          <Stack.Screen
            name="ressources"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

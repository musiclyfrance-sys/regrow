import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Regrow — app d'accompagnement post-rupture (MVP iOS).
 * Mode sombre uniquement. Français, tutoiement.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Regrow',
  slug: 'regrow',
  scheme: 'regrow',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  backgroundColor: '#131019',
  splash: {
    backgroundColor: '#131019',
    resizeMode: 'contain',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.regrow.app',
    // Mode sombre forcé : l'app s'utilise la nuit dans un lit.
    userInterfaceStyle: 'dark',
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        "Regrow importe les photos que tu choisis dans ton coffre-fort chiffré. Rien n'est envoyé sans ton accord.",
      NSMicrophoneUsageDescription:
        'Regrow enregistre tes capsules vocales, chiffrées et privées.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.regrow.app',
    adaptiveIcon: { backgroundColor: '#131019' },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    'expo-av',
    'expo-notifications',
    [
      'expo-image-picker',
      {
        photosPermission:
          "Regrow importe les photos que tu choisis dans ton coffre-fort chiffré.",
      },
    ],
    'expo-apple-authentication',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // Toutes les valeurs sensibles restent hors code client (Edge Functions).
    // Ces clés publiques Supabase / RevenueCat / PostHog sont injectées via env.
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    revenueCatApiKeyIos: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
    posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '',
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
    // Mode mock : développe sans aucune clé (IA, achats, analytics simulés).
    mockMode: (process.env.EXPO_PUBLIC_MOCK_MODE ?? 'true') === 'true',
    // Projet EAS « regrow » créé sur expo.dev (compte yassirsab).
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '116712fa-bc71-4289-9487-eb1f70198110',
    },
  },
});

// Configuration Metro (l'assembleur de l'app).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Depuis Expo SDK 53, Metro suit les « package exports » de Node. La librairie
// Supabase y déclare une dépendance serveur (ws → stream) qui n'existe pas sur
// iOS, et le paquet mobile refuse alors de s'assembler. On repasse sur la
// résolution classique, celle prévue pour React Native.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

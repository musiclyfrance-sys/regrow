module.exports = function (api) {
  api.cache(true);
  return {
    // Depuis Expo SDK 54 (Reanimated 4), `babel-preset-expo` ajoute lui-même
    // le module d'animations (`react-native-worklets/plugin`). L'ajouter une
    // seconde fois ici le fait s'appliquer deux fois, et l'app plante au
    // démarrage sur téléphone. On laisse donc le préréglage seul aux commandes.
    presets: ['babel-preset-expo'],
  };
};

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated/plugin doit toujours être en dernier.
      'react-native-reanimated/plugin',
    ],
  };
};

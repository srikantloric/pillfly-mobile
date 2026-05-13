module.exports = function (api) {
  api.cache(true);
  const { plugins } = require('nativewind/babel')();
  return {
    presets: ['module:@react-native/babel-preset'],
    // NativeWind already enables worklets; don't add reanimated/plugin too.
    plugins: [
      ...plugins,
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
          extensions: [
            '.ios.js',
            '.android.js',
            '.js',
            '.jsx',
            '.json',
            '.tsx',
            '.ts',
          ],
        },
      ],
    ],
  };
};

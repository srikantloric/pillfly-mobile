module.exports = function (api) {
  api.cache(true);
  const { plugins } = require('nativewind/babel')();
  return {
    presets: ['module:@react-native/babel-preset'],
    /** Includes css-interop JSX transform + worklets (via NativeWind). Do not add `reanimated/plugin` — duplicates worklets. */
    plugins,
  };
};

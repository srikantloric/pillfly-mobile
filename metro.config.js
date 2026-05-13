const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const base = getDefaultConfig(__dirname);

const withSvg = mergeConfig(base, {
  transformer: {
    ...base.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    ...base.resolver,
    assetExts: base.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...base.resolver.sourceExts, 'svg'],
  },
});

module.exports = withNativeWind(withSvg, { input: './global.css' });

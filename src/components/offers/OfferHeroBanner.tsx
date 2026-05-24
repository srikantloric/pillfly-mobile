import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  View,
  type ImageLoadEventData,
  type ImageRequireSource,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';

import { offerBannerAssets } from './offerAssets';

const HERO_BOTTOM_RADIUS = 36;

function heightForWidth(naturalW: number, naturalH: number, targetW: number): number {
  if (naturalW <= 0 || naturalH <= 0) {
    return Math.max(1, Math.round(targetW * 0.42));
  }
  return Math.max(1, Math.round((naturalH / naturalW) * targetW));
}

type Props = {
  onPressBack?: () => void;
  source?: ImageRequireSource;
};

export const OfferHeroBanner = memo(function OfferHeroBanner({
  onPressBack,
  source = offerBannerAssets.bogoHero,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const bannerWidth = Math.max(1, windowWidth);

  const resolved = useMemo(
    () => Image.resolveAssetSource(source) ?? { width: 1, height: 1 },
    [source],
  );
  const baselineHeight = heightForWidth(resolved.width, resolved.height, bannerWidth);
  const [frameHeight, setFrameHeight] = useState(baselineHeight);

  useEffect(() => {
    setFrameHeight(heightForWidth(resolved.width, resolved.height, bannerWidth));
  }, [resolved.height, resolved.width, bannerWidth]);

  const onLoad = useCallback(
    (event: NativeSyntheticEvent<ImageLoadEventData>) => {
      const w = event.nativeEvent.source?.width;
      const h = event.nativeEvent.source?.height;
      if (typeof w !== 'number' || typeof h !== 'number' || w <= 0 || h <= 0) return;
      const next = heightForWidth(w, h, bannerWidth);
      setFrameHeight((prev) => (Math.abs(prev - next) > 1 ? next : prev));
    },
    [bannerWidth],
  );

  return (
    <View
      className="overflow-hidden bg-pillfly-surface"
      style={{
        width: bannerWidth,
        height: frameHeight,
        borderBottomLeftRadius: HERO_BOTTOM_RADIUS,
        borderBottomRightRadius: HERO_BOTTOM_RADIUS,
      }}
    >
      <Image
        source={source}
        style={{ width: bannerWidth, height: frameHeight }}
        resizeMode="cover"
        onLoad={onLoad}
        accessibilityIgnoresInvertColors
      />

      {onPressBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onPressBack}
          hitSlop={12}
          className="absolute left-4 top-3 h-10 w-10 items-center justify-center rounded-full bg-black/35 active:bg-black/50"
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
});

OfferHeroBanner.displayName = 'OfferHeroBanner';

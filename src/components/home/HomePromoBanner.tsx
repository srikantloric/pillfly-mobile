import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  type ImageLoadEventData,
  type ImageRequireSource,
  type NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from 'react-native';

export const HOME_CONTENT_PADDING_HORIZONTAL = 16;

const SCROLL_GUTTER = HOME_CONTENT_PADDING_HORIZONTAL;

const CARD_PADDING_H = 1;
const OUTER_RADIUS = 16;
const INNER_RADIUS = Math.max(8, OUTER_RADIUS - CARD_PADDING_H);

export const homePromoBannerAssets = {
  medicine27: require('../../assets/banner/7ac30788ac6-HPMKTGPYMED27.jpg'),
  diagBogo: require('../../assets/banner/3c0569aa8e5-Diag_HP_Banner_BOGO.jpg'),
} as const;

function heightForWidth(naturalW: number, naturalH: number, targetW: number): number {
  if (naturalW <= 0 || naturalH <= 0) {
    return Math.max(1, Math.round(targetW * 0.4));
  }
  return Math.max(1, Math.round((naturalH / naturalW) * targetW));
}

type Props = {
  source: ImageRequireSource;
};

export const HomePromoBanner = memo(function HomePromoBanner({ source }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.max(1, windowWidth - SCROLL_GUTTER * 2);
  const imageWidth = Math.max(1, contentWidth - CARD_PADDING_H * 2);

  const resolved = useMemo(
    () => Image.resolveAssetSource(source) ?? { width: 1, height: 1 },
    [source],
  );
  const baselineHeight = heightForWidth(resolved.width, resolved.height, imageWidth);
  const [frameHeight, setFrameHeight] = useState(baselineHeight);

  useEffect(() => {
    setFrameHeight(heightForWidth(resolved.width, resolved.height, imageWidth));
  }, [resolved.height, resolved.width, imageWidth]);

  const onLoad = useCallback(
    (event: NativeSyntheticEvent<ImageLoadEventData>) => {
      const w = event.nativeEvent.source?.width;
      const h = event.nativeEvent.source?.height;
      if (typeof w !== 'number' || typeof h !== 'number' || w <= 0 || h <= 0) return;
      const next = heightForWidth(w, h, imageWidth);
      setFrameHeight((prev) => (Math.abs(prev - next) > 1 ? next : prev));
    },
    [imageWidth],
  );

  return (
    <View
      className="shrink-0 self-center overflow-hidden rounded-2xl border border-pillfly-line bg-pillfly-surface px-px py-px"
      style={{ width: contentWidth }}
    >
      <View
        className="self-center overflow-hidden"
        style={{
          width: imageWidth,
          height: frameHeight,
          borderRadius: INNER_RADIUS,
        }}
      >
        <Image
          source={source}
          style={{ width: imageWidth, height: frameHeight }}
          resizeMode="contain"
          onLoad={onLoad}
        />
      </View>
    </View>
  );
});

HomePromoBanner.displayName = 'HomePromoBanner';

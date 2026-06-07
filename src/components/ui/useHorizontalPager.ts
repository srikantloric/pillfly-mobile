import { useCallback, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

type Options = {
  slideWidth: number;
  itemGap?: number;
  itemCount: number;
  initialIndex?: number;
};

export function useHorizontalPager({
  slideWidth,
  itemGap = 0,
  itemCount,
  initialIndex = 0,
}: Options) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const step = slideWidth + itemGap;

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const rawIndex = Math.round(event.nativeEvent.contentOffset.x / step);
      const nextIndex = Math.min(Math.max(rawIndex, 0), Math.max(itemCount - 1, 0));
      setActiveIndex(nextIndex);
    },
    [itemCount, step],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: step,
      offset: step * index,
      index,
    }),
    [step],
  );

  return {
    activeIndex,
    step,
    onMomentumScrollEnd,
    getItemLayout,
  };
}

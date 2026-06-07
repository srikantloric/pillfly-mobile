import React, { memo, useCallback, type ReactElement, type ReactNode } from "react";
import { FlatList } from "react-native";

import { useHorizontalPager } from "./useHorizontalPager";

type Props<T> = {
  data: readonly T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: { item: T; index: number }) => ReactElement | null;
  slideWidth: number;
  itemGap?: number;
  pagingEnabled?: boolean;
  scrollEnabled?: boolean;
  bounces?: boolean;
  contentContainerClassName?: string;
  className?: string;
  decelerationRate?: "fast" | "normal" | number;
  snapToAlignment?: "start" | "center" | "end";
  children?: (state: { activeIndex: number }) => ReactNode;
};

function HorizontalPagerComponent<T>({
  data,
  keyExtractor,
  renderItem,
  slideWidth,
  itemGap = 0,
  pagingEnabled,
  scrollEnabled = true,
  bounces,
  contentContainerClassName,
  className,
  decelerationRate,
  snapToAlignment,
  children,
}: Props<T>) {
  const { activeIndex, step, onMomentumScrollEnd, getItemLayout } = useHorizontalPager({
    slideWidth,
    itemGap,
    itemCount: data.length,
  });

  const handleScrollEnd = useCallback(
    (event: Parameters<typeof onMomentumScrollEnd>[0]) => {
      onMomentumScrollEnd(event);
    },
    [onMomentumScrollEnd],
  );

  const usePaging = pagingEnabled ?? itemGap === 0;
  const canScroll = scrollEnabled && data.length > 1;

  return (
    <>
      <FlatList
        className={className}
        data={data as T[]}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => renderItem({ item, index })}
        horizontal
        pagingEnabled={usePaging}
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemGap > 0 ? step : undefined}
        snapToAlignment={snapToAlignment}
        decelerationRate={decelerationRate}
        onMomentumScrollEnd={handleScrollEnd}
        bounces={bounces ?? data.length > 1}
        scrollEnabled={canScroll}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        contentContainerClassName={contentContainerClassName}
      />
      {children?.({ activeIndex })}
    </>
  );
}

export const HorizontalPager = memo(HorizontalPagerComponent) as typeof HorizontalPagerComponent;

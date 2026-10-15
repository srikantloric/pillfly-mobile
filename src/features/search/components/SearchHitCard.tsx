import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

import type { ProductSearchHit } from "@/features/product";
import { PrimaryButton } from "@/components/ui";

import { ProductImageWithPlaceholder } from "@/components/ui";

const TITLE_LINE_HEIGHT = 18;
const TITLE_MAX_LINES = 2;
const TITLE_BLOCK_HEIGHT = TITLE_LINE_HEIGHT * TITLE_MAX_LINES;
const META_LINE_HEIGHT = 16;
const IMAGE_BLOCK_HEIGHT = 130;
const CONTENT_VERTICAL_PADDING = 16;
const BUTTON_BLOCK_HEIGHT = 48;

export const SEARCH_HIT_CARD_INTRINSIC_HEIGHT =
  IMAGE_BLOCK_HEIGHT +
  CONTENT_VERTICAL_PADDING +
  TITLE_BLOCK_HEIGHT +
  META_LINE_HEIGHT * 2 +
  BUTTON_BLOCK_HEIGHT;

type Props = {
  hit: ProductSearchHit;
  width: number;
  fillHeight?: boolean;
  onPress?: (hit: ProductSearchHit) => void;
};

export const SearchHitCard = memo(function SearchHitCard({
  hit,
  width,
  fillHeight = true,
  onPress,
}: Props) {
  const subtitle = hit.saltComposition?.trim() || hit.brandName;

  return (
    <View
      style={fillHeight ? { width, flex: 1 } : { width, height: SEARCH_HIT_CARD_INTRINSIC_HEIGHT }}
      className="flex-col overflow-hidden border border-pillfly-line bg-pillfly-surface"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hit.title}
        onPress={() => onPress?.(hit)}
        className={fillHeight ? "flex-1 active:opacity-95" : "active:opacity-95"}
      >
        <View className="bg-pillfly-background px-2 pt-2" style={{ height: IMAGE_BLOCK_HEIGHT }}>
          <ProductImageWithPlaceholder uri={hit.thumbnailUrl} className="h-full w-full" />
        </View>

        <View className={fillHeight ? "flex-1 px-2.5 pb-2 pt-2" : "px-2.5 pb-2 pt-2"}>
          <Text
            className="text-[13px] font-bold text-pillfly-ink"
            numberOfLines={TITLE_MAX_LINES}
            ellipsizeMode="tail"
            style={{ lineHeight: TITLE_LINE_HEIGHT, height: TITLE_BLOCK_HEIGHT }}
          >
            {hit.title}
          </Text>
          <Text
            className="text-[11px] text-pillfly-muted"
            numberOfLines={1}
            style={{ lineHeight: META_LINE_HEIGHT, height: META_LINE_HEIGHT }}
          >
            {subtitle}
          </Text>
          <Text
            className="text-[11px] text-pillfly-muted"
            numberOfLines={1}
            style={{ lineHeight: META_LINE_HEIGHT, height: META_LINE_HEIGHT }}
          >
            {hit.manufacturerName}
          </Text>
        </View>
      </Pressable>

      <View className="px-2.5 pb-2.5 pt-1">
        <PrimaryButton
          label="View"
          size="sm"
          accessibilityLabel={`View ${hit.title}`}
          onPress={() => onPress?.(hit)}
          className="w-full rounded-lg"
        />
      </View>
    </View>
  );
});

SearchHitCard.displayName = "SearchHitCard";

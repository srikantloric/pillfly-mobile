import React, { memo, useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { DescriptionParagraph } from "@/features/product/utils/productDescription";

type Props = {
  paragraphs: DescriptionParagraph[];
  collapsedLines?: number;
  textClassName?: string;
};

function DescriptionSpans({
  paragraph,
}: {
  paragraph: DescriptionParagraph;
}) {
  return (
    <>
      {paragraph.spans.map((span, index) => (
        <Text key={`${index}-${span.text.slice(0, 12)}`} className={span.bold ? "font-bold text-pillfly-ink" : undefined}>
          {span.text}
        </Text>
      ))}
    </>
  );
}

export const ProductDescriptionText = memo(function ProductDescriptionText({
  paragraphs,
  collapsedLines,
  textClassName = "text-[13px] leading-[20px] text-pillfly-muted",
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const canCollapse = collapsedLines != null;

  const onTextLayout = useCallback(
    (event: { nativeEvent: { lines: unknown[] } }) => {
      if (!expanded && collapsedLines != null) {
        setTruncated(event.nativeEvent.lines.length > collapsedLines);
      }
    },
    [collapsedLines, expanded],
  );

  if (paragraphs.length === 0) {
    return null;
  }

  if (!canCollapse || expanded) {
    return (
      <View>
        {paragraphs.map((paragraph, index) => (
          <Text
            key={`paragraph-${index}`}
            className={`${textClassName} ${index < paragraphs.length - 1 ? "mb-2" : ""}`}
          >
            <DescriptionSpans paragraph={paragraph} />
          </Text>
        ))}
        {canCollapse && expanded ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Read less"
            onPress={() => setExpanded(false)}
            className="mt-1 self-start active:opacity-80"
          >
            <Text className="text-[13px] font-semibold text-pillfly-primary">read less</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const showToggle = truncated || expanded;

  return (
    <View>
      <Text
        className={textClassName}
        numberOfLines={collapsedLines}
        onTextLayout={onTextLayout}
      >
        {paragraphs.map((paragraph, index) => (
          <Text key={`paragraph-${index}`}>
            {index > 0 ? "\n\n" : null}
            <DescriptionSpans paragraph={paragraph} />
          </Text>
        ))}
      </Text>
      {showToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Read more"
          onPress={() => setExpanded(true)}
          className="mt-1 self-start active:opacity-80"
        >
          <Text className="text-[13px] font-semibold text-pillfly-primary">read more</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

ProductDescriptionText.displayName = "ProductDescriptionText";

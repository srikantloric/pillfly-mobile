import React, { memo, useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  text: string;
  collapsedLines?: number;
  className?: string;
  textClassName?: string;
};

export const ReadMoreText = memo(function ReadMoreText({
  text,
  collapsedLines = 3,
  className = "",
  textClassName = "text-[13px] leading-[20px] text-pillfly-muted",
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const onTextLayout = useCallback(
    (event: { nativeEvent: { lines: unknown[] } }) => {
      if (!expanded) {
        setTruncated(event.nativeEvent.lines.length > collapsedLines);
      }
    },
    [collapsedLines, expanded],
  );

  const showToggle = truncated || expanded;

  return (
    <View className={className}>
      <Text
        className={textClassName}
        numberOfLines={expanded ? undefined : collapsedLines}
        onTextLayout={onTextLayout}
      >
        {text}
      </Text>

      {showToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Read less" : "Read more"}
          onPress={() => setExpanded((prev) => !prev)}
          className="mt-1 self-start active:opacity-80"
        >
          <Text className="text-[13px] font-semibold text-pillfly-primary">
            {expanded ? "read less" : "read more"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
});

ReadMoreText.displayName = "ReadMoreText";

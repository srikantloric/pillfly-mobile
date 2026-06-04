import React, { memo, type ReactNode } from "react";
import { ScrollView } from "react-native";

type Props = {
  children: ReactNode;
  gapClassName?: string;
  contentClassName?: string;
};

export const HorizontalScrollRow = memo(function HorizontalScrollRow({
  children,
  gapClassName = "gap-3",
  contentClassName = "px-4 pb-1",
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName={`${contentClassName} ${gapClassName}`}
    >
      {children}
    </ScrollView>
  );
});

HorizontalScrollRow.displayName = "HorizontalScrollRow";

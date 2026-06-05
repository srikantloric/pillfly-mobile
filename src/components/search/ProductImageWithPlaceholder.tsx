import React, { memo, useCallback, useEffect, useState } from "react";
import { Image, View, type ImageStyle, type StyleProp } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { colors } from "@/theme";

const PRODUCT_PLACEHOLDER = require("../../assets/icons/branded_09092025.png");

type Props = {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  className?: string;
  dimmed?: boolean;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
};

export const ProductImageWithPlaceholder = memo(function ProductImageWithPlaceholder({
  uri,
  style,
  className = "h-full w-full",
  dimmed = false,
  resizeMode = "contain",
}: Props) {
  const [phase, setPhase] = useState<"loading" | "loaded" | "error">(
    uri ? "loading" : "error",
  );

  useEffect(() => {
    setPhase(uri ? "loading" : "error");
  }, [uri]);

  const onLoad = useCallback(() => setPhase("loaded"), []);
  const onError = useCallback(() => setPhase("error"), []);

  const showRemote = uri != null && phase !== "error";
  const showPlaceholder = !showRemote || phase !== "loaded";

  return (
    <View className={`items-center justify-center ${className}`} style={style}>
      {showPlaceholder ? (
        <Image
          source={PRODUCT_PLACEHOLDER}
          className="h-[72px] w-[72px] opacity-90"
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : null}

      {showRemote ? (
        <Image
          source={{ uri }}
          className="absolute inset-0 h-full w-full"
          resizeMode={resizeMode}
          onLoad={onLoad}
          onError={onError}
          style={{
            opacity: phase === "loaded" ? (dimmed ? 0.35 : 1) : 0,
          }}
          accessibilityIgnoresInvertColors
        />
      ) : null}

      {!uri ? (
        <View className="absolute inset-0 items-center justify-center">
          <Feather name="package" size={28} color={colors.textSecondary} />
        </View>
      ) : null}
    </View>
  );
});

ProductImageWithPlaceholder.displayName = "ProductImageWithPlaceholder";

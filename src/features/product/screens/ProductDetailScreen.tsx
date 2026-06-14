import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BouncingDotsLoader } from "@/components/ui";
import { PDP_HORIZONTAL_PADDING } from "@/features/product/constants/productDetail.constants";
import { useProductDetail } from "@/features/product/hooks/useProductDetail";
import { ProductDetailContent } from "@/features/product/screens/ProductDetailContent";
import type { AppStackParamList } from "@/types/navigation.types";
import { colors } from "@/theme";

const LOADER_FADE_MS = 220;

type Props = NativeStackScreenProps<AppStackParamList, "ProductDetail">;

export function ProductDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const productId = route.params.productId;
  const { product, loading, error } = useProductDetail(productId);

  const [showLoaderOverlay, setShowLoaderOverlay] = useState(true);
  const loaderOpacity = useRef(new Animated.Value(1)).current;

  const resetLoader = useCallback(() => {
    loaderOpacity.stopAnimation();
    loaderOpacity.setValue(1);
    setShowLoaderOverlay(true);
  }, [loaderOpacity]);

  useEffect(() => {
    resetLoader();
  }, [productId, resetLoader]);

  useEffect(() => {
    if (loading) {
      resetLoader();
    }
  }, [loading, resetLoader]);

  const handleContentReady = useCallback(() => {
    Animated.timing(loaderOpacity, {
      toValue: 0,
      duration: LOADER_FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowLoaderOverlay(false);
      }
    });
  }, [loaderOpacity]);

  const onPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (error && !product) {
    return (
      <View
        className="flex-1 bg-pillfly-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onPressBack}
          className="h-12 w-12 items-center justify-center"
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <View className={`flex-1 justify-center ${PDP_HORIZONTAL_PADDING}`}>
          <View className="rounded-xl border border-pillfly-line bg-pillfly-surface px-4 py-5">
            <Text className="text-center text-[14px] text-pillfly-promo-red">{error.message}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-pillfly-surface">
      {!loading && product ? (
        <ProductDetailContent
          product={product}
          navigation={navigation}
          onReady={handleContentReady}
        />
      ) : null}

      {showLoaderOverlay ? (
        <Animated.View
          pointerEvents={loading ? "auto" : "none"}
          style={[StyleSheet.absoluteFill, { opacity: loaderOpacity }]}
        >
          <View
            className="flex-1 bg-pillfly-surface"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
          >
            <BouncingDotsLoader />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

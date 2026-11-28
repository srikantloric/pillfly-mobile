import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { HEADER_HIT_SLOP } from "@/components/header/appHeader.constants";
import { colors } from "@/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onBack: () => void;
  onClear?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  onBack,
  onClear,
  onSubmit,
  placeholder = "Search for Medicines/Healthcare...",
  autoFocus = false,
}: Props) {
  const showClear = value.length > 0 && onClear != null;
  const isEmpty = value.length === 0;

  return (
    <View className="flex-row items-center gap-2 border-b border-pillfly-line bg-pillfly-surface px-4 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={HEADER_HIT_SLOP}
        onPress={onBack}
        className="h-10 w-10 shrink-0 items-center justify-center active:opacity-80"
      >
        <Feather name="arrow-left" size={22} color={colors.textPrimary} />
      </Pressable>

      <View className="min-h-[46px] min-w-0 flex-1 flex-row items-center rounded-2xl border border-pillfly-line bg-pillfly-background px-3">
        <View className="min-w-0 flex-1 justify-center">
          {/* Android TextInput hints can first-layout as "..." on narrow screens;
              Text + numberOfLines ellipsizes correctly from the first paint. */}
          {isEmpty ? (
            <Text
              pointerEvents="none"
              numberOfLines={1}
              ellipsizeMode="tail"
              className="absolute left-0 right-0 text-[15px]"
              style={{ color: colors.textSecondary }}
            >
              {placeholder}
            </Text>
          ) : null}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder=""
            returnKeyType="search"
            onSubmitEditing={onSubmit}
            autoCorrect={false}
            autoCapitalize="none"
            autoFocus={autoFocus}
            className="py-2.5 text-[15px] text-pillfly-ink"
            style={{ color: colors.textPrimary, padding: 0 }}
          />
        </View>
        {showClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onClear}
            className="shrink-0 p-1 active:opacity-70"
          >
            <Feather name="x" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search with camera"
        hitSlop={HEADER_HIT_SLOP}
        onPress={() => {}}
        className="h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-pillfly-line active:opacity-80"
      >
        <Feather name="camera" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

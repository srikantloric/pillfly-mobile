import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { HEADER_HIT_SLOP } from "../header/appHeader.constants";
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
  placeholder = "Search for Medicines/Lab Tests/H...",
  autoFocus = false,
}: Props) {
  const showClear = value.length > 0 && onClear != null;

  return (
    <View className="flex-row items-center gap-2 border-b border-pillfly-line bg-pillfly-surface px-4 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={HEADER_HIT_SLOP}
        onPress={onBack}
        className="h-10 w-10 items-center justify-center active:opacity-80"
      >
        <Feather name="arrow-left" size={22} color={colors.textPrimary} />
      </Pressable>

      <View className="min-h-[46px] flex-1 flex-row items-center rounded-2xl border border-pillfly-line bg-pillfly-background px-3">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus={autoFocus}
          className="flex-1 py-2.5 text-[15px] text-pillfly-ink"
          style={{ color: colors.textPrimary }}
        />
        {showClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={HEADER_HIT_SLOP}
            onPress={onClear}
            className="p-1 active:opacity-70"
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
        className="h-10 w-10 items-center justify-center rounded-lg border border-pillfly-line active:opacity-80"
      >
        <Feather name="camera" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

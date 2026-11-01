import React from "react";
import { Text, TextInput, View } from "react-native";

import { colors } from "@/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: "default" | "phone-pad" | "number-pad";
  maxLength?: number;
  optional?: boolean;
};

export function AddressField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  maxLength,
  optional = false,
}: Props) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold text-pillfly-ink">
        {label}
        {optional ? <Text className="font-medium text-pillfly-muted"> (optional)</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        maxLength={maxLength}
        accessibilityLabel={label}
        className={`min-h-[52px] rounded-xl border bg-pillfly-surface px-4 text-[15px] text-pillfly-ink ${
          error ? "border-pillfly-promo-red" : "border-pillfly-line"
        }`}
      />
      {error ? <Text className="mt-1 text-[12px] text-pillfly-promo-red">{error}</Text> : null}
    </View>
  );
}

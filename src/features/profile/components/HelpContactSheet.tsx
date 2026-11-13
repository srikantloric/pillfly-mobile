import React, { memo } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";
import { openSupportPhone, openSupportWhatsApp } from "@/utils/supportContact";

type Props = {
  visible: boolean;
  onClose: () => void;
};

function ContactAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="native:shadow-sm flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-pillfly-line bg-pillfly-surface py-3.5 active:bg-pillfly-background"
    >
      {icon}
      <Text className="text-[15px] font-semibold text-pillfly-ink">{label}</Text>
    </Pressable>
  );
}

export const HelpContactSheet = memo(function HelpContactSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close help options"
        onPress={onClose}
        className="flex-1 justify-center bg-black/40 px-5"
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="rounded-2xl border border-pillfly-line bg-pillfly-surface px-4 pb-4 pt-4"
          style={{ marginBottom: Math.max(insets.bottom, 0) }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-pillfly-ink">Need Help</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              className="h-8 w-8 items-center justify-center"
            >
              <Feather name="x" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            <ContactAction
              icon={<Ionicons name="logo-whatsapp" size={22} color="#16A34A" />}
              label="WhatsApp"
              onPress={() => {
                openSupportWhatsApp();
                onClose();
              }}
            />
            <ContactAction
              icon={<Feather name="phone" size={20} color={colors.textPrimary} />}
              label="Call"
              onPress={() => {
                openSupportPhone();
                onClose();
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

HelpContactSheet.displayName = "HelpContactSheet";

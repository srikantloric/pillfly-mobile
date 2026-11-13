import React, { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

import type { CustomerAddress } from "../types/address.types";
import { addressSummaryLine } from "../utils/addressSelection";

const MENU_WIDTH = 156;
const MENU_HEIGHT = 92;

type Props = {
  visible: boolean;
  addresses: readonly CustomerAddress[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  selectedId?: string;
  deletingId?: string;
  onClose: () => void;
  onRetry: () => void;
  onAdd: () => void;
  onSelect: (address: CustomerAddress) => void;
  onEdit: (address: CustomerAddress) => void;
  onDelete: (address: CustomerAddress) => void;
};

export function AddressPickerSheet({
  visible,
  addresses,
  status,
  error,
  selectedId,
  deletingId,
  onClose,
  onRetry,
  onAdd,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();
  const dotRefs = useRef<Record<string, View | null>>({});
  const [menu, setMenu] = useState<{ address: CustomerAddress; top: number; left: number } | null>(
    null,
  );
  const showInitialError = status === "error";
  const showLoading = (status === "loading" || status === "idle") && addresses.length === 0;

  return (
    <>
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
      <View
        className="flex-1 overflow-hidden rounded-t-3xl bg-pillfly-surface px-4"
        style={{ marginTop: insets.top + 8, paddingTop: 16, paddingBottom: insets.bottom + 16 }}
      >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-pillfly-ink">Choose your location</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} className="h-8 w-8 items-center justify-center">
              <Feather name="x" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add new address"
            onPress={onAdd}
            className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border border-pillfly-line py-3 active:opacity-80"
          >
            <Feather name="plus" size={18} color={colors.textPrimary} />
            <Text className="text-[15px] font-semibold text-pillfly-ink">Add new address</Text>
          </Pressable>

          <Text className="mb-3 text-[13px] font-semibold text-pillfly-muted">Saved Address</Text>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {showLoading ? <Text className="py-6 text-[14px] text-pillfly-muted">Loading addresses</Text> : null}

          {showInitialError ? (
            <View className="py-4">
              <Text className="text-[14px] text-pillfly-ink">{error ?? "Unable to load addresses."}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry loading addresses"
                onPress={onRetry}
                className="mt-3 self-start rounded-xl bg-pillfly-primary px-4 py-2 active:opacity-90"
              >
                <Text className="text-[14px] font-bold text-white">Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {!showInitialError && !showLoading && error ? (
            <Text className="mb-3 text-[13px] text-pillfly-promo-red">{error}</Text>
          ) : null}

          {!showInitialError && !showLoading && addresses.length === 0 ? (
            <Text className="py-6 text-[14px] text-pillfly-muted">No saved addresses</Text>
          ) : null}

          {!showInitialError
            ? addresses.map((address) => {
                const selected = address.id === selectedId;
                return (
                  <Pressable
                    key={address.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Deliver to ${address.recipientName}`}
                    accessibilityState={{ selected }}
                    onPress={() => onSelect(address)}
                    className={`mb-3 flex-row items-start gap-3 rounded-xl border px-3 py-3 ${
                      selected ? "border-pillfly-primary" : "border-pillfly-line"
                    }`}
                    style={selected ? { backgroundColor: "#E7F7F4" } : undefined}
                  >
                    <Feather
                      name={selected ? "check-circle" : "circle"}
                      size={18}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <View className="min-w-0 flex-1">
                      <Text className="text-[15px] font-bold text-pillfly-ink">{address.recipientName}</Text>
                      <Text className="mt-1 text-[13px] leading-5 text-pillfly-muted" numberOfLines={2}>
                        {addressSummaryLine(address)}, {address.postalCode}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Address options for ${address.recipientName}`}
                      onPress={() => {
                        dotRefs.current[address.id]?.measureInWindow((x, y, width, height) => {
                          setMenu({
                            address,
                            top: Math.max(insets.top + 8, y - MENU_HEIGHT + Math.round(height * 0.3)),
                            left: Math.max(12, x - MENU_WIDTH + Math.round(width * 0.2)),
                          });
                        });
                      }}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <View
                        ref={(node) => {
                          dotRefs.current[address.id] = node;
                        }}
                        collapsable={false}
                      >
                        <Feather name="more-vertical" size={18} color={colors.textSecondary} />
                      </View>
                    </Pressable>
                  </Pressable>
                );
              })
            : null}
          </ScrollView>
      </View>
      </View>
    </Modal>

    <Modal visible={menu != null} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
      <View className="flex-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close address options"
          style={StyleSheet.absoluteFill}
          onPress={() => setMenu(null)}
        />
        {menu ? (
          <View
            className="absolute rounded-2xl bg-pillfly-surface py-1"
            style={[styles.menu, { top: menu.top, left: menu.left, width: MENU_WIDTH }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit address"
              onPress={() => {
                const address = menu.address;
                setMenu(null);
                onEdit(address);
              }}
              className="flex-row items-center gap-3 px-4 py-3"
            >
              <Feather name="edit-2" size={18} color={colors.textPrimary} />
              <Text className="text-[15px] font-semibold text-pillfly-ink">Edit</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete address"
              disabled={deletingId === menu.address.id}
              onPress={() => {
                const address = menu.address;
                setMenu(null);
                onDelete(address);
              }}
              className="flex-row items-center gap-3 px-4 py-3"
            >
              <Feather name="trash-2" size={18} color={colors.textPrimary} />
              <Text className="text-[15px] font-semibold text-pillfly-ink">
                {deletingId === menu.address.id ? "Deleting..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menu: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
});

import React from "react";
import { Text, View } from "react-native";

import { formatInr } from "@/features/product/utils/productDisplay";

import type { CartBill } from "../types/cart.types";

type Props = {
  bill: CartBill;
};

function BillRow({
  label,
  amount,
  strikethroughAmount,
  tone = "default",
}: {
  label: string;
  amount: number;
  strikethroughAmount?: number;
  tone?: "default" | "discount" | "total";
}) {
  const isDiscount = tone === "discount";
  const isTotal = tone === "total";
  const displayAmount = isDiscount ? `- ${formatInr(Math.abs(amount))}` : formatInr(amount);

  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className={`text-[14px] ${isTotal ? "font-bold text-pillfly-ink" : "text-pillfly-muted"}`}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {strikethroughAmount != null && strikethroughAmount > 0 ? (
          <Text className="text-[13px] text-pillfly-muted line-through">
            {formatInr(strikethroughAmount)}
          </Text>
        ) : null}
        <Text
          className={`text-[14px] ${
            isTotal
              ? "font-bold text-pillfly-ink"
              : isDiscount
                ? "font-semibold text-pillfly-icon-green"
                : "font-semibold text-pillfly-ink"
          }`}
        >
          {displayAmount}
        </Text>
      </View>
    </View>
  );
}

export function CartBillSummary({ bill }: Props) {
  return (
    <View className="mx-4 mt-4 overflow-hidden rounded-xl border border-pillfly-line bg-pillfly-surface">
      <View className="border-b border-dashed border-pillfly-line px-4 py-3">
        <Text className="text-[15px] font-bold text-pillfly-ink">Bill Summary</Text>
      </View>

      <View className="px-4 py-2">
        {bill.lines.map((line) => (
          <BillRow
            key={line.id}
            label={line.label}
            amount={line.amount}
            strikethroughAmount={line.strikethroughAmount}
            tone={line.tone}
          />
        ))}
      </View>

      {bill.savingsTotal > 0 ? (
        <View className="flex-row items-center justify-between bg-pillfly-primary px-4 py-3">
          <Text className="text-[13px] font-semibold text-white">
            ₹{bill.savingsTotal.toFixed(0)} Saved on this order
          </Text>
          <Text className="text-[13px] text-white">›</Text>
        </View>
      ) : null}
    </View>
  );
}

import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { savingsCardShadow, savingsColors } from './savings.styles';

type ActionCardProps = {
  title: string;
  value: string;
  illustration: string;
  onPress?: () => void;
};

const ActionCard = memo(function ActionCard({
  title,
  value,
  illustration,
  onPress,
}: ActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${value}`}
      onPress={onPress}
      className="native:shadow-sm min-h-[108px] flex-1 overflow-hidden rounded-2xl bg-pillfly-surface active:opacity-95"
      style={savingsCardShadow.card}
    >
      <View className="flex-1 px-3.5 pb-2 pt-3.5">
        <Text className="text-[13px] font-semibold text-pillfly-muted">{title}</Text>
        <Text
          className="mt-0.5 text-[17px] font-bold"
          style={{ color: savingsColors.valueGreen }}
        >
          {value}
        </Text>
      </View>
      <View className="absolute bottom-1 right-1 h-14 w-14 items-center justify-center">
        <Text className="text-[34px]">{illustration}</Text>
      </View>
    </Pressable>
  );
});

ActionCard.displayName = 'ActionCard';

export const WalletReferCards = memo(function WalletReferCards({
  walletBalance,
  referReward,
  onPressWallet,
  onPressRefer,
}: {
  walletBalance: string;
  referReward: string;
  onPressWallet?: () => void;
  onPressRefer?: () => void;
}) {
  return (
    <View className="flex-row gap-3">
      <ActionCard
        title="Wallet"
        value={walletBalance}
        illustration="👛"
        onPress={onPressWallet}
      />
      <ActionCard
        title="Refer & Earn"
        value={referReward}
        illustration="🎁"
        onPress={onPressRefer}
      />
    </View>
  );
});

WalletReferCards.displayName = 'WalletReferCards';

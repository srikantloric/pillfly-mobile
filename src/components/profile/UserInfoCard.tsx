import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { profileCardShadow, profileColors } from './profile.styles';

type Props = {
  phone: string;
  totalSavings: number;
  onPressEdit?: () => void;
};

export const UserInfoCard = memo(function UserInfoCard({
  phone,
  totalSavings,
  onPressEdit,
}: Props) {
  return (
    <View
      className="overflow-hidden rounded-2xl border border-pillfly-line bg-pillfly-surface px-4 pb-4 pt-4"
      style={profileCardShadow.card}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        onPress={onPressEdit}
        hitSlop={8}
        className="absolute right-4 top-3.5 z-10 active:opacity-70"
      >
        <Text
          className="text-[14px] font-semibold"
          style={{ color: profileColors.editAction }}
        >
          Edit
        </Text>
      </Pressable>

      <View className="flex-row items-center pr-14">
        <Text className="mr-2 text-[15px] text-pillfly-muted">•</Text>
        <Text className="text-[16px] font-medium text-pillfly-ink">{phone}</Text>
      </View>

      <View className="mt-3 flex-row items-center">
        <View
          className="mr-2 h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: profileColors.coin }}
        >
          <Text className="text-[12px] font-bold text-white">₹</Text>
        </View>
        <Text className="text-[14px] text-pillfly-ink">
          Total Savings:{' '}
          <Text className="font-semibold">₹{totalSavings}</Text>
        </Text>
      </View>
    </View>
  );
});

UserInfoCard.displayName = 'UserInfoCard';

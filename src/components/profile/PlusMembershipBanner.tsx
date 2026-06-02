import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';
import LinearGradient from 'react-native-linear-gradient';

import { profileColors } from './profile.styles';

type Props = {
  onPress?: () => void;
};

export const PlusMembershipBanner = memo(function PlusMembershipBanner({ onPress }: Props) {
  const content = (
    <LinearGradient
      colors={[profileColors.plusPurpleStart, profileColors.plusPurpleEnd]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{ borderRadius: 16, overflow: 'hidden' }}
    >
      <View className="flex-row items-center px-3.5 py-3.5">
        <View className="mr-2.5 items-center justify-center">
          <View className="flex-row items-center">
            <Text
              className="text-[22px] font-black"
              style={{ color: profileColors.plusGold }}
            >
              +
            </Text>
            <Text className="ml-0.5 text-[17px] font-bold italic text-white">Plus</Text>
          </View>
        </View>

        <Text className="mr-2 min-w-0 flex-1 text-[12px] font-medium leading-[17px] text-white">
          Save extra 6% on medicines & enjoy FREE delivery with PLUS membership!
        </Text>

        <Feather name="chevron-right" size={20} color="#FFFFFF" />
      </View>
    </LinearGradient>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View Plus membership benefits"
      onPress={onPress}
      className="active:opacity-90"
    >
      {content}
    </Pressable>
  );
});

PlusMembershipBanner.displayName = 'PlusMembershipBanner';

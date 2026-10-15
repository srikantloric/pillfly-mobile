import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { offerColors } from './offer.styles';

export const TrustBadgeRow = memo(function TrustBadgeRow() {
  return (
    <View
      className="mx-0 flex-row items-center justify-between px-4 py-5"
      style={{ backgroundColor: offerColors.trustStripBg }}
    >
      <View className="flex-1 px-1" />
      <TrustBadge title="VERIFIED" subtitle="Doctor Reports" />
      <View className="flex-1 px-1" />
    </View>
  );
});

TrustBadgeRow.displayName = 'TrustBadgeRow';

function TrustBadge({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="flex-1 items-center px-1">
      <MaterialIcons
        name="workspace-premium"
        size={28}
        color="#86C99A"
        style={{ marginBottom: 6 }}
      />
      <Text
        className="text-center text-[11px] font-extrabold leading-4"
        style={{ color: offerColors.trustBadgeTitle }}
      >
        {title}
      </Text>
      <Text
        className="mt-0.5 text-center text-[10px] leading-3.5"
        style={{ color: offerColors.trustBadgeSubtitle }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

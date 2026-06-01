import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { offerColors } from './offer.styles';

export const OfferInfoStrip = memo(function OfferInfoStrip() {
  return (
    <View
      className="flex-row items-center gap-3 px-4 py-3.5"
      style={{ backgroundColor: offerColors.infoStripBg }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: '#3B82F6' }}
      >
        <MaterialIcons name="verified" size={20} color="#FFFFFF" />
      </View>

      <Text
        className="flex-1 text-[13px] leading-5"
        style={{ color: offerColors.infoStripText }}
      >
        <Text className="font-bold italic">ON-TIME</Text>
        <Text> collection - if delayed, your tests are </Text>
        <Text className="font-bold italic">FREE!</Text>
      </Text>
    </View>
  );
});

OfferInfoStrip.displayName = 'OfferInfoStrip';

import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { OfferHeroBanner } from './OfferHeroBanner';
import { OfferInfoStrip } from './OfferInfoStrip';
import { offerColors } from './offer.styles';

type Props = {
  onPressBack?: () => void;
};

export const OfferListHeader = memo(function OfferListHeader({ onPressBack }: Props) {
  return (
    <View className="mb-1">
      <OfferHeroBanner onPressBack={onPressBack} />
      <OfferInfoStrip />

      <View className="items-center bg-pillfly-surface px-5 pb-4 pt-5">
        <Text
          className="text-center text-[15px] font-medium"
          style={{ color: offerColors.trustTitle }}
        >
          Trusted by millions across India.
        </Text>
        <Text
          className="mt-1.5 text-center text-[17px] font-bold"
          style={{ color: offerColors.trustSubtitle }}
        >
          Twice the care, one incredible price.
        </Text>
      </View>

      <View className="bg-pillfly-surface px-4 pb-5">
        <View
          className="items-center rounded-2xl px-4 py-4"
          style={{ backgroundColor: offerColors.benefitBoxBg }}
        >
          <Text
            className="mb-3 text-center text-[13px]"
            style={{ color: offerColors.benefitMuted }}
          >
            With every plan, you get
          </Text>

          <View className="flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2">
            <BenefitChip
              icon={<MaterialIcons name="groups" size={20} color={offerColors.trustSubtitle} />}
              label="2 CHECKUPS, PAY HALF"
            />
            <Text className="text-[16px] font-bold" style={{ color: offerColors.trustSubtitle }}>
              +
            </Text>
            <BenefitChip
              icon={
                <MaterialIcons
                  name="medical-services"
                  size={20}
                  color={offerColors.trustSubtitle}
                />
              }
              label="FREE DOC CONSULT"
            />
          </View>
        </View>
      </View>
    </View>
  );
});

OfferListHeader.displayName = 'OfferListHeader';

function BenefitChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {icon}
      <Text className="text-[12px] font-extrabold" style={{ color: offerColors.trustBadgeTitle }}>
        {label}
      </Text>
    </View>
  );
}

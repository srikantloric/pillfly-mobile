import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { AppHeader } from '../../components/headers';
import { navigateToSharedRoute } from '../../navigation/navigateShared';

export function OfferScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <View className="flex-1 bg-slate-100">
      <AppHeader
        showProfile
        showCart
        title="Offers"
        variant="offer"
        onPressProfile={() => navigateToSharedRoute(navigation, 'Profile')}
        onPressCart={() => navigateToSharedRoute(navigation, 'Cart')}
      />
      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-8 pt-4">
        <Text className="text-xl font-semibold text-slate-900">Offer</Text>
      </ScrollView>
    </View>
  );
}

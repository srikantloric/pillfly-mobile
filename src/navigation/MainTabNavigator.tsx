import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../types/navigation.types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoryScreen } from '../screens/category/CategoryScreen';
import { OfferScreen } from '../screens/offer/OfferScreen';
import { SavingsScreen } from '../screens/savings/SavingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoryScreen} />
      <Tab.Screen name="Offer" component={OfferScreen} />
      <Tab.Screen name="Savings" component={SavingsScreen} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { MainTabParamList } from '../types/navigation.types';
import { colors } from '../theme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoryScreen } from '../screens/category/CategoryScreen';
import { OfferScreen } from '../screens/offer/OfferScreen';
import { SavingsScreen } from '../screens/savings/SavingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconProps = { color: string; size: number; focused: boolean };

/**
 * Tab icons: per-family scoped packages (`@react-native-vector-icons/*`),
 * not the deprecated monolithic `react-native-vector-icons`.
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          paddingTop: 4,
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 4,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: TabHomeIcon }} />
      <Tab.Screen
        name="Categories"
        component={CategoryScreen}
        options={{ tabBarLabel: 'Categories', tabBarIcon: TabCategoriesIcon }}
      />
      <Tab.Screen name="Offer" component={OfferScreen} options={{ tabBarLabel: 'Offers', tabBarIcon: TabOffersIcon }} />
      <Tab.Screen
        name="Savings"
        component={SavingsScreen}
        options={{ tabBarLabel: 'Savings', tabBarIcon: TabSavingsIcon }}
      />
    </Tab.Navigator>
  );
}

function TabHomeIcon({ color, size, focused }: IconProps) {
  return (
    <MaterialDesignIcons
      name={focused ? 'home-plus' : 'home-plus-outline'}
      size={focused ? size + 2 : size}
      color={color}
    />
  );
}

function TabCategoriesIcon({ color, size, focused }: IconProps) {
  return (
    <Ionicons
      name={focused ? 'bag-add' : 'bag-add-outline'}
      size={focused ? size + 2 : size}
      color={color}
    />
  );
}

function TabOffersIcon({ color, size, focused }: IconProps) {
  return (
    <MaterialIcons name="local-offer" size={focused ? size + 2 : size} color={color} />
  );
}

function TabSavingsIcon({ color, size, focused }: IconProps) {
  return <MaterialIcons name="savings" size={focused ? size + 2 : size} color={color} />;
}

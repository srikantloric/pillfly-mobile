import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@react-native-vector-icons/feather';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { CategoryScreen } from '@/features/category';
import { HomeScreen } from '@/features/home';
import { StoreProductsScreen } from '@/features/product';
import { colors } from '../theme';
import type { MainTabParamList } from '../types/navigation.types';
import { OrdersStackNavigator } from './stacks/OrdersStackNavigator';
import { ProfileStackNavigator } from './stacks/ProfileStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconProps = { color: string; size: number; focused: boolean };

const ACTIVE = colors.primary;
const INACTIVE = '#475569';

function TabHomeIcon({ color, size, focused }: IconProps) {
  return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
}

function TabCategoriesIcon({ color, size }: IconProps) {
  return <Feather name="grid" size={size} color={color} />;
}

function TabOrdersIcon({ color, size }: IconProps) {
  return <Feather name="package" size={size} color={color} />;
}

function TabProfileIcon({ color, size }: IconProps) {
  return <Feather name="user" size={size} color={color} />;
}

function MedicinesTabButton({ children, onPress, accessibilityState }: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected === true;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Medicines"
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={styles.fabWrap}
    >
      <View style={[styles.fab, focused ? styles.fabFocused : null]}>{children}</View>
    </Pressable>
  );
}

function MedicinesTabIcon() {
  return <MaterialIcons name="medication" size={28} color="#FFFFFF" />;
}

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 64 + bottomPad,
            paddingBottom: bottomPad,
          },
        ],
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: TabHomeIcon }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoryScreen}
        options={{ tabBarLabel: 'Categories', tabBarIcon: TabCategoriesIcon }}
      />
      <Tab.Screen
        name="Medicines"
        component={StoreProductsScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: MedicinesTabIcon,
          tabBarButton: MedicinesTabButton,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStackNavigator}
        options={{ tabBarLabel: 'Orders', tabBarIcon: TabOrdersIcon }}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.navigate('Orders', {
              state: {
                routes: [{ name: 'OrdersList' }],
                index: 0,
              },
            });
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Account', tabBarIcon: TabProfileIcon }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    borderRadius: 28,
    borderTopWidth: 0,
    backgroundColor: '#FFFFFF',
    elevation: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    overflow: 'visible',
    paddingTop: 8,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  fabWrap: {
    top: -18,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandTeal,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  fabFocused: {
    backgroundColor: colors.brandTealDark,
  },
});

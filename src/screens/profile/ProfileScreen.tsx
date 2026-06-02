import React, { useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PlusMembershipBanner,
  PROFILE_APP_VERSION,
  ProfileHeader,
  ProfileMenuList,
  UserInfoCard,
  profileColors,
} from '../../components/profile';
import { useSharedHeaderNavigation } from '../../components/header';
import { MOCK_PROFILE_USER } from '../../mocks/profile.mock';

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { onPressSearch, onPressCart } = useSharedHeaderNavigation(navigation);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onPressBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const onPressEdit = useCallback(() => {
    Alert.alert('Edit profile', 'Profile editing will be available soon.');
  }, []);

  const onPressPlus = useCallback(() => {
    Alert.alert('Plus membership', 'Membership details will open here.');
  }, []);

  const onPressLogout = useCallback(() => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive' },
    ]);
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: profileColors.screenBg }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={profileColors.statusBar}
        translucent={false}
      />

      <ProfileHeader
        cartBadgeCount={MOCK_PROFILE_USER.cartCount}
        onPressBack={onPressBack}
        onPressSearch={onPressSearch}
        onPressCart={onPressCart}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 28,
        }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <UserInfoCard
            phone={MOCK_PROFILE_USER.phone}
            totalSavings={MOCK_PROFILE_USER.totalSavings}
            onPressEdit={onPressEdit}
          />

          <View className="mt-3">
            <PlusMembershipBanner onPress={onPressPlus} />
          </View>

          <ProfileMenuList dynamicBadges={MOCK_PROFILE_USER.dynamicMenuBadges} />

          <View className="mt-6 flex-row items-center justify-between px-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={onPressLogout}
              hitSlop={8}
              className="active:opacity-70"
            >
              <Text
                className="text-[15px] font-medium"
                style={{ color: profileColors.logout }}
              >
                Log Out
              </Text>
            </Pressable>

            <Text
              className="text-[12px]"
              style={{ color: profileColors.version }}
            >
              Version: {PROFILE_APP_VERSION}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

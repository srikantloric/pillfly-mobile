import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HelpContactSheet,
  PlusMembershipBanner,
  PROFILE_APP_VERSION,
  ProfileHeader,
  ProfileMenuList,
  SHOW_PLUS_MEMBERSHIP_BANNER,
  UserInfoCard,
  profileColors,
} from '../components';
import { useSharedHeaderNavigation } from '@/components/header';
import { normalizeIndianMobile, useAuth } from '@/features/auth';
import { getAccessToken } from '@/features/auth/api/authSession';
import { AddressPickerSheet } from '@/features/address/components/AddressPickerSheet';
import { deleteCustomerAddress } from '@/features/address/api/address.api';
import { useAddressListStore } from '@/features/address/store/addressList.store';
import { isCustomerAddress, type CustomerAddress } from '@/features/address/types/address.types';
import { useCartStore } from '@/features/cart/store/cart.store';
import { useCartSummary } from '@/features/cart';
import type { ProfileStackParamList } from '@/types/navigation.types';
import { toCustomerMessage } from '@/utils/customerMessage';
import { MOCK_PROFILE_USER } from '../mocks/profile.mock';
import type { ProfileMenuEntry } from '../types/profile.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

function formatProfilePhone(phoneNumber: string | undefined): string {
  if (!phoneNumber) {
    return MOCK_PROFILE_USER.phone;
  }

  const normalized = normalizeIndianMobile(phoneNumber);
  if (!normalized.ok) {
    return phoneNumber;
  }

  return `+91 ${normalized.mobile.slice(0, 5)} ${normalized.mobile.slice(5)}`;
}

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { onPressSearch, onPressCart } = useSharedHeaderNavigation(
    navigation as unknown as NavigationProp<ParamListBase>,
  );
  const { user, signOut, isSubmitting } = useAuth();
  const { lineCount } = useCartSummary();
  const deliveryAddress = useCartStore((state) => state.deliveryAddress);
  const selectedAddress = isCustomerAddress(deliveryAddress) ? deliveryAddress : null;
  const listStatus = useAddressListStore((state) => state.status);
  const addresses = useAddressListStore((state) => state.addresses);
  const listError = useAddressListStore((state) => state.error);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      if (useAddressListStore.getState().status === 'idle' && getAccessToken()) {
        useAddressListStore.getState().load().catch(() => undefined);
      }
    }, []),
  );

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

  const onSelectAddress = useCallback((address: CustomerAddress) => {
    useCartStore.getState().setDeliveryAddress(address);
    setPickerOpen(false);
  }, []);

  const onDeleteAddress = useCallback(
    (address: CustomerAddress) => {
      if (deletingId) {
        return;
      }

      setDeletingId(address.id);
      void deleteCustomerAddress(address.id)
        .then(() => {
          useAddressListStore.getState().remove(address.id);
          if (useCartStore.getState().deliveryAddress?.id === address.id) {
            useCartStore.getState().setDeliveryAddress(null);
          }
        })
        .catch((error: unknown) => {
          Alert.alert('Unable to delete address', toCustomerMessage(error));
        })
        .finally(() => {
          setDeletingId(undefined);
        });
    },
    [deletingId],
  );

  const onPressMenu = useCallback(
    (entry: ProfileMenuEntry) => {
      if (entry.id === 'orders') {
        navigation.navigate('Orders');
        return;
      }

      if (entry.id === 'address') {
        setPickerOpen(true);
        return;
      }

      if (entry.id === 'help') {
        setHelpOpen(true);
        return;
      }

      Alert.alert(entry.title, 'This section will be available soon.');
    },
    [navigation],
  );

  const onPressLogout = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  }, [isSubmitting, signOut]);

  return (
    <View className="flex-1" style={{ backgroundColor: profileColors.screenBg }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={profileColors.statusBar}
        translucent={false}
      />

      <ProfileHeader
        cartBadgeCount={lineCount}
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
            phone={formatProfilePhone(user?.phoneNumber)}
            totalSavings={MOCK_PROFILE_USER.totalSavings}
            onPressEdit={onPressEdit}
          />

          {SHOW_PLUS_MEMBERSHIP_BANNER ? (
            <View className="mt-3">
              <PlusMembershipBanner onPress={onPressPlus} />
            </View>
          ) : null}

          <ProfileMenuList
            dynamicBadges={MOCK_PROFILE_USER.dynamicMenuBadges}
            onPressEntry={onPressMenu}
          />

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

      <AddressPickerSheet
        visible={pickerOpen}
        addresses={addresses}
        status={listStatus}
        error={listError}
        selectedId={selectedAddress?.id}
        deletingId={deletingId}
        onClose={() => setPickerOpen(false)}
        onRetry={() => void useAddressListStore.getState().retry()}
        onAdd={() => {
          setPickerOpen(false);
          navigation.navigate('AddressForm');
        }}
        onSelect={onSelectAddress}
        onEdit={(address) => {
          setPickerOpen(false);
          navigation.navigate('AddressForm', { addressId: address.id });
        }}
        onDelete={onDeleteAddress}
      />

      <HelpContactSheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </View>
  );
}

import React, { useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@react-native-vector-icons/feather';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import DeliveryBoy from '../../assets/icons/deliveryBoy.svg';
import { HomeHeader } from '../../components/header';
import { CategoryShopGrid, categoryGridTileWidth } from '../../components/category';
import { HomePromoBanner, homePromoBannerAssets } from '../../components/home/HomePromoBanner';
import { CATEGORIES } from '../../mocks/categories.mock';
import { colors } from '../../theme';
import type { MainTabParamList } from '../../types/navigation.types';

import { homeScreenStyles } from './homeScreen.styles';

const MOCK_CART_COUNT = 2;
const PLACEHOLDER_WHATSAPP = 'https://wa.me/911234567890';
const PLACEHOLDER_PHONE = 'tel:+912212345678';

function SectionTitle({
  title,
  underlineWidth = 40,
}: {
  title: string;
  underlineWidth?: number;
}) {
  return (
    <View className="mb-3 flex-row items-center">
      <Text className="text-[13px] font-bold tracking-wide text-pillfly-section">{title}</Text>
      <View
        className="ml-2 h-0.5 flex-1 rounded-full bg-pillfly-primary"
        style={{ maxWidth: underlineWidth }}
      />
    </View>
  );
}

function DividerLabel({ label }: { label: string }) {
  return (
    <View className="my-5 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-pillfly-line" />
      <Text className="text-center text-[11px] font-semibold uppercase tracking-wide text-pillfly-muted">
        {label}
      </Text>
      <View className="h-px flex-1 bg-pillfly-line" />
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Home'>>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;

  const onPressDiagBogo = useCallback(() => {
    navigation.navigate('Offer');
  }, [navigation]);

  const categoryGridTileW = categoryGridTileWidth(windowWidth);

  const homeScrollContentStyle = useMemo(
    () => [
      homeScreenStyles.scrollContentGutter,
      { paddingBottom: insets.bottom + 88 },
    ],
    [insets.bottom],
  );

  return (
    <View className="flex-1 bg-pillfly-background">
      <HomeHeader
        scrollY={scrollY}
        insets={insets}
        navigation={navigation}
        cartBadgeCount={MOCK_CART_COUNT}
      />

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={homeScrollContentStyle}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        <View className="mb-7 mt-1">
          <HomePromoBanner source={homePromoBannerAssets.medicine27} />
        </View>

        <View className="mb-5 flex-row gap-3">
          <ServiceCard
            title="Medicines"
            subtitle="Extra Rs.50 Credits"
            accent="bg-rose-50"
            footerTextClass="text-rose-700 font-bold"
            icon={
              <Image
                source={require('../../assets/icons/branded_09092025.png')}
                className="h-full w-full"
                resizeMode="contain"
              />
            }
          />
          <ServiceCard
            title="4 Hours Delivery"
            subtitle="Fast & Reliable"
            accent="bg-rose-50"
            footerTextClass="text-rose-700 font-bold"
            icon={
              <DeliveryBoy
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
              />
            }
          />
        </View>

        <DividerLabel label="Or you can order via" />

        <View className="mb-6 flex-row gap-3">
          <OutlineAction
            icon={<Ionicons name="logo-whatsapp" size={22} color="#16A34A" />}
            label="WhatsApp"
            onPress={() => {
              Linking.openURL(PLACEHOLDER_WHATSAPP).catch(() => {});
            }}
          />
          <OutlineAction
            icon={<Feather name="phone" size={20} color={colors.textPrimary} />}
            label="Call"
            onPress={() => {
              Linking.openURL(PLACEHOLDER_PHONE).catch(() => {});
            }}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View buy one get one free lab offers"
          onPress={onPressDiagBogo}
          className="mb-8 mt-2 active:opacity-95"
        >
          <HomePromoBanner source={homePromoBannerAssets.diagBogo} />
        </Pressable>

        <SectionTitle title="OUR OTHER SERVICES" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8 -mx-1"
          contentContainerStyle={homeScreenStyles.horizontalMiniServices}
        >
          <MiniService
            icon={require('../../assets/icons/branded_09092025.png')}
            label="Branded Substitute"
            bg="#E0F2FE"
          />
          <MiniService icon="🧴" label="Healthcare Store" bg="#DCFCE7" />
          <MiniService icon="🎗️" label="Cancer Care" bg="#FEE2E2" />
          <MiniService icon="🐕" label="PetEasy" bg="#FEF3C7" badge="NOW LIVE!" />
        </ScrollView>

        <SectionTitle title="SHOP BY CATEGORY" />
        <CategoryShopGrid categories={CATEGORIES} tileWidth={categoryGridTileW} />

        <SectionTitle title="HEALTH ARTICLES" /> 

      </Animated.ScrollView>
    </View>
  );
}

function ServiceCard({
  title,
  subtitle,
  accent,
  footerTextClass,
  icon,
}: {
  title: string;
  subtitle: string;
  accent: string;
  footerTextClass: string;
  icon: string | React.ReactNode;
}) {
  return (
    <View className="native:shadow-sm flex-1 overflow-hidden rounded-2xl bg-pillfly-surface shadow-sm">
      <View className="border-b border-pillfly-line px-3 pb-2 pt-3">
        <Text className="text-[15px] font-bold text-pillfly-ink">{title}</Text>
      </View>
      <View className="h-[100px] w-full items-center justify-center px-3 py-2">
        {typeof icon === 'string' ? (
          <Text className="text-center text-[40px]">{icon}</Text>
        ) : (
          <View className="h-full w-full">{icon}</View>
        )}
      </View>
      <View className={`px-2 py-2.5 ${accent}`}>
        <Text className={`text-center text-[12px] ${footerTextClass}`}>{subtitle}</Text>
      </View>
    </View>
  );
}

function OutlineAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="native:shadow-sm flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-pillfly-line bg-pillfly-surface py-3.5 active:bg-pillfly-background"
    >
      {icon}
      <Text className="text-[15px] font-semibold text-pillfly-ink">{label}</Text>
    </Pressable>
  );
}

function MiniService({
  icon,
  label,
  bg,
  badge,
}: {
  icon: string | ImageSourcePropType;
  label: string;
  bg: string;
  badge?: string;
}) {
  const iconNode =
    typeof icon === 'string' ? (
      <Text className="text-[36px]">{icon}</Text>
    ) : (
      <Image source={icon} className="h-20 w-26" resizeMode="contain" />
    );

  return (
    <View className="w-[104px] overflow-hidden rounded-2xl border border-pillfly-line bg-pillfly-surface">
      {badge ? (
        <View className="absolute right-0 top-0 z-10 rounded-bl-lg bg-red-600 px-1.5 py-0.5">
          <Text className="text-[8px] font-bold text-white">{badge}</Text>
        </View>
      ) : null}
      <View className="h-[100px] items-center justify-center" style={{ backgroundColor: bg }}>
        {iconNode}
      </View>
      <Text className="px-2 py-2 text-center text-[11px] font-semibold leading-4 text-pillfly-ink">
        {label}
      </Text>
    </View>
  );
}

import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  OfferListHeader,
  OfferPackageCard,
  TrustBadgeRow,
  offerColors,
} from '../../components/offers';
import { OFFER_PACKAGES, type OfferPackage } from '../../mocks/offers.mock';
import type { MainTabParamList } from '../../types/navigation.types';

const TRUST_BADGES_ROW_ID = 'trust-badges';
const TRUST_BADGES_INSERT_INDEX = 2;

type OfferListRow =
  | { kind: 'package'; pkg: OfferPackage }
  | { kind: 'trustBadges'; id: typeof TRUST_BADGES_ROW_ID };

function buildOfferListData(packages: OfferPackage[]): OfferListRow[] {
  const rows: OfferListRow[] = packages.map((pkg) => ({ kind: 'package', pkg }));

  const trustRow: OfferListRow = { kind: 'trustBadges', id: TRUST_BADGES_ROW_ID };

  if (rows.length > TRUST_BADGES_INSERT_INDEX) {
    rows.splice(TRUST_BADGES_INSERT_INDEX, 0, trustRow);
  } else {
    rows.push(trustRow);
  }

  return rows;
}

export function OfferScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Offer'>>();
  const insets = useSafeAreaInsets();

  const listData = useMemo(() => buildOfferListData(OFFER_PACKAGES), []);

  const onPressBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  }, [navigation]);

  const onBookPress = useCallback((pkg: OfferPackage) => {
    Alert.alert('Book for 2', `Booking flow for "${pkg.title}" will open here.`);
  }, []);

  const listHeader = useMemo(
    () => <OfferListHeader onPressBack={onPressBack} />,
    [onPressBack],
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom: insets.bottom + 96,
      flexGrow: 1 as const,
    }),
    [insets.bottom],
  );

  const keyExtractor = useCallback((item: OfferListRow) => {
    return item.kind === 'trustBadges' ? item.id : item.pkg.id;
  }, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<OfferListRow>) => {
      if (item.kind === 'trustBadges') {
        return <TrustBadgeRow />;
      }

      const packageIndex = index > TRUST_BADGES_INSERT_INDEX ? index - 1 : index;
      return (
        <OfferPackageCard
          pkg={item.pkg}
          index={packageIndex}
          onBookPress={onBookPress}
        />
      );
    },
    [onBookPress],
  );

  return (
    <View className="flex-1" style={{ backgroundColor: offerColors.screenBg }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={offerColors.statusBar}
        translucent={false}
      />

      <View
        pointerEvents="none"
        className="bg-white"
        style={{ height: insets.top, zIndex: 10 }}
      />

      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={6}
        windowSize={8}
        removeClippedSubviews
        contentContainerStyle={contentContainerStyle}
        style={{ flex: 1, backgroundColor: offerColors.screenBg }}
      />
    </View>
  );
}

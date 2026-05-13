import type { Animated } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { APP_HEADER_VARIANT_SURFACE } from './appHeader.constants';

export type AppHeaderVariant = keyof typeof APP_HEADER_VARIANT_SURFACE;

export interface SharedHeaderNavHandlers {
  onPressProfile?: () => void;
  onPressSearch?: () => void;
  onPressCart?: () => void;
}

export interface AppHeaderProps extends SharedHeaderNavHandlers {
  showProfile?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  title?: string;
  variant?: AppHeaderVariant;
  searchPlaceholder?: string;
  cartBadgeCount?: number;
}

export interface HomeHeaderProps {
  scrollY: Animated.Value;
  insets: EdgeInsets;
  navigation: NavigationProp<ParamListBase>;
  cartBadgeCount?: number;
}

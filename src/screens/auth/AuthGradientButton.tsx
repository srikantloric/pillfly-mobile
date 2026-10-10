import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Feather } from '@react-native-vector-icons/feather';

import { authColors, authRadii, authSpacing, authTypography } from '../../theme/authTheme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
};

export function AuthGradientButton({ label, onPress, disabled, busy }: Props) {
  const isDisabled = disabled || busy;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy }}
      className="mx-6 overflow-hidden"
      style={({ pressed }) => [
        {
          borderRadius: authRadii.button,
          opacity: isDisabled ? 0.6 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        {
          shadowColor: authColors.primaryGreen,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 6,
        },
      ]}
    >
      <LinearGradient
        colors={[authColors.gradientStart, authColors.gradientEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          height: authSpacing.buttonHeight,
          borderRadius: authRadii.button,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: authSpacing.screenHorizontal,
        }}
      >
        {busy ? (
          <ActivityIndicator color={authColors.white} />
        ) : (
          <>
            <Text
              className="flex-1 text-center font-bold text-white"
              style={{ fontSize: authTypography.button }}
            >
              {label}
            </Text>
            <Feather name="arrow-right" size={22} color={authColors.white} />
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

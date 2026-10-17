import React from 'react';
import {
  Animated,
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { authColors, authRadii, authSpacing, authTypography } from '@/theme/authTheme';

const COUNTRY_CODE = '+91';

export function DividerTitle({ title }: { title: string }) {
  return (
    <View
      className="flex-row items-center"
      style={{
        marginVertical: authSpacing.sectionVertical,
        paddingHorizontal: authSpacing.screenHorizontal,
      }}
    >
      <LinearGradient
        colors={['transparent', authColors.lightGreen]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, height: 1 }}
      />
      <Text
        className="mx-3 font-semibold text-pillfly-auth-ink"
        style={{ fontSize: authTypography.dividerTitle }}
      >
        {title}
      </Text>
      <LinearGradient
        colors={[authColors.lightGreen, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, height: 1 }}
      />
    </View>
  );
}

type PhoneInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function PhoneInput({ value, onChangeText }: PhoneInputProps) {
  return (
    <View
      className="flex-row items-center border border-pillfly-auth-light bg-white"
      style={{
        height: authSpacing.inputHeight,
        borderRadius: authRadii.input,
        paddingHorizontal: authSpacing.screenHorizontal - 4,
        marginHorizontal: authSpacing.screenHorizontal,
      }}
    >
      <Text
        className="font-bold text-pillfly-auth-ink"
        style={{ fontSize: authTypography.countryCode }}
      >
        {COUNTRY_CODE}
      </Text>
      <View
        className="mx-3 bg-pillfly-auth-muted/30"
        style={{ width: 1, height: authSpacing.inputHeight * 0.45 }}
      />
      <TextInput
        className="flex-1 text-pillfly-auth-ink"
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter your phone number"
        placeholderTextColor={authColors.mutedText}
        keyboardType="phone-pad"
        returnKeyType="done"
        maxLength={10}
        style={{ fontSize: authTypography.input, paddingVertical: 0 }}
        accessibilityLabel="Phone number"
      />
    </View>
  );
}

export function TrustedBadge() {
  return (
    <View
      className="flex-row items-center self-center border border-pillfly-auth-light bg-pillfly-auth-soft px-5 py-2.5"
      style={{
        borderRadius: authRadii.badge,
        marginTop: -authSpacing.badgeOverlap,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="mr-2 rounded-full bg-pillfly-auth-primary p-1">
        <MaterialIcons name="verified-user" size={18} color={authColors.white} />
      </View>
      <Text
        className="font-semibold text-pillfly-auth-primary"
        style={{ fontSize: authTypography.badge }}
      >
        Trusted & Verified Labs
      </Text>
    </View>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label}>
      <Text
        className="font-bold text-pillfly-auth-primary underline"
        style={{ fontSize: authTypography.footerLinks }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LoginFooter({ containerStyle }: { containerStyle?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View
      className="items-center px-6"
      style={[
        {
          marginTop: authSpacing.footerTop,
          paddingBottom: authSpacing.footerBottom,
        },
        containerStyle,
      ]}
    >
      <Text
        className="text-center text-pillfly-auth-muted"
        style={{ fontSize: authTypography.footer }}
      >
        By continuing, you agree to our
      </Text>
      <View className="mt-1 flex-row flex-wrap items-center justify-center">
        <FooterLink label="Terms" />
        <Text
          className="text-pillfly-auth-muted"
          style={{ fontSize: authTypography.footerLinks }}
        >
          {' '}
          &{' '}
        </Text>
        <FooterLink label="Privacy Policy" />
      </View>
    </Animated.View>
  );
}

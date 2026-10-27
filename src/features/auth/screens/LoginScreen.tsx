import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/types/navigation.types';
import { authColors, authSpacing, authTypography } from '@/theme/authTheme';

import { AuthGradientButton } from '../components/AuthGradientButton';
import { LoginBackground } from '../components/LoginBackground';
import { DividerTitle, LoginFooter, PhoneInput, TrustedBadge } from '../components/LoginFormParts';
import { OtpBottomSheet } from '../components/OtpBottomSheet';
import { useAuth } from '../hooks/useAuth';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';

const LOGO_SOURCE = require('@/assets/splash/logo.png') as ImageSourcePropType;
const DOCTOR_SOURCE = require('@/assets/icons/icon_doctor.webp') as ImageSourcePropType;

const KEYBOARD_FLOAT_EXTRA = 16;

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'LoginScreen'>;

function LoginScreen(_props: LoginScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [otpSheetVisible, setOtpSheetVisible] = useState(false);
  const { sendOtp, isSubmitting, authError, clearAuthError, otpChallenge } = useAuth();

  const keyboardProgress = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(0)).current;

  const handlePhoneChange = useCallback(
    (value: string) => {
      setPhone(value.replace(/\D/g, '').slice(0, 10));
      if (authError) {
        clearAuthError();
      }
    },
    [authError, clearAuthError],
  );

  const handleContinue = useCallback(async () => {
    Keyboard.dismiss();
    try {
      await sendOtp(phone);
      setOtpSheetVisible(true);
    } catch {
      // authError is shown from the store
    }
  }, [phone, sendOtp]);

  useKeyboardHeight((keyboardHeight, duration) => {
    const visible = keyboardHeight > 0;
    const formBaseBottom = insets.bottom + 12;
    const lift = Math.max(0, keyboardHeight - formBaseBottom + KEYBOARD_FLOAT_EXTRA);
    const targetTranslate = -Math.min(lift + KEYBOARD_FLOAT_EXTRA, height * 0.42);
    const easing = Easing.out(Easing.ease);

    setIsKeyboardVisible(visible);
    Animated.parallel([
      Animated.timing(keyboardProgress, {
        toValue: visible ? 1 : 0,
        duration,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: visible ? targetTranslate : 0,
        duration,
        easing,
        useNativeDriver: true,
      }),
    ]).start();
  });

  const opacity = useMemo(() => {
    const fade = (closed: number, open: number) =>
      keyboardProgress.interpolate({ inputRange: [0, 1], outputRange: [closed, open] });
    return {
      background: fade(1, 0.32),
      header: fade(1, 0.72),
      hero: fade(1, 0.58),
      heroFrost: fade(0, 0.48),
      overlay: fade(0, 0.82),
      formShadow: fade(0.08, 0.22),
      footer: fade(1, 0),
    };
  }, [keyboardProgress]);

  const doctorWidth = Math.min(width * 0.78, 320);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={authColors.white} />
      <View className="flex-1">
        <LoginBackground width={width} height={height} containerStyle={{ opacity: opacity.background }} />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.38 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isKeyboardVisible}
          bounces={!isKeyboardVisible}
        >
          <Animated.View style={{ opacity: opacity.header }}>
            <View className="items-center px-6" style={{ paddingTop: authSpacing.screenTop + 8 }}>
              <Image
                source={LOGO_SOURCE}
                style={{
                  width: authSpacing.logoSize,
                  height: authSpacing.logoSize,
                }}
                resizeMode="contain"
                accessibilityLabel="PillFly logo"
              />
              <Text
                className="font-bold text-pillfly-auth-primary"
                style={{
                  fontSize: authTypography.brand,
                  marginTop: authSpacing.brandTop,
                }}
              >
                PillFly
              </Text>
              <Text
                className="text-center text-pillfly-auth-muted"
                style={{
                  fontSize: authTypography.subtitle,
                  marginTop: authSpacing.subtitleTop,
                }}
              >
                Smart Healthcare, Simplified
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            className="items-center"
            style={{
              marginTop: authSpacing.heroTop,
              marginBottom: authSpacing.heroBottom,
              opacity: opacity.hero,
            }}
          >
            <View className="relative items-center justify-end overflow-hidden">
              <Image
                source={DOCTOR_SOURCE}
                style={{
                  width: doctorWidth,
                  height: doctorWidth * 1.05,
                }}
                resizeMode="contain"
                accessibilityLabel="Healthcare professional"
              />
              <Animated.View
                pointerEvents="none"
                className="absolute inset-0 rounded-3xl bg-white"
                style={{ opacity: opacity.heroFrost }}
              />
            </View>
            <TrustedBadge />
          </Animated.View>
        </ScrollView>

        <Animated.View
          pointerEvents={isKeyboardVisible ? 'auto' : 'none'}
          className="absolute inset-0 z-10 bg-white"
          style={{ opacity: opacity.overlay }}
        >
          <Pressable className="flex-1" onPress={Keyboard.dismiss} accessibilityLabel="Dismiss keyboard" />
        </Animated.View>

        <Animated.View
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{ transform: [{ translateY: formTranslateY }] }}
        >
          <Animated.View
            className="overflow-hidden rounded-t-[28px] bg-white/95 pt-1"
            style={{
              paddingBottom: insets.bottom + 8,
              shadowColor: authColors.primaryGreen,
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: opacity.formShadow,
              shadowRadius: 20,
              elevation: isKeyboardVisible ? 12 : 5,
            }}
          >
            <DividerTitle title="Login to PillFly" />

            <PhoneInput value={phone} onChangeText={handlePhoneChange} />

            {authError && !otpSheetVisible ? (
              <Text className="mx-6 mt-3 text-[13px] text-pillfly-promo-red">{authError}</Text>
            ) : null}

            <View style={{ marginTop: authSpacing.sectionVertical }}>
              <AuthGradientButton
                label="Continue"
                onPress={handleContinue}
                disabled={phone.length < 10}
                busy={isSubmitting}
              />
            </View>

            <LoginFooter containerStyle={{ opacity: opacity.footer }} />
          </Animated.View>
        </Animated.View>

        <OtpBottomSheet
          visible={otpSheetVisible}
          mobile={otpChallenge?.mobile ?? phone}
          onClose={() => setOtpSheetVisible(false)}
          onVerified={() => setOtpSheetVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

export default LoginScreen;

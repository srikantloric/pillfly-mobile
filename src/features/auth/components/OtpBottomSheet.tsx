import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../hooks/useAuth';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import {
  authColors,
  authRadii,
  authSpacing,
  authTypography,
} from '@/theme/authTheme';
import { AuthGradientButton } from './AuthGradientButton';

const SHEET_ANIM_MS = 260;
const OTP_LENGTH = 6;

type Props = {
  visible: boolean;
  mobile: string;
  onClose: () => void;
  onVerified: () => void;
};

function formatMobile(mobile: string): string {
  if (mobile.length !== 10) {
    return `+91 ${mobile}`;
  }
  return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
}

export function OtpBottomSheet({ visible, mobile, onClose, onVerified }: Props) {
  const insets = useSafeAreaInsets();
  const { isSubmitting, authError, verifyOtp, resendOtp, clearAuthError } = useAuth();
  const [otp, setOtp] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const overlay = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(40)).current;
  const inputRef = useRef<TextInput>(null);

  const activeIndex = Math.min(otp.length, OTP_LENGTH - 1);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setOtp('');
    setIsInputFocused(false);
    overlay.setValue(0);
    sheetY.setValue(48);

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 1,
        duration: SHEET_ANIM_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 0,
        duration: SHEET_ANIM_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      inputRef.current?.focus();
    });
  }, [overlay, sheetY, visible]);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      setIsInputFocused(false);
    }
  }, [visible]);
  useKeyboardHeight(setKeyboardHeight, visible);

  const handleChangeOtp = useCallback(
    (value: string) => {
      setOtp(value.replace(/\D/g, '').slice(0, OTP_LENGTH));
      if (authError) {
        clearAuthError();
      }
    },
    [authError, clearAuthError],
  );

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    Keyboard.dismiss();
    clearAuthError();
    onClose();
  }, [clearAuthError, isSubmitting, onClose]);

  const handleVerify = useCallback(async () => {
    Keyboard.dismiss();
    try {
      await verifyOtp(otp);
      onVerified();
    } catch {
      setOtp('');
    }
  }, [onVerified, otp, verifyOtp]);

  const handleResend = useCallback(async () => {
    setOtp('');
    try {
      await resendOtp();
    } catch {
      // authError is shown from the store
    }
  }, [resendOtp]);

  const focusOtpInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const sheetPaddingBottom = Math.max(insets.bottom, 12) + (keyboardHeight > 0 ? 8 : 16);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 bg-black"
          style={{ opacity: overlay.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }) }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss OTP"
          className="flex-1"
          onPress={handleClose}
        />

        <Animated.View
          className="overflow-hidden rounded-t-[28px] bg-white"
          style={{
            transform: [{ translateY: sheetY }],
            paddingBottom: sheetPaddingBottom,
            marginBottom: keyboardHeight > 0 ? Math.max(0, keyboardHeight - insets.bottom) : 0,
            shadowColor: authColors.primaryGreen,
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.16,
            shadowRadius: 20,
            elevation: 18,
          }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="h-1.5 w-12 rounded-full bg-slate-200" />
          </View>

          <Text
            className="px-6 pt-3 font-bold text-pillfly-auth-ink"
            style={{ fontSize: 22 }}
          >
            Enter OTP
          </Text>
          <Text
            className="mt-1 px-6 text-pillfly-auth-muted"
            style={{ fontSize: authTypography.subtitle }}
          >
            We sent a 6-digit code to {formatMobile(mobile)}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="One-time password"
            onPress={focusOtpInput}
            className="relative mt-5 flex-row items-center justify-between px-6"
          >
            {Array.from({ length: OTP_LENGTH }, (_, index) => {
              const digit = otp[index] ?? '';
              const isActive = isInputFocused && index === activeIndex;

              return (
                <View
                  key={`otp-box-${index}`}
                  pointerEvents="none"
                  className="items-center justify-center bg-white"
                  style={{
                    width: 48,
                    height: authSpacing.inputHeight,
                    borderRadius: authRadii.input,
                    borderWidth: isActive ? 2 : 1,
                    borderColor: isActive ? authColors.primaryGreen : authColors.lightGreen,
                  }}
                >
                  <Text
                    className="font-bold text-pillfly-auth-ink"
                    style={{ fontSize: 22 }}
                  >
                    {digit}
                  </Text>
                </View>
              );
            })}

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleChangeOtp}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              editable={!isSubmitting}
              caretHidden
              style={{
                position: 'absolute',
                top: 0,
                right: 24,
                bottom: 0,
                left: 24,
                opacity: 0.01,
                color: 'transparent',
              }}
              accessibilityLabel="One-time password"
            />
          </Pressable>

          {authError ? (
            <Text className="mx-6 mt-3 text-[13px] text-pillfly-promo-red">{authError}</Text>
          ) : null}

          <View style={{ marginTop: authSpacing.sectionVertical }}>
            <AuthGradientButton
              label="Verify OTP"
              onPress={handleVerify}
              disabled={otp.length !== OTP_LENGTH}
              busy={isSubmitting}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Resend OTP"
            onPress={handleResend}
            disabled={isSubmitting}
            className="mt-4 items-center py-3 active:opacity-70"
          >
            <Text
              className="font-semibold text-pillfly-auth-primary"
              style={{ fontSize: authTypography.footerLinks }}
            >
              Resend OTP
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

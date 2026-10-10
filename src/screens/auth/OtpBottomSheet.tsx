import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import {
  authColors,
  authRadii,
  authSpacing,
  authTypography,
} from '../../theme/authTheme';
import { AuthGradientButton } from './AuthGradientButton';

const SHEET_ANIM_MS = 260;

type Props = {
  visible: boolean;
  mobile: string;
  onClose: () => void;
  onVerified: () => void;
};

function maskedMobile(mobile: string): string {
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
  const overlay = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(40)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setOtp('');
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
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  const handleChangeOtp = useCallback(
    (value: string) => {
      setOtp(value.replace(/\D/g, '').slice(0, 6));
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
    if (otp.length !== 6 || isSubmitting) {
      return;
    }

    Keyboard.dismiss();
    try {
      await verifyOtp(otp);
      onVerified();
    } catch {
      setOtp('');
    }
  }, [isSubmitting, onVerified, otp, verifyOtp]);

  const handleResend = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setOtp('');
    try {
      await resendOtp();
    } catch {
      // authError is shown from the store
    }
  }, [isSubmitting, resendOtp]);

  const canVerify = otp.length === 6 && !isSubmitting;
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
            We sent a 6-digit code to {maskedMobile(mobile)}
          </Text>

          <View
            className="mt-5 border border-pillfly-auth-light bg-white"
            style={{
              height: authSpacing.inputHeight,
              borderRadius: authRadii.input,
              marginHorizontal: authSpacing.screenHorizontal,
              paddingHorizontal: authSpacing.screenHorizontal - 4,
              justifyContent: 'center',
            }}
          >
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleChangeOtp}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={6}
              editable={!isSubmitting}
              placeholder="------"
              placeholderTextColor={authColors.mutedText}
              className="text-center font-bold text-pillfly-auth-ink"
              style={{ fontSize: 28, letterSpacing: 8, paddingVertical: 0 }}
              accessibilityLabel="One-time password"
            />
          </View>

          {authError ? (
            <Text className="mx-6 mt-3 text-[13px] text-pillfly-promo-red">{authError}</Text>
          ) : null}

          <View style={{ marginTop: authSpacing.sectionVertical }}>
            <AuthGradientButton
              label="Verify OTP"
              onPress={() => {
                handleVerify().catch(() => undefined);
              }}
              disabled={!canVerify && !isSubmitting}
              busy={isSubmitting}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Resend OTP"
            onPress={() => {
              handleResend().catch(() => undefined);
            }}
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';
import { Feather } from '@react-native-vector-icons/feather';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList, RootStackParamList } from '../../types/navigation.types';
import {
  authColors,
  authRadii,
  authSpacing,
  authTypography,
} from '../../theme/authTheme';

const LOGO_SOURCE = require('../../assets/splash/logo.png') as ImageSourcePropType;
const DOCTOR_SOURCE = require('../../assets/icons/icon_doctor.webp') as ImageSourcePropType;

const COUNTRY_CODE = '+91';

const KEYBOARD_ANIM_DURATION = 250;
const KEYBOARD_FLOAT_EXTRA = 16;

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'LoginScreen'>;

type DecorativeBackgroundProps = {
  width: number;
  height: number;
  containerStyle?: StyleProp<ViewStyle>;
};

function PlusIcon({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  const half = size / 2;
  const arm = size * 0.35;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Line
        x1={half}
        y1={half - arm}
        x2={half}
        y2={half + arm}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={opacity}
      />
      <Line
        x1={half - arm}
        y1={half}
        x2={half + arm}
        y2={half}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={opacity}
      />
    </Svg>
  );
}

function SparkleIcon({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={`M${c} ${c - size * 0.4} L${c + size * 0.08} ${c - size * 0.08} L${c + size * 0.4} ${c} L${c + size * 0.08} ${c + size * 0.08} L${c} ${c + size * 0.4} L${c - size * 0.08} ${c + size * 0.08} L${c - size * 0.4} ${c} L${c - size * 0.08} ${c - size * 0.08} Z`}
        fill={color}
        opacity={opacity}
      />
    </Svg>
  );
}

function DecorativeBackground({ width, height, containerStyle }: DecorativeBackgroundProps) {
  const decorColor = authColors.lightGreen;
  const opacity = authColors.decorativeOpacity;

  return (
    <Animated.View
      className="absolute inset-0 overflow-hidden"
      pointerEvents="none"
      style={containerStyle}
    >
      <View
        className="absolute rounded-full bg-pillfly-auth-soft"
        style={{
          width: width * 0.72,
          height: width * 0.72,
          left: width * 0.14,
          top: height * 0.2,
          opacity: 0.55,
        }}
      />
      <View className="absolute" style={{ left: width * 0.06, top: height * 0.28 }}>
        <PlusIcon size={28} color={decorColor} opacity={opacity} />
      </View>
      <View className="absolute" style={{ right: width * 0.1, top: height * 0.32 }}>
        <PlusIcon size={20} color={decorColor} opacity={opacity * 0.85} />
      </View>
      <View className="absolute" style={{ left: width * 0.12, top: height * 0.42 }}>
        <SparkleIcon size={14} color={decorColor} opacity={opacity} />
      </View>
      <View className="absolute" style={{ right: width * 0.18, top: height * 0.24 }}>
        <SparkleIcon size={18} color={decorColor} opacity={opacity * 0.9} />
      </View>
      <View className="absolute" style={{ right: width * 0.08, top: height * 0.38 }}>
        <View className="flex-row flex-wrap gap-1.5" style={{ width: 36 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <View
              key={i}
              className="rounded-full bg-pillfly-auth-light"
              style={{ width: 4, height: 4, opacity: opacity * 0.7 }}
            />
          ))}
        </View>
      </View>
      <View
        className="absolute rounded-full border border-pillfly-auth-light"
        style={{
          width: width * 0.2,
          height: width * 0.2,
          left: width * 0.04,
          bottom: height * 0.35,
          opacity: 0.2,
        }}
      />
    </Animated.View>
  );
}

type LoginFooterProps = {
  containerStyle?: StyleProp<ViewStyle>;
};

function DividerTitle({ title }: { title: string }) {
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
  containerStyle?: StyleProp<ViewStyle>;
};

function PhoneInput({ value, onChangeText, containerStyle }: PhoneInputProps) {
  return (
    <View
      className="flex-row items-center border border-pillfly-auth-light bg-white"
      style={[
        {
          height: authSpacing.inputHeight,
          borderRadius: authRadii.input,
          paddingHorizontal: authSpacing.screenHorizontal - 4,
          marginHorizontal: authSpacing.screenHorizontal,
        },
        containerStyle,
      ]}
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

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function GradientButton({ label, onPress, disabled }: GradientButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="mx-6 overflow-hidden"
      style={({ pressed }) => [
        {
          borderRadius: authRadii.button,
          opacity: disabled ? 0.6 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
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
        <Text
          className="flex-1 text-center font-bold text-white"
          style={{ fontSize: authTypography.button }}
        >
          {label}
        </Text>
        <Feather name="arrow-right" size={22} color={authColors.white} />
      </LinearGradient>
    </Pressable>
  );
}

function TrustedBadge() {
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

function LoginFooter({ containerStyle }: LoginFooterProps) {
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
        <Pressable accessibilityRole="link" accessibilityLabel="Terms">
          <Text
            className="font-bold text-pillfly-auth-primary underline"
            style={{ fontSize: authTypography.footerLinks }}
          >
            Terms
          </Text>
        </Pressable>
        <Text
          className="text-pillfly-auth-muted"
          style={{ fontSize: authTypography.footerLinks }}
        >
          {' '}
          &{' '}
        </Text>
        <Pressable accessibilityRole="link" accessibilityLabel="Privacy Policy">
          <Text
            className="font-bold text-pillfly-auth-primary underline"
            style={{ fontSize: authTypography.footerLinks }}
          >
            Privacy Policy
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function LoginScreen({ navigation }: LoginScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const keyboardProgress = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(0)).current;

  const enterApp = useCallback(() => {
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.navigate('Application');
  }, [navigation]);

  const handleContinue = useCallback(() => {
    enterApp();
  }, [enterApp]);

  const animateKeyboard = useCallback(
    (visible: boolean, keyboardHeight = 0, duration = KEYBOARD_ANIM_DURATION) => {
      const easing = Easing.out(Easing.ease);

      const formBaseBottom = insets.bottom + 12;
      const liftAboveKeyboard = visible
        ? Math.max(0, keyboardHeight - formBaseBottom + KEYBOARD_FLOAT_EXTRA)
        : 0;
      const aestheticFloat = visible ? KEYBOARD_FLOAT_EXTRA : 0;
      const maxLift = height * 0.42;
      const targetTranslate = -Math.min(liftAboveKeyboard + aestheticFloat, maxLift);

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
    },
    [formTranslateY, height, insets.bottom, keyboardProgress],
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = event.endCoordinates.height;
      const duration =
        Platform.OS === 'ios' && event.duration ? event.duration : KEYBOARD_ANIM_DURATION;
      animateKeyboard(true, keyboardHeight, duration);
    });

    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      const duration =
        Platform.OS === 'ios' && event.duration ? event.duration : KEYBOARD_ANIM_DURATION;
      animateKeyboard(false, 0, duration);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animateKeyboard]);

  const doctorWidth = Math.min(width * 0.78, 320);

  const overlayOpacity = keyboardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.82],
  });

  const heroOpacity = keyboardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.58],
  });

  const heroFrostOpacity = keyboardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.48],
  });

  const decorOpacity = keyboardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.32],
  });

  const headerOpacity = keyboardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.72],
  });

  const formShadowOpacity = keyboardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.22],
  });

  const footerOpacity = keyboardProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const dismissKeyboard = useCallback(() => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    }
  }, [isKeyboardVisible]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={authColors.white} />
      <View className="flex-1">
        <DecorativeBackground
          width={width}
          height={height}
          containerStyle={{ opacity: decorOpacity }}
        />

        <Pressable
          onPress={enterApp}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Skip"
          className="absolute right-0 z-30 px-6"
          style={{ top: authSpacing.screenTop }}
        >
          <Text
            className="font-bold text-pillfly-auth-primary"
            style={{ fontSize: authTypography.skip }}
          >
            Skip
          </Text>
        </Pressable>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.38 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isKeyboardVisible}
          bounces={!isKeyboardVisible}
        >
          <Animated.View style={{ opacity: headerOpacity }}>
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
              opacity: heroOpacity,
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
                style={{ opacity: heroFrostOpacity }}
              />
            </View>
            <TrustedBadge />
          </Animated.View>
        </ScrollView>

        <Animated.View
          pointerEvents={isKeyboardVisible ? 'auto' : 'none'}
          className="absolute inset-0 z-10 bg-white"
          style={{ opacity: overlayOpacity }}
        >
          <Pressable className="flex-1" onPress={dismissKeyboard} accessibilityLabel="Dismiss keyboard" />
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
              shadowOpacity: formShadowOpacity,
              shadowRadius: 20,
              elevation: isKeyboardVisible ? 12 : 5,
            }}
          >
            <DividerTitle title="Login to PillFly" />

            <PhoneInput value={phone} onChangeText={setPhone} />

            <View style={{ marginTop: authSpacing.sectionVertical }}>
              <GradientButton label="Continue" onPress={handleContinue} />
            </View>

            <LoginFooter containerStyle={{ opacity: footerOpacity }} />
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

export default LoginScreen;

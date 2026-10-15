import React, { memo, useCallback, useState } from 'react';
import { Alert, Keyboard, Pressable, Text, TextInput, View } from 'react-native';

import { savingsCardShadow, savingsColors } from './savings.styles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SubscriptionBanner = memo(function SubscriptionBanner({
  onSubscribe,
}: {
  onSubscribe?: (email: string) => void;
}) {
  const [email, setEmail] = useState('');

  const handleSubscribe = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    Keyboard.dismiss();
    onSubscribe?.(trimmed);
    Alert.alert('Subscribed', 'You will receive offers at this email.');
    setEmail('');
  }, [email, onSubscribe]);

  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={[savingsCardShadow.card, { backgroundColor: savingsColors.subscriptionBg }]}
    >
      <View className="min-h-[120px] flex-row items-center overflow-hidden px-4 py-4">
        <View className="min-w-0 flex-1 pr-2">
          <Text className="text-[16px] font-bold text-pillfly-ink">Subscribe for offers!</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter Email"
            placeholderTextColor={savingsColors.chipText}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            accessibilityLabel="Email address"
            returnKeyType="done"
            onSubmitEditing={handleSubscribe}
            className="mt-3 rounded-xl border border-pillfly-line bg-pillfly-surface px-3 py-2.5 text-[14px] text-pillfly-ink"
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Subscribe for offers"
            onPress={handleSubscribe}
            className="mt-2.5 self-start rounded-lg border bg-pillfly-surface px-4 py-2 active:opacity-90"
            style={{ borderColor: savingsColors.copyCode }}
          >
            <Text
              className="text-[13px] font-bold"
              style={{ color: savingsColors.copyCode }}
            >
              Subscribe
            </Text>
          </Pressable>
        </View>

        <View
          className="h-20 w-20 items-center justify-center"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text className="text-[44px]">🛍️</Text>
        </View>
      </View>
    </View>
  );
});

SubscriptionBanner.displayName = 'SubscriptionBanner';

import React from 'react';
import { Image, Text, View, type ImageSourcePropType } from 'react-native';

export function ShopTile({
  title,
  subtitle,
  bg,
  icon,
  width,
}: {
  title: string;
  subtitle: string;
  bg: string;
  icon: string | ImageSourcePropType;
  width?: number;
}) {
  const graphic =
    typeof icon === 'string' ? (
      <Text className="text-[36px]">{icon}</Text>
    ) : (
      <Image
        source={icon}
        className="h-[88px] w-full max-w-[112px]"
        resizeMode="contain"
      />
    );

  return (
    <View
      className={`overflow-hidden rounded-2xl border border-pillfly-line/80 ${width == null ? 'w-[132px]' : ''}`}
      style={width != null ? { width } : undefined}
    >
      <View className="h-[120px] items-center justify-center px-2" style={{ backgroundColor: bg }}>
        {graphic}
        {subtitle ? (
          <Text className="mt-1 text-center text-[10px] font-semibold text-pillfly-muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="bg-pillfly-surface px-2 py-2.5">
        <Text className="text-center text-[12px] font-bold text-pillfly-ink">{title}</Text>
      </View>
    </View>
  );
}

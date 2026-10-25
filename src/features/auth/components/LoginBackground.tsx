import React from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { authColors } from '@/theme/authTheme';

type IconProps = { size: number; color: string; opacity: number };

function PlusIcon({ size, color, opacity }: IconProps) {
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

function SparkleIcon({ size, color, opacity }: IconProps) {
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

type LoginBackgroundProps = {
  width: number;
  height: number;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Soft circles, plus signs and sparkles drawn behind the login hero. */
export function LoginBackground({ width, height, containerStyle }: LoginBackgroundProps) {
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

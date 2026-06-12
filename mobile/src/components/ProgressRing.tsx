// TeacherAssistant / MarkScan — animated completion ring ported from ProgressRing
import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp, useTheme } from '../AppState';
import { Icon } from './Icon';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  pct, size = 44, stroke = 4, label,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const { c } = useTheme();
  const { durMul } = useApp();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct / 100, duration: 900 * durMul, useNativeDriver: false }).start();
  }, [anim, pct, durMul]);
  const done = pct >= 100;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.surface2} strokeWidth={stroke} />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={done ? c.good : c.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ}, ${circ}`}
          strokeDashoffset={anim.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] })}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        {done
          ? <Icon name="check" size={14} stroke={3} color={c.good} />
          : <Text style={{ fontSize: 10.5, fontWeight: '700', color: c.ink }}>{label}</Text>}
      </View>
    </View>
  );
}

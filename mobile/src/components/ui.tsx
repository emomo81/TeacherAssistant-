// TeacherAssistant / MarkScan — core UI primitives ported from components.jsx
import React, { useRef } from 'react';
import {
  Animated, Pressable, Text, TextInput, TextInputProps, View, ViewStyle, TextStyle,
  StyleProp, GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../AppState';
import { Icon } from './Icon';
import type { Palette } from '../theme';

// ── press-to-scale wrapper (the .ms-press behaviour) ──
export function PressScale({
  children, onPress, style, disabled, scaleTo = 0.96,
}: {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scaleTo?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

export type BtnKind = 'primary' | 'soft' | 'ghost' | 'outline' | 'danger';

export function Btn({
  kind = 'primary', icon, children, onPress, disabled, style, full,
}: {
  kind?: BtnKind;
  icon?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}) {
  const { c, f } = useTheme();
  const map: Record<BtnKind, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.primary, fg: c.onPrimary },
    soft: { bg: c.psoft, fg: c.primary },
    ghost: { bg: 'transparent', fg: c.primary },
    outline: { bg: c.surface, fg: c.ink, border: c.line },
    danger: { bg: c.badsoft, fg: c.bad },
  };
  const m = map[kind];
  return (
    <PressScale onPress={disabled ? undefined : onPress} disabled={disabled} scaleTo={0.95}
      style={[{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        minHeight: 48, borderRadius: 999, paddingHorizontal: 22,
        backgroundColor: m.bg, opacity: disabled ? 0.45 : 1,
        borderWidth: m.border ? 1.5 : 0, borderColor: m.border,
        width: full ? '100%' : undefined,
        ...(kind === 'primary' ? shadow(c.primary, 0.5) : {}),
      }, style]}>
      {icon ? <Icon name={icon} size={19} color={m.fg} /> : null}
      {typeof children === 'string'
        ? <Text style={{ color: m.fg, fontFamily: f.body, fontWeight: '600', fontSize: 15 }}>{children}</Text>
        : children}
    </PressScale>
  );
}

export type Tone = 'mute' | 'good' | 'warn' | 'bad' | 'primary';

export function Tag({
  tone = 'mute', children, icon, style,
}: {
  tone?: Tone;
  children?: React.ReactNode;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { c, f } = useTheme();
  const tones: Record<Tone, { bg: string; fg: string }> = {
    mute: { bg: c.surface2, fg: c.mute },
    good: { bg: c.goodsoft, fg: c.good },
    warn: { bg: c.warnsoft, fg: c.warn },
    bad: { bg: c.badsoft, fg: c.bad },
    primary: { bg: c.psoft, fg: c.primary },
  };
  const t = tones[tone];
  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.bg,
      borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    }, style]}>
      {icon ? <Icon name={icon} size={13} stroke={2.4} color={t.fg} /> : null}
      <Text style={{ color: t.fg, fontSize: 11.5, fontWeight: '600', fontFamily: f.body }}>{children}</Text>
    </View>
  );
}

export function Card({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c, d } = useTheme();
  return (
    <View style={[{
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: d.radius,
    }, style]}>{children}</View>
  );
}

export function Input(props: TextInputProps & { style?: StyleProp<TextStyle> }) {
  const { c, d, f } = useTheme();
  return (
    <TextInput
      placeholderTextColor={c.mute}
      {...props}
      style={[{
        minHeight: 48, paddingHorizontal: 14, borderRadius: d.radiusSm,
        borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface,
        color: c.ink, fontFamily: f.body, fontSize: 15,
      }, props.style]}
    />
  );
}

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const { c, f } = useTheme();
  return (
    <Text style={[{
      fontSize: 12.5, fontWeight: '700', color: c.mute, textTransform: 'uppercase',
      letterSpacing: 0.7, fontFamily: f.body,
    }, style]}>{children}</Text>
  );
}

// Display-font heading helper
export function Display({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const { c, f } = useTheme();
  return <Text style={[{ fontFamily: f.display, fontWeight: '700', color: c.ink }, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const { c, f } = useTheme();
  return <Text style={[{ fontFamily: f.body, color: c.ink, fontSize: 15 }, style]}>{children}</Text>;
}

// Screen app-bar header
export function Header({
  title, sub, onBack, right, big,
}: {
  title: string;
  sub?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  big?: boolean;
}) {
  const { c, f } = useTheme();
  return (
    <View style={{
      backgroundColor: c.header, paddingHorizontal: onBack ? 4 : 16,
      paddingTop: big ? 10 : 8, paddingBottom: big ? 18 : 10,
      borderBottomWidth: 1, borderBottomColor: c.line,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 }}>
        {onBack ? (
          <PressScale onPress={onBack} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 999 }}>
            <Icon name="chevL" size={22} color={c.headerInk} />
          </PressScale>
        ) : <View style={{ width: 6 }} />}
        <View style={{ flex: 1, paddingLeft: onBack ? 0 : 8 }}>
          <Text numberOfLines={1} style={{ fontFamily: f.display, fontWeight: '700', color: c.headerInk, fontSize: big ? 23 : 18 }}>{title}</Text>
          {sub ? <Text style={{ fontSize: 12.5, color: c.headerMute, marginTop: 1, fontFamily: f.body }}>{sub}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

export function shadow(color: string, strength = 0.25): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: strength,
    shadowRadius: 16,
    elevation: 6,
  };
}

export function paletteOf(p: Palette) { return p; }

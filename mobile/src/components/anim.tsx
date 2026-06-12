// TeacherAssistant / MarkScan — animated primitives ported from components.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View, ViewStyle, StyleProp } from 'react-native';
import { useApp, useTheme } from '../AppState';
import { Icon } from './Icon';
import type { SyncState } from '../AppState';

// Count-up number (ease-out cubic), ported from AnimNumber
export function AnimNumber({
  value, duration = 700, decimals = 0, prefix = '', suffix = '', style,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<any>;
}) {
  const { durMul } = useApp();
  const [disp, setDisp] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const dur = duration * durMul;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(value * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <Text style={style}>{prefix}{disp.toFixed(decimals)}{suffix}</Text>;
}

// Sync badge — animated cloud states
export function SyncBadge({ state = 'synced', light }: { state?: SyncState; light?: boolean }) {
  const { c, f } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (state === 'pending') {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 550, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
      ]));
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
  }, [state, pulse]);
  const map: Record<SyncState, { icon: string; label: string; tone: string }> = {
    synced: { icon: 'check', label: 'Synced', tone: c.good },
    pending: { icon: 'cloudUp', label: 'Syncing', tone: c.warn },
    offline: { icon: 'wifiOff', label: 'Offline', tone: light ? c.headerMute : c.mute },
  };
  const m = map[state];
  const fg = light ? c.headerInk : m.tone;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: light ? 'rgba(255,255,255,0.14)' : 'transparent',
      borderWidth: light ? 0 : 1.5, borderColor: m.tone, opacity: state === 'offline' ? 0.8 : 1,
      paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999,
    }}>
      <Animated.View style={{ opacity: pulse }}>
        <Icon name={m.icon} size={13} stroke={2.4} color={fg} />
      </Animated.View>
      <Text style={{ fontSize: 12.5, fontWeight: '600', color: fg, fontFamily: f.body }}>{m.label}</Text>
    </View>
  );
}

// Confetti burst
export function Confetti({ count = 26 }: { count?: number }) {
  const { c } = useTheme();
  const { durMul } = useApp();
  const colors = [c.primary, c.accent, c.good, c.warn, c.bad];
  const parts = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 500,
    dur: 1600 + Math.random() * 1200,
    size: 6 + Math.random() * 7,
    color: colors[i % colors.length],
    round: Math.random() > 0.5,
    anim: new Animated.Value(0),
  })), [count]);
  useEffect(() => {
    parts.forEach((p) => {
      Animated.timing(p.anim, {
        toValue: 1, duration: p.dur * durMul, delay: p.delay * durMul,
        easing: Easing.bezier(0.3, 0.4, 0.6, 1), useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 40 }}>
      {parts.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', top: -10, left: `${p.left}%`,
          width: p.size, height: p.round ? p.size : p.size * 0.45,
          backgroundColor: p.color, borderRadius: p.round ? p.size : 2,
          opacity: p.anim.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, 560] }) },
            { rotate: p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] }) },
          ],
        }} />
      ))}
    </View>
  );
}

// Bottom sheet (uses a Modal so it overlays the screen)
export function Sheet({
  open, onClose, children, title,
}: {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
}) {
  const { c, d, f } = useTheme();
  const { durMul } = useApp();
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (open) {
      slide.setValue(0);
      Animated.timing(slide, { toValue: 1, duration: 320 * durMul, easing: Easing.bezier(0.32, 0.72, 0.25, 1), useNativeDriver: true }).start();
    }
  }, [open, slide, durMul]);
  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(8,12,20,0.45)' }} />
      <Animated.View style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        backgroundColor: c.surface, borderTopLeftRadius: d.radius, borderTopRightRadius: d.radius,
        padding: d.padLg, paddingBottom: d.padLg + 14,
        transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
        shadowColor: '#000', shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.25, shadowRadius: 40, elevation: 24,
      }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: c.line, alignSelf: 'center', marginBottom: 14 }} />
        {title ? <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 18, marginBottom: 12, color: c.ink }}>{title}</Text> : null}
        {children}
      </Animated.View>
    </Modal>
  );
}

// Simple fade+rise entrance wrapper (replaces the ms-stagger CSS animation)
export function FadeInView({
  children, delay = 0, style, rise = 14,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  rise?: number;
}) {
  const { durMul } = useApp();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 420 * durMul, delay: delay * durMul, easing: Easing.bezier(0.2, 0.7, 0.3, 1), useNativeDriver: true }).start();
  }, [a, delay, durMul]);
  return (
    <Animated.View style={[{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Spring "pop" entrance (scale)
export function PopView({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const { durMul } = useApp();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay * durMul),
      Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 12 }),
    ]).start();
  }, [a, delay, durMul]);
  return (
    <Animated.View style={[{ opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

// TeacherAssistant — brand wordmark (Teacher = ink, Assistant = primary) + logo asset
import React from 'react';
import { Text, Image, ImageStyle, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../AppState';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const TA_LOGO = require('../../assets/ta-logo-motif.png');

export function Logo({ size = 40, style }: { size?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={TA_LOGO} resizeMode="contain" style={[{ width: size, height: size }, style]} />;
}

export function TABrand({
  size = 22, light = false, style,
}: {
  size?: number;
  light?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const { c, f } = useTheme();
  return (
    <Text style={[{ fontFamily: f.display, fontWeight: '700', fontSize: size, letterSpacing: -0.2 }, style]}>
      <Text style={{ color: light ? c.headerInk : c.ink }}>Teacher</Text>
      <Text style={{ color: c.primary }}>Assistant</Text>
    </Text>
  );
}

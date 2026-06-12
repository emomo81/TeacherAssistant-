// TeacherAssistant / MarkScan — simulated marked paper for the scan viewfinder
import React from 'react';
import { Text, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { useTheme } from '../AppState';
import type { Paper } from '../data';

export interface ZoneRect { x: number; y: number; w: number; h: number; }

const PAPER_W = 250;
const PAPER_H = 330;

export function PaperMock({
  paper, zoneRect, style,
}: {
  paper: Paper;
  zoneRect?: ZoneRect | null;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View style={[{
      width: PAPER_W, height: PAPER_H, backgroundColor: '#FDFCF7', borderRadius: 4, overflow: 'hidden',
      transform: [{ rotate: `${paper.tilt || 0}deg` }],
      shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 12,
    }, style]}>
      {/* printed header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#222', letterSpacing: 0.3 }}>QUIZ 2 — ALGEBRA</Text>
        <Text style={{ fontSize: 8.5, color: '#888', marginTop: 2 }}>Grade 9A Mathematics · Bong County Junior High</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 8.5, color: '#888' }}>Name:</Text>
          <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#bbb', height: 12 }} />
          <Text style={{ fontSize: 8.5, color: '#888', marginLeft: 6 }}>Date:</Text>
          <View style={{ width: 44, borderBottomWidth: 1, borderBottomColor: '#bbb', height: 12 }} />
        </View>
      </View>
      {/* handwritten work */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        {[
          '1.  3x + 7 = 22   →   x = 5  ✓',
          '2.  y = 2(4) − 3  →   y = 5  ✓',
          '3.  a² = 49   →   a = ±7  ✓',
          '4.  12 ÷ (x−1) = 4 → x = 4 ✗',
          '5.  slope = rise / run = 2/3 ✓',
        ].map((line, i) => (
          <Text key={i} style={{ fontFamily: 'Caveat', fontSize: 17, color: '#3A3F4A', opacity: 0.82 - (i >= 3 ? 0.1 : 0), lineHeight: 24 }}>{line}</Text>
        ))}
      </View>
      {/* the mark, circled in red, top-right */}
      <View style={{ position: 'absolute', top: 10, right: 12, width: 64, height: 52, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={64} height={52} viewBox="0 0 64 52" style={{ position: 'absolute' }}>
          <Ellipse cx={32} cy={26} rx={28} ry={22} fill="none" stroke={paper.ink} strokeWidth={2.2} opacity={0.85} rotation={-4} originX={32} originY={26} />
        </Svg>
        <Text style={{ fontFamily: 'Caveat', fontSize: 30, fontWeight: '700', color: paper.ink, opacity: paper.smudged ? 0.75 : 1 }}>
          {paper.written}<Text style={{ fontSize: 16, opacity: 0.7 }}>/20</Text>
        </Text>
      </View>
      {/* zone overlay */}
      {zoneRect ? (
        <View pointerEvents="none" style={{
          position: 'absolute',
          left: (zoneRect.x / 100) * PAPER_W, top: (zoneRect.y / 100) * PAPER_H,
          width: (zoneRect.w / 100) * PAPER_W, height: (zoneRect.h / 100) * PAPER_H,
          borderWidth: 2.5, borderColor: c.primary, borderRadius: 6,
        }}>
          {[[-4, -4], [null, -4], [-4, null], [null, null]].map((p, i) => (
            <View key={i} style={{
              position: 'absolute', width: 10, height: 10, borderRadius: 3, backgroundColor: c.primary, borderWidth: 2, borderColor: '#fff',
              left: p[0] === -4 ? -4 : undefined, right: p[0] === null ? -6 : undefined,
              top: p[1] === -4 ? -4 : undefined, bottom: p[1] === null ? -6 : undefined,
            }} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export const PAPER_DIMS = { w: PAPER_W, h: PAPER_H };
export const SUGGESTED_ZONE: ZoneRect = { x: 58, y: 1.5, w: 36, h: 18 };

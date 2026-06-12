// TeacherAssistant / MarkScan — line icons + Google "G", ported from components.jsx
import React from 'react';
import Svg, { Path, G, Rect, Circle, Ellipse } from 'react-native-svg';

export const ICON_PATHS: Record<string, string> = {
  camera: 'M9 3l-1.6 2H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-3.4L15 3H9zm3 14.5A4.5 4.5 0 1112 8.5a4.5 4.5 0 010 9z',
  book: 'M4 4a2 2 0 012-2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm4 0v18M12 8h5M12 12h5',
  table: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 5h18M3 15h18M9 3v18M15 3v18',
  sliders: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 4.5v5M8 14.5v5',
  sheet: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm0 0v6h6M9 13h6M9 17h6',
  sync: 'M21 12a9 9 0 11-2.6-6.3M21 3v5h-5',
  check: 'M4.5 12.5l5 5 10-11',
  chevR: 'M9 5l7 7-7 7',
  chevL: 'M15 5l-7 7 7 7',
  plus: 'M12 4v16M4 12h16',
  pencil: 'M16.5 3.5l4 4L8 20l-5 1 1-5L16.5 3.5z',
  warn: 'M12 3L2 21h20L12 3zm0 7v5m0 3v.5',
  user: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm-8 9a8 8 0 0116 0',
  school: 'M3 10l9-6 9 6-9 6-9-6zm3 4v5c0 1 2.7 3 6 3s6-2 6-3v-5M21 10v6',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-13v5l3.5 2',
  x: 'M5 5l14 14M19 5L5 19',
  flash: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
  archive: 'M3 4h18v5H3V4zm2 5v11h14V9M9.5 13h5',
  moon: 'M20 13.5A8 8 0 0110.5 4 8 8 0 1020 13.5z',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zm0-15v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8',
  wifiOff: 'M2 7c5.5-5 14.5-5 20 0M5.5 10.5c3.7-3.3 9.3-3.3 13 0M9 14c1.7-1.5 4.3-1.5 6 0M12 18.5v.01M3 3l18 18',
  cloudUp: 'M7 18a5 5 0 01-.6-9.97A6.5 6.5 0 0119 9.5 4.25 4.25 0 0118 18h-2m-4 2v-8m0 0l-3 3m3-3l3 3',
  download: 'M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 20h16',
  history: 'M3 12a9 9 0 113 6.7M3 12V7m0 5h5M12 8v4l3 2',
  scanFrame: 'M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M3 12h18',
  sparkle: 'M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2zm7 12l.9 3.1L23 18l-3.1.9L19 22l-.9-3.1L15 18l3.1-.9L19 14z',
  grip: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
  search: 'M10.5 18a7.5 7.5 0 115.3-2.2L21 21',
  csv: 'M4 4a2 2 0 012-2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm10-2v6h6M8 13l2 2-2 2m4 .5h4',
  trash: 'M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13',
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
}

export function Icon({ name, size = 20, color = '#000', stroke = 1.9 }: IconProps) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={d}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={name === 'sparkle' ? color : 'none'}
      />
    </Svg>
  );
}

export function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.3 17.7 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z" />
      <Path fill="#FBBC05" d="M10.5 28.6a14.5 14.5 0 010-9.2l-7.9-6.2a24 24 0 000 21.6l7.9-6.2z" />
      <Path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.6l-7.7-6c-2.1 1.4-4.8 2.3-7.5 2.3-6.3 0-11.6-3.8-13.5-9.1l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
    </Svg>
  );
}

// Drag-grip dots used in the assessment setup rows
export function GripDots({ color = '#ccc' }: { color?: string }) {
  return (
    <Svg width={14} height={20} viewBox="0 0 14 20">
      <G>
        {[3, 10, 17].map((y) => [4, 10].map((x) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill={color} />
        )))}
      </G>
    </Svg>
  );
}

export { Rect, Ellipse };

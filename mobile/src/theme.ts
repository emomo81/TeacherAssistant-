// TeacherAssistant / MarkScan — theme tokens ported from the design's theme.js
// Three directions (Ministry, Greenboard, Harmattan), light + dark, density tokens.
// Default direction is "greenboard" (the user's chosen direction).

export type DirectionKey = 'ministry' | 'greenboard' | 'harmattan';
export type DensityKey = 'comfy' | 'compact';

export interface Palette {
  bg: string; surface: string; surface2: string;
  ink: string; mute: string; line: string;
  primary: string; onPrimary: string; psoft: string; pdeep: string;
  accent: string; good: string; goodsoft: string;
  warn: string; warnsoft: string; bad: string; badsoft: string;
  header: string; headerInk: string; headerMute: string;
}

export interface FontPair { label: string; display: string; body: string; }

export const FONTS: Record<DirectionKey, FontPair> = {
  ministry: { label: 'Zilla Slab + Libre Franklin', display: 'ZillaSlab', body: 'LibreFranklin' },
  greenboard: { label: 'Bitter + Archivo', display: 'Bitter', body: 'Archivo' },
  harmattan: { label: 'Sora + Spline Sans', display: 'Sora', body: 'SplineSans' },
};

export interface Direction {
  name: string;
  tagline: string;
  font: DirectionKey;
  light: Palette;
  dark: Palette;
}

export const DIRECTIONS: Record<DirectionKey, Direction> = {
  ministry: {
    name: 'Ministry',
    tagline: 'Civic cobalt — letterhead trust',
    font: 'ministry',
    light: {
      bg: '#EFF2F7', surface: '#FFFFFF', surface2: '#E4EAF3',
      ink: '#15233B', mute: '#5A6A82', line: '#D4DCE8',
      primary: '#1A56A8', onPrimary: '#FFFFFF', psoft: '#DDE8F7', pdeep: '#123E7C',
      accent: '#C9A23B', good: '#1F8A5B', goodsoft: '#DCF0E6',
      warn: '#C97B1D', warnsoft: '#F8ECD9', bad: '#C03E2E', badsoft: '#F9E3DF',
      header: '#123E7C', headerInk: '#FFFFFF', headerMute: 'rgba(255,255,255,0.66)',
    },
    dark: {
      bg: '#0C1626', surface: '#15233A', surface2: '#1D2F4D',
      ink: '#E8EEF7', mute: '#8FA1BC', line: '#27395A',
      primary: '#6FA3E8', onPrimary: '#0C1626', psoft: '#1C3358', pdeep: '#9FC3F2',
      accent: '#D9B45C', good: '#54C08C', goodsoft: '#15382A',
      warn: '#E0A24E', warnsoft: '#3A2C14', bad: '#E07060', badsoft: '#3D1F1B',
      header: '#0F1E36', headerInk: '#E8EEF7', headerMute: 'rgba(232,238,247,0.6)',
    },
  },
  greenboard: {
    name: 'Greenboard',
    tagline: 'Chalk & ledger — classroom green on cream',
    font: 'greenboard',
    light: {
      bg: '#F4F1E6', surface: '#FFFDF6', surface2: '#EAE5D4',
      ink: '#20291F', mute: '#5F6A58', line: '#DDD6C2',
      primary: '#1E6B4F', onPrimary: '#FFFFFF', psoft: '#DCECE2', pdeep: '#14503A',
      accent: '#D8A03A', good: '#2E7D4F', goodsoft: '#DFEEDF',
      warn: '#B97A18', warnsoft: '#F6EBD2', bad: '#B5432F', badsoft: '#F6E2DC',
      header: '#FFFDF6', headerInk: '#14503A', headerMute: '#5F6A58',
    },
    dark: {
      bg: '#0F1A14', surface: '#18271E', surface2: '#203428',
      ink: '#E8EFE6', mute: '#93A693', line: '#2B4233',
      primary: '#5FB893', onPrimary: '#0F1A14', psoft: '#1B3A2C', pdeep: '#8FD4B6',
      accent: '#D8B05C', good: '#5FB876', goodsoft: '#1A3522',
      warn: '#D9A953', warnsoft: '#383014', bad: '#DC7B62', badsoft: '#3C231B',
      header: '#18271E', headerInk: '#BFE3D2', headerMute: '#93A693',
    },
  },
  harmattan: {
    name: 'Harmattan',
    tagline: 'Warm laterite — modern West-African civic',
    font: 'harmattan',
    light: {
      bg: '#FAF4EC', surface: '#FFFFFF', surface2: '#F1E7D9',
      ink: '#2B2118', mute: '#71614F', line: '#E6D9C7',
      primary: '#B4502A', onPrimary: '#FFFFFF', psoft: '#F6E2D6', pdeep: '#8C3A1C',
      accent: '#3D4A5C', good: '#3A7D44', goodsoft: '#E2EFDD',
      warn: '#BB7B16', warnsoft: '#F8EDD4', bad: '#B23B36', badsoft: '#F8E1DD',
      header: '#FAF4EC', headerInk: '#2B2118', headerMute: '#71614F',
    },
    dark: {
      bg: '#191009', surface: '#251A11', surface2: '#322417',
      ink: '#F3E9DD', mute: '#B49C84', line: '#3F2F1F',
      primary: '#E08756', onPrimary: '#191009', psoft: '#3C2415', pdeep: '#F0A878',
      accent: '#9FB2C8', good: '#76B97F', goodsoft: '#22351F',
      warn: '#DDA743', warnsoft: '#3A2D10', bad: '#E27A6B', badsoft: '#3D201A',
      header: '#251A11', headerInk: '#F3E9DD', headerMute: '#B49C84',
    },
  },
};

export interface Density {
  pad: number; padLg: number; row: number; fs: number; fsSm: number; radius: number; radiusSm: number;
}

export const DENSITY: Record<DensityKey, Density> = {
  comfy: { pad: 16, padLg: 20, row: 56, fs: 15, fsSm: 12.5, radius: 14, radiusSm: 10 },
  compact: { pad: 12, padLg: 14, row: 46, fs: 13.5, fsSm: 11.5, radius: 10, radiusSm: 8 },
};

export interface Tweaks {
  direction: DirectionKey;
  dark: boolean;
  density: DensityKey;
  speed: number;
}

export const TWEAK_DEFAULTS: Tweaks = {
  direction: 'greenboard',
  dark: false,
  density: 'comfy',
  speed: 1,
};

export interface Theme {
  c: Palette;
  f: FontPair;
  d: Density;
  dark: boolean;
  direction: DirectionKey;
  // a light status bar (white text) is used on solid headers (ministry) or in dark mode
  statusLight: boolean;
}

export function buildTheme(t: Tweaks): Theme {
  const dir = DIRECTIONS[t.direction] || DIRECTIONS.greenboard;
  const c = t.dark ? dir.dark : dir.light;
  const f = FONTS[dir.font] || FONTS.greenboard;
  const d = DENSITY[t.density] || DENSITY.comfy;
  return {
    c, f, d, dark: t.dark, direction: t.direction,
    statusLight: t.dark || t.direction === 'ministry',
  };
}

// TeacherAssistant / MarkScan — global app state: theme tweaks, marks, components,
// calculation method, and a passive background-sync simulation (ported from app.jsx).
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  buildTheme, Theme, Tweaks, TWEAK_DEFAULTS,
} from './theme';
import {
  CalcMethod, Component, MarksState, MS_COMPONENTS, MS_STUDENTS,
} from './data';

export type SyncState = 'synced' | 'pending' | 'offline';

interface AppContextValue {
  theme: Theme;
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
  marks: MarksState;
  setMark: (sid: string, comp: string, val: number | null) => void;
  comps: Component[];
  setComps: React.Dispatch<React.SetStateAction<Component[]>>;
  calc: CalcMethod;
  setCalc: (m: CalcMethod) => void;
  syncState: SyncState;
  setSyncState: (s: SyncState) => void;
  // motion duration multiplier (1 / speed) — used by animations
  durMul: number;
}

const AppContext = createContext<AppContextValue | null>(null);

function initialMarks(): MarksState {
  const m: MarksState = {};
  MS_STUDENTS.forEach((s) => { m[s.id] = { ...s.marks }; });
  return m;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);
  const [marks, setMarks] = useState<MarksState>(initialMarks);
  const [comps, setComps] = useState<Component[]>(() => MS_COMPONENTS.map((c) => ({ ...c })));
  const [calc, setCalc] = useState<CalcMethod>('weighted');
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const durMul = 1 / (tweaks.speed || 1);

  const setTweak = useCallback(<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  }, []);

  // every mark write → passive background sync simulation
  const setMark = useCallback((sid: string, comp: string, val: number | null) => {
    setMarks((prev) => ({ ...prev, [sid]: { ...prev[sid], [comp]: val } }));
    setSyncState('pending');
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => setSyncState('synced'), 3000 * durMul);
  }, [durMul]);

  const theme = useMemo(() => buildTheme(tweaks), [tweaks]);

  const value: AppContextValue = {
    theme, tweaks, setTweak, marks, setMark, comps, setComps,
    calc, setCalc, syncState, setSyncState, durMul,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useTheme(): Theme {
  return useApp().theme;
}

// TeacherAssistant / MarkScan — Export & sync (cloud backup, Google Sheets, Excel)
import React, { useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useTheme } from '../src/AppState';
import { MS_STUDENTS, msFinalMark } from '../src/data';
import { Btn, Card, Header, Tag } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { SyncBadge } from '../src/components/anim';

type ExpState = 'idle' | 'connect' | 'write' | 'done';

export default function ExportScreen() {
  const { c, f, d } = useTheme();
  const { marks, comps, calc, syncState, setSyncState, durMul } = useApp();
  const router = useRouter();
  const [exp, setExp] = useState<ExpState>('idle');
  const [rowsWritten, setRowsWritten] = useState(0);
  const [xls, setXls] = useState<'idle' | 'busy' | 'done'>('idle');
  const spin = useRef(new Animated.Value(0)).current;

  const previewRows = MS_STUDENTS.slice(0, 16);

  const startExport = () => {
    setExp('connect'); setRowsWritten(0);
    setTimeout(() => {
      setExp('write');
      let i = 0;
      const iv = setInterval(() => {
        i += 1; setRowsWritten(i);
        if (i >= 16) { clearInterval(iv); setTimeout(() => setExp('done'), 400 * durMul); }
      }, 110 * durMul);
    }, 1100 * durMul);
  };

  const doSync = () => {
    if (syncState === 'pending') return;
    setSyncState('pending');
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1100 * durMul, easing: Easing.linear, useNativeDriver: true })).start();
    setTimeout(() => { setSyncState('synced'); spin.stopAnimation(); spin.setValue(0); }, 1800 * durMul);
  };

  const doXls = () => { setXls('busy'); setTimeout(() => setXls('done'), 1300 * durMul); };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Export & sync" sub="Grade 9A Mathematics · Third Term" onBack={() => router.back()} />
      <View style={{ flex: 1, padding: 16 }}>
        {/* cloud sync */}
        <Card style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: c.psoft, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                <Icon name="sync" size={21} color={c.primary} />
              </Animated.View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.display, fontWeight: '700', color: c.ink }}>Cloud backup</Text>
              <Text style={{ fontSize: 12.5, color: c.mute, fontFamily: f.body }}>
                {syncState === 'synced' ? 'All 96 records safe · just now' : syncState === 'pending' ? 'Uploading 4 new marks…' : 'Offline — 4 changes queued'}
              </Text>
            </View>
            <SyncBadge state={syncState} />
          </View>
          {syncState !== 'synced' ? (
            <View style={{ marginTop: 12 }}>
              <Btn kind="soft" full icon="cloudUp" onPress={doSync}>{syncState === 'pending' ? 'Syncing…' : 'Sync now'}</Btn>
            </View>
          ) : null}
        </Card>

        {/* Google Sheets */}
        <Card style={{ padding: 16, marginTop: 10, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: c.goodsoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="table" size={21} color={c.good} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.display, fontWeight: '700', color: c.ink }}>Google Sheets</Text>
              <Text style={{ fontSize: 12.5, color: c.mute, fontFamily: f.body }}>Bong County JHS — Grade Book → tab “G9A Math · Term 3”</Text>
            </View>
          </View>

          {/* live sheet preview */}
          <View style={{ marginTop: 12, borderWidth: 1, borderColor: c.line, borderRadius: d.radiusSm, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#E8F0FE' }}>
              {[['Roll', 34], ['Student Name', 120], ['Q2', 40], ['…', 36], ['Final', 44]].map(([h, w]) => (
                <View key={h as string} style={{ width: w as number, paddingVertical: 5, paddingHorizontal: 7, borderRightWidth: 1, borderRightColor: '#d6e2f5' }}>
                  <Text style={{ fontSize: 10, color: '#1A56A8', fontWeight: '700' }}>{h}</Text>
                </View>
              ))}
            </View>
            <View style={{ maxHeight: 122, overflow: 'hidden' }}>
              {previewRows.map((s, i) => {
                const written = exp === 'done' || (exp === 'write' && i < rowsWritten);
                const fin = msFinalMark(marks[s.id] || {}, comps, calc);
                const justWritten = written && exp === 'write' && i === rowsWritten - 1;
                return (
                  <View key={s.id} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: c.line, opacity: written ? 1 : 0.22, backgroundColor: justWritten ? c.goodsoft : 'transparent' }}>
                    <View style={{ width: 34, paddingVertical: 3.5, paddingHorizontal: 7 }}><Text style={{ fontSize: 10, color: c.ink }}>{s.roll}</Text></View>
                    <View style={{ width: 120, paddingVertical: 3.5, paddingHorizontal: 7 }}><Text style={{ fontSize: 10, color: c.ink }}>{s.first} {s.last}</Text></View>
                    <View style={{ width: 40, paddingVertical: 3.5, paddingHorizontal: 7 }}><Text style={{ fontSize: 10, color: c.ink }}>{marks[s.id]?.q2 ?? ''}</Text></View>
                    <View style={{ width: 36, paddingVertical: 3.5, paddingHorizontal: 7 }}><Text style={{ fontSize: 10, color: c.mute }}>…</Text></View>
                    <View style={{ width: 44, paddingVertical: 3.5, paddingHorizontal: 7 }}><Text style={{ fontSize: 10, fontWeight: '700', color: c.ink }}>{fin.complete ? fin.value.toFixed(0) : ''}</Text></View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            {exp === 'idle' && <Btn full icon="cloudUp" onPress={startExport}>Export to Google Sheets</Btn>}
            {exp === 'connect' && <Btn full disabled icon="sync">Connecting to Google…</Btn>}
            {exp === 'write' && (
              <View>
                <View style={{ height: 8, borderRadius: 5, backgroundColor: c.surface2, overflow: 'hidden', marginBottom: 8 }}>
                  <View style={{ height: '100%', width: `${(rowsWritten / 16) * 100}%`, backgroundColor: c.good }} />
                </View>
                <Text style={{ fontSize: 12.5, color: c.mute, textAlign: 'center', fontFamily: f.body }}>Writing row {rowsWritten} of 16 — formulas included</Text>
              </View>
            )}
            {exp === 'done' && (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Tag tone="good" icon="check" style={{ paddingVertical: 9, paddingHorizontal: 13 }}>Exported · 16 rows</Tag>
                <Btn kind="ghost" style={{ flex: 1 }} onPress={() => setExp('idle')}>Open in Sheets ↗</Btn>
              </View>
            )}
          </View>
        </Card>

        {/* Excel */}
        <Card style={{ padding: 16, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: c.warnsoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="download" size={21} color={c.warn} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.display, fontWeight: '700', color: c.ink }}>Excel backup (.xlsx)</Text>
            <Text style={{ fontSize: 12.5, color: c.mute, fontFamily: f.body }}>Works offline · saves to Downloads</Text>
          </View>
          {xls === 'done'
            ? <Tag tone="good" icon="check">Saved</Tag>
            : <Btn kind="soft" onPress={doXls} disabled={xls === 'busy'}>{xls === 'busy' ? 'Saving…' : 'Download'}</Btn>}
        </Card>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginHorizontal: 4, marginVertical: 14 }}>
          <Icon name="wifiOff" size={15} color={c.mute} />
          <Text style={{ flex: 1, fontSize: 11.5, color: c.mute, lineHeight: 18, fontFamily: f.body }}>
            Scanning, marking and Excel export never need internet. Cloud backup and Sheets export wait quietly until you're connected.
          </Text>
        </View>
      </View>
    </View>
  );
}

// TeacherAssistant / MarkScan — Grade book (spreadsheet-style table, inline edit, stats)
import React, { useState } from 'react';
import { Pressable, SafeAreaView, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useTheme } from '../src/AppState';
import { MS_STUDENTS, msFinalMark, msGrade, Component, Student } from '../src/data';
import { Btn, Card, Header, Input } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { Sheet } from '../src/components/anim';

type Filter = 'all' | 'missing' | 'below';
const CELL_W = 56;
const NAME_W = 132;

export default function Gradebook() {
  const { c, f, d } = useTheme();
  const { marks, setMark, comps, calc } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [edit, setEdit] = useState<{ s: Student; cp: Component } | null>(null);
  const [editVal, setEditVal] = useState('');

  const rows = MS_STUDENTS.map((s) => {
    const m = marks[s.id] || {};
    return { s, m, fin: msFinalMark(m, comps, calc) };
  }).filter((r) => {
    if (filter === 'missing') return comps.some((cp) => r.m[cp.id] == null);
    if (filter === 'below') return r.fin.complete && r.fin.value < 60;
    return true;
  });

  const finals = MS_STUDENTS.map((s) => msFinalMark(marks[s.id] || {}, comps, calc)).filter((x) => x.complete).map((x) => x.value);
  const avg = finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : 0;
  const hi = finals.length ? Math.max(...finals) : 0;
  const lo = finals.length ? Math.min(...finals) : 0;
  const passRate = finals.length ? Math.round((finals.filter((x) => x >= 60).length / finals.length) * 100) : 0;

  const openEdit = (s: Student, cp: Component) => { setEdit({ s, cp }); setEditVal(String(marks[s.id]?.[cp.id] ?? '')); };
  const saveEdit = () => {
    if (!edit) return;
    setMark(edit.s.id, edit.cp.id, editVal === '' ? null : Number(editVal));
    setEdit(null);
  };

  const filters: [Filter, string][] = [['all', 'All students'], ['missing', 'Missing marks'], ['below', 'Below 60%']];
  const stats: [string, string, string][] = [
    ['Average', avg.toFixed(1), avg >= 60 ? c.good : c.warn],
    ['Highest', hi.toFixed(0), c.ink],
    ['Lowest', lo.toFixed(0), c.bad],
    ['Pass rate', `${passRate}%`, passRate >= 60 ? c.good : c.warn],
  ];

  const thBase = { backgroundColor: c.surface2, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.line } as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Grade book" sub="Grade 9A Mathematics · Third Term" onBack={() => router.back()} />

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
        {filters.map(([k, l]) => {
          const on = filter === k;
          return (
            <Pressable key={k} onPress={() => setFilter(k)} style={{
              paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999,
              borderWidth: on ? 0 : 1.5, borderColor: c.line, backgroundColor: on ? c.primary : c.surface,
            }}>
              <Text style={{ fontWeight: '600', fontSize: 12.5, color: on ? c.onPrimary : c.mute, fontFamily: f.body }}>{l}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* table — vertical scroll holds rows, horizontal scroll holds columns */}
      <View style={{ flex: 1, marginHorizontal: 16, borderRadius: d.radius, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, overflow: 'hidden' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* header row */}
            <View style={{ flexDirection: 'row' }}>
              <View style={[thBase, { width: NAME_W, paddingHorizontal: 12 }]}><Text style={{ fontSize: 12.5, fontWeight: '700', color: c.ink, fontFamily: f.body }}>Student</Text></View>
              {comps.map((cp) => (
                <View key={cp.id} style={[thBase, { width: CELL_W, alignItems: 'center' }]}>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: c.mute, fontFamily: f.body }}>{cp.short}</Text>
                  <Text style={{ fontSize: 9.5, color: c.mute, fontFamily: f.body }}>/{cp.max}</Text>
                </View>
              ))}
              <View style={[thBase, { width: CELL_W, alignItems: 'center' }]}>
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: c.primary, fontFamily: f.body }}>Final</Text>
                <Text style={{ fontSize: 9.5, color: c.mute, fontFamily: f.body }}>%</Text>
              </View>
              <View style={[thBase, { width: 44, alignItems: 'center' }]}>
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: c.mute, fontFamily: f.body }}>Gr</Text>
              </View>
            </View>
            {/* body rows */}
            <ScrollView style={{ maxHeight: 9999 }}>
              {rows.map(({ s, m, fin }) => (
                <View key={s.id} style={{ flexDirection: 'row' }}>
                  <View style={{ width: NAME_W, paddingHorizontal: 12, justifyContent: 'center', height: d.row - 14, borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: c.surface }}>
                    <Text style={{ fontSize: 12.5, fontWeight: '600', color: c.ink, fontFamily: f.body }}>{s.first} {s.last[0]}.</Text>
                    <Text style={{ fontSize: 9.5, color: c.mute, fontFamily: f.body }}>#{s.roll}</Text>
                  </View>
                  {comps.map((cp) => {
                    const v = m[cp.id];
                    const missing = v == null;
                    const below = !missing && (v! / cp.max) < 0.6;
                    return (
                      <Pressable key={cp.id} onPress={() => openEdit(s, cp)} style={{
                        width: CELL_W, height: d.row - 14, alignItems: 'center', justifyContent: 'center',
                        borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: missing ? c.badsoft : 'transparent',
                      }}>
                        <Text style={{ fontSize: 12.5, fontWeight: missing ? '400' : '600', color: missing ? c.bad : below ? c.warn : c.ink, fontFamily: f.body }}>
                          {missing ? '·' : v}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <View style={{ width: CELL_W, height: d.row - 14, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: c.line }}>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: !fin.complete ? c.mute : fin.value >= 60 ? c.good : c.warn, fontFamily: f.body }}>
                      {fin.complete ? fin.value.toFixed(0) : '…'}
                    </Text>
                  </View>
                  <View style={{ width: 44, height: d.row - 14, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: c.line }}>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: c.mute, fontFamily: f.body }}>{fin.complete ? msGrade(fin.value) : ''}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* stats footer */}
      <View style={{ flexDirection: 'row', gap: 8, padding: 16 }}>
        {stats.map(([l, v, col]) => (
          <Card key={l} style={{ flex: 1, paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center' }}>
            <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 17, color: col }}>{v}</Text>
            <Text style={{ fontSize: 11, color: c.mute, fontFamily: f.body }}>{l}</Text>
          </Card>
        ))}
      </View>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit ? `${edit.s.first} ${edit.s.last} — ${edit.cp.name}` : ''}>
        {edit ? (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, justifyContent: 'center', marginTop: 6, marginBottom: 16 }}>
              <Pressable onPress={() => setEditVal(String(Math.max(0, (Number(editVal) || 0) - 1)))} style={{ width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: c.ink }}>−</Text>
              </Pressable>
              <View style={{ width: 110, alignItems: 'center' }}>
                <Input value={editVal} onChangeText={(t) => setEditVal(t.replace(/[^0-9.]/g, ''))} keyboardType="numeric" style={{ textAlign: 'center', fontSize: 25, fontWeight: '700', fontFamily: f.display, minHeight: 56 }} />
                <Text style={{ fontSize: 12.5, color: c.mute, marginTop: 4, fontFamily: f.body }}>out of {edit.cp.max}</Text>
              </View>
              <Pressable onPress={() => setEditVal(String(Math.min(edit.cp.max, (Number(editVal) || 0) + 1)))} style={{ width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: c.ink }}>+</Text>
              </Pressable>
            </View>
            <Input placeholder="Reason for change (optional — kept in history)" />
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginHorizontal: 2, marginVertical: 12 }}>
              <Icon name="history" size={14} color={c.mute} />
              <Text style={{ fontSize: 11.5, color: c.mute, fontFamily: f.body }}>
                {marks[edit.s.id]?.[edit.cp.id] != null ? `OCR entry · Mon 4:12 PM · was ${marks[edit.s.id][edit.cp.id]}/${edit.cp.max}` : 'No previous entries'}
              </Text>
            </View>
            <Btn full icon="check" onPress={saveEdit}>Save mark</Btn>
          </View>
        ) : null}
      </Sheet>
    </SafeAreaView>
  );
}

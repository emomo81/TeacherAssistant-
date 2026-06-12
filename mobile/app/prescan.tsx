// TeacherAssistant / MarkScan — Pre-scan setup (pick component, see remaining students)
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useTheme } from '../src/AppState';
import { MS_STUDENTS } from '../src/data';
import { Btn, Card, Header, SectionLabel, Tag } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { FadeInView } from '../src/components/anim';

export default function PreScan() {
  const { c, f, d } = useTheme();
  const { marks, comps } = useApp();
  const router = useRouter();
  const remaining = MS_STUDENTS.filter((s) => marks[s.id]?.q2 == null);
  const done = MS_STUDENTS.filter((s) => marks[s.id]?.q2 != null);
  const ordered = [...remaining, ...done];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="New scan session" sub="Grade 9A Mathematics" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <SectionLabel style={{ marginHorizontal: 2, marginBottom: 8 }}>Component</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {comps.map((cp) => {
            const on = cp.id === 'q2';
            return (
              <View key={cp.id} style={{
                paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
                backgroundColor: on ? c.primary : c.surface, borderWidth: on ? 0 : 1.5, borderColor: c.line,
              }}>
                <Text style={{ fontSize: 12.5, fontWeight: '600', color: on ? c.onPrimary : c.mute, fontFamily: f.body }}>
                  {cp.name} <Text style={{ opacity: 0.65 }}>/{cp.max}</Text>
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginHorizontal: 2, marginTop: 20, marginBottom: 8 }}>
          <SectionLabel>Students</SectionLabel>
          <Tag tone="warn">{remaining.length} missing Quiz 2</Tag>
        </View>
        <Card style={{ overflow: 'hidden' }}>
          {ordered.map((s, i) => {
            const has = marks[s.id]?.q2 != null;
            return (
              <FadeInView key={s.id} delay={Math.min(i, 10) * 50 + 40}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14,
                  minHeight: d.row - 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, opacity: has ? 0.5 : 1,
                }}>
                  <View style={{ width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: has ? c.goodsoft : c.psoft }}>
                    {has ? <Icon name="check" size={14} stroke={3} color={c.good} />
                      : <Text style={{ fontSize: 12, fontWeight: '700', color: c.primary }}>{s.first[0]}{s.last[0]}</Text>}
                  </View>
                  <Text style={{ flex: 1, fontWeight: '600', fontSize: 12.5, color: c.ink, fontFamily: f.body }}>
                    {s.first} {s.last}<Text style={{ color: c.mute, fontWeight: '400' }}> · #{s.roll}</Text>
                  </Text>
                  {has
                    ? <Text style={{ fontSize: 12.5, color: c.good, fontWeight: '700', fontFamily: f.body }}>{marks[s.id].q2}/20</Text>
                    : <Text style={{ fontSize: 12.5, color: c.mute, fontFamily: f.body }}>—</Text>}
                </View>
              </FadeInView>
            );
          })}
        </Card>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: c.bg }}>
        <Btn full icon="camera" onPress={() => router.push('/scan')}>Start scanning session</Btn>
      </View>
    </View>
  );
}

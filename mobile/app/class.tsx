// TeacherAssistant / MarkScan — Class detail (action tiles + recent activity)
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useTheme } from '../src/AppState';
import { MS_CLASSES, MS_STUDENTS } from '../src/data';
import { Card, Header, PressScale } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { FadeInView } from '../src/components/anim';
import { shadow } from '../src/components/ui';

function ActionTile({ icon, label, sub, onPress, hero, i }: {
  icon: string; label: string; sub: string; onPress: () => void; hero?: boolean; i: number;
}) {
  const { c, f } = useTheme();
  return (
    <FadeInView delay={i * 50 + 40} style={hero ? { width: '100%' } : { width: '48%' }}>
      <PressScale onPress={onPress}>
        <Card style={{
          padding: 16, flexDirection: hero ? 'row' : 'column', alignItems: hero ? 'center' : 'flex-start', gap: hero ? 14 : 10,
          backgroundColor: hero ? c.primary : c.surface, borderWidth: hero ? 0 : 1,
          ...(hero ? shadow(c.primary, 0.5) : {}),
        }}>
          <View style={{ width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: hero ? 'rgba(255,255,255,0.18)' : c.psoft }}>
            <Icon name={icon} size={22} color={hero ? c.onPrimary : c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: hero ? 18 : 15, color: hero ? c.onPrimary : c.ink }}>{label}</Text>
            <Text style={{ fontSize: 12.5, marginTop: 2, color: hero ? 'rgba(255,255,255,0.75)' : c.mute, fontFamily: f.body }}>{sub}</Text>
          </View>
          {hero ? <Icon name="chevR" size={20} color={c.onPrimary} /> : null}
        </Card>
      </PressScale>
    </FadeInView>
  );
}

export default function ClassScreen() {
  const { c, f } = useTheme();
  const { marks } = useApp();
  const router = useRouter();
  const cls = MS_CLASSES[0];
  const missing = MS_STUDENTS.filter((s) => marks[s.id]?.q2 == null).length;

  const activity = [
    { icon: 'camera', t: 'Scan session — Quiz 1', s: '16 papers · 4 min 12 s', when: 'Mon' },
    { icon: 'pencil', t: 'Mark override — Abraham S.', s: 'Mid-Term 27 → 30 · “re-marked p.3”', when: 'Mon' },
    { icon: 'cloudUp', t: 'Synced to cloud', s: '42 records', when: 'Sun' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={cls.name} sub={`${cls.term} · ${cls.year}`} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <FadeInView>
          <Card style={{
            padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12,
            backgroundColor: missing > 0 ? c.warnsoft : c.goodsoft, borderColor: 'transparent',
          }}>
            <Icon name={missing > 0 ? 'warn' : 'check'} size={20} color={missing > 0 ? c.warn : c.good} stroke={2.6} />
            <Text style={{ flex: 1, fontSize: 12.5, color: c.ink, fontFamily: f.body }}>
              {missing > 0
                ? `${missing} students still need a Quiz 2 mark — papers are marked, ready to scan.`
                : 'Quiz 2 complete — all 16 students have marks.'}
            </Text>
          </Card>
        </FadeInView>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
          <ActionTile hero i={0} icon="camera" label="New scan session" sub={missing > 0 ? `Scan ${missing} Quiz 2 papers` : 'All components filled'} onPress={() => router.push('/prescan')} />
          <ActionTile i={1} icon="table" label="Grade book" sub="16 students · 6 columns" onPress={() => router.push('/gradebook')} />
          <ActionTile i={2} icon="sliders" label="Assessment" sub="6 components · 100%" onPress={() => router.push('/setup')} />
          <ActionTile i={3} icon="sheet" label="Export & sync" sub="Sheets · Excel" onPress={() => router.push('/export')} />
          <ActionTile i={4} icon="user" label="Students" sub="16 enrolled" onPress={() => router.push('/gradebook')} />
        </View>

        <Text style={{ marginHorizontal: 2, marginTop: 18, marginBottom: 8, fontFamily: f.display, fontWeight: '700', color: c.ink }}>Recent activity</Text>
        <Card style={{ overflow: 'hidden' }}>
          {activity.map((a, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 11, paddingHorizontal: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              <Icon name={a.icon} size={17} color={c.mute} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, fontWeight: '600', color: c.ink, fontFamily: f.body }}>{a.t}</Text>
                <Text numberOfLines={1} style={{ fontSize: 11.5, color: c.mute, fontFamily: f.body }}>{a.s}</Text>
              </View>
              <Text style={{ fontSize: 11.5, color: c.mute, fontFamily: f.body }}>{a.when}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

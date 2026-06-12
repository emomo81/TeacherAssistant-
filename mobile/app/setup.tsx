// TeacherAssistant / MarkScan — Assessment setup (rename components, weights, calc method)
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, useTheme } from '../src/AppState';
import { MS_STUDENTS, msFinalMark, msGrade, CalcMethod, Component } from '../src/data';
import { Btn, Card, Header, Input } from '../src/components/ui';
import { Icon, GripDots } from '../src/components/Icon';
import { Sheet, FadeInView } from '../src/components/anim';

const CALC_METHODS: { id: CalcMethod; name: string; desc: string }[] = [
  { id: 'weighted', name: 'Weighted %', desc: 'Each component counts by its weight — the Liberia MOE standard.' },
  { id: 'points', name: 'Points total', desc: 'Simple sum of marks ÷ total possible. Weights are ignored.' },
  { id: 'droplow', name: 'Drop lowest quiz', desc: 'The weakest quiz score is forgiven; other weights stretch to 100%.' },
];

export default function Setup() {
  const { c, f, d } = useTheme();
  const { comps, setComps, calc, setCalc, marks } = useApp();
  const router = useRouter();
  const [confirmDel, setConfirmDel] = useState<Component | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const total = comps.reduce((a, cp) => a + cp.weight, 0);
  const ok = total === 100;

  const bump = (id: string, delta: number) =>
    setComps((cs) => cs.map((cp) => (cp.id === id ? { ...cp, weight: Math.max(0, Math.min(100, cp.weight + delta)) } : cp)));
  const rename = (id: string, name: string) =>
    setComps((cs) => cs.map((cp) => (cp.id === id
      ? { ...cp, name: name || cp.name, short: (name || cp.name).split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase() }
      : cp)));
  const setMax = (id: string, max: number) =>
    setComps((cs) => cs.map((cp) => (cp.id === id ? { ...cp, max: Math.max(1, Math.min(200, max || cp.max)) } : cp)));

  const exMarks = marks.s02 || MS_STUDENTS[1].marks;
  const exFinal = msFinalMark(exMarks, comps, calc);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Assessment setup" sub="First Period · weights must total 100%" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* weight total gauge */}
        <FadeInView>
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <Text style={{ fontWeight: '700', fontFamily: f.display, color: c.ink }}>Total weight</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 21, color: ok ? c.good : c.warn }}>{total}%</Text>
                {ok ? <Icon name="check" size={18} stroke={3} color={c.good} /> : null}
              </View>
            </View>
            <View style={{ height: 10, borderRadius: 6, backgroundColor: c.surface2, overflow: 'hidden', flexDirection: 'row' }}>
              {comps.map((cp, i) => (
                <View key={cp.id} style={{ width: `${cp.weight}%`, backgroundColor: ok ? c.good : c.primary, opacity: 0.55 + 0.45 * ((i % 3) / 2), borderRightWidth: 1.5, borderRightColor: c.bg }} />
              ))}
            </View>
            {!ok ? (
              <Text style={{ fontSize: 12.5, color: c.warn, marginTop: 8, fontWeight: '600', fontFamily: f.body }}>
                {total < 100 ? `${100 - total}% unallocated` : `${total - 100}% over — reduce a component`}
              </Text>
            ) : null}
          </Card>
        </FadeInView>

        {/* component rows */}
        <View style={{ gap: 8, marginTop: 12 }}>
          {comps.map((cp, i) => (
            <FadeInView key={cp.id} delay={i * 50 + 40}>
              <Card style={{ padding: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <GripDots color={c.line} />
                <View style={{ flex: 1 }}>
                  {editing === cp.id ? (
                    <Input
                      autoFocus
                      defaultValue={cp.name}
                      onChangeText={setEditName}
                      onBlur={() => { rename(cp.id, editName.trim() || cp.name); setEditing(null); }}
                      style={{ minHeight: 34, paddingHorizontal: 8, fontSize: 12.5, fontWeight: '600' }}
                    />
                  ) : (
                    <Pressable onPress={() => { setEditName(cp.name); setEditing(cp.id); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontWeight: '600', fontSize: 12.5, color: c.ink, fontFamily: f.body }}>{cp.name}</Text>
                      <Icon name="pencil" size={11} color={c.mute} />
                    </Pressable>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Text style={{ fontSize: 11.5, color: c.mute, fontFamily: f.body }}>max</Text>
                    <Input
                      value={String(cp.max)}
                      onChangeText={(t) => setMax(cp.id, Number(t.replace(/\D/g, '')))}
                      keyboardType="numeric"
                      style={{ width: 40, minHeight: 22, borderWidth: 0, borderBottomWidth: 1, borderBottomColor: c.line, paddingHorizontal: 0, textAlign: 'center', fontSize: 11.5, fontWeight: '700' }}
                    />
                    <Text style={{ fontSize: 11.5, color: c.mute, fontFamily: f.body }}>marks</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pressable onPress={() => bump(cp.id, -5)} style={{ width: 32, height: 32, borderRadius: 9, borderWidth: 1.5, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: c.mute, fontWeight: '700', fontSize: 16 }}>−</Text>
                  </Pressable>
                  <Text style={{ width: 44, textAlign: 'center', fontFamily: f.display, fontWeight: '700', color: c.ink }}>{cp.weight}%</Text>
                  <Pressable onPress={() => bump(cp.id, 5)} style={{ width: 32, height: 32, borderRadius: 9, borderWidth: 1.5, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: c.mute, fontWeight: '700', fontSize: 16 }}>+</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => setConfirmDel(cp)} style={{ width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="trash" size={16} color={c.mute} />
                </Pressable>
              </Card>
            </FadeInView>
          ))}
          <Pressable
            onPress={() => setComps((cs) => [...cs, { id: `n${Date.now()}`, name: 'New component', short: 'NEW', max: 20, weight: 0 }])}
            style={{ minHeight: 48, borderRadius: d.radius, borderWidth: 1.5, borderColor: c.line, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
          >
            <Icon name="plus" size={16} color={c.primary} />
            <Text style={{ color: c.primary, fontWeight: '600', fontSize: 12.5, fontFamily: f.body }}>Add component</Text>
          </Pressable>
        </View>

        {/* calculation method */}
        <Card style={{ padding: 16, marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Icon name="sliders" size={17} color={c.primary} />
            <Text style={{ fontWeight: '700', fontFamily: f.display, color: c.ink }}>Final mark calculation</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, backgroundColor: c.surface2, borderRadius: 999, padding: 4 }}>
            {CALC_METHODS.map((m) => {
              const on = calc === m.id;
              return (
                <Pressable key={m.id} onPress={() => setCalc(m.id)} style={{ flex: 1, minHeight: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primary : 'transparent' }}>
                  <Text style={{ fontWeight: '600', fontSize: 11.5, color: on ? c.onPrimary : c.mute, fontFamily: f.body }}>{m.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ fontSize: 12.5, color: c.mute, marginHorizontal: 2, marginTop: 10, marginBottom: 12, lineHeight: 19, fontFamily: f.body }}>
            {(CALC_METHODS.find((m) => m.id === calc) || CALC_METHODS[0]).desc}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.psoft, borderRadius: d.radiusSm, padding: 12, paddingHorizontal: 14 }}>
            <Icon name="sparkle" size={16} color={c.primary} />
            <Text style={{ flex: 1, fontSize: 12.5, color: c.ink, fontFamily: f.body }}>
              Example — Grace Pewee: <Text style={{ color: c.primary, fontWeight: '700' }}>{exFinal.value.toFixed(1)}% · {msGrade(exFinal.value)}</Text>
            </Text>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginHorizontal: 2, marginVertical: 16 }}>
          <Icon name="sparkle" size={15} color={c.accent} />
          <Text style={{ flex: 1, fontSize: 12.5, color: c.mute, fontFamily: f.body }}>
            Pass threshold: <Text style={{ color: c.ink, fontWeight: '700' }}>60%</Text> (Liberia MOE standard) · tap any name to rename it
          </Text>
        </View>
      </ScrollView>

      <Sheet open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete component?">
        {confirmDel ? (
          <View>
            <Text style={{ fontSize: 12.5, color: c.mute, lineHeight: 19, fontFamily: f.body }}>
              <Text style={{ color: c.bad, fontWeight: '700' }}>{confirmDel.name}</Text> already has marks for some students. Deleting it will remove those marks from the final calculation. This cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Btn kind="outline" style={{ flex: 1 }} onPress={() => setConfirmDel(null)}>Keep it</Btn>
              <Btn kind="danger" style={{ flex: 1 }} icon="trash" onPress={() => { setComps((cs) => cs.filter((x) => x.id !== confirmDel.id)); setConfirmDel(null); }}>Delete</Btn>
            </View>
          </View>
        ) : null}
      </Sheet>
    </View>
  );
}

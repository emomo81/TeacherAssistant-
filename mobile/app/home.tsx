// TeacherAssistant / MarkScan — Home (class list, sync, profile + logout)
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp, useTheme } from '../src/AppState';
import { MS_CLASSES, ClassInfo } from '../src/data';
import { Btn, Card, PressScale, Tag } from '../src/components/ui';
import { Icon, GoogleG } from '../src/components/Icon';
import { SyncBadge, Sheet, FadeInView, PopView } from '../src/components/anim';
import { ProgressRing } from '../src/components/ProgressRing';
import { TABrand, Logo } from '../src/components/Brand';
import { shadow } from '../src/components/ui';

function ClassCard({ cls, onOpen, i }: { cls: ClassInfo; onOpen: () => void; i: number }) {
  const { c, f } = useTheme();
  const fillPct = Math.round((cls.filled / cls.students) * 100);
  return (
    <FadeInView delay={i * 50 + 40}>
      <PressScale onPress={onOpen}>
        <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ProgressRing pct={fillPct} label={`${fillPct}%`} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 16, color: c.ink }}>{cls.name}</Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 3 }}>
              <Text style={{ color: c.mute, fontSize: 12.5, fontFamily: f.body }}>{cls.students} students · {cls.level}</Text>
              {cls.scanTarget ? <Tag tone="warn" style={{ paddingVertical: 2, paddingHorizontal: 8 }}>Quiz 2 pending</Tag> : null}
            </View>
          </View>
          <Icon name="chevR" size={18} color={c.mute} />
        </Card>
      </PressScale>
    </FadeInView>
  );
}

export default function Home() {
  const { c, f, dark } = useTheme();
  const { tweaks, setTweak, syncState } = useApp();
  const router = useRouter();
  const active = MS_CLASSES.filter((x) => x.active);
  const archived = MS_CLASSES.filter((x) => !x.active);
  const [showArch, setShowArch] = useState(false);
  const [profile, setProfile] = useState(false);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.header }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: c.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Logo size={40} style={{ width: 40, height: 39 }} />
            <View style={{ flex: 1 }}>
              <TABrand size={20} light={c.header !== c.surface} />
              <Text style={{ fontSize: 12.5, color: c.headerMute, marginTop: 1, fontFamily: f.body }}>{greet}, Ms. Kollie</Text>
            </View>
            <PressScale onPress={() => setTweak('dark', !dark)} style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: 'rgba(127,127,127,0.14)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={dark ? 'sun' : 'moon'} size={18} color={c.headerInk} />
            </PressScale>
            <PressScale onPress={() => setProfile(true)} style={{ width: 38, height: 38, borderRadius: 999, borderWidth: 2, borderColor: c.primary, backgroundColor: c.psoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 14, color: c.primary }}>MK</Text>
            </PressScale>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <SyncBadge state={syncState} light={c.header !== c.surface} />
            <Tag style={{ backgroundColor: 'rgba(127,127,127,0.14)' }}><Text style={{ color: c.headerInk }}>Third Term · 2025–26</Text></Tag>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginHorizontal: 2, marginTop: 4, marginBottom: 10 }}>
          <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 17, color: c.ink }}>My classes</Text>
          <Text style={{ fontSize: 12.5, color: c.mute, fontWeight: '600', fontFamily: f.body }}>{active.length} active</Text>
        </View>
        <View style={{ gap: 10 }}>
          {active.map((cl, i) => <ClassCard key={cl.id} cls={cl} i={i} onOpen={() => router.push('/class')} />)}
          <PressScale style={{ minHeight: 52, borderRadius: 14, borderWidth: 1.5, borderColor: c.line, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
            <Icon name="plus" size={16} color={c.mute} />
            <Text style={{ color: c.mute, fontWeight: '600', fontSize: 12.5, fontFamily: f.body }}>New class</Text>
          </PressScale>
        </View>

        <View style={{ marginTop: 18 }}>
          <Pressable onPress={() => setShowArch(!showArch)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 2 }}>
            <Icon name="archive" size={15} color={c.mute} />
            <Text style={{ color: c.mute, fontWeight: '600', fontSize: 12.5, fontFamily: f.body }}>Archived ({archived.length})</Text>
            <View style={{ transform: [{ rotate: showArch ? '90deg' : '0deg' }] }}><Icon name="chevR" size={13} color={c.mute} /></View>
          </Pressable>
          {showArch && archived.map((cl) => (
            <Card key={cl.id} style={{ padding: 16, opacity: 0.65, marginTop: 8 }}>
              <Text style={{ fontWeight: '600', color: c.ink, fontFamily: f.body }}>{cl.name}</Text>
              <Text style={{ color: c.mute, fontSize: 12.5, fontFamily: f.body }}>{cl.term} · {cl.year}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>

      <PopView delay={350} style={{ position: 'absolute', right: 18, bottom: 26 }}>
        <PressScale onPress={() => router.push('/class')} style={{ minHeight: 56, paddingHorizontal: 22, borderRadius: 18, backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', gap: 10, ...shadow(c.primary, 0.5) }}>
          <Icon name="camera" size={22} color={c.onPrimary} />
          <Text style={{ fontWeight: '700', fontSize: 15, color: c.onPrimary, fontFamily: f.body }}>Scan</Text>
        </PressScale>
      </PopView>

      <Sheet open={profile} onClose={() => setProfile(false)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <View style={{ width: 54, height: 54, borderRadius: 999, backgroundColor: c.psoft, borderWidth: 2, borderColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 19, color: c.primary }}>MK</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 17, color: c.ink }}>Martha Kollie</Text>
            <Text style={{ fontSize: 12.5, color: c.mute, fontFamily: f.body }}>Bong County Junior High · Margibi</Text>
          </View>
          <Tag tone="good" icon="check">Synced</Tag>
        </View>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 12 }}>
          <GoogleG size={16} />
          <Text style={{ flex: 1, fontSize: 12.5, color: c.mute, fontFamily: f.body }}>martha.kollie@gmail.com</Text>
          <Text style={{ fontSize: 11.5, color: c.good, fontWeight: '700', fontFamily: f.body }}>Connected</Text>
        </Card>
        {([['user', 'Edit profile & school'], ['sliders', 'Settings'], ['history', 'Mark history & audit log']] as const).map(([ic, l]) => (
          <Pressable key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: c.line }}>
            <Icon name={ic} size={17} color={c.mute} />
            <Text style={{ flex: 1, fontSize: 12.5, fontWeight: '600', color: c.ink, fontFamily: f.body }}>{l}</Text>
            <Icon name="chevR" size={15} color={c.mute} />
          </Pressable>
        ))}
        <View style={{ height: 14 }} />
        <Btn kind="danger" full icon="x" onPress={() => { setProfile(false); router.replace('/'); }}>Log out</Btn>
        <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: c.mute, fontFamily: f.body }}>
          Your marks stay safe in the cloud — log back in anytime to restore them.
        </Text>
      </Sheet>
    </View>
  );
}

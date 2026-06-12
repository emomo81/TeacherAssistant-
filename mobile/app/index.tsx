// TeacherAssistant — Onboarding: animated logo splash → 3-step wizard (ported)
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp, useTheme } from '../src/AppState';
import { Btn, Body, Input, PressScale } from '../src/components/ui';
import { Icon, GoogleG } from '../src/components/Icon';
import { TABrand, Logo } from '../src/components/Brand';
import { Tag } from '../src/components/ui';

function ScanCorners({ progress }: { progress: Animated.Value }) {
  const { c } = useTheme();
  const corners = [
    { left: -16, top: -14, bw: { borderTopWidth: 3, borderLeftWidth: 3 }, br: { borderTopLeftRadius: 10 } },
    { right: -16, top: -14, bw: { borderTopWidth: 3, borderRightWidth: 3 }, br: { borderTopRightRadius: 10 } },
    { left: -16, bottom: -14, bw: { borderBottomWidth: 3, borderLeftWidth: 3 }, br: { borderBottomLeftRadius: 10 } },
    { right: -16, bottom: -14, bw: { borderBottomWidth: 3, borderRightWidth: 3 }, br: { borderBottomRightRadius: 10 } },
  ];
  return (
    <>
      {corners.map((cn, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', width: 30, height: 30, borderColor: c.primary,
          left: cn.left, right: cn.right, top: cn.top, bottom: cn.bottom,
          ...cn.bw, ...cn.br, opacity: progress, transform: [{ scale: progress }],
        }} />
      ))}
    </>
  );
}

function ObSplash({ onDone }: { onDone: () => void }) {
  const { c, f } = useTheme();
  const { durMul } = useApp();
  const pop = useRef(new Animated.Value(0)).current;
  const corners = useRef(new Animated.Value(0)).current;
  const beam = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 12 }).start();
    Animated.timing(corners, { toValue: 1, delay: 380 * durMul, duration: 400 * durMul, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(beam, { toValue: 1, duration: 1500 * durMul, delay: 700 * durMul, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(beam, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]), { iterations: 2 }).start();
    Animated.timing(word, { toValue: 1, delay: 900 * durMul, duration: 500 * durMul, useNativeDriver: true }).start();
    Animated.timing(tagline, { toValue: 1, delay: 1900 * durMul, duration: 500 * durMul, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1500 * durMul, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1500 * durMul, useNativeDriver: true }),
    ])).start();
    const t = setTimeout(onDone, 4200 * durMul);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable onPress={onDone} style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.bg,
      zIndex: 20, alignItems: 'center', justifyContent: 'center',
    }}>
      <Animated.View style={{
        position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: c.psoft,
        opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.5] }),
        transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
      }} />
      <View style={{ width: 170, height: 166 }}>
        <Animated.View style={{ width: '100%', height: '100%', transform: [{ scale: pop }], opacity: pop }}>
          <Logo size={170} />
        </Animated.View>
        <ScanCorners progress={corners} />
        <View style={{ position: 'absolute', left: -10, right: -10, top: -6, bottom: -6, overflow: 'hidden' }}>
          <Animated.View style={{
            position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, backgroundColor: c.primary,
            shadowColor: c.primary, shadowOpacity: 0.85, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
            opacity: beam.interpolate({ inputRange: [0, 0.05, 0.95, 1], outputRange: [0, 0.85, 0.85, 0] }),
            transform: [{ translateY: beam.interpolate({ inputRange: [0, 1], outputRange: [-8, 170] }) }],
          }} />
        </View>
      </View>

      <Animated.View style={{ marginTop: 26, alignItems: 'center', opacity: word, transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
        <TABrand size={31} />
      </Animated.View>
      <Animated.Text style={{ marginTop: 10, color: c.mute, fontSize: 12.5, fontFamily: f.body, opacity: tagline }}>
        Record marks faster. Save time. Teach more.
      </Animated.Text>
      <Animated.Text style={{ position: 'absolute', bottom: 30, color: c.mute, fontSize: 11.5, fontFamily: f.body, opacity: tagline }}>
        Tap to continue
      </Animated.Text>
    </Pressable>
  );
}

function ObStep({ active, done, label, i }: { active: boolean; done: boolean; label: string; i: number }) {
  const { c, f } = useTheme();
  const on = done || active;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <View style={{
        width: 26, height: 26, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
        backgroundColor: on ? c.primary : c.surface2, transform: [{ scale: active ? 1.12 : 1 }],
      }}>
        {done ? <Icon name="check" size={13} stroke={3} color={c.onPrimary} />
          : <Text style={{ fontSize: 12, fontWeight: '700', color: on ? c.onPrimary : c.mute }}>{i}</Text>}
      </View>
      <Text style={{ fontSize: 12.5, fontWeight: '600', fontFamily: f.body, color: active ? c.ink : c.mute }}>{label}</Text>
    </View>
  );
}

export default function Onboarding() {
  const { c, f } = useTheme();
  const { durMul } = useApp();
  const router = useRouter();
  const [splash, setSplash] = useState(true);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [signing, setSigning] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'Science']);
  const spin = useRef(new Animated.Value(0)).current;

  const finish = () => router.replace('/home');
  const steps = ['Sign in', 'School', 'First class'];

  const doSignIn = () => {
    setSigning(true);
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })).start();
    setTimeout(() => {
      setSigning(false); setSignedIn(true); setName('Martha Kollie');
      setTimeout(() => setStep(1), 600 * durMul);
    }, 1100 * durMul);
  };
  const toggleSubject = (s: string) =>
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      {splash ? <ObSplash onDone={() => setSplash(false)} /> : null}

      <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
        <Logo size={46} />
        <View>
          <TABrand size={22} />
          <Text style={{ color: c.mute, fontSize: 11.5, marginTop: 1, fontFamily: f.body }}>
            Record marks faster. Save time. Teach more.
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, paddingTop: 16, paddingBottom: 4 }}>
        {steps.map((s, i) => <ObStep key={s} label={s} i={i + 1} active={step === i} done={step > i} />)}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View>
            <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14 }}>
              <PressScale onPress={doSignIn} style={{ minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {signing
                  ? <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}><Icon name="sync" size={18} color={c.ink} /></Animated.View>
                  : signedIn ? <Icon name="check" size={18} color={c.good} stroke={2.6} /> : <GoogleG />}
                <Text style={{ fontFamily: f.body, fontSize: 15, fontWeight: '600', color: c.ink }}>
                  {signing ? 'Connecting…' : signedIn ? 'Signed in as Martha Kollie' : 'Continue with Google'}
                </Text>
              </PressScale>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
              <Text style={{ color: c.mute, fontSize: 12.5, fontFamily: f.body }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
            </View>

            <Input placeholder="Email address" autoCapitalize="none" keyboardType="email-address" />
            <View style={{ height: 10 }} />
            <Input placeholder="Password" secureTextEntry />
            <View style={{ height: 16 }} />
            <Btn full onPress={() => { setName('Martha Kollie'); setStep(1); }}>Create account</Btn>
            <Text style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: c.mute, fontFamily: f.body }}>
              Works fully offline after first sign-in.
            </Text>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 20, marginBottom: 4, color: c.ink }}>Tell us about your school</Text>
            <Text style={{ color: c.mute, fontSize: 12.5, marginBottom: 16, fontFamily: f.body }}>This is just for your records — no admin approval needed.</Text>
            <Text style={{ fontSize: 12.5, fontWeight: '600', marginBottom: 6, color: c.ink, fontFamily: f.body }}>Your name</Text>
            <Input value={name} onChangeText={setName} />
            <View style={{ height: 14 }} />
            <Text style={{ fontSize: 12.5, fontWeight: '600', marginBottom: 6, color: c.ink, fontFamily: f.body }}>School name</Text>
            <Input placeholder="e.g. Bong County Junior High" value={school} onChangeText={setSchool} />
            <View style={{ height: 14 }} />
            <Text style={{ fontSize: 12.5, fontWeight: '600', marginBottom: 6, color: c.ink, fontFamily: f.body }}>Subjects you teach</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {['Mathematics', 'Science', 'English', 'Social Studies'].map((s) => (
                <Pressable key={s} onPress={() => toggleSubject(s)}>
                  <Tag tone={subjects.includes(s) ? 'primary' : 'mute'} style={{ paddingHorizontal: 14, paddingVertical: 8 }}>{s}</Tag>
                </Pressable>
              ))}
            </View>
            <View style={{ height: 22 }} />
            <Btn full onPress={() => setStep(2)} icon="chevR">Continue</Btn>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 20, marginBottom: 4, color: c.ink }}>Create your first class</Text>
            <Text style={{ color: c.mute, fontSize: 12.5, marginBottom: 16, fontFamily: f.body }}>You can add students by CSV or one by one after this.</Text>
            <Text style={{ fontSize: 12.5, fontWeight: '600', marginBottom: 6, color: c.ink, fontFamily: f.body }}>Class name</Text>
            <Input defaultValue="Grade 9A Mathematics" />
            <View style={{ height: 14 }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, fontWeight: '600', marginBottom: 6, color: c.ink, fontFamily: f.body }}>Academic year</Text>
                <Input defaultValue="2025–2026" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, fontWeight: '600', marginBottom: 6, color: c.ink, fontFamily: f.body }}>Term</Text>
                <Input defaultValue="Third Term" />
              </View>
            </View>
            <View style={{ marginTop: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, flexDirection: 'row', gap: 10, padding: 14, alignItems: 'center' }}>
              <Icon name="sparkle" size={18} color={c.accent} />
              <Text style={{ flex: 1, fontSize: 12.5, color: c.mute, fontFamily: f.body }}>
                Junior High detected — we will suggest the standard Liberian assessment structure.
              </Text>
            </View>
            <View style={{ height: 22 }} />
            <Btn full onPress={finish} icon="check">Finish setup</Btn>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: 16, alignItems: 'center' }}>
        <Pressable onPress={finish} style={{ padding: 8 }}>
          <Text style={{ color: c.mute, fontSize: 12.5, fontWeight: '600', fontFamily: f.body }}>Skip — explore with sample data</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

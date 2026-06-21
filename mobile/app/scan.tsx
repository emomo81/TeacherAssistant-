// TeacherAssistant / MarkScan — hero flow: camera → mark zone → OCR → review → summary
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, PanResponder, Pressable, ScrollView, Text, View, LayoutRectangle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp, useTheme } from '../src/AppState';
import { MS_PAPERS, MS_STUDENTS } from '../src/data';
import { Btn, Header, SectionLabel, Tag } from '../src/components/ui';
import { Icon } from '../src/components/Icon';
import { AnimNumber, Confetti, Sheet, FadeInView, PopView } from '../src/components/anim';
import { PaperMock, SUGGESTED_ZONE, ZoneRect, PAPER_DIMS } from '../src/components/PaperMock';

type Phase = 'camera' | 'zone' | 'processing' | 'review' | 'summary';

export default function Scan() {
  const { c, f, d } = useTheme();
  const { marks, setMark, durMul } = useApp();
  const router = useRouter();
  const [perm, requestPerm] = useCameraPermissions();

  const [paperIdx, setPaperIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('camera');
  const [flash, setFlash] = useState(false);
  const [zone, setZone] = useState<ZoneRect | null>(null);
  const [draftZone, setDraftZone] = useState<ZoneRect | null>(null);
  const [ocrStep, setOcrStep] = useState(0);
  const [extracted, setExtracted] = useState('');
  const [selStudent, setSelStudent] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<{ student: typeof MS_STUDENTS[number]; value: number }[]>([]);
  const [dupWarn, setDupWarn] = useState<typeof MS_STUDENTS[number] | null>(null);

  const paper = MS_PAPERS[paperIdx];
  const total = MS_PAPERS.length;
  const conf = paper.conf;
  const confTone = conf >= 70 ? 'good' : conf >= 40 ? 'warn' : 'bad';

  const paperLayout = useRef<LayoutRectangle | null>(null);
  const scanline = useRef(new Animated.Value(0)).current;
  const shutter = useRef(new Animated.Value(0)).current;

  const capture = () => {
    setFlash(true);
    Animated.sequence([
      Animated.timing(shutter, { toValue: 1, duration: 60 * durMul, useNativeDriver: true }),
      Animated.timing(shutter, { toValue: 0, duration: 390 * durMul, useNativeDriver: true }),
    ]).start(() => setFlash(false));
    setTimeout(() => setPhase(zone ? 'processing' : 'zone'), 260 * durMul);
  };

  // OCR processing simulation
  useEffect(() => {
    if (phase !== 'processing') return;
    setOcrStep(0);
    const loop = Animated.loop(Animated.timing(scanline, { toValue: 1, duration: 1050 * durMul, easing: Easing.inOut(Easing.ease), useNativeDriver: true }));
    loop.start();
    const t1 = setTimeout(() => setOcrStep(1), 350 * durMul);
    const t2 = setTimeout(() => setOcrStep(2), 700 * durMul);
    const t3 = setTimeout(() => {
      setExtracted(paper.value == null ? '' : String(paper.value));
      setSelStudent(paper.suggest);
      setPhase('review');
    }, 1100 * durMul);
    return () => { loop.stop(); scanline.setValue(0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── zone drawing via PanResponder (percentage coords on the paper) ──
  const toPct = (px: number, py: number): { x: number; y: number } => ({
    x: Math.max(0, Math.min(100, (px / PAPER_DIMS.w) * 100)),
    y: Math.max(0, Math.min(100, (py / PAPER_DIMS.h) * 100)),
  });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const s = toPct(e.nativeEvent.locationX, e.nativeEvent.locationY);
        dragStart.current = s;
        setDraftZone({ x: s.x, y: s.y, w: 0, h: 0 });
      },
      onPanResponderMove: (e) => {
        if (!dragStart.current) return;
        const p = toPct(e.nativeEvent.locationX, e.nativeEvent.locationY);
        const s = dragStart.current;
        setDraftZone({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
      },
      onPanResponderRelease: () => { dragStart.current = null; },
    }),
  ).current;

  const confirmZone = () => {
    const z = draftZone && draftZone.w > 4 ? draftZone : SUGGESTED_ZONE;
    setZone(z); setDraftZone(null); setPhase('processing');
  };

  const remaining = MS_STUDENTS.filter((s) => marks[s.id]?.q2 == null && !assigned.find((a) => a.student.id === s.id));
  const already = MS_STUDENTS.filter((s) => marks[s.id]?.q2 != null);
  const activeZone = draftZone || zone;

  const saveNext = () => {
    const student = MS_STUDENTS.find((s) => s.id === selStudent);
    if (!student) return;
    if (marks[student.id]?.q2 != null && !dupWarn) { setDupWarn(student); return; }
    setDupWarn(null);
    setMark(student.id, 'q2', Number(extracted));
    setAssigned((a) => [...a, { student, value: Number(extracted) }]);
    if (paperIdx + 1 >= total) setPhase('summary');
    else { setPaperIdx(paperIdx + 1); setExtracted(''); setSelStudent(null); setPhase('camera'); }
  };

  // ─────────────────── camera / zone / processing (dark viewfinder) ───────────────────
  if (phase === 'camera' || phase === 'zone' || phase === 'processing') {
    const camGranted = perm?.granted;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F16' }}>
        {camGranted && phase === 'camera' ? (
          <CameraView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} facing="back" />
        ) : null}
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          {/* top bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
            <Pressable onPress={() => router.replace('/class')} style={{ width: 42, height: 42, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={19} color="#fff" />
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: 12.5, fontFamily: f.body }}>
              Quiz 2 · Paper {paperIdx + 1} of {total}
            </Text>
            <View style={{ width: 42, alignItems: 'center' }}><Icon name="flash" size={18} color="rgba(255,255,255,0.7)" /></View>
          </View>

          {/* progress beads */}
          <View style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', paddingBottom: 8 }}>
            {MS_PAPERS.map((_, i) => (
              <View key={i} style={{
                width: i === paperIdx ? 22 : 7, height: 7, borderRadius: 4,
                backgroundColor: i < paperIdx ? c.good : i === paperIdx ? '#fff' : 'rgba(255,255,255,0.25)',
              }} />
            ))}
          </View>

          {/* viewfinder */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              {...(phase === 'zone' ? pan.panHandlers : {})}
              onLayout={(e) => { paperLayout.current = e.nativeEvent.layout; }}
            >
              <PaperMock paper={paper} zoneRect={phase === 'zone' ? activeZone : phase === 'processing' ? zone : null} />
              {phase === 'processing' ? (
                <Animated.View style={{
                  position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: c.primary,
                  shadowColor: c.primary, shadowOpacity: 0.9, shadowRadius: 18, shadowOffset: { width: 0, height: 0 },
                  transform: [{ translateY: scanline.interpolate({ inputRange: [0, 1], outputRange: [0, PAPER_DIMS.h] }) }],
                }} />
              ) : null}
            </View>

            {flash ? <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', opacity: shutter }} /> : null}
          </View>

          {/* bottom controls */}
          <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 22 }}>
            {phase === 'camera' && (
              <View style={{ alignItems: 'center', gap: 12 }}>
                {!camGranted ? (
                  <Pressable onPress={requestPerm} style={{ paddingVertical: 8 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12.5, fontFamily: f.body }}>Tap to enable camera</Text>
                  </Pressable>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.good }} />
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12.5, fontFamily: f.body }}>Paper detected — hold steady or tap</Text>
                  </View>
                )}
                <Pressable onPress={capture} style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: '#fff', borderWidth: 5, borderColor: 'rgba(255,255,255,0.35)' }} />
              </View>
            )}
            {phase === 'zone' && (
              <FadeInView>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', marginBottom: 4, fontFamily: f.body }}>Draw the Mark Zone</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', textAlign: 'center', fontSize: 12.5, marginBottom: 14, fontFamily: f.body }}>
                  Drag a box around the mark — it will be reused for every paper in this batch.
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Btn kind="outline" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)' }} onPress={() => setDraftZone(SUGGESTED_ZONE)}>
                    <Text style={{ color: '#fff', fontWeight: '600', fontFamily: f.body }}>Suggest zone</Text>
                  </Btn>
                  <Btn style={{ flex: 1.4 }} icon="check" disabled={!activeZone || activeZone.w < 4} onPress={confirmZone}>Use this zone</Btn>
                </View>
              </FadeInView>
            )}
            {phase === 'processing' && (
              <FadeInView style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
                  {['Deskew', 'Enhance', 'Read digits'].map((s, i) => (
                    <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      {ocrStep > i
                        ? <Icon name="check" size={12} stroke={3} color={c.good} />
                        : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ocrStep >= i ? '#fff' : 'rgba(255,255,255,0.4)' }} />}
                      <Text style={{ color: ocrStep >= i ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: ocrStep >= i ? '700' : '400', fontSize: 12.5, fontFamily: f.body }}>{s}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ marginTop: 10, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', fontFamily: f.body }}>On-device OCR · no internet needed</Text>
              </FadeInView>
            )}
          </View>
        </SafeAreaView>
      </SafeAreaView>
    );
  }

  // ─────────────────── review ───────────────────
  if (phase === 'review') {
    const forced = paper.value == null;
    const canSave = extracted !== '' && !!selStudent;
    const reviewList = [...remaining.slice(0, 6), ...already.slice(0, 1)];
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Header
          title={`Review · paper ${paperIdx + 1}/${total}`}
          sub="Quiz 2 / 20"
          onBack={() => setPhase('camera')}
          right={<Tag tone={confTone as any} style={{ marginRight: 10 }} icon={conf < 70 ? 'warn' : 'check'}>{conf}%</Tag>}
        />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* crop + extraction */}
          <PopView>
            <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: d.radius, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <View style={{ width: 108, height: 78, borderRadius: 8, backgroundColor: '#FDFCF7', borderWidth: 2, borderColor: c.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Text style={{ position: 'absolute', top: 3, left: 5, fontSize: 8, fontWeight: '700', color: c.primary, letterSpacing: 0.4, fontFamily: f.body }}>MARK ZONE</Text>
                <Text style={{ fontFamily: 'Caveat', fontSize: 40, fontWeight: '700', color: paper.ink, opacity: paper.smudged ? 0.75 : 1 }}>
                  {paper.written}<Text style={{ fontSize: 20, opacity: 0.7 }}>/20</Text>
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, color: c.mute, marginBottom: 4, fontFamily: f.body }}>{forced ? 'Could not read — enter manually' : 'OCR read'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  {forced && extracted === '' ? (
                    <Text style={{ fontFamily: f.display, fontSize: 37, fontWeight: '700', color: c.bad }}>?</Text>
                  ) : (
                    <Text style={{ fontFamily: f.display, fontSize: 37, fontWeight: '700', color: conf < 70 && !forced ? c.warn : c.ink }}>
                      {extracted || '0'}
                    </Text>
                  )}
                  <Text style={{ color: c.mute, fontWeight: '600', fontFamily: f.body }}>/ 20</Text>
                </View>
              </View>
              <View style={{ gap: 6 }}>
                {[1, -1].map((delta) => (
                  <Pressable key={delta} onPress={() => setExtracted(String(Math.max(0, Math.min(20, (Number(extracted) || 0) + delta))))}
                    style={{ width: 38, height: 34, borderRadius: 9, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink }}>{delta > 0 ? '+' : '−'}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </PopView>

          {conf < 70 && !forced ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginHorizontal: 2, marginTop: 10 }}>
              <Icon name="warn" size={15} color={c.warn} />
              <Text style={{ color: c.warn, fontSize: 12.5, fontWeight: '600', fontFamily: f.body }}>Low confidence — double-check against the paper</Text>
            </View>
          ) : null}

          <SectionLabel style={{ marginHorizontal: 2, marginTop: 16, marginBottom: 8 }}>Assign to student · {remaining.length} remaining</SectionLabel>
          <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: d.radius, overflow: 'hidden' }}>
            {reviewList.map((s, i) => {
              const sel = selStudent === s.id;
              const has = marks[s.id]?.q2 != null;
              return (
                <Pressable key={s.id} onPress={() => setSelStudent(s.id)} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, minHeight: d.row - 8,
                  borderTopWidth: i ? 1 : 0, borderTopColor: c.line, backgroundColor: sel ? c.psoft : 'transparent',
                }}>
                  <View style={{ width: 22, height: 22, borderRadius: 999, borderWidth: sel ? 0 : 2, borderColor: c.line, backgroundColor: sel ? c.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {sel ? <Icon name="check" size={12} stroke={3.4} color={c.onPrimary} /> : null}
                  </View>
                  <Text style={{ flex: 1, fontWeight: '600', fontSize: 12.5, color: c.ink, fontFamily: f.body }}>
                    {s.first} {s.last} <Text style={{ color: c.mute, fontWeight: '400' }}>· #{s.roll}</Text>
                  </Text>
                  {s.id === paper.suggest ? <Tag tone="primary" icon="sparkle">suggested</Tag> : null}
                  {has ? <Tag tone="warn">has {marks[s.id].q2}/20</Tag> : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, flexDirection: 'row', gap: 10, backgroundColor: c.bg }}>
          <Btn kind="outline" onPress={() => setPhase('camera')} icon="camera">Retake</Btn>
          <Btn style={{ flex: 1 }} icon="check" disabled={!canSave} onPress={saveNext}>
            {paperIdx + 1 >= total ? 'Save & finish' : 'Save & next paper'}
          </Btn>
        </View>

        <Sheet open={!!dupWarn} onClose={() => setDupWarn(null)} title="Overwrite existing mark?">
          {dupWarn ? (
            <View>
              <Text style={{ fontSize: 12.5, color: c.mute, lineHeight: 19, fontFamily: f.body }}>
                <Text style={{ color: c.ink, fontWeight: '700' }}>{dupWarn.first} {dupWarn.last}</Text> already has Quiz 2 = <Text style={{ color: c.ink, fontWeight: '700' }}>{marks[dupWarn.id]?.q2}/20</Text>. Replace it with <Text style={{ color: c.ink, fontWeight: '700' }}>{extracted}/20</Text>? The change is kept in mark history.
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Btn kind="outline" style={{ flex: 1 }} onPress={() => setDupWarn(null)}>Cancel</Btn>
                <Btn kind="danger" style={{ flex: 1 }} onPress={saveNext}>Overwrite</Btn>
              </View>
            </View>
          ) : null}
        </Sheet>
      </View>
    );
  }

  // ─────────────────── summary ───────────────────
  const stats = [
    { n: assigned.length, l: 'papers scanned' },
    { n: assigned.length, l: 'marks assigned' },
    { n: MS_STUDENTS.filter((s) => marks[s.id]?.q2 == null).length, l: 'still missing' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Confetti />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <PopView>
            <View style={{ width: 86, height: 86, borderRadius: 999, backgroundColor: c.goodsoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={44} stroke={2.6} color={c.good} />
            </View>
          </PopView>
          <FadeInView delay={150}><Text style={{ fontFamily: f.display, fontWeight: '700', fontSize: 24, marginTop: 18, color: c.ink, textAlign: 'center' }}>Session complete</Text></FadeInView>
          <FadeInView delay={220}><Text style={{ color: c.mute, marginTop: 6, fontSize: 12.5, fontFamily: f.body }}>Quiz 2 · Grade 9A Mathematics · 2 min 41 s</Text></FadeInView>

          <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 26 }}>
            {stats.map((s, i) => (
              <FadeInView key={i} delay={(i + 2) * 50 + 40} style={{ flex: 1 }}>
                <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: d.radius, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center' }}>
                  <AnimNumber value={s.n} duration={900} style={{ fontFamily: f.display, fontWeight: '700', fontSize: 25, color: i === 2 && s.n > 0 ? c.warn : c.primary }} />
                  <Text style={{ fontSize: 11, color: c.mute, marginTop: 2, textAlign: 'center', fontFamily: f.body }}>{s.l}</Text>
                </View>
              </FadeInView>
            ))}
          </View>

          <FadeInView delay={500} style={{ width: '100%', marginTop: 12 }}>
            <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: d.radius, overflow: 'hidden' }}>
              {assigned.map((a, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 9, paddingHorizontal: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
                  <Icon name="check" size={14} color={c.good} stroke={3} />
                  <Text style={{ flex: 1, fontWeight: '600', fontSize: 12.5, color: c.ink, fontFamily: f.body }}>{a.student.first} {a.student.last}</Text>
                  <Text style={{ fontWeight: '700', color: c.ink, fontFamily: f.body }}>{a.value}/20</Text>
                </View>
              ))}
            </View>
          </FadeInView>
        </ScrollView>
        <View style={{ padding: 16, flexDirection: 'row', gap: 10 }}>
          <Btn kind="outline" style={{ flex: 1 }} onPress={() => router.replace('/class')}>Done</Btn>
          <Btn style={{ flex: 1.3 }} icon="table" onPress={() => router.replace('/gradebook')}>Open grade book</Btn>
        </View>
      </SafeAreaView>
    </View>
  );
}

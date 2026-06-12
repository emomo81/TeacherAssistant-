// MarkScan backend — in-memory data store seeded from the PRD data models.
// This mirrors the offline-first design: the device is the source of truth, the
// server is a sync replica. Swap this module for Postgres/Supabase in production.
import { randomUUID } from 'node:crypto';

const now = () => new Date().toISOString();

// ── seed: one teacher, the demo class, students, period, components, marks ──
const teacherId = 'teacher-martha';

const profiles = [
  {
    id: teacherId,
    full_name: 'Martha Kollie',
    school_name: 'Bong County Junior High',
    school_location: 'Margibi',
    subjects: ['Mathematics', 'Science'],
    created_at: now(),
    updated_at: now(),
  },
];

const classes = [
  { id: 'c1', teacher_id: teacherId, name: 'Grade 9A Mathematics', level: 'Junior High', academic_year: '2025–2026', term: 'Third Term', is_archived: false, created_at: now(), updated_at: now() },
  { id: 'c2', teacher_id: teacherId, name: 'Grade 7B English', level: 'Junior High', academic_year: '2025–2026', term: 'Third Term', is_archived: false, created_at: now(), updated_at: now() },
  { id: 'c3', teacher_id: teacherId, name: 'Grade 8A Science', level: 'Junior High', academic_year: '2025–2026', term: 'Third Term', is_archived: false, created_at: now(), updated_at: now() },
  { id: 'c4', teacher_id: teacherId, name: 'Grade 9A Mathematics', level: 'Junior High', academic_year: '2025–2026', term: 'Second Term', is_archived: true, created_at: now(), updated_at: now() },
];

const STUDENT_SEED = [
  ['s01', '001', 'Moses', 'Kollie', { cw: 9, q1: 17, asg: 16, mid: 41, ex: 78 }],
  ['s02', '002', 'Grace', 'Pewee', { cw: 10, q1: 19, q2: 18, asg: 18, mid: 46, ex: 88 }],
  ['s03', '003', 'Joseph', 'Kanneh', { cw: 7, q1: 12, asg: 13, mid: 30, ex: 55 }],
  ['s04', '004', 'Princess', 'Doe', { cw: 8, q1: 15, q2: 14, asg: 15, mid: 38, ex: 71 }],
  ['s05', '005', 'Emmanuel', 'Togba', { cw: 9, q1: 16, asg: 17, mid: 43, ex: 80 }],
  ['s06', '006', 'Mercy', 'Flomo', { cw: 10, q1: 18, q2: 17, asg: 19, mid: 47, ex: 91 }],
  ['s07', '007', 'Abraham', 'Sirleaf', { cw: 6, q1: 11, asg: 12, mid: 27, ex: 49 }],
  ['s08', '008', 'Patience', 'Weah', { cw: 9, q1: 14, asg: 16, mid: 36, ex: 69 }],
  ['s09', '009', 'Samuel', 'Gaye', { cw: 8, q1: 13, q2: 12, asg: 14, mid: 33, ex: 61 }],
  ['s10', '010', 'Comfort', 'Nyemah', { cw: 9, q1: 17, asg: 18, mid: 44, ex: 83 }],
  ['s11', '011', 'Isaac', 'Mulbah', { cw: 7, q1: 10, asg: 11, mid: 25, ex: 44 }],
  ['s12', '012', 'Esther', 'Tarr', { cw: 10, q1: 18, asg: 17, mid: 45, ex: 86 }],
  ['s13', '013', 'Daniel', 'Freeman', { cw: 8, q1: 15, asg: 15, mid: 37, ex: 66 }],
  ['s14', '014', 'Blessing', 'Karnley', { cw: 9, q1: 16, q2: 15, asg: 16, mid: 40, ex: 74 }],
  ['s15', '015', 'Victor', 'Paye', { cw: 7, q1: 13, asg: 13, mid: 31, ex: 58 }],
  ['s16', '016', 'Felicia', 'Dukuly', { cw: 9, q1: 17, asg: 17, mid: 42, ex: 79 }],
];

const students = STUDENT_SEED.map(([id, roll, first, last]) => ({
  id, class_id: 'c1', roll_number: roll, first_name: first, last_name: last, created_at: now(), updated_at: now(),
}));

const periods = [
  { id: 'p1', class_id: 'c1', name: 'Third Term', pass_threshold: 60.0, calc_method: 'weighted', is_locked: false, created_at: now() },
];

const COMPONENT_SEED = [
  ['cw', 'Classwork', 10, 10, 0],
  ['q1', 'Quiz 1', 20, 10, 1],
  ['q2', 'Quiz 2', 20, 10, 2],
  ['asg', 'Assignment', 20, 10, 3],
  ['mid', 'Mid-Term', 50, 20, 4],
  ['ex', 'Term Exam', 100, 40, 5],
];

const components = COMPONENT_SEED.map(([id, name, max, weight, order]) => ({
  id, period_id: 'p1', name, max_mark: max, weight, display_order: order, created_at: now(),
}));

// marks: flattened from seed (skip q2 where missing — the scan target)
const marks = [];
const markHistory = [];
STUDENT_SEED.forEach(([sid, , , , m]) => {
  for (const [cid, raw] of Object.entries(m)) {
    marks.push({
      id: randomUUID(),
      student_id: sid,
      component_id: cid,
      raw_mark: raw,
      is_override: false,
      override_note: null,
      entry_method: 'import',
      ocr_confidence: null,
      created_at: now(),
      updated_at: now(),
      last_modified_at: now(),
    });
  }
});

export const db = {
  teacherId,
  profiles,
  classes,
  students,
  periods,
  components,
  marks,
  markHistory,
};

export function findMark(studentId, componentId) {
  return db.marks.find((m) => m.student_id === studentId && m.component_id === componentId);
}

// Upsert a mark with audit history (used by sync + manual edits)
export function upsertMark({ student_id, component_id, raw_mark, entry_method = 'manual', ocr_confidence = null, note = null, last_modified_at }) {
  const existing = findMark(student_id, component_id);
  const ts = last_modified_at || now();
  if (existing) {
    // last-write-wins conflict resolution
    if (new Date(ts) < new Date(existing.last_modified_at)) {
      return { mark: existing, applied: false, reason: 'stale' };
    }
    db.markHistory.push({
      id: randomUUID(), mark_id: existing.id, old_value: existing.raw_mark, new_value: raw_mark,
      changed_by: db.teacherId, change_reason: note, changed_at: now(),
    });
    existing.raw_mark = raw_mark;
    existing.entry_method = entry_method;
    existing.ocr_confidence = ocr_confidence;
    existing.is_override = entry_method === 'manual' && !!note;
    existing.override_note = note;
    existing.updated_at = now();
    existing.last_modified_at = ts;
    return { mark: existing, applied: true };
  }
  const mark = {
    id: randomUUID(), student_id, component_id, raw_mark, is_override: false, override_note: note,
    entry_method, ocr_confidence, created_at: now(), updated_at: now(), last_modified_at: ts,
  };
  db.marks.push(mark);
  db.markHistory.push({
    id: randomUUID(), mark_id: mark.id, old_value: null, new_value: raw_mark,
    changed_by: db.teacherId, change_reason: note, changed_at: now(),
  });
  return { mark, applied: true };
}

// Build the marks map { componentId: raw } for one student
export function marksFor(studentId) {
  const out = {};
  for (const m of db.marks) if (m.student_id === studentId) out[m.component_id] = m.raw_mark;
  return out;
}

export function componentsForCalc() {
  return [...db.components]
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({ id: c.id, name: c.name, max: c.max_mark, weight: c.weight }));
}

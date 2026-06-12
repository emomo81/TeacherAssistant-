// TeacherAssistant / MarkScan — demo data + calculation engine, ported from data.js
// Liberian names from the PRD. Quiz 2 (q2) is deliberately partial — today's scan target.

export type CalcMethod = 'weighted' | 'points' | 'droplow';

export interface Component {
  id: string;
  name: string;
  short: string;
  max: number;
  weight: number;
}

export interface Student {
  id: string;
  roll: string;
  first: string;
  last: string;
  marks: Record<string, number>;
}

export interface ClassInfo {
  id: string;
  name: string;
  level: string;
  term: string;
  year: string;
  students: number;
  filled: number;
  scanTarget: string | null;
  active: boolean;
}

export interface Paper {
  written: string;
  value: number | null;
  conf: number;
  ink: string;
  tilt: number;
  smudged?: boolean;
  suggest: string;
}

export const MS_COMPONENTS: Component[] = [
  { id: 'cw', name: 'Classwork', short: 'CW', max: 10, weight: 10 },
  { id: 'q1', name: 'Quiz 1', short: 'Q1', max: 20, weight: 10 },
  { id: 'q2', name: 'Quiz 2', short: 'Q2', max: 20, weight: 10 },
  { id: 'asg', name: 'Assignment', short: 'Asg', max: 20, weight: 10 },
  { id: 'mid', name: 'Mid-Term', short: 'Mid', max: 50, weight: 20 },
  { id: 'ex', name: 'Term Exam', short: 'Exam', max: 100, weight: 40 },
];

export const MS_STUDENTS: Student[] = [
  { id: 's01', roll: '001', first: 'Moses', last: 'Kollie', marks: { cw: 9, q1: 17, asg: 16, mid: 41, ex: 78 } },
  { id: 's02', roll: '002', first: 'Grace', last: 'Pewee', marks: { cw: 10, q1: 19, q2: 18, asg: 18, mid: 46, ex: 88 } },
  { id: 's03', roll: '003', first: 'Joseph', last: 'Kanneh', marks: { cw: 7, q1: 12, asg: 13, mid: 30, ex: 55 } },
  { id: 's04', roll: '004', first: 'Princess', last: 'Doe', marks: { cw: 8, q1: 15, q2: 14, asg: 15, mid: 38, ex: 71 } },
  { id: 's05', roll: '005', first: 'Emmanuel', last: 'Togba', marks: { cw: 9, q1: 16, asg: 17, mid: 43, ex: 80 } },
  { id: 's06', roll: '006', first: 'Mercy', last: 'Flomo', marks: { cw: 10, q1: 18, q2: 17, asg: 19, mid: 47, ex: 91 } },
  { id: 's07', roll: '007', first: 'Abraham', last: 'Sirleaf', marks: { cw: 6, q1: 11, asg: 12, mid: 27, ex: 49 } },
  { id: 's08', roll: '008', first: 'Patience', last: 'Weah', marks: { cw: 9, q1: 14, asg: 16, mid: 36, ex: 69 } },
  { id: 's09', roll: '009', first: 'Samuel', last: 'Gaye', marks: { cw: 8, q1: 13, q2: 12, asg: 14, mid: 33, ex: 61 } },
  { id: 's10', roll: '010', first: 'Comfort', last: 'Nyemah', marks: { cw: 9, q1: 17, asg: 18, mid: 44, ex: 83 } },
  { id: 's11', roll: '011', first: 'Isaac', last: 'Mulbah', marks: { cw: 7, q1: 10, asg: 11, mid: 25, ex: 44 } },
  { id: 's12', roll: '012', first: 'Esther', last: 'Tarr', marks: { cw: 10, q1: 18, asg: 17, mid: 45, ex: 86 } },
  { id: 's13', roll: '013', first: 'Daniel', last: 'Freeman', marks: { cw: 8, q1: 15, asg: 15, mid: 37, ex: 66 } },
  { id: 's14', roll: '014', first: 'Blessing', last: 'Karnley', marks: { cw: 9, q1: 16, q2: 15, asg: 16, mid: 40, ex: 74 } },
  { id: 's15', roll: '015', first: 'Victor', last: 'Paye', marks: { cw: 7, q1: 13, asg: 13, mid: 31, ex: 58 } },
  { id: 's16', roll: '016', first: 'Felicia', last: 'Dukuly', marks: { cw: 9, q1: 17, asg: 17, mid: 42, ex: 79 } },
];

export const MS_CLASSES: ClassInfo[] = [
  { id: 'c1', name: 'Grade 9A Mathematics', level: 'Junior High', term: 'Third Term', year: '2025–2026', students: 16, filled: 5, scanTarget: 'q2', active: true },
  { id: 'c2', name: 'Grade 7B English', level: 'Junior High', term: 'Third Term', year: '2025–2026', students: 31, filled: 31, scanTarget: null, active: true },
  { id: 'c3', name: 'Grade 8A Science', level: 'Junior High', term: 'Third Term', year: '2025–2026', students: 28, filled: 22, scanTarget: null, active: true },
  { id: 'c4', name: 'Grade 9A Mathematics', level: 'Junior High', term: 'Second Term', year: '2025–2026', students: 16, filled: 16, scanTarget: null, active: false },
];

// Scripted papers for the scan session (Quiz 2, max 20)
export const MS_PAPERS: Paper[] = [
  { written: '17', value: 17, conf: 96, ink: '#B5432F', tilt: -1.4, suggest: 's01' },
  { written: '14', value: 14, conf: 88, ink: '#1A3C8C', tilt: 1.8, suggest: 's03' },
  { written: '9', value: 9, conf: 62, ink: '#B5432F', tilt: -2.2, suggest: 's07' },
  { written: '16', value: null, conf: 31, ink: '#B5432F', tilt: 2.6, smudged: true, suggest: 's05' },
];

export type MarksState = Record<string, Record<string, number | null>>;

export interface FinalMark { value: number; complete: boolean; }

// method: 'weighted' (MOE standard) | 'points' (simple points total) | 'droplow' (drop lowest quiz)
export function msFinalMark(
  marks: Record<string, number | null>,
  comps: Component[] = MS_COMPONENTS,
  method: CalcMethod = 'weighted',
): FinalMark {
  let included = comps;
  if (method === 'droplow') {
    const quizzes = comps.filter((c) => /quiz/i.test(c.name) && marks[c.id] != null);
    if (quizzes.length > 1) {
      const lowest = quizzes.reduce(
        (lo, c) => ((marks[c.id]! / c.max) < (marks[lo.id]! / lo.max) ? c : lo),
        quizzes[0],
      );
      included = comps.filter((c) => c.id !== lowest.id);
    }
  }
  let complete = true;
  for (const c of included) if (marks[c.id] == null) complete = false;

  if (method === 'points') {
    let got = 0, max = 0;
    for (const c of included) {
      if (marks[c.id] != null) { got += marks[c.id]!; max += c.max; }
    }
    return { value: max ? Math.round((got / max) * 1000) / 10 : 0, complete };
  }

  let total = 0, wsum = 0;
  for (const c of included) {
    if (marks[c.id] == null) continue;
    total += (marks[c.id]! / c.max) * c.weight;
    wsum += c.weight;
  }
  if (method === 'droplow' && wsum > 0) total = (total / wsum) * 100;
  return { value: Math.round(total * 10) / 10, complete };
}

export function msGrade(pct: number): string {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

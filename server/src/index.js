// MarkScan backend — Express API.
// Offline-first: the device owns the data; these endpoints provide cloud backup
// (sync), the grade book read model, and export (Google Sheets / Excel) helpers.
import express from 'express';
import cors from 'cors';
import { db, upsertMark, marksFor, componentsForCalc, findMark } from './db.js';
import { finalMark, grade, sheetFormula } from './calc.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 4000;

// simple request log
app.use((req, _res, next) => { console.log(`${req.method} ${req.url}`); next(); });

// ── health ──
app.get('/health', (_req, res) => res.json({ ok: true, service: 'markscan', time: new Date().toISOString() }));

// ── auth (demo: returns the seeded teacher; real impl would use Supabase Auth) ──
app.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  res.json({
    token: 'demo-token',
    profile: db.profiles[0],
    note: 'Demo auth — wire to Supabase Auth / Google OAuth for production.',
    email: email || db.profiles[0].full_name,
  });
});

app.get('/profile', (_req, res) => res.json(db.profiles[0]));

app.patch('/profile', (req, res) => {
  Object.assign(db.profiles[0], req.body, { updated_at: new Date().toISOString() });
  res.json(db.profiles[0]);
});

// ── classes ──
app.get('/classes', (req, res) => {
  const includeArchived = req.query.archived === 'true';
  const list = db.classes.filter((c) => includeArchived || !c.is_archived);
  res.json(list);
});

app.post('/classes/:id/archive', (req, res) => {
  const cls = db.classes.find((c) => c.id === req.params.id);
  if (!cls) return res.status(404).json({ error: 'class not found' });
  cls.is_archived = true;
  cls.updated_at = new Date().toISOString();
  res.json(cls);
});

// ── students ──
app.get('/classes/:id/students', (req, res) => {
  res.json(db.students.filter((s) => s.class_id === req.params.id));
});

// CSV bulk import: { rows: [{ student_number, first_name, last_name }] }
app.post('/classes/:id/students/import', (req, res) => {
  const { rows = [] } = req.body || {};
  const errors = [];
  const added = [];
  rows.forEach((row, i) => {
    if (!row.first_name || !row.last_name) { errors.push({ row: i + 1, error: 'missing name' }); return; }
    const dup = db.students.find((s) => s.class_id === req.params.id && s.roll_number === row.student_number);
    if (dup) { errors.push({ row: i + 1, error: 'duplicate student number' }); return; }
    const s = {
      id: `s-${Date.now()}-${i}`, class_id: req.params.id, roll_number: row.student_number || null,
      first_name: row.first_name, last_name: row.last_name,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    db.students.push(s); added.push(s);
  });
  res.json({ added: added.length, errors });
});

// ── assessment periods + components ──
app.get('/classes/:id/periods', (req, res) => {
  res.json(db.periods.filter((p) => p.class_id === req.params.id));
});

app.get('/periods/:id/components', (req, res) => {
  res.json(db.components.filter((c) => c.period_id === req.params.id).sort((a, b) => a.display_order - b.display_order));
});

// validate weights total 100
app.post('/periods/:id/validate', (req, res) => {
  const comps = db.components.filter((c) => c.period_id === req.params.id);
  const total = comps.reduce((a, c) => a + c.weight, 0);
  res.json({ total, ok: total === 100 });
});

// ── marks ──
app.get('/students/:id/marks', (req, res) => {
  res.json(marksFor(req.params.id));
});

// single mark upsert (manual edit)
app.put('/marks', (req, res) => {
  const { student_id, component_id, raw_mark, entry_method, ocr_confidence, note, last_modified_at } = req.body || {};
  if (!student_id || !component_id) return res.status(400).json({ error: 'student_id and component_id required' });
  const result = upsertMark({ student_id, component_id, raw_mark, entry_method, ocr_confidence, note, last_modified_at });
  res.json(result);
});

// mark history (audit trail)
app.get('/students/:id/history', (req, res) => {
  const markIds = db.marks.filter((m) => m.student_id === req.params.id).map((m) => m.id);
  res.json(db.markHistory.filter((h) => markIds.includes(h.mark_id)));
});

// ── sync: replay the device's offline change queue (last-write-wins) ──
// body: { changes: [{ student_id, component_id, raw_mark, entry_method, ocr_confidence, note, last_modified_at }] }
app.post('/sync', (req, res) => {
  const { changes = [] } = req.body || {};
  const results = changes.map((ch) => {
    const r = upsertMark(ch);
    return { student_id: ch.student_id, component_id: ch.component_id, applied: r.applied, reason: r.reason };
  });
  const applied = results.filter((r) => r.applied).length;
  res.json({ received: changes.length, applied, conflicts: results.filter((r) => !r.applied), server_time: new Date().toISOString() });
});

// ── grade book read model (rows + stats), used by the app / exports ──
function buildGradebook(classId, method) {
  const comps = componentsForCalc();
  const studs = db.students.filter((s) => s.class_id === classId);
  const rows = studs.map((s) => {
    const m = marksFor(s.id);
    const fin = finalMark(m, comps, method);
    return {
      student_id: s.id, roll: s.roll_number, name: `${s.first_name} ${s.last_name}`,
      marks: m, final: fin.complete ? fin.value : null, grade: fin.complete ? grade(fin.value) : null, complete: fin.complete,
    };
  });
  const finals = rows.filter((r) => r.complete).map((r) => r.final);
  const avg = finals.length ? finals.reduce((a, b) => a + b, 0) / finals.length : 0;
  const stats = {
    average: Math.round(avg * 10) / 10,
    highest: finals.length ? Math.max(...finals) : 0,
    lowest: finals.length ? Math.min(...finals) : 0,
    pass_rate: finals.length ? Math.round((finals.filter((f) => f >= 60).length / finals.length) * 100) : 0,
  };
  return { components: comps, rows, stats };
}

app.get('/classes/:id/gradebook', (req, res) => {
  const method = req.query.method || 'weighted';
  res.json(buildGradebook(req.params.id, method));
});

// ── export: Google Sheets (returns the sheet payload the app would POST to Sheets API) ──
app.post('/classes/:id/export/sheets', (req, res) => {
  const method = req.query.method || 'weighted';
  const gb = buildGradebook(req.params.id, method);
  const header = ['Roll No', 'Student Name', ...gb.components.map((c) => c.name), 'Final Mark', 'Grade'];
  const rows = gb.rows.map((r, i) => {
    const rowIndex = i + 2; // row 1 is the header
    const compCells = gb.components.map((c) => (r.marks[c.id] ?? ''));
    return {
      cells: [r.roll, r.name, ...compCells],
      final_formula: sheetFormula(gb.components, rowIndex),
      grade_formula: `=IF(${cellRef(gb.components.length + 2, rowIndex)}>=90,"A",IF(${cellRef(gb.components.length + 2, rowIndex)}>=80,"B",IF(${cellRef(gb.components.length + 2, rowIndex)}>=70,"C",IF(${cellRef(gb.components.length + 2, rowIndex)}>=60,"D","F"))))`,
    };
  });
  res.json({
    spreadsheet_name: `${db.profiles[0].school_name} — Grade Book`,
    sheet_tab: 'G9A Math · Term 3',
    header,
    rows,
    note: 'Formulas are written as real Google Sheets formulas so teachers can verify the logic.',
  });
});

// ── export: Excel (returns a simple value matrix; app turns it into .xlsx offline) ──
app.post('/classes/:id/export/excel', (req, res) => {
  const method = req.query.method || 'weighted';
  const gb = buildGradebook(req.params.id, method);
  const header = ['Roll No', 'Student Name', ...gb.components.map((c) => c.name), 'Final Mark', 'Grade'];
  const matrix = [header, ...gb.rows.map((r) => [r.roll, r.name, ...gb.components.map((c) => r.marks[c.id] ?? ''), r.final ?? '', r.grade ?? ''])];
  res.json({ filename: 'G9A_Math_Term3.xlsx', matrix });
});

// helper: A1 column reference for a 0-based column index
function cellRef(colIndex, rowIndex) {
  return String.fromCharCode('A'.charCodeAt(0) + colIndex) + rowIndex;
}

app.use((req, res) => res.status(404).json({ error: 'not found', path: req.url }));

app.listen(PORT, () => {
  console.log(`MarkScan API listening on http://localhost:${PORT}`);
  console.log(`  GET  /health`);
  console.log(`  GET  /classes  ·  GET /classes/c1/gradebook  ·  POST /sync`);
});

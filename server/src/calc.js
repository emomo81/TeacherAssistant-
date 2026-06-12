// MarkScan backend — final-mark calculation engine (mirrors the mobile app's data.ts)

// method: 'weighted' (MOE standard) | 'points' | 'droplow'
export function finalMark(marks, comps, method = 'weighted') {
  let included = comps;
  if (method === 'droplow') {
    const quizzes = comps.filter((c) => /quiz/i.test(c.name) && marks[c.id] != null);
    if (quizzes.length > 1) {
      const lowest = quizzes.reduce(
        (lo, c) => (marks[c.id] / c.max < marks[lo.id] / lo.max ? c : lo),
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
      if (marks[c.id] != null) { got += marks[c.id]; max += c.max; }
    }
    return { value: max ? Math.round((got / max) * 1000) / 10 : 0, complete };
  }

  let total = 0, wsum = 0;
  for (const c of included) {
    if (marks[c.id] == null) continue;
    total += (marks[c.id] / c.max) * c.weight;
    wsum += c.weight;
  }
  if (method === 'droplow' && wsum > 0) total = (total / wsum) * 100;
  return { value: Math.round(total * 10) / 10, complete };
}

// Liberian A–F grading scale (60% MOE pass threshold)
export function grade(pct) {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

// Build a Google-Sheets style final-mark formula string for a student row (1-based row index)
// comps map to columns C, D, E ... ; final formula references those cells.
export function sheetFormula(comps, rowIndex) {
  const startCol = 'C'.charCodeAt(0);
  const parts = comps.map((c, i) => {
    const col = String.fromCharCode(startCol + i);
    return `(${col}${rowIndex}/${c.max}*${c.weight}%)`;
  });
  return '=' + parts.join('+');
}

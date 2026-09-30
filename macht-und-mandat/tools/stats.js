/* Kombinatorik- und Simulationsbericht für den Ereignis-Generator.  node tools/stats.js */
'use strict';
const G = require('./eventgen');
const fmt = n => n.toLocaleString('de-DE');

console.log('## A. Pool-Größen\n');
console.log('| Pool | Größe |\n|---|---:|');
for (const k of Object.keys(G.POOLS)) console.log(`| ${k} | ${fmt(G.poolSize(k))} |`);

console.log('\n## B. Kombinatorik je Template (Auszug + Summen)\n');
let rows = G.TEMPLATES.map(t => ({ id: t.id, kat: t.kat, ...G.combos(t) }));
const tvMin = Math.min(...rows.map(r => r.textVariants));
const slotMean = rows.reduce((a, r) => a + r.slotProduct, 0) / rows.length;
const logMean = Math.exp(rows.reduce((a, r) => a + Math.log(r.total), 0) / rows.length);
const sum50 = rows.reduce((a, r) => a + r.total, 0);
console.log(`Templates: ${rows.length}; Textvarianten je Template (min): ${tvMin}; Ø Slot-Produkt: ${slotMean.toExponential(2)}; geometr. Mittel Gesamtvarianten: ${logMean.toExponential(2)}; Summe (50): ${sum50.toExponential(2)}`);
console.log('\n| Kategorie | Templates | Ø Textvarianten | Ø Slots | kleinste Gesamtzahl |\n|---|---:|---:|---:|---:|');
const byKat = {};
rows.forEach(r => (byKat[r.kat] = byKat[r.kat] || []).push(r));
for (const [k, v] of Object.entries(byKat)) {
  const tv = v.reduce((a, r) => a + r.textVariants, 0) / v.length;
  const sl = v.reduce((a, r) => a + r.slots.length, 0) / v.length;
  const mn = Math.min(...v.map(r => r.total));
  console.log(`| ${k} | ${v.length} | ${tv.toFixed(1)} | ${sl.toFixed(1)} | ${mn.toExponential(1)} |`);
}

console.log('\n## C. Konservative Zählung (Wahrnehmungs-Deckel)\n');
// Ein Spieler nimmt zwei Slot-Werte als „verschieden“ wahr, wenn sie sich im Sichtbaren unterscheiden.
// Wir deckeln daher jeden Pool auf CAP verschiedene Werte und zählen höchstens 2 Slots je Template.
for (const cap of [3, 5, 10]) {
  let tot = 0;
  for (const t of G.TEMPLATES) {
    const used = G.slotNames(t).map(s => Math.min(cap, G.poolSize(t.slots[s]))).sort((a, b) => b - a).slice(0, 2);
    tot += t.a.length * t.z.length * used.reduce((a, b) => a * b, 1);
  }
  console.log(`CAP=${cap}: ${fmt(tot)} wahrnehmbar verschiedene Ereignisse aus nur ${G.TEMPLATES.length} Templates (Ø ${fmt(Math.round(tot / G.TEMPLATES.length))} je Template)`);
}

console.log('\n## D. 20-Stunden-Simulation (nur 50 Templates = Worst Case)\n');
function sim(label, N, opt) {
  const gen = G.create(opt.seed || 7);
  const S = { tag: 0, amt: opt.amt || 2, jahresthema: 'Wohnen', saldo: 0, parteiTags: ['Wirtschaft'], noFair: !!opt.noFair };
  const rr = G.rng((opt.seed || 7) + 99);
  let sigDup = 0, tplRepeatGap = [], last = {}, luckSeries = [], n = 0, texts = new Set();
  for (let i = 0; i < N; i++) {
    S.tag += 1 + Math.floor(rr() * 3);
    if (opt.amtGrow && i % 200 === 199) S.amt = Math.min(11, S.amt + 1);
    const ev = gen.next(S); if (!ev) continue; n++;
    if (texts.has(ev.text)) sigDup++; texts.add(ev.text);
    if (last[ev.id] !== undefined) tplRepeatGap.push(i - last[ev.id]); last[ev.id] = i;
    const oi = Math.floor(rr() * ev.optionen.length);
    gen.decide(S, ev, oi);
    luckSeries.push(gen.roll(S, 0.5) ? 1 : -1);
  }
  tplRepeatGap.sort((a, b) => a - b);
  const med = tplRepeatGap[Math.floor(tplRepeatGap.length / 2)];
  const p5 = tplRepeatGap[Math.floor(tplRepeatGap.length * 0.05)];
  // Glück-Fairness: Fenster à 50 Würfe, Anteil „Strähnenfenster“ (|Summe| > 10, also > 60 % Glück oder Pech)
  let win = 0, streak = 0, maxRun = 0, run = 0, prev = 0;
  for (let i = 0; i + 50 <= luckSeries.length; i += 50) { const s = luckSeries.slice(i, i + 50).reduce((a, b) => a + b, 0); win++; if (Math.abs(s) > 10) streak++; }
  luckSeries.forEach(x => { run = x === prev ? run + 1 : 1; prev = x; maxRun = Math.max(maxRun, run); });
  const okShare = luckSeries.filter(x => x > 0).length / luckSeries.length;
  console.log(`${label}: ${n} Ereignisse | identische Volltexte: ${sigDup} | Template-Wiederkehr: Median ${med} Ereignisse, 5 %-Perzentil ${p5} | Glücksanteil ${(okShare * 100).toFixed(1)} % | längste Strähne ${maxRun} | Strähnenfenster ${streak}/${win}`);
}
sim('20 h, Kommune→Bund (Wachstum), mit Fairness', 1800, { amtGrow: true });
sim('20 h, Kommune→Bund (Wachstum), ohne Fairness', 1800, { amtGrow: true, noFair: true });
sim('20 h, nur Bund-Ebene, mit Fairness', 1800, { amt: 8 });
sim('100 h Dauertest, Kommune→Bund', 9000, { amtGrow: true, seed: 3 });

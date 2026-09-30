/* Rechenbeispiele für die Dokumentation:  node tools/examples.js
 *  1) Sainte-Laguë/Schepers mit 5-%-Hürde und Grundmandatsklausel
 *  2) Modus „Klassik“: Überhang- und Ausgleichsmandate (vereinfacht)
 *  3) Wählerwanderung per Iterative Proportional Fitting (IPF/RAS) als Sankey-Datengrundlage
 */
'use strict';
const sl = (votes, seats) => { const r = {}; Object.keys(votes).forEach(p => r[p] = 0); for (let i = 0; i < seats; i++) { let b = null, bv = -1; for (const p in votes) { const q = votes[p] / (r[p] + .5); if (q > bv) { bv = q; b = p; } } r[b]++; } return r; };

console.log('### 1) Sitzverteilung (Modus „Reform“: feste Größe, Zweitstimmendeckung)\n');
const V = { CDU: 24.0, SPD: 17.0, AfD: 19.0, Grüne: 12.0, FDP: 4.6, Linke: 4.4, BSW: 4.2, Sonstige: 14.8 };
const DM = { CDU: 88, SPD: 40, AfD: 75, Grüne: 14, FDP: 0, Linke: 3, BSW: 0, Sonstige: 0 }; // Direktmandate (299 Wahlkreise)
const elig = {}; const why = {};
for (const p in V) { if (p === 'Sonstige') continue; if (V[p] >= 5) { elig[p] = V[p]; why[p] = '≥ 5 %'; } else if (DM[p] >= 3) { elig[p] = V[p]; why[p] = `Grundmandatsklausel (${DM[p]} Direktmandate)`; } else why[p] = '**scheitert** (' + V[p] + ' %, ' + DM[p] + ' Direktmandate)'; }
const tot = Object.values(elig).reduce((a, b) => a + b, 0);
const seats = sl(elig, 630);
console.log('| Partei | Zweitstimmen | Direktmandate | Hürde | Sitze (630) |\n|---|--:|--:|---|--:|');
for (const p in V) { if (p === 'Sonstige') continue; console.log(`| ${p} | ${V[p].toFixed(1)} % | ${DM[p]} | ${why[p]} | ${seats[p] || 0} |`); }
console.log(`\nBerücksichtigte Stimmen: ${tot.toFixed(1)} % → Divisor ≈ ${(tot / 630).toFixed(4)} Prozentpunkte je Sitz. Mehrheit ab 316 Sitzen.`);
const dmOver = Object.keys(elig).filter(p => DM[p] > (seats[p] || 0));
console.log('Direktmandate über Zweitstimmen-Sitzzahl (würden in „Reform“ entfallen): ' + (dmOver.length ? dmOver.join(', ') : 'keine'));

console.log('\n### 2) Modus „Klassik“ (vereinfacht): Überhang + Ausgleich – Mini-Beispiel (Landtag, 100 Sitze, 50 Wahlkreise)\n');
const V2 = { A: 37.0, B: 27.0, C: 19.0, D: 11.0, E: 6.0 };
const DM2 = { A: 41, B: 6, C: 3, D: 0, E: 0 };
const base = sl(V2, 100);
const over = {}; Object.keys(V2).forEach(p => { if ((DM2[p] || 0) > base[p]) over[p] = DM2[p] - base[p]; });
let N = 100, res = base; while (Object.keys(V2).some(p => (DM2[p] || 0) > res[p])) { N++; res = sl(V2, N); }
const naive = Object.assign({}, base); Object.keys(over).forEach(p => naive[p] = DM2[p]);
console.log('| Partei | Zweitstimmen | Sitze nach Zweitstimmen (100) | Direktmandate | Überhang | Sitze nur mit Überhang | Sitze mit Ausgleich |\n|---|--:|--:|--:|--:|--:|--:|');
Object.keys(V2).forEach(p => console.log(`| ${p} | ${V2[p].toFixed(0)} % | ${base[p]} | ${DM2[p]} | ${over[p] || 0} | ${naive[p]} | ${res[p]} |`));
console.log(`\nOhne Ausgleich hätte Partei A einen Bonus von ${Object.values(over).reduce((a, b) => a + b, 0)} Sitzen; mit Ausgleich wächst das Parlament von 100 auf **${N}** Sitze (+${N - 100}). Im Bundestag-Maßstab (630 Sitze) führt das bei knappen Erststimmen-Vorsprüngen schnell zu dreistelligen Zuwächsen – genau diesen Aufblähungs-Effekt soll der Schalter erlebbar machen. Standard bleibt „Reform“ (feste Größe).`);
console.log('\n### 3) Wählerwanderung (Sankey-Daten) per IPF\n');
const P = ['CDU', 'SPD', 'AfD', 'Grüne', 'Linke', 'Nicht', 'Sonst'];
const prev = { CDU: 24.0, SPD: 17.0, AfD: 19.0, Grüne: 12.0, Linke: 7.0, Nicht: 14.0, Sonst: 7.0 };       // letzte Wahl (inkl. Nichtwähler)
const now =  { CDU: 22.0, SPD: 15.5, AfD: 21.0, Grüne: 13.0, Linke: 8.0, Nicht: 13.5, Sonst: 7.0 };        // aktuelle Umfrage
// Prior: „Verwandtschaft“ (Übergangsneigung), Diagonale = Treue
const prior = {
  CDU:   { CDU: 12, SPD: .6, AfD: 1.2, Grüne: .4, Linke: .05, Nicht: .8, Sonst: .4 },
  SPD:   { CDU: .4, SPD: 10, AfD: .8, Grüne: 1.2, Linke: 1.0, Nicht: .8, Sonst: .3 },
  AfD:   { CDU: .3, SPD: .2, AfD: 14, Grüne: .02, Linke: .1, Nicht: .8, Sonst: .3 },
  Grüne: { CDU: .2, SPD: 1.0, AfD: .05, Grüne: 10, Linke: .8, Nicht: .5, Sonst: .4 },
  Linke: { CDU: .05, SPD: 1.0, AfD: .6, Grüne: .6, Linke: 8, Nicht: .8, Sonst: .4 },
  Nicht: { CDU: .8, SPD: .6, AfD: 1.4, Grüne: .5, Linke: .5, Nicht: 10, Sonst: .4 },
  Sonst: { CDU: .4, SPD: .3, AfD: .6, Grüne: .4, Linke: .3, Nicht: .8, Sonst: 6 }
};
let M = {}; P.forEach(i => { M[i] = {}; P.forEach(j => M[i][j] = prior[i][j] * prev[i] / 10); });
for (let it = 0; it < 200; it++) {
  P.forEach(i => { const rs = P.reduce((a, j) => a + M[i][j], 0); P.forEach(j => M[i][j] *= prev[i] / rs); });   // Zeilen = alte Anteile
  P.forEach(j => { const cs = P.reduce((a, i) => a + M[i][j], 0); P.forEach(i => M[i][j] *= now[j] / cs); });   // Spalten = neue Anteile
}
const flows = []; P.forEach(i => P.forEach(j => { if (i !== j) flows.push([i, j, M[i][j]]); }));
flows.sort((a, b) => b[2] - a[2]);
console.log('Größte Wanderungen (Prozentpunkte der Wahlberechtigten):\n');
console.log('| Von | Nach | Fluss |\n|---|---|--:|');
flows.slice(0, 8).forEach(f => console.log(`| ${f[0]} | ${f[1]} | ${f[2].toFixed(2)} pp |`));
const loyal = P.map(p => `${p}: ${(M[p][p] / prev[p] * 100).toFixed(0)} %`).join(' · ');
console.log(`\nTreue (Anteil, der bei der Partei bleibt): ${loyal}`);

console.log('\n### 4) Verhandlungsmacht: Shapley-Shubik-Index (gewichtetes Mehrheitsspiel, Quote 316)\n');
function shapley(w, quota) {
  const names = Object.keys(w), idx = {}; names.forEach(k => idx[k] = 0);
  const perm = a => a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p]));
  const all = perm(names);
  for (const p of all) { let s = 0; for (const k of p) { s += w[k]; if (s >= quota) { idx[k]++; break; } } }
  names.forEach(k => idx[k] /= all.length); return idx;
}
const rows = [
  ['Union + SPD + Grüne', { Union: 198, SPD: 140, Grüne: 99 }],
  ['Union + Grüne + FDP', { Union: 198, Grüne: 99, FDP: 40 }],
  ['Union + SPD + FDP', { Union: 198, SPD: 140, FDP: 40 }],
  ['SPD + Grüne + Linke (knapp)', { SPD: 140, Grüne: 99, Linke: 80 }]
];
console.log('| Koalition | Sitze | Sitzanteile | Shapley-Shubik (Verhandlungsmacht) |\n|---|--:|---|---|');
rows.forEach(([n, w]) => { const t = Object.values(w).reduce((a, b) => a + b, 0), q = t >= 316 ? 316 : 316; const ss = shapley(w, q); console.log(`| ${n} | ${t}${t < 316 ? ' (keine Mehrheit)' : ''} | ${Object.entries(w).map(([k, v]) => k + ' ' + (v / t * 100).toFixed(0) + ' %').join(' · ')} | ${t >= 316 ? Object.entries(ss).map(([k, v]) => k + ' ' + (v * 100).toFixed(0) + ' %').join(' · ') : '–'} |`); });
console.log('\n**Lesart:** Nicht der Sitzanteil, sondern die *Mehrheitsrelevanz* bestimmt die Macht. Sind **alle** Partner für die Mehrheit nötig (Union + Grüne + FDP: Union + Grüne = 297 < 316), hat jeder – auch die kleine FDP – **gleiche** Verhandlungsmacht (je 33 %). Reichen dagegen zwei Partner schon aus (Union + SPD = 338), ist der dritte **überzählig** (Grüne / FDP: 0 %) – er kann nur durch Drohungen (Bündniswechsel) oder Sachthemen Gewicht gewinnen.');
console.log('\n### 5) Ministerienverteilung (Ressortwerte × Sainte-Laguë)\n');
const RES = { Finanzen: 10, Außen: 9, Inneres: 8, Wirtschaft: 8, 'Arbeit & Soziales': 8, Verteidigung: 6, Gesundheit: 6, Verkehr: 5, Umwelt: 5, Bildung: 5, Justiz: 5, Bauen: 4, Digitales: 4, Landwirtschaft: 3 };
const total = Object.values(RES).reduce((a, b) => a + b, 0);
const pref = { CDU: ['Finanzen', 'Wirtschaft', 'Inneres', 'Verteidigung', 'Landwirtschaft', 'Verkehr', 'Bauen', 'Justiz'], SPD: ['Arbeit & Soziales', 'Außen', 'Bauen', 'Gesundheit', 'Bildung', 'Justiz'], Grüne: ['Umwelt', 'Wirtschaft', 'Verkehr', 'Außen', 'Digitales', 'Bildung'] };
const weights = { CDU: 198, SPD: 140, Grüne: 99 };
const claim = {}; const W = Object.values(weights).reduce((a, b) => a + b, 0);
Object.keys(weights).forEach(k => claim[k] = 0);
const left = new Set(Object.keys(RES)); const got = { CDU: [], SPD: [], Grüne: [] }; const pts = { CDU: 0, SPD: 0, Grüne: 0 };
// Kanzleramt-Bonus: Kanzlerpartei erhält 8 „Richtlinien-Punkte“ vorab
pts.CDU += 8;
while (left.size) {
  // Sainte-Laguë-Rang: Anspruch = Sitze / (2·Punkte_abgegeben/Punkte_je_Ministerium + 1)
  const order = Object.keys(weights).sort((a, b) => (weights[b] / (2 * pts[b] / (total / W * 1) / 10 + 1)) - (weights[a] / (2 * pts[a] / (total / W * 1) / 10 + 1)));
  let picked = false;
  for (const p of order) { const r = pref[p].find(x => left.has(x)) || [...left][0]; if (!r) continue; left.delete(r); got[p].push(r); pts[p] += RES[r]; picked = true; break; }
  if (!picked) break;
}
console.log('| Partner | Sitzanteil | Soll-Punkte (86 + 8) | Ist-Punkte | Ministerien |\n|---|--:|--:|--:|---|');
Object.keys(weights).forEach(p => console.log(`| ${p} | ${(weights[p] / W * 100).toFixed(0)} % | ${((weights[p] / W) * (total + 8)).toFixed(1)} | ${pts[p]} | ${got[p].join(', ')} |`));
console.log(`\nRessortwerte (Summe ${total}): ${Object.entries(RES).map(([k, v]) => k + ' ' + v).join(' · ')}. Die Kanzlerpartei erhält vorab 8 Richtlinien-Punkte (Kanzleramt). Die Abweichung Ist/Soll ist die *Unzufriedenheit*, die in die Koalitionsstabilität einfließt.`);

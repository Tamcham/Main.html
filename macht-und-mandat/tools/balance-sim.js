/* Monte-Carlo-Balancing: Umfragen -> Wahlergebnis -> Sitze -> Mehrheiten.  node tools/balance-sim.js [N]
 * Modell (siehe docs/05-bundestag-umfragen.md und docs/07-balancing.md):
 *   S_p(t+1) = S_p(t) + k (T_p(t) - S_p(t)) + eps,  T_p = B_p + Z_p(t) + E_p(t) - Regierungsmalus
 *   Sitzverteilung: Sainte-Laguë/Schepers, 5 %-Hürde oder 3 Grundmandate, 630 Sitze (Zweitstimmendeckung)
 */
'use strict';
const { rng } = require('./eventgen');
const N = parseInt(process.argv[2] || '20000', 10);
const r = rng(20260930);
const gauss = () => { let u = 0, v = 0; while (!u) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

const P = ['CDU', 'CSU', 'SPD', 'AFD', 'GRUENE', 'FDP', 'LINKE', 'BSW', 'SONST'];
const BASE = { CDU: 20.5, CSU: 5.5, SPD: 16.5, AFD: 21.0, GRUENE: 12.0, FDP: 4.5, LINKE: 6.5, BSW: 4.0, SONST: 9.5 }; // fiktive Ausgangslage, Summe 100
const CONC = { CDU: 1.0, CSU: 5.0, SPD: 1.0, AFD: 1.35, GRUENE: 1.0, FDP: 0.35, LINKE: 1.7, BSW: 0.5, SONST: 0.05 }; // regionale Konzentration -> Direktmandate
const SIGMA_Z = { CDU: .30, CSU: .12, SPD: .30, AFD: .34, GRUENE: .28, FDP: .22, LINKE: .22, BSW: .26, SONST: .18 }; // wöchentlicher Zeitgeist-Schock (pp)
const SKANDAL = { AFD: 1.4, FDP: 1.1, BSW: 1.2, CDU: 1, CSU: 1, SPD: 1, GRUENE: 1, LINKE: 1, SONST: 1 };
const GOV = { CDU: 1, SPD: 1, CSU: 1 }; // Start: Große Koalition
const WEEKS = 208, K = 0.15;

function pathFinal() {
  const S = { ...BASE }, Z = {}; P.forEach(p => Z[p] = 0);
  const E = {}; P.forEach(p => E[p] = 0);
  for (let t = 0; t < WEEKS; t++) {
    let sumZ = 0;
    P.forEach(p => { Z[p] = 0.97 * Z[p] + SIGMA_Z[p] * Math.sqrt(BASE[p] / 15) * gauss(); sumZ += Z[p]; });
    P.forEach(p => { Z[p] -= sumZ / P.length; });                         // Nullsummen-Zeitgeist
    if (r() < 0.05) { // Ereignis-Schock
      const p = P[Math.floor(r() * (P.length - 1))];
      const neg = r() < 0.55 ? -1 : 1;
      E[p] += neg * (1.2 + 2.6 * r()) * Math.sqrt(BASE[p] / 15) * (neg < 0 ? SKANDAL[p] : 1);
    }
    let sumT = 0;
    const T = {};
    // relativer Regierungsmalus, max. 14 %
    P.forEach(p => { E[p] *= 0.93; const gov = GOV[p] ? -BASE[p] * Math.min(0.14, 0.0007 * t) : 0; T[p] = BASE[p] + Z[p] + E[p] + gov; sumT += T[p]; });
    P.forEach(p => { T[p] *= 100 / sumT; S[p] += K * (T[p] - S[p]) + 0.05 * gauss(); });
  }
  return S;
}

function norm(S) { const s = P.reduce((a, p) => a + Math.max(0.1, S[p]), 0); const o = {}; P.forEach(p => o[p] = Math.max(0.1, S[p]) * 100 / s); return o; }

function sainteLague(votes, seats) {
  const ps = Object.keys(votes); const res = {}; ps.forEach(p => res[p] = 0);
  for (let i = 0; i < seats; i++) { let best = null, bv = -1; for (const p of ps) { const q = votes[p] / (res[p] + 0.5); if (q > bv) { bv = q; best = p; } } res[best]++; }
  return res;
}

function election(S0, delta) {
  // Wahltag: Umfragefehler + Spätentscheider
  const S = {}; P.forEach(p => S[p] = S0[p] + (p === 'SONST' ? 0.6 : 1.3) * gauss() + (delta[p] || 0));
  const V = norm(S);
  // Direktmandate (299): Anteil ~ share^3 * Konzentration
  const d = {}; let ds = 0; P.forEach(p => { d[p] = Math.pow(V[p], 3) * CONC[p]; ds += d[p]; });
  const direct = {}; P.forEach(p => direct[p] = Math.round(299 * d[p] / ds));
  const elig = {};
  P.filter(p => p !== 'SONST').forEach(p => { if (V[p] >= 5 || direct[p] >= 3) elig[p] = V[p]; });
  const seats = sainteLague(elig, 630);
  return { V, seats, direct };
}

const FR = ['UNION', 'SPD', 'AFD', 'GRUENE', 'FDP', 'LINKE', 'BSW'];
const HARD = [['AFD', '*'], ['UNION', 'LINKE'], ['FDP', 'LINKE'], ['BSW', 'GRUENE'], ['BSW', 'FDP']];
function compatible(set, brandmauer = true) {
  for (const a of set) for (const b of set) {
    if (a >= b) continue;
    for (const [x, y] of HARD) {
      if (!brandmauer && x === 'AFD') continue;
      if ((x === a && (y === b || y === '*')) || (x === b && (y === a || y === '*'))) return false;
    }
  }
  return true;
}
function coalitions(res, brandmauer = true) {
  const s = { UNION: (res.seats.CDU || 0) + (res.seats.CSU || 0), SPD: res.seats.SPD || 0, AFD: res.seats.AFD || 0, GRUENE: res.seats.GRUENE || 0, FDP: res.seats.FDP || 0, LINKE: res.seats.LINKE || 0, BSW: res.seats.BSW || 0 };
  const out = [];
  for (let m = 1; m < (1 << FR.length); m++) {
    const set = FR.filter((_, i) => m & (1 << i));
    const seats = set.reduce((a, f) => a + s[f], 0);
    if (seats < 316) continue;
    if (!compatible(set, brandmauer)) continue;
    // minimal: Entfernen jeder Partei bricht die Mehrheit
    if (set.some(f => seats - s[f] >= 316)) continue;
    const chancellor = set.reduce((b, f) => s[f] > s[b] ? f : b, set[0]);
    out.push({ set, seats, chancellor });
  }
  return { s, out };
}

/* ---- Lauf ---- */
const finals = []; for (let i = 0; i < N; i++) finals.push(pathFinal());
const fmt = x => (x * 100).toFixed(1) + ' %';

// 1. Verteilung der Parteistärken nach 4 Jahren ohne Spielereinfluss
console.log('## 1. Verteilung der Zweitstimmenanteile nach 4 Jahren (ohne Spieler), N=' + N + '\n');
console.log('| Partei | Start | Ø Ergebnis | 10 %-Quantil | 90 %-Quantil | P(< 5 %) | P(stärkste Kraft) |\n|---|---:|---:|---:|---:|---:|---:|');
const resAll = finals.map(f => election(f, {}));
for (const p of P.filter(x => x !== 'SONST')) {
  const v = resAll.map(x => x.V[p]).sort((a, b) => a - b);
  const below = v.filter(x => x < 5).length / N;
  const strongest = resAll.filter(x => { const u = (x.V.CDU + x.V.CSU); const m = { UNION: u, SPD: x.V.SPD, AFD: x.V.AFD, GRUENE: x.V.GRUENE, LINKE: x.V.LINKE, FDP: x.V.FDP, BSW: x.V.BSW }; const pp = p === 'CDU' || p === 'CSU' ? 'UNION' : p; return Object.keys(m).every(k => m[pp] >= m[k]); }).length / N;
  console.log(`| ${p} | ${BASE[p].toFixed(1)} | ${(v.reduce((a, b) => a + b, 0) / N).toFixed(1)} | ${v[Math.floor(N * .1)].toFixed(1)} | ${v[Math.floor(N * .9)].toFixed(1)} | ${fmt(below)} | ${p === 'CSU' ? '(mit CDU)' : fmt(strongest)} |`);
}

// 2. Parlamentsstruktur
console.log('\n## 2. Parlamentsstruktur (ohne Spieler)\n');
const nParties = resAll.map(x => Object.keys(x.seats).filter(k => x.seats[k] > 0).length);
const hist = {}; nParties.forEach(n => hist[n] = (hist[n] || 0) + 1);
console.log('Fraktionen (Parteien) im Bundestag: ' + Object.keys(hist).sort().map(k => `${k}: ${fmt(hist[k] / N)}`).join(' | '));
for (const bm of [true, false]) {
  const cs = resAll.map(x => coalitions(x, bm));
  const none = cs.filter(c => c.out.length === 0).length / N;
  const two = cs.filter(c => c.out.some(o => o.set.length === 2)).length / N;
  const three = cs.filter(c => c.out.some(o => o.set.length === 3)).length / N;
  const onlyThree = cs.filter(c => c.out.length && !c.out.some(o => o.set.length === 2)).length / N;
  const avgOptions = cs.reduce((a, c) => a + c.out.length, 0) / N;
  console.log(`Kooperationssperre (Brandmauer) ${bm ? 'AN ' : 'AUS'}: keine Mehrheit ${fmt(none)} | Zweierbündnis möglich ${fmt(two)} | Dreierbündnis nötig ${fmt(onlyThree)} | Ø Koalitionsoptionen ${avgOptions.toFixed(2)}`);
}

// 3. Spielerwirkung: Kampagnen-Bonus D (pp) für die Spielerpartei, Mehrheit durch Partner-Pool
console.log('\n## 3. Wie stark muss der Spieler sein? (Kampagnen-Bonus in Prozentpunkten zusätzlich)\n');
console.log('| Partei | Δ = 0 pp: stärkste Kraft / Regierung / Kanzler | Δ = +3 pp | Δ = +6 pp | Δ = +9 pp |\n|---|---|---|---|---|');
const map = { CDU: 'UNION', CSU: 'UNION', SPD: 'SPD', AFD: 'AFD', GRUENE: 'GRUENE', FDP: 'FDP', LINKE: 'LINKE', BSW: 'BSW' };
const M = Math.min(N, 6000);
for (const p of ['CDU', 'CSU', 'SPD', 'AFD', 'GRUENE', 'FDP', 'LINKE', 'BSW']) {
  const cells = [];
  for (const d of [0, 3, 6, 9]) {
    let strongest = 0, gov = 0, chan = 0;
    for (let i = 0; i < M; i++) {
      const delta = { [p]: d }; // Gegner verlieren anteilig durch Normalisierung
      const res = election(finals[i], delta);
      const c = coalitions(res, true);
      const f = map[p];
      const u = { UNION: res.V.CDU + res.V.CSU, SPD: res.V.SPD, AFD: res.V.AFD, GRUENE: res.V.GRUENE, LINKE: res.V.LINKE, FDP: res.V.FDP, BSW: res.V.BSW };
      if (Object.keys(u).every(k => u[f] >= u[k])) strongest++;
      const mine = c.out.filter(o => o.set.includes(f));
      if (mine.length) gov++;
      if (mine.some(o => o.chancellor === f)) chan++;
    }
    cells.push(`${fmt(strongest / M)} / ${fmt(gov / M)} / ${fmt(chan / M)}`);
  }
  console.log(`| ${p} | ${cells.join(' | ')} |`);
}

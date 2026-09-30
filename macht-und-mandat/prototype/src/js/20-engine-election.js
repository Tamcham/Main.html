/* ---------- Spielstand anlegen ---------- */
function newGame() {
  return {
    v: 1, phase: 'party', party: null, own: { name: 'Bürgerliste Zukunft', abk: 'BZ', color: '#d6b16c', motto: 'Politik ohne Filterkaffee.', logo: 'stern', sl: [60, 50, 50, 70, 40, 60], kap: 4 },
    name: '', nn: '', anrede: 'div', bg: 'lehrer', herk: 'alt', dial: 'hoch', age: 38,
    av: { skin: 2, face: 'oval', hair: 'seit', hairc: 1, outfit: 'anzug', acc: 'none' },
    stats: { cha: 45, iq: 45, dur: 45, ehr: 45, med: 45, res: 45, net: 45 }, free: 12,
    res: { bel: 35, par: 55, bud: 10, med: 0, wirt: 50, umw: 50, ges: 50, str: 25 },
    prof: [.45, .45, .45, .45, .45, .45], ml: {}, recog: .25, mob: 0, mom: 0, realo: 0,
    camp: { k: { plak: 0, soc: 0, str: 0, rad: 0, evt: 0 }, sl: 0, slfree: '', spent: 0 },
    deck: [], cardIdx: 0, queue: [], flags: {}, promises: [], log: [], npc: JSON.parse(JSON.stringify(NPC0)),
    opp: [], noise: [], elec: null, bund: null, speech: null, result: null, weekly: [], pollHist: []
  };
}

/* ---------- Startwerte aus Partei, Hintergrund, Herkunft ---------- */
function initCharacter() {
  const P = PARTIES[G.party], B = BACKGROUNDS[G.bg], H = HERKUNFT[G.herk];
  Object.keys(B.st).forEach(k => G.stats[k] = clamp(G.stats[k] + B.st[k], 10, 95));
  Object.keys(H.st || {}).forEach(k => G.stats[k] = clamp(G.stats[k] + H.st[k], 10, 95));
  G.res.bel = P.bel; G.res.par = P.par; G.res.bud = P.bud + (B.bud || 0) + (G.party === 'EIGEN' ? G.own.kap - 4 : 0);
  G.res.bel += Math.round((G.stats.cha - 45) / 6);
  G.recog = clamp(P.recog + (B.recog || 0) + (H.recog || 0) + G.stats.med / 500, .03, .9);
  G.prof = (G.party === 'EIGEN' ? G.own.sl.map(v => .25 + .5 * v / 100) : P.prof.slice());
  Object.keys(B.prof).forEach(k => G.prof[TH.indexOf(k)] += B.prof[k]);
  G.ml = {}; MI.forEach(m => G.ml[m] = 0);
  [B.mil, H.mil].forEach(o => o && Object.keys(o).forEach(m => G.ml[m] += o[m]));
  if (DIALEKTE[G.dial].dorf) G.ml.dorf += DIALEKTE[G.dial].dorf;
  if (G.party === 'CSU') G.ml.dorf += .18, G.ml.jung -= .06;
  if (G.party === 'SPD') G.ml.arb += .12;
  if (G.party === 'AFD') { G.ml.dorf += .08; G.ml.arb += .10; G.mob += .05; }
  if (G.party === 'LINKE') G.mob += .05;
  if (G.party === 'BSW') G.mob -= .04;
  if (G.party === 'CDU') G.ml.gew += .05;
  if (G.bg === 'journalist') G.npc.press.v = 60;
  if (G.party === 'EIGEN') { G.npc.party.n = 'Dragan Jablonski'; G.npc.party.r = 'Gründungsmitglied & Schatzmeister'; G.npc.party.v = 60; }
  G.res.par = clamp(G.res.par, 0, 100);
}

/* ---------- Gegnerfeld ---------- */
function setupOpponents() {
  const inBayern = G.party === 'CSU';
  let pool = OPP_PARTY_POOL.filter(p => p !== G.party && !(inBayern && p === 'CDU') && !(!inBayern && p === 'CSU'));
  if (inBayern) pool.push('CSU');
  // Amtsinhaber: immer eine etablierte Partei, nie die eigene
  const incParty = pick(pool.filter(p => ['SPD', 'CDU', 'GRUENE', 'FDP', 'CSU'].includes(p)));
  const others = shuffle(pool.filter(p => p !== incParty));
  const mk = (name, party, inc, pers, recog, prof) => ({ name, party, inc, pers, recog, prof });
  const prof = p => PARTIES[p].prof.slice();
  G.opp = [
    mk(pick(OPP_NAMES.inc), incParty, 1, .18, .80, prof(incParty)),
    mk(OPP_NAMES.unab, 'BUERGER', 0, .10, .45, [.45, .45, .50, .35, .45, .45]),
    mk(pick(OPP_NAMES.o1), others[0], 0, -.02, .35, prof(others[0])),
    mk(pick(OPP_NAMES.o2), others[1], 0, -.05, .28, prof(others[1]))
  ];
  G.opp.forEach(o => { o.aff = o.party === 'BUERGER' ? [-.1, .1, .2, .2, .4, 0] : PARTIES[o.party].aff.slice(); });
  G.noise = DISTRICTS.map(() => [0, 1, 2, 3].map(() => gauss() * .22));
  G.noise2 = DISTRICTS.map(() => [0, 1].map(() => gauss() * .22));
}

/* ---------- Kampagnenkanäle: Reichweite pro Milieu ---------- */
const CHANNELS = [
  { id: 'plak', n: 'Plakate', e: '🪧', w: [.4, .5, .6, .4, .7, .6] },
  { id: 'soc', n: 'Social Media', e: '📱', w: [1, .6, .1, .3, .2, .5] },
  { id: 'str', n: 'Straße & Haustür', e: '🚪', w: [.5, .6, .7, .4, .6, .8] },
  { id: 'rad', n: 'Radio & Lokalpresse', e: '📻', w: [.1, .3, 1, .6, .8, .5] },
  { id: 'evt', n: 'Events & Bierzelt', e: '🎪', w: [.5, .7, .5, .8, 1, .4] }
];
function campaignBoost() {
  // Wirkung: abnehmender Grenznutzen (Log) je Kanal, gewichtet nach Milieu; tanh begrenzt die Gesamtwirkung
  const out = MI.map(() => 0);
  CHANNELS.forEach(ch => {
    let spend = (G.camp.k && G.camp.k[ch.id]) || 0;
    let eff = Math.log(1 + spend / 4);
    if (G.party === 'LINKE' && ch.id === 'str') eff *= 1.5;
    MI.forEach((m, g) => { out[g] += eff * ch.w[g]; });
  });
  return out.map(x => .32 * Math.tanh(x / 2.4));
}

/* ---------- Kandidat:innen-Modell ---------- */
function playerCand() {
  const P = PARTIES[G.party];
  const s = G.stats, r = G.res;
  let pers = clamp((r.bel - 38) / 40, -.8, 1.3) * LM.B + (s.cha - 45) / 160 + clamp(r.med, -60, 60) / 400;
  if (G.party === 'BSW') pers *= 1.6;
  if (G.party === 'EIGEN') pers += G.mom * .03;
  const stressPenalty = Math.max(0, r.str - 70) / 300;
  pers -= stressPenalty;
  const aff = (G.party === 'EIGEN') ? MILIEUS.map((m, g) => {
    const dot = m.sal.reduce((a, w, t) => a + w * (G.own.sl[t] - 50) / 50, 0);
    return clamp(dot * 1.1 - .12, -1, 1);
  }) : P.aff.slice();
  const slg = sloganTilt();
  const boost = campaignBoost().map((b, g) => b + (G.ml[MI[g]] || 0) + slg[g]);
  const pw = G.party === 'BSW' ? .75 : .7 + .6 * r.par / 100;
  return { name: G.name, party: G.party, inc: 0, pers, recog: clamp(G.recog + G.mom * .006, .02, .98), prof: G.prof, aff, boost, pw, me: true };
}
function candList() {
  const me = playerCand();
  const list = [me];
  G.opp.forEach(o => list.push({ name: o.name, party: o.party, inc: o.inc, pers: o.pers + (o.bump || 0), recog: o.recog, prof: o.prof, aff: o.aff, boost: MI.map(() => (o.inc ? .05 : 0)), pw: 1 }));
  return list;
}
/* Modellparameter (Balancing): A Parteiaffinität, P Themenprofil, C Persönlichkeit, I Amtsbonus, R Bekanntheit */
const LM = { A: .8, P: 3.0, C: 1.9, I: .35, R: .9, B: .42 };
/* Kalibrierungs-Offset je Partei (nur Spieler:in): Ziel-Siegquoten bei Zufallsspiel, siehe docs/07-balancing.md */
const HCAP = { CDU: -.1, CSU: -.4, SPD: -.2, GRUENE: .1, FDP: .45, LINKE: .2, BSW: -.25, AFD: .65, EIGEN: -.1, BUERGER: 0 };
function utility(c, g, stich, ci) {
  const sal = MILIEUS[g].sal;
  let prof = 0; for (let t = 0; t < 6; t++) prof += sal[t] * (c.prof[t] - .45);
  let u = LM.A * c.pw * c.aff[g] + LM.P * prof + LM.C * c.pers + LM.I * c.inc + LM.R * (c.recog - .5) + c.boost[g] + (c.me ? (HCAP[c.party] || 0) : 0);
  if (c.party === 'AFD' && stich) u -= .45;   // Kooperationssperre: Wähler:innen anderer Bewerber geben seltener an AfD-Kandidaturen weiter
  return u;
}
const TURN = { jung: .42, fam: .55, sen: .68, gew: .55, dorf: .62, arb: .45 };
function runVote(cands, noise, stich) {
  // pro Bezirk: Stimmen je Kandidat; Multinomial-Logit je Milieu, gemischt nach Bezirkszusammensetzung und Wahlbeteiligung
  const C = cands.length;
  const mob = 1 + G.mob;
  const pm = MILIEUS.map((m, g) => {
    const ex = cands.map(c => Math.exp(utility(c, g, stich)));
    const s = ex.reduce((a, b) => a + b, 0);
    return ex.map(x => x / s);
  });
  const districts = DISTRICTS.map((d, di) => {
    const v = new Array(C).fill(0);
    for (let g = 0; g < 6; g++) {
      const turn = clamp(TURN[MI[g]] * mob * (stich ? .86 : 1), .2, .9);
      for (let c = 0; c < C; c++) {
        // Bezirks-Rauschen wirkt als Faktor auf die Kandidatenwahrscheinlichkeit
        const nz = noise ? Math.exp(noise[di][c] || 0) : 1;
        v[c] += d.mix[g] * turn * pm[g][c] * nz;
      }
    }
    const s = v.reduce((a, b) => a + b, 0);
    const tot = d.size * 100 * (s);
    return { v: v.map(x => x / s * tot), tot, name: d.n, size: d.size };
  });
  const total = new Array(C).fill(0); let all = 0;
  districts.forEach(d => d.v.forEach((x, c) => { total[c] += x; all += x; }));
  return { districts, total, shares: total.map(x => x / all * 100), all };
}
function expectedShares() { return runVote(candList(), null, false).shares; }

/* ---------- Wahlabend: Prognose & Hochrechnungen ---------- */
function makeElection(stich, cands) {
  const c = cands || candList();
  const noise = stich ? G.noise2 : G.noise;
  const res = runVote(c, noise, stich);
  const order = DISTRICTS.map((d, i) => ({ i, k: d.size * (.65 + rnd() * .7) })).sort((a, b) => a.k - b.k).map(o => o.i);
  const prog = res.shares.map(x => x + gauss() * 2.0);
  const ps = prog.reduce((a, b) => a + Math.max(0.5, b), 0);
  return { stich: !!stich, cands: c, res, order, prog: prog.map(x => Math.max(.5, x) * 100 / ps), turnout: res.all / (DISTRICTS.reduce((a, d) => a + d.size * 100, 0)) };
}
const HR_STEPS = [
  { t: '18:00', n: 'Prognose', f: 0 }, { t: '18:45', n: '1. Hochrechnung', f: .22 }, { t: '19:30', n: '2. Hochrechnung', f: .46 },
  { t: '20:15', n: '3. Hochrechnung', f: .71 }, { t: '21:00', n: '4. Hochrechnung', f: .92 }, { t: '22:30', n: 'Endergebnis', f: 1 }
];
function hochrechnung(E, step) {
  const f = HR_STEPS[step].f;
  if (step === 0) return { shares: E.prog, k: 0, counted: [] };
  const k = Math.round(f * E.order.length);
  const counted = E.order.slice(0, k);
  const C = E.cands.length;
  const sum = new Array(C).fill(0); let all = 0;
  counted.forEach(i => E.res.districts[i].v.forEach((x, c) => { sum[c] += x; all += x; }));
  const naive = sum.map(x => x / all * 100);
  if (f >= 1) return { shares: E.res.shares, k, counted };
  const w = Math.pow(f, .75);
  const mix = naive.map((x, c) => w * x + (1 - w) * E.prog[c]);
  const s = mix.reduce((a, b) => a + b, 0);
  return { shares: mix.map(x => x * 100 / s), k, counted, naive };
}

/* ---------- Bundestag & Umfragen (Bund) ---------- */
const CONC = { CDU: 1.0, CSU: 5.0, SPD: 1.0, AFD: 1.35, GRUENE: 1.0, FDP: .35, LINKE: 1.7, BSW: .5 };
function sainteLague(votes, seats) {
  const ps = Object.keys(votes); const res = {}; ps.forEach(p => res[p] = 0);
  for (let i = 0; i < seats; i++) { let best = null, bv = -1; for (const p of ps) { const q = votes[p] / (res[p] + .5); if (q > bv) { bv = q; best = p; } } res[best]++; }
  return res;
}
function bundSeats(S) {
  const v = {}; BUND_PARTIES.forEach(p => v[p] = S[p]);
  const d = {}; let ds = 0; BUND_PARTIES.forEach(p => { d[p] = Math.pow(v[p], 3) * CONC[p]; ds += d[p]; });
  const direct = {}; BUND_PARTIES.forEach(p => direct[p] = Math.round(299 * d[p] / ds));
  const elig = {}; BUND_PARTIES.forEach(p => { if (v[p] >= 5 || direct[p] >= 3) elig[p] = v[p]; });
  const seats = sainteLague(elig, 630);
  const fr = { UNION: (seats.CDU || 0) + (seats.CSU || 0) };
  ['SPD', 'AFD', 'GRUENE', 'FDP', 'LINKE', 'BSW'].forEach(p => fr[p] = seats[p] || 0);
  return { seats, fr, direct, out: BUND_PARTIES.filter(p => !(p in elig)) };
}
const HARD = [['AFD', '*'], ['UNION', 'LINKE'], ['FDP', 'LINKE'], ['BSW', 'GRUENE'], ['BSW', 'FDP']];
function coalitionsFor(fr) {
  const FR = ['UNION', 'SPD', 'AFD', 'GRUENE', 'FDP', 'LINKE', 'BSW'];
  const out = [];
  for (let m = 1; m < 128; m++) {
    const set = FR.filter((_, i) => m & (1 << i));
    if (set.some(f => !fr[f])) continue;
    let ok = true;
    for (const a of set) for (const b of set) { if (a >= b) continue; for (const [x, y] of HARD) if ((x === a && (y === b || y === '*')) || (x === b && (y === a || y === '*'))) ok = false; }
    if (!ok) continue;
    const seats = set.reduce((a, f) => a + fr[f], 0);
    if (seats < 316) continue;
    if (set.some(f => seats - fr[f] >= 316)) continue;
    out.push({ set, seats, chancellor: set.reduce((b, f) => fr[f] > fr[b] ? f : b, set[0]) });
  }
  return out.sort((a, b) => a.set.length - b.set.length || b.seats - a.seats);
}
function initBund() {
  const S = Object.assign({}, BUND0);
  G.bund = { S, Z: {}, E: {}, week: 0, hist: [], why: [] };
  Object.keys(S).forEach(p => { G.bund.Z[p] = 0; G.bund.E[p] = 0; });
  for (let i = 0; i < 26; i++) bundStep(true);
  G.bund.week = 0;
}
function bundStep(silent, shock) {
  const B = G.bund, keys = Object.keys(B.S);
  let sumZ = 0;
  keys.forEach(p => { B.Z[p] = .95 * B.Z[p] + .28 * Math.sqrt(BUND0[p] / 15) * gauss(); sumZ += B.Z[p]; });
  keys.forEach(p => { B.Z[p] -= sumZ / keys.length; });
  if (shock) Object.keys(shock).forEach(p => { B.E[p] = (B.E[p] || 0) + shock[p]; });
  let sumT = 0; const T = {};
  keys.forEach(p => { B.E[p] *= .94; const gov = ['CDU', 'CSU', 'SPD'].includes(p) ? -BUND0[p] * .02 : 0; T[p] = BUND0[p] + B.Z[p] + B.E[p] + gov; sumT += T[p]; });
  keys.forEach(p => { T[p] *= 100 / sumT; B.S[p] += .15 * (T[p] - B.S[p]); });
  const snap = {}; keys.forEach(p => snap[p] = B.S[p]);
  B.hist.push(snap); B.week++;
  if (B.hist.length > 60) B.hist.shift();
}
function bundPoll(inst, S) {
  S = S || G.bund.S;
  const o = {}; let sum = 0;
  Object.keys(S).forEach(p => { const b = (inst.bias && inst.bias[p]) || 0; const pr = S[p] / 100; const err = Math.sqrt(pr * (1 - pr) / inst.nn) * 100; o[p] = Math.max(.5, S[p] + b + gauss() * err * .55); sum += o[p]; });
  const out = {}; Object.keys(o).forEach(p => out[p] = Math.round(o[p] * 100 / sum * 2) / 2);
  return out;
}
function halfWidth(p, inst) { const pr = p / 100; return 1.96 * Math.sqrt(pr * (1 - pr) / inst.nn) * 100; }

/* Ereignis-Generator – Referenzimplementierung (Node, ohne Abhängigkeiten)
 * Zeigt: Slot-Auflösung, Gewichtungsformel, Wiederholungssperre, Gedächtnis, Glückskonto, Ereignisketten.
 * Nutzung:  const G = require('./eventgen'); const gen = G.create(seed); gen.next(state)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const POOLS = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/pools.json'), 'utf8')).pools;
const TEMPLATES = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/templates50.json'), 'utf8')).templates;

/* ---------- deterministischer Zufall (mulberry32) ---------- */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Pools ---------- */
function poolSize(name) {
  const p = POOLS[name];
  if (!p) throw new Error('Pool fehlt: ' + name);
  if (p.kind === 'list') return p.items.length;
  if (p.kind === 'range') return Math.floor((p.max - p.min) / p.step) + 1;
  return p.parts.reduce((n, part) => n * part.length, 1);
}
function drawPool(name, r) {
  const p = POOLS[name];
  if (p.kind === 'list') return p.items[Math.floor(r() * p.items.length)];
  if (p.kind === 'range') return p.min + p.step * Math.floor(r() * ((p.max - p.min) / p.step + 1));
  return p.parts.map(part => part[Math.floor(r() * part.length)]).join(p.join);
}
function form(v, f) { return typeof v === 'object' ? (v[f] || v.n) : String(v); }

function capSentences(s) {
  return s.replace(/(^|[.!?]\s+|:\s+„)([a-zäöü])/g, (m, pre, ch) => pre + ch.toUpperCase());
}

/* ---------- Rendern ---------- */
function drawSlots(t, r) {
  const v = {};
  for (const [alias, pool] of Object.entries(t.slots)) v[alias] = drawPool(pool, r);
  return v;
}
function fill(str, v) {
  return capSentences(str.replace(/\{(\w+)(?:\.(\w))?\}/g, (m, k, f) => {
    if (!(k in v)) throw new Error('Slot ohne Definition: ' + k);
    return form(v[k], f || 'n');
  }));
}
function signature(t, v, ia, iz) {
  return t.id + '|' + ia + '|' + iz + '|' + Object.entries(v).map(([k, x]) => k + '=' + form(x, 'n')).join(',');
}

/* ---------- Archetypen der Optionen (Effektvektor: Beliebtheit, Partei, Budget, Medien, Wirtschaft, Umwelt, Gesellschaft, Stress, Risiko) ---------- */
const ARCH = {
  invest:       { b: 2,  p: 1,  d: -3, m: 1,  w: 2,  u: 0,  g: 1,  s: 1,  risk: 0.10 },
  sparen:       { b: -2, p: 0,  d: 3,  m: -1, w: -1, u: 0,  g: -1, s: 0,  risk: 0.15 },
  dialog:       { b: 1,  p: 1,  d: 0,  m: 1,  w: 0,  u: 0,  g: 2,  s: 1,  risk: 0.05 },
  durchgreifen: { b: 1,  p: -1, d: 0,  m: 2,  w: 0,  u: 0,  g: -2, s: 2,  risk: 0.20 },
  aussitzen:    { b: -1, p: 0,  d: 0,  m: -2, w: 0,  u: 0,  g: 0,  s: -1, risk: 0.35 },
  populaer:     { b: 4,  p: -1, d: -1, m: 2,  w: -1, u: -1, g: -1, s: 0,  risk: 0.30 },
  transparenz:  { b: 1,  p: -1, d: 0,  m: 2,  w: 0,  u: 0,  g: 2,  s: 1,  risk: 0.05 },
  deal:         { b: 0,  p: 2,  d: 2,  m: -2, w: 1,  u: 0,  g: -1, s: 0,  risk: 0.30 },
  gruen:        { b: 1,  p: 0,  d: -2, m: 1,  w: -1, u: 3,  g: 1,  s: 1,  risk: 0.10 },
  delegieren:   { b: 0,  p: 0,  d: -1, m: 0,  w: 0,  u: 0,  g: 0,  s: -2, risk: 0.15 },
  konter:       { b: 1,  p: 1,  d: 0,  m: 1,  w: 0,  u: 0,  g: -2, s: 1,  risk: 0.25 },
  humor:        { b: 2,  p: 0,  d: 0,  m: 2,  w: 0,  u: 0,  g: 1,  s: -1, risk: 0.20 }
};

/* ---------- Gewichtungsformel ----------
 * w = w0 · F_amt · F_ebene · F_kontext · F_zeitgeist · F_partei · F_fairness · F_cooldown · F_novelty · F_kette
 * (siehe docs/06-ereignis-generator.md)
 */
function weight(t, S, mem) {
  if (S.amt < t.amt[0] || S.amt > t.amt[1]) return 0;                        // harte Bedingung
  const dSince = mem.lastSeen[t.id] === undefined ? Infinity : S.tag - mem.lastSeen[t.id];
  if (dSince < t.cd * 0.25) return 0;                                         // harte Sperre: 25 % der Abklingzeit
  const F_cool = dSince === Infinity ? 1 : 1 - Math.exp(-(dSince / t.cd) * 1.8); // sanfte Erholung
  const seen = mem.count[t.id] || 0;
  const F_novelty = 1 / (1 + 0.35 * seen);                                    // Gedächtnis: je öfter gesehen, desto seltener
  const F_zeit = 1 + 0.6 * (t.themen.includes(S.jahresthema) ? 1 : 0);        // Zeitgeist
  const F_kat = 1 / (1 + 0.5 * (mem.katRecent[t.kat] || 0));                  // Kategorie-Balance (gleitendes Fenster)
  const pos = t.kat === 'Positives' || t.kat === 'Absurdes und Satirisches';
  const neg = t.kat === 'Krisen und Katastrophen' || t.kat === 'Persönliches';
  // Glückssaldo S.saldo > 0 = Glückssträhne, < 0 = Pechsträhne; gleicht sich über die Zeit aus
  const F_fair = S.noFair ? 1 : pos ? Math.min(2.0, Math.max(0.4, 1 - S.saldo / 6)) : neg ? Math.min(1.6, Math.max(0.4, 1 + S.saldo / 12)) : 1;
  const F_partei = (S.parteiTags && t.themen.some(x => S.parteiTags.includes(x))) ? 1.25 : 1;
  const F_kette = mem.chainBoost[t.id] ? 4 : 1;
  return t.w * F_cool * F_novelty * F_zeit * F_kat * F_fair * F_partei * F_kette;
}

function pick(weights, r) {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return -1;
  let x = r() * sum;
  for (let i = 0; i < weights.length; i++) { x -= weights[i]; if (x <= 0) return i; }
  return weights.length - 1;
}

function create(seed) {
  const r = rng(seed);
  const mem = { lastSeen: {}, count: {}, katRecent: {}, recentKat: [], sigs: new Set(), sigList: [], chainBoost: {}, queue: [] };
  return {
    mem,
    next(S) {
      // 1. fällige Folgeereignisse (Ereignisketten) haben Vorrang
      const dueIdx = mem.queue.findIndex(q => q.tag <= S.tag);
      let t;
      if (dueIdx >= 0) { const q = mem.queue.splice(dueIdx, 1)[0]; t = TEMPLATES.find(x => x.id === q.id); }
      // 2. sonst gewichtete Auswahl
      if (!t) {
        const ws = TEMPLATES.map(x => weight(x, S, mem));
        const i = pick(ws, r);
        if (i < 0) return null;
        t = TEMPLATES[i];
      }
      // 3. Slots ziehen, bis der SICHTBARE Text noch nicht vorkam (Wiederholungssperre auf Textebene)
      let v, ia, iz, text, tries = 0;
      do {
        v = drawSlots(t, r);
        ia = Math.floor(r() * t.a.length);
        iz = Math.floor(r() * t.z.length);
        text = fill(t.a[ia], v) + ' ' + fill(t.z[iz], v);
      } while (mem.sigs.has(text) && ++tries < 12);
      const sig = text;
      mem.sigs.add(sig); mem.sigList.push(sig);
      if (mem.sigList.length > 4000) mem.sigs.delete(mem.sigList.shift());
      // 4. Buchführung
      mem.lastSeen[t.id] = S.tag;
      mem.count[t.id] = (mem.count[t.id] || 0) + 1;
      mem.recentKat.push(t.kat);
      if (mem.recentKat.length > 12) mem.recentKat.shift();
      mem.katRecent = {};
      mem.recentKat.forEach(k => { mem.katRecent[k] = (mem.katRecent[k] || 0) + 1; });
      delete mem.chainBoost[t.id];
      return {
        id: t.id, kat: t.kat, text, frage: fill(t.q, v),
        optionen: t.o.map(o => ({ arch: o.a, text: fill(o.t, v), fx: scaled(ARCH[o.a], t.i) })),
        sig, t
      };
    },
    // Fairer Zufallswurf: Erfolgswahrscheinlichkeit wird durch das Glückssaldo in Richtung Ausgleich verschoben
    roll(S, pBase) {
      const p = S.noFair ? pBase : Math.min(0.8, Math.max(0.2, pBase - 0.05 * S.saldo));
      const ok = r() < p;
      S.saldo = S.saldo * 0.92 + (ok ? 1 : -1);
      return ok;
    },
    // Entscheidung bucht Folgeereignis ein (Schmetterlingseffekt)
    decide(S, ev, optIdx) {
      const o = ev.optionen[optIdx];
      const f = ev.t.folge;
      if (f && f.wenn.includes(o.arch) && r() < 0.35 + ARCH[o.arch].risk) {
        const dt = f.nach[0] + Math.floor(r() * (f.nach[1] - f.nach[0] + 1));
        mem.queue.push({ id: f.id, tag: S.tag + dt });
        mem.chainBoost[f.id] = true;
      }
      return o;
    }
  };
}

function scaled(a, i) {
  const out = {};
  for (const k of Object.keys(a)) out[k] = k === 'risk' ? a[k] : Math.round(a[k] * (0.6 + 0.4 * i) * 10) / 10;
  return out;
}

/* ---------- Kombinatorik ---------- */
function slotNames(t) {
  const s = new Set();
  [...t.a, ...t.z, t.q, ...t.o.map(o => o.t)].forEach(x => x.replace(/\{(\w+)(?:\.\w)?\}/g, (m, k) => s.add(k)));
  return [...s];
}
function lint() {
  const errs = [];
  const ids = new Set();
  for (const t of TEMPLATES) {
    if (ids.has(t.id)) errs.push('doppelte ID ' + t.id); ids.add(t.id);
    for (const [alias, pool] of Object.entries(t.slots)) if (!POOLS[pool]) errs.push(t.id + ': Pool fehlt ' + pool);
    for (const s of slotNames(t)) if (!t.slots[s]) errs.push(t.id + ': Slot ohne Definition {' + s + '}');
    for (const s of Object.keys(t.slots)) if (!slotNames(t).includes(s)) errs.push(t.id + ': Slot ungenutzt {' + s + '}');
    if (t.a.length < 4 || t.z.length < 3) errs.push(t.id + ': zu wenig Textvarianten');
    if (t.o.length < 2 || t.o.length > 4) errs.push(t.id + ': Optionenzahl');
    for (const o of t.o) if (!ARCH[o.a]) errs.push(t.id + ': Archetyp ' + o.a);
  }
  return errs;
}
function combos(t) {
  // Nur Slots, die im sichtbaren Text vorkommen, zählen. Mehrfach genutzte Pools (ort, ort2) würden als unabhängig gezählt.
  const used = slotNames(t);
  const slotProduct = used.reduce((n, s) => n * poolSize(t.slots[s]), 1);
  const textVariants = t.a.length * t.z.length;
  return { slotProduct, textVariants, total: slotProduct * textVariants, slots: used };
}

module.exports = { create, rng, lint, combos, poolSize, fill, drawSlots, weight, TEMPLATES, POOLS, ARCH, capSentences, slotNames };

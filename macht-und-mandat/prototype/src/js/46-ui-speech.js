/* ---------- Bundestagsrede (Dialog-Minispiel) ---------- */
const SP_TIME = 8;
function ownFraktion() { return ['CDU', 'CSU'].includes(G.party) ? 'UNION' : G.party; }
function parliament() {
  // Demo-Legislatur: Ausgangslage, die Spielerpartei zieht mindestens mit ~7 % ein
  const S = {}; BUND_PARTIES.forEach(p => S[p] = BUND0[p]);
  if (G.party === 'EIGEN') { S.EIGEN = 7; const t = BUND_PARTIES.reduce((a, p) => a + S[p], 0) + 7; BUND_PARTIES.forEach(p => S[p] = S[p] * 93 / (t - 7)); }
  else if (S[G.party] < 7) { const add = 7 - S[G.party], others = BUND_PARTIES.filter(p => p !== G.party).reduce((a, p) => a + S[p], 0); BUND_PARTIES.forEach(p => { if (p !== G.party) S[p] -= add * S[p] / others; }); S[G.party] = 7; }
  const v = {}; Object.keys(S).forEach(p => { if (S[p] >= 5) v[p] = S[p]; });
  const seats = sainteLague(v, 630);
  const fr = { UNION: (seats.CDU || 0) + (seats.CSU || 0) };
  ['LINKE', 'SPD', 'GRUENE', 'FDP', 'BSW', 'AFD', 'EIGEN'].forEach(p => fr[p] = seats[p] || 0);
  Object.keys(fr).forEach(k => { if (!fr[k]) delete fr[k]; });
  return fr;
}
function frPos(f) {
  if (f === 'EIGEN') return [clamp((G.own.sl[0] - 50) / 50, -1, 1), clamp((G.own.sl[4] - G.own.sl[3]) / 60, -1, 1)];
  return FRK[f].pos;
}
function frName(f) { return f === 'EIGEN' ? G.own.abk || G.own.name : frkAbbr(f); }
const _frkColor = frkColor; frkColor = f => f === 'EIGEN' ? pcolor('EIGEN') : _frkColor(f);
const _frkAbbr = frkAbbr; frkAbbr = f => f === 'EIGEN' ? (G.own.abk || 'Eigene') : _frkAbbr(f);
if (FRAKTIONEN.indexOf('EIGEN') < 0) FRAKTIONEN.splice(3, 0, 'EIGEN');

function startSpeech() {
  ensureDemoGame();
  G.phase = 'speech';
  const fr = parliament(), own = ownFraktion();
  const others = Object.keys(fr).filter(f => f !== own).sort((a, b) => fr[b] - fr[a]);
  G.speech = { step: 'setup', fr, own, gegner: others[0], topic: null, tone: null, beat: 0, app: Object.fromEntries(Object.keys(fr).map(f => [f, 0])), time: 0, ordnung: 0, log: [], zw: 0 };
  save(); SCREENS.speech();
}
SCREENS.speech = () => {
  const S = G.speech; if (!S) return startSpeech();
  const head = `<div class="row sp"><div><div class="caps">Deutscher Bundestag</div><div class="small mut">${esc(G.name)} · ${esc(pname(G.party))}</div></div><div class="chip">${frName(S.own)} · ${S.fr[S.own]} Sitze</div></div>`;
  if (S.step === 'setup') {
    render(`${head}<h2>Deine erste Rede</h2><p class="mut small">Plenarsaal, 14:32 Uhr, Tagesordnungspunkt 5: „Aussprache“. Die Präsidentin ruft dich auf: Du hast ${SP_TIME} Minuten. Achte auf Beifall und Zwischenrufe der Fraktionen.</p>
      <div class="glass tight">${hemicycleSVG(S.fr, { hi: S.own, labels: true })}</div>
      <label class="f">Thema</label><div class="opts">${Object.entries(SPEECH).map(([k, t]) => `<button class="opt ${S.topic === k ? 'on' : ''}" data-act="spt" data-k="${k}">${t.e} ${t.n}</button>`).join('')}</div>
      <label class="f">Tonfall</label><div class="opts" style="flex-direction:column">${Object.entries(TONES).map(([k, t]) => `<button class="opt ${S.tone === k ? 'on' : ''}" style="text-align:left" data-act="spn" data-k="${k}"><b>${t.n}</b><br><span class="small mut" style="font-weight:400">${t.d}</span></button>`).join('')}</div>
      <button class="btn mt2" data-act="spstart" ${S.topic && S.tone ? '' : 'disabled'}>Ans Rednerpult</button>`);
  } else if (S.step === 'beat') {
    const T = SPEECH[S.topic], B = T.beats[S.beat];
    const used = S.time / SP_TIME * 100;
    render(`${head}
      <div class="row sp mt"><span class="small mut">Noch ${f1(Math.max(0, SP_TIME - S.time))} von ${SP_TIME} Min. Redezeit</span><span class="chip">${S.beat + 1}/${T.beats.length} · ${B.h}</span></div>
      <div class="bar mt" style="height:7px"><i style="width:${clamp(100 - used, 0, 100)}%;background:${used > 85 ? 'linear-gradient(90deg,#b34a4a,#ff7b7b)' : ''}"></i></div>
      <div class="glass tight mt" id="plen">${hemicycleSVG(S.fr, { labels: false, dr: 2.9 })}</div>
      <div id="appl" class="row wrap mt" style="gap:6px">${applauseHTML(S)}</div>
      <h3 class="mt">${esc(B.h)} – was sagst du?</h3>
      <div class="ochoices">${B.o.map((a, i) => `<button class="oc" data-act="sparg" data-i="${i}"><span class="tiny gold" style="text-transform:uppercase;letter-spacing:.1em">${({ fakt: 'Fakten', emo: 'Emotion', vision: 'Vision', humor: 'Humor', angriff: 'Angriff' })[a.tag]}</span><br>${esc(a.t.replace('{gegner}', frName(S.gegner)))}</button>`).join('')}</div>`);
  } else if (S.step === 'zw') {
    const z = S.zwCur;
    render(`${head}
      <div class="row sp mt"><span class="small mut">Noch ${f1(Math.max(0, SP_TIME - S.time))} von ${SP_TIME} Min. Redezeit</span><span class="chip">Zwischenruf!</span></div>
      <div class="bar mt" style="height:7px"><i style="width:${clamp(100 - S.time / SP_TIME * 100, 0, 100)}%"></i></div>
      <div class="glass tight mt">${hemicycleSVG(S.fr, { hi: z.f, labels: false, dr: 2.9 })}</div>
      <div class="zw"><div class="caps" style="color:#ff9b9b">Aus den Reihen der ${esc(frName(z.f))}</div><div class="serif" style="font-size:1.3rem;margin-top:4px">${esc(z.t)}</div>
        <div class="timer mt"><i id="zwtimer" style="transition:transform 4.5s linear"></i></div></div>
      <div class="ochoices">
        <button class="oc" data-act="zwr" data-r="kontern"><b>Schlagfertig kontern</b><div class="risk">Wagnis · ${Math.round(zwProb('kontern') * 100)} % (Charisma &amp; Medienwirkung)</div></button>
        <button class="oc" data-act="zwr" data-r="frage"><b>Zwischenfrage zulassen</b> <span class="tiny mut">(+1 Min.)</span><div class="risk">Wagnis · ${Math.round(zwProb('frage') * 100)} % (Intelligenz)</div></button>
        <button class="oc" data-act="zwr" data-r="ignorieren"><b>Ignorieren und weiterreden</b><div class="tiny mut">Kein Risiko, kein Gewinn.</div></button></div>`);
    requestAnimationFrame(() => requestAnimationFrame(() => { const t = $('#zwtimer'); if (t) { t.style.transform = 'scaleX(0)'; } }));
    clearTimeout(S.zt); S.zt = setTimeout(() => { if (G.speech && G.speech.step === 'zw') ACT.zwr({ dataset: { r: 'ignorieren', timeout: 1 } }); }, 4700);
  } else if (S.step === 'end') {
    speechEnd();
  }
};
function applauseHTML(S) {
  return Object.keys(S.fr).filter(f => S.fr[f] > 0).sort((a, b) => FRAKTIONEN.indexOf(a) - FRAKTIONEN.indexOf(b)).map(f => {
    const v = S.app[f], e = v > .6 ? '👏' : v > .1 ? '🙂' : v < -.6 ? '😠' : v < -.1 ? '😒' : '😐';
    return `<span class="chip" style="border-color:${frkColor(f)}">${esc(frkAbbr(f))} ${e}<span class="delta ${v >= 0 ? 'up' : 'dn'}">${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}</span></span>`;
  }).join('');
}
ACT.spt = a => { G.speech.topic = a.dataset.k; SCREENS.speech(); };
ACT.spn = a => { G.speech.tone = a.dataset.k; SCREENS.speech(); };
ACT.spstart = () => { G.speech.step = 'beat'; SCREENS.speech(); };

function reception(f, arg, S) {
  const tone = TONES[S.tone], mult = tone.m[arg.tag];
  const fp = frPos(f), d = Math.hypot(arg.pos[0] - fp[0], arg.pos[1] - fp[1]);
  let r = (1 - d / 1.4);
  if (f === S.own) r += .35;
  if (arg.tag === 'humor') r = r * .5 + .35;
  if (arg.tag === 'angriff') {
    const gp = frPos(S.gegner), dg = Math.hypot(fp[0] - gp[0], fp[1] - gp[1]);
    if (f === S.gegner) r = -.9; else if (dg < 1) r = Math.min(r, -.25); else if (f === S.own) r = .7; else r = r * .4 + .1;
  }
  r = r * (r > 0 ? mult : 1 / Math.max(.6, mult)) + gauss() * .08;
  return clamp(r, -1.5, 1.5);
}
ACT.sparg = a => {
  const S = G.speech, T = SPEECH[S.topic], B = T.beats[S.beat], arg = B.o[+a.dataset.i];
  const cost = { fakt: 1.4, emo: 1.6, vision: 1.7, humor: 1.0, angriff: 1.2 }[arg.tag];
  S.time += cost;
  Object.keys(S.fr).forEach(f => { S.app[f] = clamp(S.app[f] + reception(f, arg, S) * 1.0, -3, 3); });
  S.log.push(arg.tag);
  // Ordnungsruf-Risiko bei Angriffen (Tonfall angriffslustig erhöht das Risiko)
  const risk = arg.tag === 'angriff' ? (S.tone === 'angr' ? .38 : .12) : 0;
  buzz(14);
  if (rnd() < risk) { S.ordnung++; S.app[S.own] -= .4; flashBanner('Ordnungsruf von der Präsidentin!'); buzz([40, 40, 40]); }
  S.lastArg = arg;
  // Zwischenruf der Fraktion mit der niedrigsten Stimmung (aber nie die eigene)
  const cand = Object.keys(S.fr).filter(f => f !== S.own).sort((x, y) => S.app[x] - S.app[y])[0];
  S.zwCur = { f: cand, t: pick(ZWISCHENRUFE[cand] || ['„Hört, hört!“']) };
  S.step = S.beat >= T.beats.length - 1 ? 'endzw' : 'zw';
  if (S.step === 'endzw') { S.step = 'end'; }
  S.beat++; save(); SCREENS.speech();
  if (S.step === 'end') return;
};
function zwProb(kind) {
  const s = G.stats, stress = Math.max(0, G.res.str - 60) * .4;
  if (kind === 'kontern') return clamp(.5 + (((s.cha + s.med) / 2) - 52 - stress) / 80, .12, .9);
  return clamp(.5 + (s.iq - 50 - stress) / 80, .12, .9);
}
ACT.zwr = a => {
  const S = G.speech; if (!S || S.step !== 'zw') return; clearTimeout(S.zt);
  const z = S.zwCur, r = a.dataset.r; let msg = '';
  if (r === 'kontern') {
    const ok = rnd() < zwProb('kontern');
    if (ok) { S.app[S.own] += .5; S.app[z.f] += .2; S.app = clampAll(S.app); msg = 'Kontra sitzt! Der Saal lacht – sogar ein bisschen bei den Zwischenrufern.'; S.time += .3; }
    else { S.app[S.own] -= .2; S.app[z.f] -= .3; if (rnd() < .3) { S.ordnung++; msg = 'Der Konter geht daneben – Ordnungsruf.'; buzz([40, 40, 40]); } else msg = 'Der Konter verpufft. Jemand hüstelt.'; S.time += .4; }
  } else if (r === 'frage') {
    S.time += 1; const ok = rnd() < zwProb('frage');
    Object.keys(S.app).forEach(f => S.app[f] += ok ? .25 : -.2); if (!ok) S.app[z.f] += .3; S.app = clampAll(S.app);
    msg = ok ? 'Du beantwortest die Frage präzise. Respekt aus mehreren Fraktionen.' : 'Bei der Frage zur Gegenfinanzierung verhedderst du dich. Der Zwischenrufer strahlt.';
  } else { S.app[z.f] -= a.dataset.timeout ? .2 : .1; msg = a.dataset.timeout ? 'Zu langsam – der Zwischenruf bleibt im Saal stehen.' : 'Du redest einfach weiter. Die Präsidentin nickt anerkennend.'; S.time += .1; }
  S.zwMsg = msg; S.step = S.beat >= SPEECH[S.topic].beats.length ? 'end' : 'beat'; save();
  if (S.step === 'beat') { SCREENS.speech(); flashBanner(msg); } else SCREENS.speech();
  if (S.step === 'end') G.speech.endMsg = msg;
};
function clampAll(o) { Object.keys(o).forEach(k => o[k] = clamp(o[k], -3, 3)); return o; }
function flashBanner(t) { const b = document.createElement('div'); b.className = 'banner'; b.textContent = t; $('#app').appendChild(b); setTimeout(() => b.remove(), 2600); }

function speechEnd() {
  const S = G.speech;
  if (!S.scored) {
    let wsum = 0, tot = 0; Object.keys(S.fr).forEach(f => { wsum += S.fr[f]; tot += S.fr[f] * S.app[f]; });
    const avg = tot / wsum / 3;           // −1 … +1
    const own = S.app[S.own] / 3;
    const over = Math.max(0, S.time - SP_TIME);
    let score = 50 + 34 * avg + 16 * own - 9 * S.ordnung - 6 * over;
    S.score = clamp(Math.round(score), 0, 100); S.scored = true;
    const dm = Math.round((S.score - 50) / 8), dp = Math.round((own) * 4 - S.ordnung * 2);
    G.res.med = clamp(G.res.med + dm * 2, -100, 100); G.res.par = clamp(G.res.par + dp, 0, 100);
    S.dm = dm; S.dp = dp; save();
  }
  const grade = S.score >= 80 ? ['Rede des Tages', 'Die Kameras bleiben auf dir, selbst der Bundestagspräsident klatscht.'] : S.score >= 60 ? ['Starker Auftritt', 'Gute Mischung aus Substanz und Schlagkraft. Die Fraktion ist zufrieden.'] : S.score >= 40 ? ['Solide', 'Ordentlich geredet – bloß das Protokoll wird mehr Aufmerksamkeit bekommen als du.'] : ['Verpufft', 'Die Rede war wie ein Dienstagnachmittag: da, aber nicht erinnerungswürdig.'];
  const rows = Object.keys(S.fr).sort((a, b) => FRAKTIONEN.indexOf(a) - FRAKTIONEN.indexOf(b)).map(f => `<div class="brow" style="grid-template-columns:96px 1fr 54px"><span class="nm small" style="font-weight:700"><span class="badge" style="width:12px;height:12px;border-radius:50%;--pc:${frkColor(f)}"></span>${esc(frkAbbr(f))}</span><div class="track"><div class="fill" style="width:${clamp((S.app[f] + 3) / 6 * 100, 2, 100)}%;--pc:${frkColor(f)}"></div></div><span class="val small">${S.app[f] >= 0 ? '+' : '−'}${Math.abs(S.app[f]).toFixed(1)}</span></div>`).join('');
  render(`<div class="caps">Deutscher Bundestag · Rede beendet</div><h2>${grade[0]}</h2>
    <div class="glass mt center"><div style="font:800 3rem var(--serif);color:var(--gold2)">${S.score}<span class="small mut"> / 100</span></div><p style="margin:.2em 0 0">${grade[1]}</p></div>
    <div class="glass mt"><div class="caps">Beifall &amp; Murren nach Fraktion</div>${rows}</div>
    <div class="row wrap mt" style="gap:6px"><span class="chip">Medienecho <span class="delta ${S.dm >= 0 ? 'up' : 'dn'}">${sgn(S.dm * 2)}</span></span><span class="chip">Fraktionsrückhalt <span class="delta ${S.dp >= 0 ? 'up' : 'dn'}">${sgn(S.dp)}</span></span><span class="chip">Ordnungsrufe ${S.ordnung}</span><span class="chip">Redezeit ${f1(Math.min(S.time, 9.9))} Min.</span></div>
    <div class="glass tight mt small"><b class="gold">Schlagzeile:</b> ${esc(speechHeadline(S))}</div>
    <div class="row mt2"><button class="btn ghost" data-act="speechagain">Nochmal versuchen</button><button class="btn" data-act="toend">Karriere-Bilanz</button></div>`, { nogear: true });
}
function speechHeadline(S) {
  const n = G.nn || G.name;
  if (S.ordnung >= 2) return `Ordnungsruf-Festival: ${n} poltert durch den Plenarsaal`;
  if (S.score >= 80) return `${n} begeistert das Hohe Haus – „So klingt Opposition, die regieren will“`;
  if (S.score >= 60) return `Starke Premiere: ${n} überzeugt mit Substanz und Schlagfertigkeit`;
  if (S.score >= 40) return `${n} hielt eine Rede. Sie war da.`;
  return `Verpufft im Plenum: ${n} bleibt blass`;
}
ACT.speechagain = () => startSpeech();
ACT.toend = () => { G.phase = 'end'; save(); show('end'); };

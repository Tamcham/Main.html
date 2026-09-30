/* ---------- Deck-Aufbau (gewichtete Auswahl, Vielfalt, Partei- und Berufs-Affinität) ---------- */
const TOTAL_CARDS = 10;
const BG_TH = { lehrer: ['soz'], handwerk: ['wirt', 'wohn'], jurist: ['sich'], unternehmer: ['wirt'], pflege: ['soz'], landwirt: ['verk', 'klim'], polizei: ['sich'], journalist: ['med'] };
const PARTY_TH = { CDU: ['wirt', 'sich'], CSU: ['sich', 'verk'], SPD: ['soz'], AFD: ['sich'], GRUENE: ['klim', 'verk'], FDP: ['wirt'], LINKE: ['wohn', 'soz'], BSW: ['soz'], EIGEN: [] };
function cardWeight(id) {
  const c = CARDS[id]; let w = c.w;
  if (id === 'EV-017') w *= G.res.str > 50 ? 2.2 : .5;
  if (id === 'EV-005') w *= G.stats.ehr < 50 ? 1.4 : .8;
  if ((BG_TH[G.bg] || []).includes(c.th)) w *= 1.35;
  if ((PARTY_TH[G.party] || []).includes(c.th)) w *= 1.25;
  if (G.party === 'CSU' && id === 'EV-003') w *= 1.8;
  if (G.party === 'SPD' && id === 'EV-015') w *= 1.6;
  if (G.party === 'GRUENE' && ['EV-002', 'EV-001'].includes(id)) w *= 1.3;
  return w;
}
function buildDeck() {
  const pool = CARD_IDS.slice(), chosen = [];
  while (chosen.length < TOTAL_CARDS && pool.length) {
    const ws = pool.map(cardWeight), sum = ws.reduce((a, b) => a + b, 0);
    let x = rnd() * sum, i = 0; while (i < ws.length - 1 && (x -= ws[i]) > 0) i++;
    const id = pool.splice(i, 1)[0];
    // Vielfalt: höchstens ein absurdes Ereignis, nicht dreimal dasselbe Thema in Folge
    if (CARDS[id].kat === 'Absurdes' && chosen.some(c => CARDS[c].kat === 'Absurdes')) continue;
    chosen.push(id);
  }
  // Reihenfolge: gleiche Themen nicht direkt hintereinander; Krise früh-mittig
  for (let i = 1; i < chosen.length; i++) if (CARDS[chosen[i]].th === CARDS[chosen[i - 1]].th) { const j = chosen.findIndex((x, k) => k > i && CARDS[x].th !== CARDS[chosen[i - 1]].th); if (j > 0) [chosen[i], chosen[j]] = [chosen[j], chosen[i]]; }
  if (G.party === 'EIGEN') chosen[3] = 'EV-EG1';
  G.deck = chosen.map(id => ({ id, v: CARDS[id].vars() }));
  G.cardIdx = 0; G.queue = []; G.log = []; G.promises = []; G.pollHist = [expectedShares()];
}

/* ---------- Vorschau-Qualität (Berater:innen) ---------- */
const FXN = { b: 'Beliebt', p: 'Partei', d: 'Kasse', m: 'Medien', w: 'Wirtschaft', u: 'Umwelt', g: 'Gesellschaft' };
function advisorQ() { return clamp((G.stats.net + G.stats.iq) / 200, .15, .95); }
function optFx(card, v, o, out) {
  const fx = Object.assign({}, o.fx, o.fxf ? o.fxf(v) : {});
  const ok = o.chk ? (out === 'bad' ? o.chk.bad.fx : o.chk.ok.fx) : null;
  return ok ? Object.assign({}, fx, ok) : fx;
}
function previewHTML(card, inst, o, oi) {
  const fx = optFx(card, inst.v, o, 'ok'); const q = advisorQ();
  const items = Object.keys(FXN).filter(k => fx[k]);
  const r = seeded(hashStr(inst.id + oi + G.name));
  const chips = items.map(k => { const sure = r() < q; const up = fx[k] > 0; return sure ? `<b class="${(k === 'd' ? up : up) ? 'u' : 'd'}">${FXN[k]} ${up ? (fx[k] >= 4 ? '↑↑' : '↑') : (fx[k] <= -4 ? '↓↓' : '↓')}</b>` : `<b class="q">${FXN[k]} ?</b>`; }).join('');
  let extra = '';
  if (o.chk) extra = `<div class="risk">Wagnis · ${Math.round(chkProb(o) * 100)} % Erfolgschance (${STATS.find(s => s.id === o.chk.s).n})</div>`;
  return `<div class="pv">${chips}</div>${extra}`;
}
function chkProb(o) {
  const s = o.chk.s; let val = G.stats[s];
  if (o.chk.bierzelt) { if (G.party === 'CSU') val += 8; val += DIALEKTE[G.dial].bierzelt || 0; }
  if (G.res.str > 60) val -= (G.res.str - 60) * .4;
  return clamp(.5 + (val - o.chk.dc) / 80, .12, .92);
}

/* ---------- Kartenansicht ---------- */
SCREENS.cards = () => {
  G.phase = 'cards';
  if (G.cardIdx >= TOTAL_CARDS) return finale();
  const due = G.queue.find(q => q.due <= G.cardIdx && q.kind === 'hl' && !q.shown);
  if (due) return showAftermath(due);
  const fc = G.queue.find(q => q.due <= G.cardIdx && q.kind === 'card' && !q.shown);
  if (fc) { fc.shown = true; if (G.cardIdx < TOTAL_CARDS) { G.deck.splice(G.cardIdx, 0, { id: fc.id, v: CARDS[fc.id].vars(), follow: true }); G.deck.pop(); } }
  const inst = G.deck[G.cardIdx], c = CARDS[inst.id];
  const week = G.cardIdx + 1;
  const opts = c.opts.map((o, i) => {
    const cost = -(optFx(c, inst.v, o, 'ok').d || 0);
    const dis = cost > G.res.bud + .01;
    return `<button class="oc" data-act="choose" data-i="${i}" ${dis ? 'disabled' : ''}>${esc(o.t)}${dis ? ' <span class="risk">(Kasse reicht nicht)</span>' : ''}${previewHTML(c, inst, o, i)}</button>`;
  }).join('');
  const cuts = c.opts.length === 2 && c.swipe;
  render(`<div class="cardscreen">
    <div class="row sp"><div><div class="caps">Woche ${week} von ${TOTAL_CARDS}</div><div class="small mut">${esc(G.name)} · ${kandidat()} ${esc(pname(G.party))}</div></div>
      <div class="chip">${badge(G.party)}&nbsp;Noch ${Math.max(0, TOTAL_CARDS - week)}</div></div>
    <div class="stepper" style="margin:0">${Array.from({ length: TOTAL_CARDS }, (_, i) => `<i class="${i < week ? 'on' : ''}"></i>`).join('')}</div>
    ${statStrip()}
    <div class="stage" id="stage">
      <div class="dcard" id="dcard">
        ${cuts ? `<div class="swl l" id="swl">${esc(c.opts[0].t.split(' ')[0])}</div><div class="swl r" id="swr">${esc(c.opts[1].t.split(' ')[0])}</div>` : ''}
        <div class="row"><div class="ico">${c.e}</div><div><div class="caps">${inst.follow ? '⏳ Folgeereignis · ' : ''}${esc(c.kat)}</div><div class="tiny mut">Stress ${Math.round(G.res.str)} %${G.res.str > 65 ? ' · erschöpft!' : ''}</div></div></div>
        <h2>${esc(c.title)}</h2>
        <div class="body">${esc(c.text(inst.v))}<div class="q">${esc(c.q)}</div></div>
      </div>
    </div>
    <div class="ochoices" id="och">${opts}</div></div>`, { nav: true, noscroll: true });
  if (cuts) bindSwipe(c);
};
function bindSwipe(c) {
  const el = $('#dcard'); if (!el) return;
  let sx = 0, dx = 0, drag = false;
  const l = $('#swl'), r = $('#swr');
  el.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; drag = true; sx = e.clientX; el.setPointerCapture(e.pointerId); el.style.transition = 'none'; });
  el.addEventListener('pointermove', e => { if (!drag) return; dx = e.clientX - sx; el.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; l.style.opacity = clamp(-dx / 100, 0, 1); r.style.opacity = clamp(dx / 100, 0, 1); });
  const end = () => { if (!drag) return; drag = false; el.style.transition = ''; if (Math.abs(dx) > 100) { el.style.transform = `translateX(${Math.sign(dx) * 600}px) rotate(${dx / 10}deg)`; el.style.opacity = 0; setTimeout(() => ACT.choose({ dataset: { i: dx < 0 ? 0 : 1 } }), 180); } else { el.style.transform = ''; l.style.opacity = r.style.opacity = 0; } dx = 0; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}

/* ---------- Entscheidung auflösen ---------- */
function applyMods(fx, o) {
  const f = Object.assign({}, fx), P = G.party;
  if (P === 'CDU') { if (f.w < 0) f.w = Math.round(f.w / 2); if (f.g < 0) f.g = Math.round(f.g / 2); if (o.fr === 'klima' && f.b > 0) f.b = Math.round(f.b / 2); }
  if (P === 'AFD' && f.m) f.m = Math.round(f.m * 1.5);
  if (P === 'FDP') { if (['sparen', 'wirtschaft'].includes(o.fr)) f.b = (f.b || 0) + 1; if (o.fr === 'sozial' && f.b > 0) f.b = Math.round(f.b * .7); if (o.donation && f.d) f.d = Math.round(f.d * 1.5); }
  if (P === 'SPD') { if (['sparen', 'deal'].includes(o.fr) && f.p < 0) f.p *= 2; if (['sparen', 'deal'].includes(o.fr) && !f.p) f.p = -1; }
  if (P === 'LINKE' && o.fr === 'sozial') f.b = (f.b || 0) + 1;
  if (P === 'GRUENE' && o.ideal) { f.p = (f.p || 0) + o.ideal * 2; f.b = (f.b || 0) - o.ideal; }
  if (P === 'EIGEN' && f.b > 0) f.b = Math.round(f.b * 1.25 * 10) / 10;
  return f;
}
ACT.choose = a => {
  const inst = G.deck[G.cardIdx], c = CARDS[inst.id], i = +a.dataset.i, o = c.opts[i];
  const before = Object.assign({}, G.res);
  let outcome = null, fx = Object.assign({}, o.fx, o.fxf ? o.fxf(inst.v) : {}), text = '';
  if (o.chk) {
    const p = chkProb(o), ok = rnd() < p; outcome = ok ? 'ok' : 'bad';
    const oc = ok ? o.chk.ok : o.chk.bad; fx = Object.assign(fx, oc.fx); text = oc.t;
    if (G.stats[o.chk.s] && ok) G.flags['won_' + o.chk.s] = 1;
  }
  fx = applyMods(fx, o);
  // Medienreaktion je Partei und Ausgangslage
  const risky = ['deal', 'populismus', 'angriff'].includes(o.fr) && rnd() < .5 || (o.fr === 'aussitzen' && rnd() < .35);
  const mr = mediaReaction(o.fr, G.party, risky);
  const mBonus = Math.round(mr.score * (G.party === 'AFD' ? 1.5 : 1) * (G.party === 'EIGEN' ? 1.2 : 1));
  fx.m = (fx.m || 0) + mBonus;
  const R = G.res;
  R.bel = clamp(R.bel + (fx.b || 0), 0, 100); R.par = clamp(R.par + (fx.p || 0), 0, 100);
  R.bud = Math.max(0, Math.round((R.bud + (fx.d || 0)) * 10) / 10);
  R.med = clamp(R.med + (fx.m || 0) * 2, -100, 100);
  R.wirt = clamp(R.wirt + (fx.w || 0), 0, 100); R.umw = clamp(R.umw + (fx.u || 0), 0, 100); R.ges = clamp(R.ges + (fx.g || 0), 0, 100);
  R.str = clamp(R.str + (fx.s || 0) + 1.5, 0, 100);
  if (o.pf) Object.keys(o.pf).forEach(k => G.prof[TH.indexOf(k)] = clamp(G.prof[TH.indexOf(k)] + o.pf[k], .1, 1));
  if (o.ml) Object.keys(o.ml).forEach(k => G.ml[k] = clamp((G.ml[k] || 0) + o.ml[k], -.4, .45));
  if (o.n) Object.keys(o.n).forEach(k => G.npc[k].v = clamp(G.npc[k].v + o.n[k], 0, 100));
  if (o.flag) G.flags[o.flag] = 1;
  if (o.promise) G.promises.push({ t: o.promise, card: c.title });
  if (G.party === 'GRUENE' && o.ideal) G.realo = clamp(G.realo + o.ideal * 12, -100, 100);
  if (G.party === 'EIGEN' && fx.m > 0) G.mom = Math.min(10, G.mom + 1);
  if (G.party === 'EIGEN' && fx.m < 0) G.mom = Math.max(0, G.mom - 1);
  if (mr.score > 0) G.recog = clamp(G.recog + .012 * mr.score, 0, .98);
  // verzögerte Folgen (Schmetterlingseffekt)
  let queued = false;
  if (o.later && rnd() < (o.later.chance || 1) * (G.party === 'AFD' ? 1.25 : 1)) {
    const item = { due: G.cardIdx + 1 + (o.later.after || 2) - 1, kind: o.later.card ? 'card' : 'hl', id: o.later.card, text: (o.later.hl || '').replace('{firma}', inst.v.firma || 'das Unternehmen'), fx: o.later.fx || {}, from: c.title };
    if (item.due >= TOTAL_CARDS) item.due = TOTAL_CARDS - 1;
    if (item.due <= G.cardIdx) item.due = G.cardIdx + 1;
    G.queue.push(item); queued = true;
  }
  // Bundesstimmung: Dein Medienecho färbt minimal auf die Partei ab
  const shock = {}; shock[G.party === 'EIGEN' ? 'SONST' : G.party] = ((fx.b || 0) + (fx.m || 0)) * .035; bundStep(true, shock); bundStep(true);
  G.pollHist.push(expectedShares());
  const after = Object.assign({}, G.res);
  G.log.push({ i: G.cardIdx + 1, title: c.title, choice: o.t, fr: o.fr, outcome });
  G.cardIdx++; save(); buzz(outcome === 'bad' ? [30, 40, 30] : 18);
  showResult({ c, o, before, after, fx, text, outcome, mr, queued });
};
function deltaChips(before, after) {
  const L = [['bel', 'Beliebt'], ['par', 'Partei'], ['bud', 'Kasse'], ['med', 'Medien'], ['wirt', 'Wirtschaft'], ['umw', 'Umwelt'], ['ges', 'Gesellschaft'], ['str', 'Stress']];
  return L.map(([k, n]) => { const d = Math.round((after[k] - before[k]) * 10) / 10; if (!d) return ''; const good = k === 'str' ? d < 0 : d > 0; return `<span class="chip"><span>${n}</span><span class="delta ${good ? 'up' : 'dn'}">${d > 0 ? '+' : '−'}${Math.abs(d)}${k === 'bud' ? 'k' : ''}</span></span>`; }).join(' ');
}
function showResult(r) {
  const hl = r.mr.out.map(x => `<div class="hl ${x.outlet.c} ${x.tone === 'pos' ? 'pos' : ''}"><span class="src">${esc(x.outlet.n)}</span>${esc(x.text)}</div>`).join('');
  const done = G.cardIdx >= TOTAL_CARDS;
  render(`<div class="caps">Ergebnis · ${esc(r.c.title)}</div>
    <h2 class="resbox">Du hast dich entschieden.</h2>
    <div class="glass resbox mt"><div class="small mut">Deine Wahl</div><div class="serif" style="font-size:1.1rem">${esc(r.o.t)}</div>
      ${r.outcome ? `<p class="${r.outcome === 'ok' ? 'gold' : ''}" style="margin:.6em 0 0"><b>${r.outcome === 'ok' ? '✔ Gelungen.' : '✘ Schiefgegangen.'}</b> ${esc(r.text)}</p>` : ''}</div>
    <div class="row wrap mt" style="gap:6px">${deltaChips(r.before, r.after)}</div>
    <h3 class="mt2">So berichten die Medien <span class="tiny mut">· Stimmung für ${esc(pname(G.party))}</span></h3>${hl}
    ${r.queued ? `<div class="glass tight small mt"><b class="gold">🦋 Schmetterlingseffekt:</b> Diese Entscheidung könnte später nachwirken.</div>` : ''}
    ${G.party === 'GRUENE' && r.o.ideal ? `<div class="glass tight small mt">Realo/Fundi-Kurs: <b>${G.realo > 10 ? 'Fundi ' + G.realo : G.realo < -10 ? 'Realo ' + (-G.realo) : 'ausgewogen'}</b></div>` : ''}
    <button class="btn mt2" data-act="nextcard">${done ? 'Wahlkampf-Finale' : 'Nächste Woche'}</button>`, { nav: true });
  $('#screen').scrollTop = 0;
}
ACT.nextcard = () => show('cards');

function showAftermath(q) {
  q.shown = true; const before = Object.assign({}, G.res);
  const R = G.res, f = q.fx;
  R.bel = clamp(R.bel + (f.b || 0), 0, 100); R.par = clamp(R.par + (f.p || 0), 0, 100); R.med = clamp(R.med + (f.m || 0) * 2, -100, 100);
  R.wirt = clamp(R.wirt + (f.w || 0), 0, 100); R.ges = clamp(R.ges + (f.g || 0), 0, 100);
  G.pollHist.push(expectedShares()); save();
  render(`<div class="caps">🦋 Nachwirkung · aus „${esc(q.from)}“</div>
    <h2 class="resbox">Die Folgen holen dich ein.</h2>
    <div class="hl b mt2" style="font-size:1.05rem"><span class="src">Eilmeldung · ${esc(OUTLETS[0].n)}</span>${esc(q.text)}</div>
    <div class="row wrap mt" style="gap:6px">${deltaChips(before, G.res)}</div>
    <p class="mut small mt">Entscheidungen wirken manchmal erst Wochen später – im Amt sogar Jahre.</p>
    <button class="btn mt2" data-act="nextcard">Weiter</button>`, { nav: true });
}

/* ---------- Finale: Letzte Umfrage vor der Wahl ---------- */
function finale() {
  const sh = expectedShares();
  const order = [0, 1, 2, 3].sort((a, b) => sh[b] - sh[a]);
  const names = [G.name, ...G.opp.map(o => o.name)], parts = [G.party, ...G.opp.map(o => o.party)];
  render(`<div class="caps">Wahlkampf-Finale</div><h2>Der Wahltag rückt näher.</h2>
    <p class="mut">Zehn Wochen sind vorbei: Plakate hängen schief, Kugelschreiber sind verteilt, die Stimmung ist ${pick(['gereizt', 'erwartungsvoll', 'müde', 'aufgekratzt'])}.</p>
    ${statStrip()}
    <div class="glass mt"><div class="caps">Letzte Umfrage · ${TOWN.name}</div>
      ${order.map(i => `<div class="brow"><span class="nm">${badge(parts[i] === 'BUERGER' ? 'EIGEN' : parts[i])}</span><div class="track"><div class="fill" style="width:${clamp(sh[i] * 1.6, 2, 100)}%;--pc:${parts[i] === 'BUERGER' ? '#b8c2d8' : pcolor(parts[i])}"></div></div><span class="val">${f1(sh[i])} %</span></div><div class="tiny mut" style="margin:-4px 0 6px 72px">${esc(names[i])}${i === 0 ? ' (du)' : ''}</div>`).join('')}
      <p class="tiny mut">Fehlertoleranz ±3 Punkte. Bei mehr als 50 % gewinnst du direkt, sonst geht es in die Stichwahl.</p></div>
    ${G.promises.length ? `<div class="glass mt"><div class="caps">Deine Versprechen</div><ul class="clean">${G.promises.map(p => `<li>${esc(p.t)}</li>`).join('')}</ul><p class="tiny mut">Versprechen werden im Amt eingefordert.</p></div>` : ''}
    <button class="btn mt2" data-act="vote">Zur Wahl gehen</button>`, { nav: true });
}
ACT.vote = () => startElection(false);

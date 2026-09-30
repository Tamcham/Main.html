/* ---------- Wahlabend: Prognose 18:00, Hochrechnungen, Bezirke, Elefantenrunde ---------- */
let ESTEP = 0;
function startElection(stich) {
  ensureDemoGame();
  G.phase = 'election';
  if (!G.elec || G.elec.stich !== !!stich || G.elec.done) {
    const cands = stich ? G.result.topCands : candList();
    G.elec = makeElection(stich, cands); G.elec.done = false;
    G.eStep = 0;
  }
  ESTEP = G.eStep || 0; save();
  renderElec();
}
const TICK_LINES = [
  (d, n, s) => `Schaltung nach ${d}: ${n} liegt vorn (${f1(s)} %).`,
  (d, n, s) => `${d} ist ausgezählt – ${n} mit ${f1(s)} %. Die Wahlhelfer:innen trinken Kaffee.`,
  (d, n, s) => `Live aus ${d}: ${n} führt. Ein Wahlhelfer zählt „zur Sicherheit“ ein drittes Mal.`
];
function renderElec() {
  const E = G.elec, st = HR_STEPS[ESTEP], hr = hochrechnung(E, ESTEP);
  const C = E.cands, order = C.map((_, i) => i).sort((a, b) => hr.shares[b] - hr.shares[a]);
  const cname = i => C[i].name, cparty = i => C[i].party;
  const cols = i => cparty(i) === 'BUERGER' ? '#b8c2d8' : pcolor(cparty(i));
  const n = E.order.length;
  const grid = DISTRICTS.map((d, i) => { const idx = E.order.indexOf(i); const on = idx < hr.k; let bg = ''; if (on) { const v = E.res.districts[i].v, lead = v.indexOf(Math.max(...v)); bg = `style="background:${cols(lead)}"`; } return `<div class="${on ? 'on' : ''}" ${bg} title="${esc(d.n)}">${on ? (C[E.res.districts[i].v.indexOf(Math.max(...E.res.districts[i].v))].party === 'BUERGER' ? 'F' : pname(C[E.res.districts[i].v.indexOf(Math.max(...E.res.districts[i].v))].party).slice(0, 1)) : ''}</div>`; }).join('');
  const lead = order[0];
  let tick = 'Die Wahllokale haben geschlossen. Die Spannung im Rathaus ist mit dem Löffel zu schneiden.';
  if (ESTEP > 0 && hr.counted.length) { const di = hr.counted[hr.counted.length - 1], v = E.res.districts[di].v, l = v.indexOf(Math.max(...v)); tick = pick(TICK_LINES)(DISTRICTS[di].n, cname(l), v[l] / E.res.districts[di].tot * 100); }
  if (ESTEP === HR_STEPS.length - 1) tick = E.stich ? 'Alle Bezirke ausgezählt. Das vorläufige Ergebnis der Stichwahl steht fest.' : 'Alle Stimmbezirke sind ausgezählt: Das vorläufige Ergebnis steht fest.';
  const turn = Math.round(E.turnout * 100);
  const last = ESTEP === HR_STEPS.length - 1;
  render(`<div class="tvframe fadein">
      <div class="tvh"><span class="live">LIVE · ${E.stich ? 'STICHWAHL' : 'WAHLABEND'}</span><span>${TOWN.name}</span></div>
      <div class="clock" id="eclock">${st.t}</div><div class="center caps" id="ename">${st.n}${ESTEP === 0 ? ' · Nachwahlbefragung' : ''}</div>
      <div class="mt">${order.map(i => `<div class="brow" style="grid-template-columns:62px 1fr 64px"><span class="nm">${badge(cparty(i))}</span><div class="track" style="height:26px"><div class="fill" data-i="${i}" style="width:${clamp(hr.shares[i], 1, 100)}%;--pc:${cols(i)}"></div>${i === order[0] ? '' : ''}<span class="hurdle" style="left:50%;border-color:#fff;opacity:.6"></span></div><span class="val">${f1(hr.shares[i])} %</span></div><div class="tiny" style="margin:-4px 0 4px 70px;color:#b9c7ee">${esc(cname(i))}${i === 0 ? ' (du)' : ''}${C[i].inc ? ' · Amtsinhaber' : ''}</div>`).join('')}</div>
      <div class="tiny" style="color:#9cc0ff;margin-top:2px">Gepunktete Linie: absolute Mehrheit (50 %) · ${ESTEP === 0 ? 'Fehlertoleranz ±3' : hr.k + ' von ' + n + ' Stimmbezirken ausgezählt'}${last ? ' · Wahlbeteiligung ' + turn + ' %' : ''}</div>
      <div class="dgrid">${grid}</div>
      <div class="ticker" id="eticker">${esc(tick)}</div>
    </div>
    <div class="glass tight mt small"><b class="gold">Hochrechnung:</b> Kleine Dörfer werden zuerst ausgezählt, die Innenstadt zuletzt – frühe Zwischenstände sind deshalb verzerrt. Die Hochrechnung korrigiert das nach und nach.</div>
    <button class="btn mt2" data-act="${last ? 'elecend' : 'estep'}">${last ? 'Ergebnis & Elefantenrunde' : ESTEP === 0 ? 'Zur 1. Hochrechnung' : 'Weiter zur nächsten Hochrechnung'}</button>`, { noscroll: false, nogear: true });
}
ACT.estep = () => { ESTEP++; G.eStep = ESTEP; save(); renderElec(); };
ACT.elecend = () => {
  const E = G.elec, sh = E.res.shares, C = E.cands;
  const order = C.map((_, i) => i).sort((a, b) => sh[b] - sh[a]);
  const me = C.findIndex(c => c.me), top = order[0];
  const absolute = sh[top] > 50;
  E.done = true;
  G.result = { stich: E.stich, won: !E.stich ? (absolute && top === me) : top === me, share: sh[me], winnerName: C[top].name, winnerParty: C[top].party, absolute, top: [C[order[0]].name, C[order[1]].name], topCands: [C[order[0]], C[order[1]]], shares: sh.slice(), names: C.map(c => c.name), parties: C.map(c => c.party), me };
  if (!E.stich && !absolute) { G.result.won = false; G.result.needStich = true; }
  save();
  const go = () => show('elecresult');
  if (G.result.needStich) startCutscene('stichwahl', go); else startCutscene('elephant', go);
};
SCREENS.elecresult = () => {
  G.phase = 'elecresult'; save();
  const r = G.result, sh = r.shares, C = r.names.map((n, i) => ({ n, p: r.parties[i], s: sh[i], i })).sort((a, b) => b.s - a.s);
  render(`<div class="caps">${r.stich ? 'Ergebnis der Stichwahl' : 'Vorläufiges Endergebnis'}</div>
    <h2>${r.needStich ? 'Stichwahl!' : r.won ? `${esc(G.name)} ist ${title()} von ${TOWN.name}!` : `${esc(r.winnerName)} gewinnt.`}</h2>
    <div class="avwrap mt" style="padding:10px">${r.won ? playerAvatar('happy') : r.needStich ? playerAvatar('serious') : playerAvatar('serious')}</div>
    <div class="glass mt">${C.map(c => `<div class="brow"><span class="nm">${badge(c.p)}</span><div class="track"><div class="fill" style="width:${clamp(c.s, 1, 100)}%;--pc:${c.p === 'BUERGER' ? '#b8c2d8' : pcolor(c.p)}"></div><span class="hurdle" style="left:50%;border-color:#fff;opacity:.6"></span></div><span class="val">${f1(c.s)} %</span></div><div class="tiny mut" style="margin:-4px 0 4px 72px">${esc(c.n)}</div>`).join('')}</div>
    ${r.needStich ? `<div class="glass mt"><p style="margin:0">Keine Kandidatur erreichte mehr als 50 %. ${r.top.includes(G.name) ? `Du bist in der Stichwahl gegen <b>${esc(r.top.find(n => n !== G.name))}</b>! Die Stimmen der ausgeschiedenen Bewerber:innen werden neu verteilt.` : `Du bist ausgeschieden – die Stichwahl bestreiten ${esc(r.top[0])} und ${esc(r.top[1])}.`}</p></div><button class="btn mt2" data-act="tostich">Stichwahl in 14 Tagen</button>`
      : `<div class="glass mt small"><p style="margin:0">${r.won ? 'Dein Erfolg: ' + (r.share > 58 ? 'ein Durchmarsch – die Stadt wollte es so.' : r.share > 52 ? 'ein solider Sieg.' : 'denkbar knapp – jede Stimme zählte.') : 'Diesmal hat es nicht gereicht. Politik kennt keine endgültigen Niederlagen, nur längere Pausen.'}</p></div>
      <button class="btn mt2" data-act="${r.won ? 'oath' : 'defeat'}">${r.won ? 'Zur Vereidigung' : 'Weiter'}</button>`}`, { nogear: true });
};
ACT.tostich = () => startElection(true);
ACT.oath = () => startCutscene('oath', () => show('timeskip'));
ACT.defeat = () => startCutscene('defeat', () => show('timeskip'));

/* ---------- Zeitsprung zum Bundestag ---------- */
SCREENS.timeskip = () => {
  const r = G.result; G.phase = 'timeskip'; save();
  render(`<div class="caps">Zeitsprung</div><h2>${r.won ? 'Zwölf Jahre später …' : 'Vier Jahre später …'}</h2>
    <div class="avwrap mt">${playerAvatar('neutral', {}, r.won ? 12 : 4)}</div>
    <p class="mt">${r.won ? `Nach zwei Amtszeiten als ${title()} von ${TOWN.name} (Wiederwahl mit einem Kaffeeautomaten im Rathausflur als Höhepunkt der zweiten) zieht ${esc(G.name)} für ${esc(pname(G.party))} in den Bundestag ein.` : `Nach der Niederlage von ${TOWN.name} arbeitest du dich im Ortsverband hoch, führst den Kreisverband – und rückst schließlich über die Landesliste in den Bundestag nach.`}</p>
    <p class="mut">Dein Avatar ist sichtbar älter – ein paar Falten, graue Schläfen, derselbe Kugelschreiber. Jetzt wartet das Hohe Haus. Deine erste Rede ist angesetzt.</p>
    <button class="btn mt2" data-act="tospeech">Zur ersten Bundestagsrede</button>`, { nogear: true });
};
ACT.tospeech = () => startSpeech();

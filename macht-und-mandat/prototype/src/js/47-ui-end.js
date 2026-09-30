/* ---------- Profil (Figur, Werte, NPCs, Geschichtsbuch) ---------- */
SCREENS.profile = () => {
  ensureDemoGame();
  const B = BACKGROUNDS[G.bg], P = PARTIES[G.party], r = G.res;
  const stats = STATS.map(s => meter(s.n, G.stats[s.id])).join('');
  const npc = Object.values(G.npc).map(n => `<div class="row" style="padding:6px 0"><div class="badge lg" style="--pc:#26366b;color:#fff;font-size:1.4rem">${n.e}</div><div class="grow"><div><b>${esc(n.n)}</b> <span class="small mut">· ${esc(n.r)}</span></div><div class="tiny mut">${esc(n.d)}</div>${meter('Beziehung', n.v, { cls: n.v >= 40 ? 'g' : 'r' })}</div></div>`).join('');
  const book = G.log.length ? G.log.map(l => `<div class="kv"><span><b>Woche ${l.i}</b> · ${esc(l.title)}<br><span class="small mut">${esc(l.choice)}${l.outcome ? (l.outcome === 'ok' ? ' ✔' : ' ✘') : ''}</span></span></div>`).join('') : '<p class="small mut">Noch keine Einträge – dein Lebenslauf beginnt mit der ersten Entscheidung.</p>';
  render(`<div class="caps">Profil</div><h2>${esc(G.name)}</h2>
    <div class="row"><div class="avwrap" style="width:120px;padding:2px">${playerAvatar(r.str > 75 ? 'serious' : 'neutral')}</div>
      <div class="grow"><div class="row">${badge(G.party)}<div><div class="serif" style="font-size:1.1rem">${esc(pname(G.party))}</div><div class="small mut">${B.e} ${B.n} · ${HERKUNFT[G.herk].n}</div></div></div>
      <div class="tiny mut mt">Dialekt: ${DIALEKTE[G.dial].n} · Alter ${G.age}</div><div class="tiny gold" style="margin-top:4px">Mechanik: ${esc(P.mech.n)}</div></div></div>
    <div class="glass mt"><div class="caps">Lage</div>${statStrip()}
      <div class="statrow mt">${meter('Wirtschaft', r.wirt)}${meter('Umwelt', r.umw)}${meter('Gesellschaft', r.ges)}${meter('Stress', r.str, { cls: r.str > 65 ? 'r' : '' })}</div></div>
    <div class="glass mt"><div class="caps">Fähigkeiten</div>${stats}</div>
    ${G.party === 'GRUENE' ? `<div class="glass mt"><div class="caps">Realo/Fundi-Regler</div>${meter(G.realo > 10 ? 'Fundi-Kurs' : G.realo < -10 ? 'Realo-Kurs' : 'ausgewogen', (G.realo + 100) / 2, { txt: sgn(G.realo) })}</div>` : ''}
    ${G.party === 'EIGEN' ? `<div class="glass mt"><div class="caps">Momentum (Wachstumsspirale)</div>${meter('Momentum', G.mom * 10, { txt: G.mom + '/10' })}</div>` : ''}
    <div class="glass mt"><div class="caps">Beziehungen</div>${npc}</div>
    ${G.promises.length ? `<div class="glass mt"><div class="caps">Versprechen</div><ul class="clean">${G.promises.map(p => `<li>${esc(p.t)} <span class="tiny mut">(${esc(p.card)})</span></li>`).join('')}</ul></div>` : ''}
    <div class="glass mt"><div class="caps">Geschichtsbuch</div>${book}</div>`, { nav: true });
};

/* ---------- Karriere-Bilanz ---------- */
function legacyScore() {
  const r = G.result || { won: false, share: 30 }, R = G.res, S = G.speech;
  const parts = [
    ['Wahlergebnis', r.won ? 35 + Math.min(15, Math.max(0, (r.share - 50) * 1.5)) : r.share * .6, 50],
    ['Integrität', G.stats.ehr / 100 * 10 + (G.flags.spendeGeheim ? -2 : 0), 10],
    ['Medienecho', (R.med + 100) / 200 * 10, 10],
    ['Parteirückhalt', R.par / 100 * 10, 10],
    ['Versprechen', Math.min(10, G.promises.length * 2.5), 10],
    ['Rede im Bundestag', S && S.score ? S.score * .1 : 0, 10]
  ];
  const total = parts.reduce((a, p) => a + p[1], 0);
  return { parts, total: Math.round(total) };
}
SCREENS.end = () => {
  const L = legacyScore(), r = G.result || {};
  const title_ = L.total >= 80 ? 'Kanzler-Format' : L.total >= 65 ? 'Politische Schwergewicht' : L.total >= 50 ? 'Aufsteiger:in mit Potenzial' : L.total >= 35 ? 'Lokalmatador:in' : 'Lehrjahre';
  const stages = [['Kommune', 'Bürgermeisterwahl', 1], ['Land', 'Landtag, MP', 0], ['Bund', 'Bundestag, Fraktion', 0.35], ['Kanzleramt', 'Kandidatur, Regieren', 0], ['Endgame', 'Wiederwahl, Vermächtnis', 0]];
  render(`<div class="caps">Karriere-Bilanz · Prototyp</div><h2>${esc(G.name)} – ${esc(title_)}</h2>
    <div class="row mt"><div class="avwrap" style="width:130px;padding:2px">${playerAvatar('happy', {}, r.won ? 12 : 4)}</div><div class="grow"><div class="glass center" style="padding:10px"><div class="caps">Legacy-Score</div><div style="font:800 2.6rem var(--serif);color:var(--gold2)">${L.total}</div><div class="tiny mut">von 100</div></div></div></div>
    <div class="glass mt">${L.parts.map(p => `<div style="margin:6px 0">${meter(p[0], p[1] / p[2] * 100, { txt: f1(p[1]) + '/' + p[2] })}</div>`).join('')}</div>
    <div class="glass mt"><div class="caps">Dein Lebenslauf</div>
      <div class="kv"><span>Bürgermeisterwahl ${TOWN.name}</span><span class="gold">${r.won ? 'gewonnen (' + f1(r.share) + ' %)' : 'verloren (' + f1(r.share || 0) + ' %)'}</span></div>
      <div class="kv"><span>Entscheidungen</span><span>${G.log.length}</span></div>
      <div class="kv"><span>Versprechen</span><span>${G.promises.length}</span></div>
      <div class="kv"><span>Bundestagsrede</span><span>${G.speech && G.speech.score != null ? G.speech.score + '/100' : '–'}</span></div></div>
    <div class="glass mt"><div class="caps">Weiterer Weg</div>${stages.map(s => `<div style="margin:8px 0">${meter((s[2] >= 1 ? '✔ ' : s[2] > 0 ? '◐ ' : '🔒 ') + s[0] + ' · ' + s[1], s[2] * 100, { txt: s[2] >= 1 ? 'fertig' : s[2] > 0 ? 'Demo' : 'folgt' })}</div>`).join('')}
      <p class="tiny mut">Der Prototyp zeigt den Kern der Schleife. Landtag, Kanzlerwahlkampf, Koalitionsverhandlungen und Regieren folgen im Vertical Slice (siehe Roadmap).</p></div>
    <div class="row mt2"><button class="btn ghost" data-act="tocards">Profil ansehen</button><button class="btn" data-act="restart">Neue Karriere</button></div>`, { nav: true });
};
ACT.tocards = () => show('profile');
ACT.restart = () => { G = null; wipeSave(); show('start'); };

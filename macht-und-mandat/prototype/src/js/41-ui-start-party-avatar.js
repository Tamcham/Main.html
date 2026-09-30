/* ---------- Start ---------- */
const CREST = `<svg class="crest" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c4"/><stop offset=".6" stop-color="#d6b16c"/><stop offset="1" stop-color="#8f7238"/></linearGradient></defs><circle cx="60" cy="60" r="56" fill="none" stroke="url(#cg)" stroke-width="2.5"/><circle cx="60" cy="60" r="50" fill="rgba(19,34,77,.65)" stroke="rgba(214,177,108,.4)"/><path d="M60 24 26 44v6h68v-6z" fill="url(#cg)"/><g fill="url(#cg)"><rect x="32" y="55" width="9" height="34"/><rect x="50" y="55" width="9" height="34"/><rect x="61" y="55" width="9" height="34"/><rect x="79" y="55" width="9" height="34"/></g><rect x="26" y="92" width="68" height="6" fill="url(#cg)"/><rect x="21" y="100" width="78" height="5" fill="url(#cg)"/></svg>`;

SCREENS.start = () => {
  const sv = loadSave();
  G = G || null;
  render(`<div class="hero fadein">
    ${CREST}
    <div><div class="caps">Ein Politik-Karrierespiel</div>
    <h1>Macht &amp; Mandat</h1><div class="sub">Vom Rathaus ins Kanzleramt</div></div>
    <p class="mut" style="max-width:32ch;margin:0 auto">Vom Gemeinderat bis zur Kanzlerschaft: jede Entscheidung hat Folgen – manche erst nach Jahren. Natürlich ist alles frei erfunden. Fast alles.</p>
    <div class="col" style="display:flex;flex-direction:column;gap:10px;margin-top:6px">
      <button class="btn" data-act="newgame">Neue Karriere beginnen</button>
      ${sv ? `<button class="btn ghost" data-act="continue">Fortsetzen · ${esc(sv.name || 'Spielstand')}${sv.party ? ' (' + esc(PARTIES[sv.party].name) + ')' : ''}</button>` : ''}
      <button class="btn ghost" data-act="howto">Wie wird gespielt?</button>
    </div>
    <div class="tiny mut">Prototyp v0.1 · Alle Figuren, Orte und Institute sind fiktiv. Parteien sind stilisiert dargestellt.</div>
  </div>`, { nogear: false });
};
ACT.newgame = () => {
  if (loadSave()) return openSheet(`<h2>Neue Karriere beginnen?</h2><p class="mut">Dein gespeicherter Spielstand wird dabei überschrieben.</p><div class="row mt"><button class="btn ghost" data-act="close">Abbrechen</button><button class="btn" data-act="newgame2">Neu beginnen</button></div>`);
  ACT.newgame2();
};
ACT.newgame2 = () => { closeSheet(); G = newGame(); G.phase = 'party'; wipeSave(); show('party'); };
ACT.continue = () => {
  const sv = loadSave(); if (!sv) return; G = sv;
  const ph = G.phase;
  if (ph === 'party') show('party'); else if (ph === 'avatar') show('avatar', G.avStep || 1); else if (ph === 'campaign') show('campaign');
  else if (ph === 'cards') show(G.lastTab || 'cards'); else if (ph === 'election') { if (G.elec && G.elec.done) show('elecresult'); else startElection(G.elec && G.elec.stich); } else if (ph === 'elecresult') show('elecresult'); else if (ph === 'timeskip') show('timeskip'); else if (ph === 'speech') startSpeech();
  else if (ph === 'end') show('end'); else show('cards');
};
ACT.howto = () => openSheet(`<h2>Wie wird gespielt?</h2><ul class="clean">
  <li><b>Entscheidungskarten:</b> Tippe eine Option an – bei Zwei-Optionen-Karten kannst du auch wischen.</li>
  <li><b>Vorschau:</b> Pfeile zeigen die wahrscheinlichen Folgen. Wie zuverlässig sie sind, hängt von deinem Netzwerk und deiner Intelligenz ab („?“ = Berater:innen unsicher).</li>
  <li><b>Wagnis:</b> Manche Optionen sind Proben. Die Erfolgschance hängt an deinen Fähigkeiten – und an deinem Stress.</li>
  <li><b>Folgen:</b> Einiges schlägt erst später zu. Schlagzeilen reagieren je nach Partei anders.</li>
  <li><b>Ziel:</b> Gewinne die Bürgermeisterwahl in Niederhüttingen – und schau, wie weit dich die Karriere trägt.</li></ul>
  <button class="btn mt" data-act="close">Verstanden</button>`);

/* ---------- Parteiwahl ---------- */
function logoSVG(style, color, abk, size) {
  const s = size || 54, c = color || '#d6b16c', t = esc((abk || '').slice(0, 4));
  const shapes = {
    kreis: `<circle cx="30" cy="30" r="26" fill="${c}"/>`,
    schild: `<path d="M10 8h40v24c0 14-12 22-20 26C22 54 10 46 10 32z" fill="${c}"/>`,
    raute: `<path d="M30 3 57 30 30 57 3 30z" fill="${c}"/>`,
    stern: `<path d="M30 3l7 17 18 2-14 12 5 18-16-10-16 10 5-18L5 22l18-2z" fill="${c}"/>`
  };
  return `<svg width="${s}" height="${s}" viewBox="0 0 60 60">${shapes[style] || shapes.kreis}<text x="30" y="${style === 'stern' ? 37 : 34}" text-anchor="middle" font-size="${t.length > 2 ? 13 : 16}" font-weight="800" fill="#0a0a0a" style="font-family:Georgia,serif">${t}</text></svg>`;
}
SCREENS.party = () => {
  G.phase = 'party'; save();
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  render(`<div class="stepper"><i class="on"></i><i></i><i></i><i></i></div>
    <div class="caps">Schritt 1 von 4</div><h2>Welche Partei vertrittst du?</h2>
    <p class="mut small">Jede Partei hat eigene Stärken, Schwächen und eine eigene Spielmechanik. Tippe für Details.</p>
    <div class="pgrid mt">${PARTY_ORDER.map(id => { const P = PARTIES[id]; return `<button class="pcard ${G.party === id ? 'sel' : ''}" style="--pc:${pcolor(id)}" data-act="pinfo" data-p="${id}">
      <div class="row">${id === 'EIGEN' ? logoSVG(G.own.logo, pcolor('EIGEN'), G.own.abk, 34) : badge(id)}<span class="pn">${esc(id === 'EIGEN' ? 'Eigene Partei' : P.name)}</span></div>
      <div class="ps">${esc(P.slogan)}</div><div class="stars" title="Schwierigkeit" aria-label="Schwierigkeit ${P.diff} von 5">${stars(P.diff)}</div></button>`; }).join('')}</div>`);
};
ACT.pinfo = a => {
  const id = a.dataset.p, P = PARTIES[id];
  if (id === 'EIGEN') return ownEditor();
  openSheet(`<div class="row">${badge(id, true)}<div><h2>${esc(P.name)}</h2><div class="small mut">${esc(P.voll)}</div></div></div>
    <p class="serif gold" style="font-style:italic;font-size:1.05rem">„${esc(P.slogan)}“</p>
    <div class="kv"><span class="mut">Kernthemen</span><span>${esc(P.kern.join(' · '))}</span></div>
    <div class="kv"><span class="mut">Wählerschaft</span><span style="text-align:right;max-width:60%">${esc(P.waehler)}</span></div>
    <div class="kv"><span class="mut">Flügel</span><span style="text-align:right;max-width:60%">${esc(P.fluegel)}</span></div>
    <h3 class="mt">Stärken</h3><ul class="clean">${P.staerken.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <h3>Schwächen</h3><ul class="clean">${P.schwaechen.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <div class="glass tight mt"><div class="caps">Spielmechanik · ${esc(P.mech.n)}</div><p class="small" style="margin:.3em 0 0">${esc(P.mech.t)}</p></div>
    <p class="small mut">Interner Konflikt: ${esc(P.konflikt)}</p>
    <div class="row mt"><button class="btn ghost" data-act="close">Zurück</button><button class="btn" data-act="pickparty" data-p="${id}">Diese Partei wählen</button></div>`);
};
function ownEditor() {
  const o = G.own, tot = o.sl.reduce((a, b) => a + b, 0);
  const sw = ['#d6b16c', '#e3404b', '#3f86e0', '#46b762', '#f5c72e', '#a66be3', '#e8833a', '#2bb3b1'];
  openSheet(`<h2>Eigene Partei gründen</h2><p class="mut small">Neue Parteien starten schwer: 5-%-Hürde, wenig Geld, kaum Bekanntheit – dafür gibt es enormes Wachstumspotenzial.</p>
    <label class="f">Name</label><input type="text" maxlength="28" value="${esc(o.name)}" data-bind="own.name" aria-label="Parteiname">
    <label class="f">Kürzel (max. 4 Zeichen)</label><input type="text" maxlength="4" value="${esc(o.abk)}" data-bind="own.abk" aria-label="Kürzel">
    <label class="f">Motto</label><input type="text" maxlength="60" value="${esc(o.motto)}" data-bind="own.motto" aria-label="Motto">
    <label class="f">Logo &amp; Farbe</label>
    <div class="row wrap"><div id="logoprev" class="avwrap" style="padding:8px">${logoSVG(o.logo, o.color, o.abk, 64)}</div>
      <div class="opts">${['kreis', 'schild', 'raute', 'stern'].map(l => `<button class="opt ${o.logo === l ? 'on' : ''}" data-act="ownlogo" data-l="${l}">${l[0].toUpperCase() + l.slice(1)}</button>`).join('')}</div></div>
    <div class="row wrap mt">${sw.map(c => `<button class="sw ${o.color === c ? 'on' : ''}" style="background:${c}" data-act="owncolor" data-c="${c}" aria-label="Farbe ${c}"></button>`).join('')}</div>
    <label class="f">Grundsatzprogramm (Themenregler) · <span id="slsum">${tot}</span>/330 Punkte</label>
    ${THEMES.map((t, i) => `<div class="attr"><div><b>${t.n}</b></div><div><input type="range" min="0" max="100" value="${o.sl[i]}" data-slider="${i}" aria-label="${t.n}"></div></div>`).join('')}
    <p class="tiny mut">Hohe Werte = starkes Profil bei diesem Thema. Das Punktekonto ist begrenzt: Du kannst nicht überall glänzen.</p>
    <label class="f">Startkapital · <span id="kapv">${o.kap}</span>k€</label><input type="range" min="2" max="8" step="1" value="${o.kap}" data-bind="own.kap" aria-label="Startkapital">
    <div class="row mt"><button class="btn ghost" data-act="close">Abbrechen</button><button class="btn" data-act="pickparty" data-p="EIGEN">Gründen!</button></div>`);
}
ACT.ownlogo = a => { G.own.logo = a.dataset.l; ownEditor(); };
ACT.owncolor = a => { G.own.color = a.dataset.c; ownEditor(); };
ACT.pickparty = a => {
  const id = a.dataset.p;
  if (id === 'EIGEN') { if (!G.own.name.trim()) G.own.name = 'Bürgerliste Zukunft'; if (!G.own.abk.trim()) G.own.abk = 'BZ'; PARTIES.EIGEN.name = G.own.name; PARTIES.EIGEN.motto = G.own.motto; PARTIES.EIGEN.slogan = G.own.motto || 'Neu. Anders. Ungetestet.'; PARTIES.EIGEN.kern = THEMES.map((t, i) => [t.n, G.own.sl[i]]).sort((x, y) => y[1] - x[1]).slice(0, 3).map(x => x[0]); PARTIES.EIGEN.color = G.own.color; }
  G.party = id; closeSheet(); G.phase = 'avatar'; G.avStep = 1; save(); show('avatar', 1);
};

/* ---------- Avatar-Erstellung ---------- */
SCREENS.avatar = step => {
  step = step || G.avStep || 1; G.avStep = step; G.phase = 'avatar'; save();
  const P = PARTIES[G.party];
  const head = `<div class="stepper"><i class="on"></i><i class="on"></i><i class="${step >= 3 ? 'on' : ''}"></i><i></i></div><div class="caps">Schritt 2 von 4 · Figur ${step}/3</div>`;
  if (step === 1) {
    render(`${head}<h2>Wer bist du?</h2>
      <label class="f">Name</label><input type="text" maxlength="30" value="${esc(G.name)}" placeholder="Vor- und Nachname" data-bind="name" aria-label="Name">
      <label class="f">Anrede</label><div class="opts">${[['frau', 'Bürgermeisterin'], ['mann', 'Bürgermeister'], ['div', 'Bürgermeister:in']].map(a => `<button class="opt ${G.anrede === a[0] ? 'on' : ''}" data-act="set" data-k="anrede" data-v="${a[0]}">${a[1]}</button>`).join('')}</div>
      <label class="f">Beruf &amp; Hintergrund</label><div class="opts">${Object.entries(BACKGROUNDS).map(([k, b]) => `<button class="opt ${G.bg === k ? 'on' : ''}" data-act="set" data-k="bg" data-v="${k}">${b.e} ${b.n}</button>`).join('')}</div>
      <div class="glass tight mt small"><p style="margin:0">${esc(BACKGROUNDS[G.bg].t)}</p><p class="gold" style="margin:.4em 0 0">Startbonus: ${esc(BACKGROUNDS[G.bg].npc)}</p></div>
      <label class="f">Herkunft</label><div class="opts">${Object.entries(HERKUNFT).map(([k, b]) => `<button class="opt ${G.herk === k ? 'on' : ''}" data-act="set" data-k="herk" data-v="${k}">${b.n}</button>`).join('')}</div>
      <p class="small mut">${esc(HERKUNFT[G.herk].t)}</p>
      <label class="f">Dialekt &amp; Stimme</label><div class="opts">${Object.entries(DIALEKTE).map(([k, b]) => `<button class="opt ${G.dial === k ? 'on' : ''}" data-act="set" data-k="dial" data-v="${k}">${b.n}</button>`).join('')}</div>
      <p class="small mut">${esc(DIALEKTE[G.dial].t)}</p>
      <div class="row mt2"><button class="btn ghost" data-act="back2party">Zurück</button><button class="btn" data-act="avnext" data-s="2">Weiter</button></div>`);
  } else if (step === 2) {
    render(`${head}<h2>Aussehen</h2>
      <div class="avwrap" id="avprev">${playerAvatar('neutral')}</div>
      <label class="f">Alter · ${G.age} Jahre</label><input type="range" min="26" max="62" value="${G.age}" data-bind="age" aria-label="Alter">
      <p class="tiny mut">Dein Avatar altert sichtbar im Laufe der Karriere – Falten, graue Haare, Erschöpfung inklusive.</p>
      <label class="f">Hautton</label><div class="row wrap">${SKINS.map((c, i) => `<button class="sw ${G.av.skin === i ? 'on' : ''}" style="background:${c}" data-act="avset" data-k="skin" data-v="${i}" aria-label="Hautton ${i + 1}"></button>`).join('')}</div>
      <label class="f">Gesichtsform</label><div class="opts">${FACES.map(o => `<button class="opt ${G.av.face === o.id ? 'on' : ''}" data-act="avset" data-k="face" data-v="${o.id}">${o.n}</button>`).join('')}</div>
      <label class="f">Frisur</label><div class="opts">${HAIRS.map(o => `<button class="opt ${G.av.hair === o.id ? 'on' : ''}" data-act="avset" data-k="hair" data-v="${o.id}">${o.n}</button>`).join('')}</div>
      <label class="f">Haarfarbe</label><div class="row wrap">${HAIRC.map((c, i) => `<button class="sw ${G.av.hairc === i ? 'on' : ''}" style="background:${c}" data-act="avset" data-k="hairc" data-v="${i}" aria-label="Haarfarbe ${i + 1}"></button>`).join('')}</div>
      <label class="f">Kleidung</label><div class="opts">${OUTFITS.map(o => `<button class="opt ${G.av.outfit === o.id ? 'on' : ''}" data-act="avset" data-k="outfit" data-v="${o.id}">${o.n}</button>`).join('')}</div>
      <label class="f">Accessoire</label><div class="opts">${ACCS.map(o => `<button class="opt ${G.av.acc === o.id ? 'on' : ''}" data-act="avset" data-k="acc" data-v="${o.id}">${o.n}</button>`).join('')}</div>
      <div class="row mt2"><button class="btn ghost" data-act="avnext" data-s="1">Zurück</button><button class="btn" data-act="avnext" data-s="3">Weiter</button></div>`);
  } else {
    const B = BACKGROUNDS[G.bg], H = HERKUNFT[G.herk];
    const eff = { ...G.stats }; Object.keys(B.st).forEach(k => eff[k] += B.st[k]); Object.keys(H.st || {}).forEach(k => eff[k] += H.st[k]);
    const rows = STATS.map(s => `<div class="attr"><div><b>${s.n}</b><div class="tiny mut">${s.d}</div>
        <div class="bar" style="margin-top:4px"><i style="width:${clamp(eff[s.id], 0, 100)}%"></i></div></div>
        <div class="pm"><button data-act="stat" data-s="${s.id}" data-d="-1" aria-label="${s.n} senken">−</button><span>${Math.round(eff[s.id])}</span><button data-act="stat" data-s="${s.id}" data-d="1" aria-label="${s.n} erhöhen">+</button></div></div>`).join('');
    render(`${head}<h2>Fähigkeiten</h2>
      <div class="row"><div class="avwrap" style="width:96px;padding:2px">${playerAvatar('neutral')}</div><div><div class="serif" style="font-size:1.2rem">${esc(G.name || 'Dein Name')}</div><div class="small mut">${B.n} · ${esc(P.name)}</div><div class="pts mt">Freie Punkte: ${G.free}</div></div></div>
      <hr class="rule">${rows}
      <p class="tiny mut">Hintergrund und Herkunft geben Boni (in den Werten oben bereits enthalten). Verteile ${G.free} freie Punkte – jeder Wert maximal 90.</p>
      <div class="row mt2"><button class="btn ghost" data-act="avnext" data-s="2">Zurück</button><button class="btn" data-act="avdone" ${G.free > 0 ? '' : ''}>Weiter zur Kampagne</button></div>`);
  }
};
ACT.back2party = () => show('party');
ACT.set = a => { G[a.dataset.k] = a.dataset.v; save(); show('avatar', 1); };
ACT.avset = a => { const v = a.dataset.v; G.av[a.dataset.k] = /^\d+$/.test(v) ? +v : v; save(); const sc = $('#screen').scrollTop; SCREENS.avatar(2); $('#screen').scrollTop = sc; };
ACT.avnext = a => {
  if ((+a.dataset.s) >= 2 && G.avStep === 1) { if (!G.name.trim()) { toast('Bitte gib deiner Figur einen Namen.'); return; } G.nn = G.name.trim().split(/\s+/).pop(); }
  show('avatar', +a.dataset.s);
};
ACT.stat = a => {
  const k = a.dataset.s, d = +a.dataset.d;
  const B = BACKGROUNDS[G.bg], H = HERKUNFT[G.herk];
  const bonus = (B.st[k] || 0) + ((H.st || {})[k] || 0);
  if (d > 0 && (G.free <= 0 || G.stats[k] + bonus >= 90)) return toast(G.free <= 0 ? 'Keine freien Punkte mehr.' : 'Maximal 90.');
  if (d < 0 && G.stats[k] <= 30) return toast('Mindestens 30 Basispunkte.');
  G.stats[k] += d * 2; G.free -= d; save();
  const sc = $('#screen').scrollTop; SCREENS.avatar(3); $('#screen').scrollTop = sc;
};
ACT.avdone = () => {
  if (!G.name.trim()) { toast('Bitte gib deiner Figur einen Namen.'); return show('avatar', 1); }
  G.nn = G.name.trim().split(/\s+/).pop();
  // Basiswerte: 45 + Punkte; Hintergrund-/Herkunftsboni werden in initCharacter addiert
  initCharacter(); setupOpponents(); initBund();
  G.phase = 'campaign'; save(); show('campaign');
};

/* ---------- Eingabe-Bindings ---------- */
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.bind) {
    const path = t.dataset.bind.split('.'); let o = G; while (path.length > 1) o = o[path.shift()];
    const k = path[0]; o[k] = t.type === 'range' ? +t.value : t.value;
    if (k === 'age') { const pv = $('#avprev'); if (pv) pv.innerHTML = playerAvatar('neutral'); const l = t.previousElementSibling; if (l) l.textContent = `Alter · ${G.age} Jahre`; }
    if (k === 'kap') { const e2 = $('#kapv'); if (e2) e2.textContent = G.own.kap; }
    if (t.dataset.bind === 'own.abk') { const lp = $('#logoprev'); if (lp) lp.innerHTML = logoSVG(G.own.logo, G.own.color, G.own.abk, 64); }
    save();
  }
  if (t.dataset.slider !== undefined) {
    const i = +t.dataset.slider, others = G.own.sl.reduce((a, b, j) => j === i ? a : a + b, 0);
    const v = Math.min(+t.value, 330 - others); t.value = v; G.own.sl[i] = v; const sm = $('#slsum'); if (sm) sm.textContent = G.own.sl.reduce((a, b) => a + b, 0); save();
  }
  if (t.dataset.camp) { campInput(t); }
});

/* ---------- Kampagne planen ---------- */
function sloganTilt() {
  if (G.camp.sl === 5) { const r = seeded(hashStr(G.camp.slfree || 'x')); return MI.map(() => (r() - .35) * .14); }
  return (SLOGANS[G.camp.sl] || SLOGANS[0]).m;
}
function reachHTML() {
  const b = campaignBoost().map((x, g) => x + sloganTilt()[g]);
  return MILIEUS.map((m, g) => `<div class="brow" style="grid-template-columns:130px 1fr 46px"><span class="nm small" style="font-weight:600">${m.n}</span><div class="track"><div class="fill" style="width:${clamp((b[g] + .15) / .5 * 100, 2, 100)}%;--pc:${pcolor(G.party)}"></div></div><span class="val small">${b[g] >= 0 ? '+' : ''}${(b[g] * 100).toFixed(0)}</span></div>`).join('');
}
SCREENS.campaign = () => {
  G.phase = 'campaign'; save();
  const bud = G.res.bud, spent = Object.values(G.camp.k).reduce((a, b) => a + b, 0);
  render(`<div class="stepper"><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div><div class="caps">Schritt 3 von 4 · Kampagne</div>
    <h2>Kampagne planen</h2>
    <p class="mut small">In ${TOWN.name} (${f0(TOWN.ew)} Einwohner:innen) wird in zehn Wochen ${title()} gewählt. Dein Kampagnenetat: <b class="gold">${f0(bud)}k€</b>.</p>
    <label class="f">Slogan</label>
    <div class="opts" style="flex-direction:column">${SLOGANS.map((s, i) => `<button class="opt ${G.camp.sl === i ? 'on' : ''}" style="text-align:left" data-act="slogan" data-i="${i}">„${esc(s.t)}“</button>`).join('')}
      <button class="opt ${G.camp.sl === 5 ? 'on' : ''}" style="text-align:left" data-act="slogan" data-i="5">✍️ Eigener Slogan…</button></div>
    ${G.camp.sl === 5 ? `<input type="text" maxlength="48" class="mt" placeholder="Dein Slogan (max. 48 Zeichen)" value="${esc(G.camp.slfree)}" data-bind="camp.slfree" aria-label="Eigener Slogan">` : ''}
    <label class="f">Budget verteilen · Rest bleibt als Reserve (<span id="resv">${f1(bud - spent)}</span>k€)</label>
    ${CHANNELS.map(c => `<div class="attr"><div><b>${c.e} ${c.n}</b> <span class="mut small" id="cv-${c.id}">${f1(G.camp.k[c.id])}k€</span></div><div></div></div><input type="range" min="0" max="${Math.max(1, Math.floor(bud))}" step="0.5" value="${G.camp.k[c.id]}" data-camp="${c.id}" aria-label="${c.n}">`).join('')}
    <label class="f">Erwartete Wirkung nach Zielgruppe</label><div id="reach">${reachHTML()}</div>
    <p class="tiny mut">Abnehmender Grenznutzen: Der zweite Euro im selben Kanal bringt weniger als der erste im nächsten. Reserve brauchst du für Überraschungen.</p>
    <button class="btn mt2" data-act="campgo">Wahlkampf starten</button>`);
};
ACT.slogan = a => { G.camp.sl = +a.dataset.i; save(); SCREENS.campaign(); };
function campInput(t) {
  const id = t.dataset.camp, bud = G.res.bud;
  const others = Object.entries(G.camp.k).reduce((a, [k, v]) => k === id ? a : a + v, 0);
  const v = Math.min(+t.value, bud - others); t.value = v; G.camp.k[id] = v;
  $('#cv-' + id).textContent = f1(v) + 'k€'; $('#resv').textContent = f1(bud - others - v); $('#reach').innerHTML = reachHTML(); save();
}
ACT.campgo = () => {
  const spent = Object.values(G.camp.k).reduce((a, b) => a + b, 0);
  G.camp.spent = spent; G.res.bud = Math.round((G.res.bud - spent) * 10) / 10;
  buildDeck(); G.phase = 'cards'; G.cardIdx = 0; save(); startCutscene('intro', () => show('cards'));
};

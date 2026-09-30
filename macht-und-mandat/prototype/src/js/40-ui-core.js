/* ---------- Screen-Manager, Navigation, Einstellungen ---------- */
const SCREENS = {}, ACT = {};
let CUR = null;
const NAVTABS = [['cards', '🗂️', 'Lage'], ['polls', '📊', 'Umfragen'], ['profile', '👤', 'Profil']];

function render(html, o) {
  o = o || {};
  const sc = $('#screen');
  sc.innerHTML = html;
  sc.classList.toggle('noscroll', !!o.noscroll);
  sc.scrollTop = 0;
  const nav = $('#nav');
  nav.classList.toggle('on', !!o.nav);
  if (o.nav) nav.innerHTML = NAVTABS.map(t => `<button data-act="nav" data-s="${t[0]}" class="${CUR === t[0] ? 'act' : ''}" aria-label="${t[2]}"><span>${t[1]}</span>${t[2]}</button>`).join('');
  $('#gear').style.display = '';
}
function show(name, data) {
  CUR = name;
  if (G && ['cards', 'polls', 'profile'].includes(name)) { G.lastTab = name; save(); }
  SCREENS[name](data);
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (!a || a.disabled) return;
  const fn = ACT[a.dataset.act];
  if (fn) { buzz(8); fn(a, e); }
});
ACT.nav = a => show(a.dataset.s);
ACT.close = () => closeSheet();
$('#sheetbg').addEventListener('click', e => { if (e.target.id === 'sheetbg') closeSheet(); });

/* ---------- gemeinsame UI-Bausteine ---------- */
function meter(label, val, o) {
  o = o || {};
  const v = clamp(val, 0, 100);
  return `<div class="meter"><div class="lab"><span>${label}</span><span>${o.txt || Math.round(val)}</span></div><div class="bar ${o.cls || ''}"><i style="width:${v}%"></i></div></div>`;
}
function statStrip() {
  const r = G.res;
  return `<div class="statrow">
    ${meter('Beliebt', r.bel)}${meter('Partei', r.par)}
    ${meter('Kasse', clamp(r.bud * 2, 0, 100), { txt: f0(r.bud) + 'k' })}
    ${meter('Medien', (r.med + 100) / 2, { cls: r.med >= 0 ? 'g' : 'r', txt: sgn(Math.round(r.med)) })}
  </div>`;
}
function badge(p, lg) { if (p === 'BUERGER') return `<span class="badge ${lg ? 'lg' : ''}" style="--pc:#b8c2d8">FBL</span>`; const P = PARTIES[p]; return `<span class="badge ${lg ? 'lg' : ''}" style="--pc:${pcolor(p)}">${esc((p === 'EIGEN' ? (G && G.own.abk) || 'NEU' : P.abk).slice(0, 5))}</span>`; }
function title() { return G.anrede === 'frau' ? 'Bürgermeisterin' : G.anrede === 'mann' ? 'Bürgermeister' : 'Bürgermeister:in'; }
function kandidat() { return G.anrede === 'frau' ? 'Kandidatin' : G.anrede === 'mann' ? 'Kandidat' : 'Kandidat:in'; }

/* ---------- Einstellungen ---------- */
ACT.settings = () => {
  const tog = (k, l, d) => `<div class="kv"><div><b>${l}</b><div class="small mut">${d}</div></div><button class="opt ${SET[k] ? 'on' : ''}" data-act="tog" data-k="${k}" aria-pressed="${!!SET[k]}">${SET[k] ? 'An' : 'Aus'}</button></div>`;
  openSheet(`<h2>Einstellungen</h2><p class="mut small">Alles wird automatisch gespeichert – auch offline.</p>
    <div class="kv"><div><b>Schriftgröße</b><div class="small mut">Aktuell ${SET.fs} px</div></div><div class="row"><button class="opt" data-act="fs" data-d="-1" aria-label="Schrift kleiner">A−</button><button class="opt" data-act="fs" data-d="1" aria-label="Schrift größer">A+</button></div></div>
    ${tog('hc', 'Hoher Kontrast', 'Stärkere Schrift- und Rahmenkontraste')}
    ${tog('cb', 'Farbenblind-Modus', 'Okabe-Ito-Palette, Muster in Balken, Kürzel überall')}
    ${tog('haptic', 'Haptisches Feedback', 'Vibration bei Entscheidungen')}
    ${tog('voice', 'Sprachausgabe (Cutscenes)', 'Liest Untertitel vor (Gerätestimme)')}
    ${tog('rm', 'Animationen reduzieren', 'Weniger Bewegung, ruhigere Übergänge')}
    <hr class="rule"><h3>Prototyp-Module</h3><p class="mut small">Direktzugriff für Tests, ohne den Spielverlauf durchzuspielen.</p>
    <div class="opts mt"><button class="opt" data-act="demo" data-m="polls">📊 Sonntagsfrage</button><button class="opt" data-act="demo" data-m="speech">🎙️ Bundestagsrede</button><button class="opt" data-act="demo" data-m="election">🗳️ Wahlabend</button></div>
    <hr class="rule"><div class="row"><button class="btn ghost" data-act="toStart">Zum Startbildschirm</button><button class="btn ghost" data-act="close">Schließen</button></div>`);
};
ACT.tog = a => { SET[a.dataset.k] = SET[a.dataset.k] ? 0 : 1; applySettings(); ACT.settings(); if (CUR && SCREENS[CUR] && ['polls', 'cards', 'profile', 'party'].includes(CUR)) SCREENS[CUR](); };
ACT.fs = a => { SET.fs = clamp(SET.fs + (+a.dataset.d) * 2, 13, 24); applySettings(); ACT.settings(); };
ACT.toStart = () => { closeSheet(); show('start'); };
ACT.demo = a => { closeSheet(); ensureDemoGame(); ({ polls: () => show('polls'), speech: () => startSpeech(), election: () => startElection(false) })[a.dataset.m](); };

function ensureDemoGame() {
  if (G && G.party && G.opp && G.opp.length && G.bund) return;
  G = newGame();
  G.party = 'SPD'; G.name = 'Alex Brandt'; G.nn = 'Brandt'; G.anrede = 'div'; G.bg = 'lehrer'; G.herk = 'alt';
  Object.keys(G.stats).forEach(k => G.stats[k] = 52);
  initCharacter(); G.camp.k = { plak: 2, soc: 1.5, str: 1, rad: 1, evt: .5 }; G.camp.spent = 6; G.res.bud = 10; setupOpponents(); initBund();
}

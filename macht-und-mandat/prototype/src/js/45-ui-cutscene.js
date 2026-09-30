/* ---------- Cutscene-Engine: Kamerafahrten, Schnitte, Untertitel, Eilmeldungen, Sprachausgabe (optional), überspringbar ---------- */
function sceneSVG(type) {
  const defs = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1330"/><stop offset=".55" stop-color="#3b4f8f"/><stop offset="1" stop-color="#e8b27a"/></linearGradient>
    <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2f1f"/><stop offset="1" stop-color="#22120a"/></linearGradient>
    <linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a4d"/><stop offset="1" stop-color="#050a24"/></linearGradient></defs>`;
  const svg = inner => `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${defs}${inner}</svg>`;
  const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffd98a" opacity=".85"/>`;
  if (type === 'town') {
    let houses = ''; for (let i = 0; i < 8; i++) { const x = i * 42 - 12, h = 60 + (i * 37 % 50); houses += `<rect x="${x}" y="${330 - h}" width="38" height="${h + 100}" fill="#10182f"/><path d="M${x - 3} ${330 - h} L${x + 19} ${308 - h} L${x + 41} ${330 - h}Z" fill="#1a2447"/>` + win(x + 7, 340 - h, 8, 10) + win(x + 22, 340 - h, 8, 10) + win(x + 7, 362 - h, 8, 10); }
    return svg(`<rect width="300" height="420" fill="url(#sk)"/><circle cx="235" cy="80" r="26" fill="#ffe9b8" opacity=".92"/>${houses}<rect x="108" y="190" width="84" height="150" fill="#1b2650"/><path d="M102 190 L150 140 L198 190Z" fill="#263263"/><rect x="146" y="92" width="8" height="50" fill="#263263"/><circle cx="150" cy="214" r="12" fill="#ffd98a"/><rect x="138" y="280" width="24" height="60" fill="#0d1433"/><rect x="0" y="330" width="300" height="90" fill="#0a0f22"/>`);
  }
  if (type === 'hall') {
    return svg(`<rect width="300" height="420" fill="url(#wd)"/><rect x="0" y="0" width="46" height="420" fill="#6d1a2a"/><rect x="254" y="0" width="46" height="420" fill="#6d1a2a"/><rect x="60" y="60" width="180" height="110" rx="4" fill="#13224d" stroke="#d6b16c"/><text x="150" y="108" text-anchor="middle" fill="#f3d99b" font-size="23" font-family="Georgia,serif">WAHLPARTY</text><text x="150" y="134" text-anchor="middle" fill="#9ba7c6" font-size="11" letter-spacing="3">NIEDERHÜTTINGEN</text>${Array.from({ length: 9 }, (_, i) => `<circle cx="${18 + i * 33}" cy="${22 + (i % 2) * 7}" r="5" fill="#ffd98a"/>`).join('')}<rect x="0" y="330" width="300" height="90" fill="#140a05"/>`);
  }
  if (type === 'studio') {
    return svg(`<rect width="300" height="420" fill="url(#st)"/><g stroke="#5aa0ff" opacity=".22" fill="none">${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${30 + i * 34} H300"/>`).join('')}${Array.from({ length: 7 }, (_, i) => `<path d="M${i * 50} 0 V420"/>`).join('')}</g><rect x="22" y="56" width="256" height="130" rx="6" fill="#0d2a6b" stroke="#6aa7ff"/><text x="150" y="112" text-anchor="middle" fill="#fff" font-size="27" font-family="Georgia,serif">WAHLABEND</text><text x="150" y="140" text-anchor="middle" fill="#9cc0ff" font-size="11" letter-spacing="3">NIEDERHÜTTINGEN</text><rect x="22" y="200" width="256" height="8" fill="#6aa7ff" opacity=".5"/><ellipse cx="150" cy="390" rx="170" ry="30" fill="#0a1a4a" stroke="#6aa7ff"/>`);
  }
  if (type === 'rathaus') {
    return svg(`<rect width="300" height="420" fill="url(#wd)"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 40}" y="0" width="2" height="420" fill="#1c0f08" opacity=".5"/>`).join('')}<rect x="28" y="40" width="5" height="240" fill="#c9a66b"/><rect x="33" y="50" width="86" height="24" fill="#111"/><rect x="33" y="74" width="86" height="24" fill="#c22"/><rect x="33" y="98" width="86" height="24" fill="#eebb22"/><rect x="160" y="60" width="110" height="100" fill="#13224d" stroke="#d6b16c"/><circle cx="215" cy="110" r="26" fill="none" stroke="#d6b16c" stroke-width="3"/><text x="215" y="118" text-anchor="middle" fill="#d6b16c" font-size="20" font-family="Georgia,serif">NH</text><rect x="0" y="330" width="300" height="90" fill="#140a05"/>`);
  }
  if (type === 'plenum') {
    let rows = ''; for (let r = 0; r < 6; r++) rows += `<path d="M${20 + r * 20} 330 A ${130 - r * 20} ${150 - r * 20} 0 0 1 ${280 - r * 20} 330" fill="none" stroke="#3a4f8f" stroke-width="7" opacity="${.9 - r * .1}"/>`;
    return svg(`<rect width="300" height="420" fill="#0a1026"/><rect x="0" y="0" width="300" height="80" fill="#13224d"/><path d="M80 0 L220 0 L205 60 L95 60Z" fill="#1d2f66"/><text x="150" y="40" text-anchor="middle" fill="#f3d99b" font-size="14" font-family="Georgia,serif">DEM DEUTSCHEN VOLKE</text>${rows}<rect x="115" y="320" width="70" height="50" fill="#2b190f"/>`);
  }
  return svg('<rect width="300" height="420" fill="#0a1026"/>');
}

const DIALEKT_LINES = {
  hoch: 'Ich will, dass Niederhüttingen morgen besser dasteht als gestern.',
  bair: 'Servus, Niederhüttingen! Des pack mer – und zwar gscheit.',
  nord: 'Moin, Niederhüttingen. Dat kriegen wir hin – ohne viel Gedöns.',
  saechs: 'Nu, Niederhüttingen – das kriegn mer hin. Gloob mir.',
  rhein: 'Niederhüttingen, et hätt noch immer jot jejange – diesmal mit Plan.',
  schwab: 'Niederhüttingen, do schaffe mer. Ond zwar ordentlich.'
};
function closeness() { const r = G.result; return r ? Math.abs(r.share - 50) : 10; }

const CUTS = {
  intro: () => [
    { bg: 'town', cam: ['scale(1.12) translate(4%,3%)', 'scale(1.0) translate(-2%,0)'], who: 'Erzähler', text: `Niederhüttingen. ${f0(TOWN.ew)} Einwohner, eine Hauptstraße, drei Kreisverkehre – und in zehn Wochen eine Bürgermeisterwahl.` },
    { bg: 'hall', cam: ['scale(1.05)', 'scale(1.22) translate(0,-3%)'], chars: [{ me: 1, emo: 'serious', speak: 0 }, { npc: 'gisela', emo: 'happy', speak: 1 }], who: G.npc.party.n, text: `${G.name}, die Partei steht hinter Ihnen. Zumindest die Hälfte. Die andere Hälfte steht noch im Stau.` },
    { bg: 'hall', cam: ['scale(1.2)', 'scale(1.05) translate(2%,0)'], chars: [{ me: 1, emo: 'happy', speak: 1 }, { npc: 'gisela', emo: 'neutral', speak: 0 }], who: G.name, text: DIALEKT_LINES[G.dial] },
    { bg: 'studio', cam: ['scale(1.1)', 'scale(1.0)'], ticker: `EILMELDUNG · ${G.name} (${pname(G.party)}) fordert Amtsinhaber ${G.opp[0].name} heraus – ${G.opp[1].name} tritt parteilos an`, who: 'Erzähler', text: 'Zehn Wochen. Zehn Entscheidungen. Eine Wahl.' }
  ],
  elephant: () => {
    const r = G.result, win = r.won, cl = closeness(), w = G.opp.find(o => o.name === r.winnerName);
    const meWon = win;
    const inc = G.opp[0];
    const L = [];
    L.push({ bg: 'studio', cam: ['scale(1.15)', 'scale(1.0)'], ticker: meWon ? `BREAKING · ${G.name} gewinnt die Bürgermeisterwahl in Niederhüttingen mit ${f1(r.share)} %` : `BREAKING · ${r.winnerName} gewinnt in Niederhüttingen – ${G.name} unterliegt mit ${f1(r.share)} %`, who: 'Moderation', text: meWon ? (cl < 1.5 ? 'Es ist denkbar knapp, aber es steht fest: Niederhüttingen hat gewählt. Und zwar sehr genau.' : 'Ein klares Ergebnis in Niederhüttingen. Wir schalten ins Rathaus zur Elefantenrunde.') : 'Niederhüttingen hat entschieden – anders, als Sie es sich erhofft hatten. Wir schalten zur Elefantenrunde.' });
    L.push({ bg: 'studio', cam: ['scale(1.0)', 'scale(1.18) translate(-2%,0)'], chars: [{ npc: inc.name, emo: meWon ? 'serious' : 'happy', speak: 1 }, { me: 1, emo: meWon ? 'happy' : 'serious', speak: 0 }], who: inc.name, text: meWon ? `Ich gratuliere ${G.name}. Es war ein fairer Wahlkampf. Meistens. Die Bürgerinnen und Bürger haben gesprochen.` : `Die Wähler haben gesprochen – und sie haben ${r.winnerName === inc.name ? 'mir erneut ihr Vertrauen geschenkt. Ich danke herzlich.' : 'sich für einen Neuanfang entschieden.'}` });
    L.push({ bg: 'studio', cam: ['scale(1.18)', 'scale(1.05)'], chars: [{ me: 1, emo: meWon ? 'happy' : 'serious', speak: 1 }, { npc: inc.name, emo: 'neutral', speak: 0 }], who: G.name, text: meWon ? (G.res.med > 15 ? 'Dieses Ergebnis gehört allen, die mitgeholfen haben – und den Plakatierern, die nie genug Kabelbinder hatten.' : 'Ich danke allen Wählerinnen und Wählern. Jetzt wird gearbeitet – und wer mir nicht geglaubt hat, darf gern mitmachen.') : 'Demokratie ist kein Wunschkonzert. Ich gratuliere dem Sieger und bleibe der Stadt verbunden – auch ohne Amtskette.' });
    return L;
  },
  oath: () => {
    const cl = closeness();
    return [
      { bg: 'rathaus', cam: ['scale(1.2) translate(4%,0)', 'scale(1.02) translate(-2%,0)'], chars: [{ npc: 'beamte', emo: 'serious', speak: 1 }, { me: 1, emo: 'serious', speak: 0 }], who: 'Stadtverordnetenvorsteher', text: cl < 1.5 ? 'Der Wahlausschuss hat dreimal gezählt. Es bleibt dabei. Bitte erheben Sie sich zur Vereidigung.' : 'Bitte erheben Sie sich zur Vereidigung. Legen Sie die rechte Hand auf die Gemeindeordnung – nur symbolisch, sie wiegt vier Kilo.' },
      { bg: 'rathaus', cam: ['scale(1.0)', 'scale(1.3) translate(0,-4%)'], chars: [{ me: 1, emo: 'serious', speak: 1 }], who: G.name, text: 'Ich schwöre, mein Amt getreu der Verfassung und den Gesetzen zu führen, meine Kraft dem Wohle der Stadt zu widmen und Gerechtigkeit gegen jedermann zu üben.' },
      { bg: 'rathaus', cam: ['scale(1.3)', 'scale(1.1)'], chars: [{ me: 1, emo: 'happy', speak: 1 }, { npc: 'gisela', emo: 'happy', speak: 0 }], who: G.npc.party.n, text: `Glückwunsch, ${title()}. Der Dienstwagen hat übrigens noch den Geruch des Vorgängers. Und einen Strafzettel.` },
      { bg: 'town', cam: ['scale(1.2)', 'scale(1.0)'], who: 'Erzähler', ticker: `${G.name.toUpperCase()} VEREIDIGT · NEUE ${title().toUpperCase()} ÜBERNIMMT DAS RATHAUS`, text: `Zwölf Jahre später wird man sagen: Es begann in Niederhüttingen. Mit ${G.promises.length} Versprechen, ${f0(G.res.bud)}k€ Restkasse und einer Menge Kabelbinder.` }
    ];
  },
  defeat: () => [
    { bg: 'hall', cam: ['scale(1.1)', 'scale(1.25)'], chars: [{ me: 1, emo: 'serious', speak: 0 }, { npc: 'gisela', emo: 'serious', speak: 1 }], who: G.npc.party.n, text: `Es waren ${f1(G.result.share)} Prozent, ${G.name}. Das ist nicht nichts. Und ab morgen sagen alle, sie hätten es kommen sehen.` },
    { bg: 'town', cam: ['scale(1.2)', 'scale(1.0)'], chars: [{ me: 1, emo: 'neutral', speak: 1 }], who: G.name, text: 'Wahlkampf ist wie Kommunalpolitik: Man verliert selten ganz und gewinnt nie endgültig. Nächstes Mal – mit besseren Kabelbindern.' }
  ],
  stichwahl: () => [
    { bg: 'studio', cam: ['scale(1.1)', 'scale(1.0)'], ticker: 'STICHWAHL · Keine Kandidatur erreicht die absolute Mehrheit', who: 'Moderation', text: `Keine absolute Mehrheit. In 14 Tagen treten ${G.result.top[0]} und ${G.result.top[1]} in der Stichwahl gegeneinander an.` }
  ]
};
function npcFor(ch) {
  if (ch.me) return playerAvatar(ch.emo, { speak: ch.speak });
  if (ch.npc === 'gisela') return avatarSVG({ skin: 1, face: 'rund', hair: 'bob', hairc: 4, outfit: 'blazer', acc: 'pin', age: 60 }, { emo: ch.emo, speak: ch.speak });
  if (ch.npc === 'beamte') return avatarSVG({ skin: 2, face: 'kantig', hair: 'seit', hairc: 4, outfit: 'anzug', acc: 'brille', age: 58 }, { emo: ch.emo, speak: ch.speak });
  return npcAvatar(ch.npc, ch.emo, { speak: ch.speak });
}
let CUTSTATE = null;
function startCutscene(id, done) {
  const shots = CUTS[id]();
  CUTSTATE = { shots, i: 0, done, typing: null };
  const el = document.createElement('div'); el.className = 'cut'; el.id = 'cut';
  el.innerHTML = `<button class="skip" data-act="cutskip">Überspringen ⏭</button><div class="view" id="cview" data-act="cutnext"></div><div class="sub" data-act="cutnext"><div class="who" id="cwho"></div><div class="txt" id="ctxt"></div><div class="hint">Tippen zum Fortfahren ▸</div></div>`;
  $('#app').appendChild(el); $('#nav').classList.remove('on');
  playShot();
}
function playShot() {
  const S = CUTSTATE, sh = S.shots[S.i]; if (!sh) return endCut();
  const view = $('#cview');
  const chars = (sh.chars || []).map(ch => `<div style="display:contents">${npcFor(ch).replace('<svg', `<svg class="${ch.speak ? 'speak' : 'dim'}"`)}</div>`).join('');
  view.innerHTML = `<div class="lb t"></div><div class="lb b"></div><div class="scene" id="cscene" style="transform:${sh.cam[0]};transition:none">${sceneSVG(sh.bg)}</div>
    ${sh.ticker ? `<div class="tick"><span>${esc(sh.ticker)} &nbsp;·&nbsp; ${esc(sh.ticker)}</span></div>` : ''}<div class="chars">${chars}</div>`;
  view.classList.remove('flash'); void view.offsetWidth; view.classList.add('flash');
  requestAnimationFrame(() => requestAnimationFrame(() => { const sc = $('#cscene'); if (sc) { sc.style.transition = 'transform 7s cubic-bezier(.3,.1,.3,1)'; sc.style.transform = sh.cam[1]; } }));
  $('#cwho').textContent = sh.who || '';
  const t = $('#ctxt'); t.textContent = ''; let k = 0; const txt = sh.text || '';
  clearInterval(S.typing);
  S.full = txt;
  S.typing = setInterval(() => { k += 2; t.textContent = txt.slice(0, k); if (k >= txt.length) { clearInterval(S.typing); S.typing = null; } }, 22);
  speak((sh.who ? sh.who + ': ' : '') + txt);
}
ACT.cutnext = () => {
  const S = CUTSTATE; if (!S) return;
  if (S.typing) { clearInterval(S.typing); S.typing = null; $('#ctxt').textContent = S.full; return; }
  S.i++; if (S.i >= S.shots.length) endCut(); else playShot();
};
ACT.cutskip = () => endCut();
function endCut() {
  const S = CUTSTATE; if (!S) return; clearInterval(S.typing); CUTSTATE = null;
  try { speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
  const el = $('#cut'); if (el) el.remove();
  if (S.done) S.done();
}

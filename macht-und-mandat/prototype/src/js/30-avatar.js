/* ---------- Avatar (SVG, parametrisch): Hautton, Gesicht, Frisur, Kleidung, Accessoire, Alterung, Mimik ---------- */
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgb2hex(r) { return '#' + r.map(x => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((x, i) => x + (B[i] - x) * t)); }
function shade(h, t) { return t < 0 ? mix(h, '#000000', -t) : mix(h, '#ffffff', t); }

function avatarSVG(c, o) {
  o = o || {};
  const skin = SKINS[c.skin] || SKINS[2];
  const age = c.age || 38, old = clamp((age - 38) / 32, 0, 1);
  const hair = mix(HAIRC[c.hairc] || HAIRC[1], '#c9c9c9', clamp((age - 40) / 34, 0, 1) * (c.hairc === 4 ? 0 : 1));
  const emo = o.emo || 'neutral';
  const sk2 = shade(skin, -.12), sk3 = shade(skin, -.22);
  const outfit = c.outfit || 'anzug';
  const OUT = { anzug: ['#1b2a4e', '#2a3c6a'], blazer: ['#5a2d45', '#7a3f5e'], strick: ['#6b5a45', '#8a755a'], tracht: ['#33573f', '#4c7a58'], hemd: ['#d8dde8', '#ffffff'] };
  const [cb, cl] = OUT[outfit] || OUT.anzug;
  let body = `<path d="M14 250 C14 200 52 180 86 172 L114 172 C148 180 186 200 186 250 Z" fill="${cb}"/>`;
  if (outfit === 'anzug' || outfit === 'blazer') {
    body += `<path d="M86 172 L100 214 L62 250 L36 250 Z" fill="${cl}"/><path d="M114 172 L100 214 L138 250 L164 250 Z" fill="${cl}"/>`;
    body += `<path d="M88 172 L100 206 L112 172 Z" fill="#f2f2f4"/>`;
    if (c.acc === 'krawatte' || outfit === 'anzug') body += `<path d="M95 182 L105 182 L109 228 L100 238 L91 228 Z" fill="${outfit === 'anzug' ? '#8a1f2b' : '#234'}"/><path d="M95 178 L105 178 L103 186 L97 186Z" fill="#6d1620"/>`;
  } else if (outfit === 'strick') {
    body += `<path d="M86 172 L100 224 L114 172 L100 176 Z" fill="#e9e3d6"/><path d="M100 176 L100 250" stroke="${cl}" stroke-width="3"/>` + [196, 212, 228].map(y => `<circle cx="100" cy="${y}" r="3" fill="#d9c9a8"/>`).join('');
  } else if (outfit === 'tracht') {
    body += `<path d="M86 172 L100 200 L114 172 Z" fill="#f4efe6"/><path d="M100 176 L100 250" stroke="${cl}" stroke-width="3"/>`
      + `<path d="M86 172 L100 224 L62 250 L44 250 Z" fill="${cl}" opacity=".6"/><path d="M114 172 L100 224 L138 250 L156 250 Z" fill="${cl}" opacity=".6"/>`
      + [200, 216, 232].map(y => `<circle cx="100" cy="${y}" r="3.2" fill="#c9a66b"/>`).join('');
  } else {
    body += `<path d="M86 172 L100 212 L114 172 Z" fill="${sk2}"/><path d="M78 170 L100 214 L62 226 Z" fill="${cl}"/><path d="M122 170 L100 214 L138 226 Z" fill="${cl}"/>`;
  }
  if (c.acc === 'schal') body += `<path d="M70 170 Q100 196 130 170 L134 186 Q100 212 66 186 Z" fill="#b5452a"/><path d="M110 186 L124 230 L108 228 Z" fill="#b5452a"/>`;
  if (c.acc === 'pin') body += `<circle cx="132" cy="206" r="4" fill="#d6b16c" stroke="#fff3cf" stroke-width="1"/>`;
  const neck = `<path d="M86 140 L86 178 Q100 192 114 178 L114 140 Z" fill="${sk2}"/>`;
  // Gesichtsform
  let faceP;
  if (c.face === 'rund') faceP = `<ellipse cx="100" cy="102" rx="50" ry="51" fill="${skin}"/>`;
  else if (c.face === 'kantig') faceP = `<path d="M54 92 C54 52 146 52 146 92 L144 118 C142 140 124 156 100 158 C76 156 58 140 56 118 Z" fill="${skin}"/>`;
  else faceP = `<ellipse cx="100" cy="102" rx="44" ry="54" fill="${skin}"/>`;
  const ears = `<ellipse cx="53" cy="106" rx="6" ry="10" fill="${sk2}"/><ellipse cx="147" cy="106" rx="6" ry="10" fill="${sk2}"/>`;
  // Haare
  let hb = '', hf = '';
  const H = c.hair;
  if (H === 'lang') { hb = `<path d="M50 100 C40 170 58 196 72 204 L128 204 C142 196 160 170 150 100 C152 38 48 38 50 100 Z" fill="${hair}"/>`; hf = `<path d="M54 94 C52 46 148 46 146 94 C138 70 120 62 100 62 C80 62 62 70 54 94 Z" fill="${hair}"/>`; }
  else if (H === 'bob') { hb = `<path d="M52 98 C44 150 56 168 66 172 L134 172 C144 168 156 150 148 98 C150 42 50 42 52 98 Z" fill="${hair}"/>`; hf = `<path d="M54 94 C54 50 146 50 146 94 C136 72 118 66 98 66 C78 66 62 76 54 94 Z" fill="${hair}"/>`; }
  else if (H === 'dutt') { hb = `<circle cx="100" cy="40" r="15" fill="${hair}"/>`; hf = `<path d="M55 96 C52 48 148 48 145 96 C136 72 118 64 100 64 C82 64 64 72 55 96 Z" fill="${hair}"/>`; }
  else if (H === 'locken') { hf = [[62, 66], [78, 54], [100, 48], [122, 54], [138, 66], [52, 84], [148, 84], [68, 78], [132, 78], [100, 62]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="15" fill="${hair}"/>`).join(''); }
  else if (H === 'glatze') { hf = `<path d="M54 98 C54 88 58 84 60 82 C58 92 56 98 56 104 Z M146 98 C146 88 142 84 140 82 C142 92 144 98 144 104 Z" fill="${hair}" opacity=".7"/>`; }
  else if (H === 'seit') { hf = `<path d="M54 98 C48 44 150 38 146 98 C142 74 126 62 96 62 C78 64 62 78 54 98 Z" fill="${hair}"/><path d="M96 62 C112 64 132 70 144 92" stroke="${shade(hair, -.25)}" stroke-width="2" fill="none"/>`; }
  else { hf = `<path d="M55 96 C52 48 148 48 145 96 C136 72 118 64 100 64 C82 64 64 72 55 96 Z" fill="${hair}"/>`; }
  // Augen, Brauen, Mund je Mimik
  const brow = hair === '#c9c9c9' ? '#8a8a8a' : shade(hair, -.2);
  const B = { neutral: [0, 0], happy: [-1, 1], serious: [3, -2], shocked: [-4, 0], angry: [4, -4] }[emo] || [0, 0];
  const brows = `<path d="M70 ${84 + B[0]} Q82 ${80 + B[0] - B[1]} 94 ${85 + B[0] + (B[1] < 0 ? 2 : 0)}" stroke="${brow}" stroke-width="4" stroke-linecap="round" fill="none"/>`
    + `<path d="M106 ${85 + B[0] + (B[1] < 0 ? 2 : 0)} Q118 ${80 + B[0] - B[1]} 130 ${84 + B[0]}" stroke="${brow}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  const eyeH = emo === 'shocked' ? 6 : emo === 'happy' ? 3 : 4.5;
  const eyes = [84, 116].map(x => `<ellipse cx="${x}" cy="100" rx="7.5" ry="${eyeH}" fill="#fff"/><circle cx="${x}" cy="100" r="3.3" fill="#3a2a20"/><circle cx="${x + 1}" cy="99" r="1" fill="#fff"/>`).join('');
  const nose = `<path d="M100 102 Q93 120 99 122 Q104 123 106 120" stroke="${sk3}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  let mouth;
  if (o.speak || emo === 'shocked') mouth = `<ellipse cx="100" cy="134" rx="${emo === 'shocked' ? 6 : 8}" ry="${emo === 'shocked' ? 8 : 5}" fill="#5a1f22"/><path d="M93 131 H107" stroke="#fff" stroke-width="2"/>`;
  else if (emo === 'happy') mouth = `<path d="M84 128 Q100 146 116 128" stroke="#7a2d30" stroke-width="3" fill="#fff" stroke-linejoin="round"/>`;
  else if (emo === 'serious' || emo === 'angry') mouth = `<path d="M88 134 Q100 130 112 134" stroke="#6a2a2c" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else mouth = `<path d="M87 131 Q100 138 113 131" stroke="#7a2d30" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const wr = `<g opacity="${(old * .55).toFixed(2)}" stroke="${sk3}" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M68 70 Q100 64 132 70"/><path d="M72 76 Q100 71 128 76"/><path d="M70 104 l-7 3 M70 108 l-6 5 M130 104 l7 3 M130 108 l6 5"/><path d="M84 128 q-5 6 -4 14 M116 128 q5 6 4 14"/></g>`;
  const glass = c.acc === 'brille' ? `<g stroke="#2a2a2a" stroke-width="2.6" fill="rgba(180,210,255,.12)"><rect x="68" y="90" width="31" height="22" rx="9"/><rect x="101" y="90" width="31" height="22" rx="9"/><path d="M99 98 H101"/></g>` : '';
  const stub = (o.stubble ? `<path d="M64 120 C70 154 130 154 136 120 C124 140 76 140 64 120 Z" fill="${hair}" opacity=".25"/>` : '');
  return `<svg viewBox="0 0 200 250" class="${o.cls || ''}" role="img" aria-label="Avatar" xmlns="http://www.w3.org/2000/svg">${hb}${neck}${body}${ears}${faceP}${stub}${wr}${nose}${eyes}${brows}${mouth}${glass}${hf}</svg>`;
}
function npcAvatar(seed, emo, extra) {
  const r = seeded(hashStr(seed));
  const c = Object.assign({ skin: Math.floor(r() * 5), face: pick(['oval', 'rund', 'kantig']), hair: pick(['kurz', 'seit', 'bob', 'lang', 'glatze', 'dutt', 'locken']), hairc: Math.floor(r() * 5), outfit: pick(['anzug', 'blazer', 'strick', 'hemd']), acc: pick(['none', 'brille', 'pin', 'krawatte']), age: 38 + Math.floor(r() * 26) }, extra || {});
  return avatarSVG(c, { emo: emo || 'neutral', cls: extra && extra.cls });
}
function playerAvatar(emo, o, ageAdd) {
  return avatarSVG(Object.assign({}, G.av, { age: G.age + (ageAdd || 0) }), Object.assign({ emo: emo || 'neutral' }, o || {}));
}

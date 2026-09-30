/* ---------- Grafik-Bausteine: Plenarsaal und Liniendiagramm ---------- */
function hemicycleSVG(fr, o) {
  o = o || {};
  const N = Object.values(fr).reduce((a, b) => a + b, 0) || 1, R = 9, r0 = 62, r1 = 178;
  const radii = Array.from({ length: R }, (_, i) => r0 + (r1 - r0) * i / (R - 1)), sr = radii.reduce((a, b) => a + b, 0);
  const seats = [];
  radii.forEach((rad, i) => { const n = Math.round(N * rad / sr); for (let k = 0; k < n; k++) { const ang = Math.PI - Math.PI * (n === 1 ? .5 : k / (n - 1)); seats.push({ a: ang, r: rad, x: 200 + rad * Math.cos(ang), y: 200 - rad * Math.sin(ang) }); } });
  seats.sort((p, q) => q.a - p.a || p.r - q.r);
  const order = FRAKTIONEN.filter(f => fr[f] > 0);
  const tot = order.reduce((a, f) => a + fr[f], 0); let idx = 0; const dots = [];
  order.forEach((f, fi) => { const cnt = Math.round(fr[f] * seats.length / tot); const lim = fi === order.length - 1 ? seats.length : Math.min(seats.length, idx + cnt); for (; idx < lim; idx++) { const s = seats[idx]; dots.push(`<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${o.dr || 3.3}" fill="${frkColor(f)}" data-f="${f}" ${o.hi && o.hi !== f ? 'opacity=".3"' : ''}/>`); } });
  const lab = o.labels === false ? '' : order.map(f => `<span class="chip" style="border-color:${frkColor(f)}">${esc(frkAbbr(f))} ${fr[f]}</span>`).join(' ');
  return `<svg viewBox="0 0 400 210" class="plenum" role="img" aria-label="Sitzverteilung im Plenarsaal">${dots.join('')}<text x="200" y="176" text-anchor="middle" fill="#eef1f8" font-size="15" font-weight="700">${N}</text><text x="200" y="192" text-anchor="middle" fill="#9ba7c6" font-size="10">Sitze · Mehrheit ab 316</text></svg>${lab ? `<div class="legend" style="margin-top:6px">${lab}</div>` : ''}`;
}
function lineChart(series, o) {
  o = o || {}; const W = 320, H = o.h || 150, pl = 26, pr = 8, pt = 8, pb = 16;
  const all = series.flatMap(s => s.data); let mn = Math.min(...all), mx = Math.max(...all); const pad = (mx - mn) * .12 + .5; mn = Math.max(0, mn - pad); mx += pad;
  const n = Math.max(...series.map(s => s.data.length));
  const X = i => pl + (W - pl - pr) * (n === 1 ? .5 : i / (n - 1)), Y = v => pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn || 1));
  const grid = [0, .25, .5, .75, 1].map(t => { const v = mn + (mx - mn) * t; return `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.08)"/><text x="2" y="${Y(v) + 3}" font-size="9" fill="#9ba7c6">${Math.round(v)}</text>`; }).join('');
  const dash = ['', '6 3', '2 3', '8 3 2 3', '', '6 3', '2 3', '8 3 2 3'];
  const lines = series.map((s, k) => `<polyline fill="none" stroke="${s.color}" stroke-width="2.2" ${SET.cb ? `stroke-dasharray="${dash[k % 8]}"` : ''} stroke-linejoin="round" points="${s.data.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ')}"/><circle cx="${X(s.data.length - 1)}" cy="${Y(s.data[s.data.length - 1])}" r="3" fill="${s.color}"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${o.label || 'Trendkurve'}">${grid}${lines}<text x="${pl}" y="${H - 3}" font-size="9" fill="#9ba7c6">${o.x0 || 'früher'}</text><text x="${W - pr}" y="${H - 3}" font-size="9" fill="#9ba7c6" text-anchor="end">${o.x1 || 'heute'}</text></svg>`;
}

/* ---------- Umfragen-Screen ---------- */
let POLLTAB = 'local', POLLINST = 0, POLLSEL = null;
SCREENS.polls = () => {
  if (!G || !G.bund) ensureDemoGame();
  const inst = INSTITUTES[POLLINST];
  const tabs = `<div class="tabs"><button class="tab ${POLLTAB === 'local' ? 'on' : ''}" data-act="ptab" data-t="local">Rathaus</button><button class="tab ${POLLTAB === 'bund' ? 'on' : ''}" data-act="ptab" data-t="bund">Bundestag</button></div>
    <div class="opts scroll mb">${INSTITUTES.map((x, i) => `<button class="opt ${POLLINST === i ? 'on' : ''}" data-act="pinst" data-i="${i}" style="min-height:40px">${esc(x.n)}</button>`).join('')}</div>`;
  render(`<div class="caps">Sonntagsfrage</div><h2>${POLLTAB === 'local' ? 'Wen würden Sie wählen? – Niederhüttingen' : 'Wenn am Sonntag Bundestagswahl wäre …'}</h2>${tabs}${POLLTAB === 'local' ? pollLocalHTML(inst) : pollBundHTML(inst)}`, { nav: true });
};
ACT.ptab = a => { POLLTAB = a.dataset.t; POLLSEL = null; show('polls'); };
ACT.pinst = a => { POLLINST = +a.dataset.i; show('polls'); };
ACT.psel = a => { POLLSEL = a.dataset.p; show('polls'); };

function pollLocalHTML(inst) {
  const hist = G.pollHist.length ? G.pollHist : [expectedShares()];
  const cur = hist[hist.length - 1], prev = hist[Math.max(0, hist.length - 2)];
  const r = seeded(hashStr(G.name + hist.length + inst.id));
  const parts = [G.party, ...G.opp.map(o => o.party)], names = [G.name, ...G.opp.map(o => o.name)];
  const n = 600 + (inst.nn % 700);
  const undec = 16;
  const raw = cur.map((x, i) => Math.max(1, (.6 * x + .4 * prev[i]) + (r() - .5) * 3.2 + (inst.bias[parts[i] === 'BUERGER' ? 'CDU' : parts[i]] || 0) * .3));
  const sum = raw.reduce((a, b) => a + b, 0);
  const vals = raw.map(x => x * (100 - undec) / sum);
  const order = [0, 1, 2, 3].sort((a, b) => vals[b] - vals[a]);
  const hl = 100 - undec;
  const bars = order.map(i => { const e = halfWidth(vals[i] / hl * 100, { nn: n }) * (hl / 100); return `<div class="brow"><span class="nm">${badge(parts[i])}</span><div class="track"><div class="fill" style="width:${clamp(vals[i] * 2, 2, 100)}%;--pc:${parts[i] === 'BUERGER' ? '#b8c2d8' : pcolor(parts[i])}"></div><span class="err" style="left:${clamp((vals[i] - e) * 2, 0, 100)}%;width:${clamp(e * 4, 2, 100)}%"></span></div><span class="val">${f0(vals[i])} %<small>±${f1(e)}</small></span></div><div class="tiny mut" style="margin:-4px 0 4px 72px">${esc(names[i])}${i === 0 ? ' (du)' : parts[i] === 'BUERGER' ? ' · parteilos' : ''}${G.opp[i - 1] && G.opp[i - 1].inc ? ' · Amtsinhaber' : ''}</div>`; }).join('');
  // Trend
  const series = [0, 1, 2, 3].map(i => ({ color: parts[i] === 'BUERGER' ? '#b8c2d8' : pcolor(parts[i]), data: hist.map(h => h[i]) }));
  // Zielgruppen
  const cands = candList(), mil = MILIEUS.map((m, g) => { const ex = cands.map(c => Math.exp(utility(c, g, false))); const s = ex.reduce((a, b) => a + b, 0); return { n: m.n, p: ex[0] / s * 100 }; });
  // Warum?
  const last = G.log[G.log.length - 1], d = hist.length > 1 ? hist[hist.length - 1][0] - hist[hist.length - 2][0] : 0;
  let why = 'Noch keine Bewegung – der Wahlkampf hat gerade erst begonnen.';
  if (last) why = d > .3 ? `Dein Wert steigt (${sgn(Math.round(d * 10) / 10)} Punkte). Auslöser: „${last.title}“ – und das Medienecho (${sgn(Math.round(G.res.med))}).` : d < -.3 ? `Dein Wert fällt (${sgn(Math.round(d * 10) / 10)} Punkte). Auslöser: „${last.title}“. ${G.res.str > 60 ? 'Dazu kommt sichtbare Erschöpfung.' : ''}` : `Kaum Bewegung seit „${last.title}“. Umfragen reagieren verzögert – bis zu zwei Wochen.`;
  return `<div class="glass">${bars}<div class="row sp small mut"><span>Unentschlossen/Sonstige: ${undec} %</span><span>n = ${f0(n)} · ${esc(inst.n)}</span></div></div>
    <div class="glass mt"><div class="caps">Trend seit Wahlkampfbeginn</div>${lineChart(series, { x0: 'Start', label: 'Trend der Kandidat:innen' })}
      <div class="legend">${[0, 1, 2, 3].map(i => `<span>${badge(parts[i])} ${esc(names[i].split(' ').pop())}</span>`).join('')}</div></div>
    <div class="glass mt"><div class="caps">Warum?</div><p style="margin:.3em 0 0">${esc(why)}</p></div>
    <div class="glass mt"><div class="caps">Deine Zustimmung nach Zielgruppe</div>${mil.map(m => `<div class="brow" style="grid-template-columns:130px 1fr 46px"><span class="nm small" style="font-weight:600">${m.n}</span><div class="track"><div class="fill" style="width:${clamp(m.p * 1.3, 2, 100)}%;--pc:${pcolor(G.party)}"></div></div><span class="val small">${f0(m.p)} %</span></div>`).join('')}</div>
    <p class="tiny mut mt">Umfragen haben Fehlertoleranzen und Institute eigene Abweichungen („Hauseffekte“). Die Wahl entscheidet am Ende.</p>`;
}

function pollBundHTML(inst) {
  const S = G.bund.S, v = bundPoll(inst, S), hist = G.bund.hist, old = hist[Math.max(0, hist.length - 9)];
  const show = BUND_PARTIES.map(p => ({ p, v: v[p], d: v[p] - Math.round(old[p] * 2) / 2 })).sort((a, b) => b.v - a.v);
  const hp = 5 * 4.6;
  const bars = show.map(x => { const e = halfWidth(x.v, inst); const warn = x.v < 6.2 && x.v > 3.6; return `<button style="all:unset;display:block;width:100%;cursor:pointer" data-act="psel" data-p="${x.p}"><div class="brow" ${POLLSEL === x.p ? 'style="background:rgba(214,177,108,.12);border-radius:8px"' : ''}><span class="nm">${badge(x.p)}</span><div class="track"><div class="fill" style="width:${clamp(x.v * 3.2, 2, 100)}%;--pc:${pcolor(x.p)}"></div><span class="err" style="left:${clamp((x.v - e) * 3.2, 0, 100)}%;width:${clamp(e * 6.4, 2, 100)}%"></span><span class="hurdle" style="left:${5 * 3.2}%"></span></div><span class="val">${f1(x.v)} %<small>${x.d > .2 ? '▲' : x.d < -.2 ? '▼' : '●'} ${warn ? '· zittert' : ''}</small></span></div></button>`; }).join('');
  const sons = Math.max(0, 100 - BUND_PARTIES.reduce((a, p) => a + v[p], 0));
  const sel = POLLSEL || G.party; const selP = sel === 'EIGEN' ? 'SONST' : sel;
  const series = BUND_PARTIES.map(p => ({ color: pcolor(p), data: hist.slice(-26).map(h => h[p]) }));
  // Sitze
  const sv = {}; BUND_PARTIES.forEach(p => sv[p] = S[p]);
  const seatsInfo = bundSeats(sv), co = coalitionsFor(seatsInfo.fr);
  // Erklärung für gewählte Partei
  const ex = explainParty(selP, hist);
  const cs = co.slice(0, 4).map(c => `<div class="kv"><span>${c.set.map(f => esc(frkAbbr(f))).join(' + ')}</span><span class="gold">${c.seats} Sitze${c.chancellor ? ' · Kanzler: ' + esc(frkAbbr(c.chancellor)) : ''}</span></div>`).join('');
  return `<div class="glass">${bars}<div class="row sp small mut"><span>Sonstige: ${f1(sons)} %</span><span>n = ${f0(inst.nn)} · gestrichelt: 5 %</span></div><div class="tiny mut">Tippe eine Partei an für „Warum?“.</div></div>
    <div class="glass mt"><div class="caps">Warum ${esc(selP === 'SONST' ? 'Sonstige' : pname(selP))}?</div><p style="margin:.3em 0 0">${esc(ex)}</p></div>
    <div class="glass mt"><div class="caps">Trend · letzte 26 Wochen</div>${lineChart(series, { x0: '−26 Wo.', label: 'Trend der Parteien', h: 160 })}<div class="legend">${BUND_PARTIES.map(p => `<span>${badge(p)}</span>`).join('')}</div></div>
    <div class="glass mt"><div class="caps">Sitzverteilung bei diesem Ergebnis</div>${hemicycleSVG(seatsInfo.fr, { hi: null })}${seatsInfo.out.length ? `<p class="tiny mut">Unter der Hürde: ${seatsInfo.out.map(p => esc(pname(p))).join(', ')}</p>` : ''}</div>
    <div class="glass mt"><div class="caps">Mögliche Mehrheiten (Kooperationssperre aktiv)</div>${cs || '<p class="small mut">Keine Mehrheit ohne Unvereinbarkeiten – Neuwahl oder Minderheitsregierung drohen.</p>'}<p class="tiny mut">Die AfD wird von allen anderen Parteien als Partner ausgeschlossen; weitere Unvereinbarkeiten: Union–Linke, FDP–Linke, BSW–Grüne/FDP.</p></div>
    <p class="tiny mut mt">Hinweis: Wählerwanderungs-Sankey und Themenkompetenz folgen im Vertical Slice.</p>`;
}
function explainParty(p, hist) {
  const B = G.bund, a = hist[hist.length - 1][p], b = hist[Math.max(0, hist.length - 9)][p], d = a - b;
  const why = [];
  if (['CDU', 'CSU', 'SPD'].includes(p)) why.push('Regierungsmüdigkeit: Regierungsparteien verlieren über die Legislatur an Zustimmung');
  if (B.E[p] > .4) why.push('positive Berichterstattung der letzten Wochen'); else if (B.E[p] < -.4) why.push('negatives Medienecho und Schlagzeilen');
  if (B.Z[p] > .4) why.push('ein günstiges Themenumfeld'); else if (B.Z[p] < -.4) why.push('ein ungünstiges Themenumfeld');
  if (p === G.party || (G.party === 'EIGEN' && p === 'SONST')) why.push(`dein Medienecho (${sgn(Math.round(G.res.med))}) färbt leicht auf die Partei ab`);
  const head = d > .25 ? `${f1(Math.abs(d))} Punkte im Plus seit acht Wochen` : d < -.25 ? `${f1(Math.abs(d))} Punkte im Minus seit acht Wochen` : 'Seit acht Wochen weitgehend stabil';
  return `${head}. ${why.length ? 'Gründe: ' + why.join('; ') + '.' : 'Keine auffälligen Treiber.'}`;
}

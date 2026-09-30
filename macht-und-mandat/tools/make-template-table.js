/* Erzeugt die 50-Template-Tabelle (Markdown) aus data/templates50.json.  node tools/make-template-table.js */
'use strict';
const G = require('./eventgen');
const AMT = ['', 'Gemeinderat', 'Bürgermeister:in', 'OB', 'Landtag', 'Minister:in (Land)', 'MP', 'Bundestag', 'Fraktionsvorsitz', 'Parteivorsitz', 'Kanzlerkandidat:in', 'Kanzler:in'];
const fmt = n => n >= 1e12 ? (n / 1e12).toFixed(1).replace('.', ',') + ' Bio.' : n >= 1e9 ? (n / 1e9).toFixed(1).replace('.', ',') + ' Mrd.' : n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' Mio.' : n >= 1e3 ? (n / 1e3).toFixed(0) + ' Tsd.' : String(n);
console.log('| # | ID | Kategorie | Ebene · Amt | Kern-Dilemma (Skelett) | Slots | Text-Varianten | Kombinationen (roh) |');
console.log('|--:|---|---|---|---|---|--:|--:|');
G.TEMPLATES.forEach((t, i) => {
  const c = G.combos(t);
  const skel = t.a[0].replace(/\{(\w+)(?:\.\w)?\}/g, (m, k) => '⟨' + k + '⟩');
  const short = skel.length > 92 ? skel.slice(0, 89) + '…' : skel;
  console.log(`| ${i + 1} | ${t.id} | ${t.kat} | ${t.ebene} · ${AMT[t.amt[0]]}–${AMT[t.amt[1]]} | ${short.replace(/\|/g, '/')} | ${c.slots.join(', ')} | ${t.a.length}×${t.z.length}=${c.textVariants} | ${fmt(c.total)} |`);
});

/* Erzeugt docs/03-ereigniskatalog.md aus den Kartendaten des Prototyps (16 Events) + 4 handgeschriebene Events höherer Ebenen.
 * node tools/make-event-catalog.js > docs/03-ereigniskatalog.md */
'use strict';
const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, '../prototype/src/js', f), 'utf8');
const util = src('00-util.js').replace('const pick = a => a[Math.floor(rnd() * a.length)];', 'const pick = a => a[0];').replace('let G = null;', "let G = { opp: [{ name: 'Dr. Ulf Brandtner' }], name: 'Mira Hollweg', nn: 'Hollweg', own: {} };");
const ctx = util + '\n';
const world = src('11-data-world.js').replace(/^\/\* ---------- Bund[\s\S]*$/m, '');
const parties = src('10-data-parties.js');
const cards = src('12-data-cards.js');
const mod = new Function(ctx + parties + '\n' + world + '\n' + cards + '\nreturn {CARDS, FRAMES, PIDX, PARTIES, BACKGROUNDS};')();
const { CARDS, FRAMES, PIDX, PARTIES, BACKGROUNDS } = mod;
const BG_TH = { lehrer: ['soz'], handwerk: ['wirt', 'wohn'], jurist: ['sich'], unternehmer: ['wirt'], pflege: ['soz'], landwirt: ['verk', 'klim'], polizei: ['sich'], journalist: ['med'] };
const PARTY_TH = { CDU: ['wirt', 'sich'], CSU: ['sich', 'verk'], SPD: ['soz'], AFD: ['sich'], GRUENE: ['klim', 'verk'], FDP: ['wirt'], LINKE: ['wohn', 'soz'], BSW: ['soz'] };
const NAMES = { b: 'Bel', p: 'Par', d: 'Kasse', m: 'Med', w: 'Wirt', u: 'Umw', g: 'Ges', s: 'Stress' };
const fx = f => Object.keys(NAMES).filter(k => f && f[k]).map(k => `${NAMES[k]} ${f[k] > 0 ? '+' : '−'}${Math.abs(f[k])}${k === 'd' ? 'k€' : ''}`).join(', ') || '–';
const STAT = { cha: 'Charisma', iq: 'Intelligenz', dur: 'Durchsetzung', ehr: 'Integrität', med: 'Medienwirkung', res: 'Belastbarkeit', net: 'Netzwerk' };
const THN = { verk: 'Verkehr', klim: 'Klima', soz: 'Soziales & Bildung', wirt: 'Wirtschaft', med: 'Medien', sich: 'Sicherheit', wohn: 'Wohnen', par: 'Partei', fam: 'Familie' };
const pn = id => PARTIES[id].abk;
const out = [];
out.push(`# 4 · Beispiel-Ereigniskatalog: 20 Events mit Optionen und Folgen

> Die Events **EV-001 bis EV-016** sind im spielbaren Prototyp implementiert; dieser Abschnitt wird aus den echten Spieldaten erzeugt (\`tools/make-event-catalog.js\`), damit Dokumentation und Spiel nicht auseinanderlaufen. **EV-101 bis EV-104** zeigen Ereignisse höherer Ebenen (Land, Bund, Welt) und sind für den Vertical Slice vorgesehen.

**Notation.** *Bel* Beliebtheit · *Par* Parteiloyalität · *Kasse* Wahlkampf-/Parteikasse in k€ (auf Landesebene Mio. €, im Bund Mrd. €, siehe Skalierung in Kapitel 7) · *Med* Medienecho · *Wirt/Umw/Ges* Zustand von Wirtschaft, Umwelt, Gesellschaftsklima · *Stress* Belastung der Figur. Werte sind **Grundwerte vor Modifikatoren** (Partei-Mechanik, Berufsbonus, Stress); die Medienreaktion fügt je nach Partei \`±1…±3\` Medienecho hinzu.

**Wagnis** = Attributsprobe. Erfolgschance \`p = clamp(0,5 + (Attribut + Boni − Schwelle) / 80; 0,12; 0,92)\`; bei Stress > 60 sinkt das Attribut um \`0,4 × (Stress − 60)\`.

**Medienreaktion.** Jede Option gehört zu einem *Frame* (z. B. „Mehr Geld in die Hand nehmen“). Jede Partei hat eine Haltung \`−1…+1\` zu jedem Frame; drei Medientypen (Lokalblatt, Boulevard, Social Media) bewerten den Frame mit Verzerrung und Rauschen. Dieselbe Entscheidung erzeugt so unterschiedliche Schlagzeilen, je nachdem, wer sie trifft.
`);
const ids = Object.keys(CARDS).filter(k => /^EV-0(0\d|1[0-6])$/.test(k));
let n = 0;
ids.forEach(id => {
  const c = CARDS[id]; n++;
  const inst = { v: c.vars() };
  const bgs = Object.keys(BG_TH).filter(b => BG_TH[b].includes(c.th)).map(b => BACKGROUNDS[b].n);
  const prs = Object.keys(PARTY_TH).filter(p => PARTY_TH[p].includes(c.th)).map(pn);
  out.push(`\n---\n\n### ${id} · ${c.title}`);
  out.push(`**Kategorie** ${c.kat} · **Ebene** Kommune (Amt 1–3) · **Thema** ${THN[c.th] || c.th} · **Basisgewicht** ${String(c.w).replace('.', ',')}${c.swipe ? ' · **Wisch-Karte (2 Optionen)**' : ''}  `);
  out.push(`**Gewicht ×1,35** bei Beruf: ${bgs.join(', ') || '–'} · **×1,25** bei Partei: ${prs.join(', ') || '–'}\n`);
  out.push('> ' + c.text(inst.v).replace(/\n/g, ' ') + '\n>\n> *' + c.q + '*\n');
  out.push('| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |\n|--:|---|---|---|---|---|');
  c.opts.forEach((o, i) => {
    const f = Object.assign({}, o.fx, o.fxf ? o.fxf(inst.v) : {});
    const chk = o.chk ? `${STAT[o.chk.s]} ≥ ${o.chk.dc}: ✔ ${fx(o.chk.ok.fx)} · ✘ ${fx(o.chk.bad.fx)}` : '–';
    const pf = [...Object.keys(o.pf || {}).map(k => `Profil ${THN[k] || k} ${o.pf[k] > 0 ? '+' : '−'}${Math.round(Math.abs(o.pf[k]) * 100)}`), ...Object.keys(o.ml || {}).map(k => `${({ jung: 'Jung', fam: 'Familien', sen: 'Senioren', gew: 'Gewerbe', dorf: 'Dorf', arb: 'Schicht' })[k]} ${o.ml[k] > 0 ? '+' : '−'}${Math.round(Math.abs(o.ml[k]) * 100)}`)].join(', ') || '–';
    out.push(`| ${i + 1} | ${o.t}${o.promise ? ` *(Versprechen: ${o.promise})*` : ''} | ${FRAMES[o.fr].n} | ${fx(f)} | ${chk} | ${pf} |`);
  });
  const laters = c.opts.map((o, i) => o.later ? `- **Option ${i + 1}** – ${o.later.card ? `mit ${Math.round(o.later.chance * 100)} % Wahrscheinlichkeit nach ${o.later.after} Wochen das Folge-Event **${o.later.card}**` : `mit ${Math.round((o.later.chance || 1) * 100)} % Wahrscheinlichkeit nach ${o.later.after} Wochen (Schmetterlingseffekt): „${o.later.hl.replace('{firma}', inst.v.firma || 'das Unternehmen')}“ → ${fx(o.later.fx)}`}` : null).filter(Boolean);
  out.push('\n**Verzögerte Folgen**\n' + (laters.length ? laters.join('\n') : '- keine (Folgen sind sofort sichtbar)'));
  // Medienreaktion: Frame der riskantesten/ersten Option
  const fr = [...new Set(c.opts.map(o => o.fr))].slice(0, 2);
  const lines = fr.map(f => { const st = FRAMES[f].st, best = Object.keys(PIDX).filter(p => p !== 'EIGEN').sort((a, b) => st[PIDX[b]] - st[PIDX[a]]), worst = best.slice().reverse(); const pos = best.filter(p => st[PIDX[p]] >= .3).slice(0, 3), neg = worst.filter(p => st[PIDX[p]] <= -.2).slice(0, 3); return `- *${FRAMES[f].n}*: lobend für ${pos.map(pn).join(', ') || '– (keine klare Haltung)'} · kritisch für ${neg.map(pn).join(', ') || '– (keine ablehnende Partei)'}`; });
  out.push('\n**Medienreaktion (Haltung der Partei zum Frame)**\n' + lines.join('\n'));
});
out.push(`
---

### EV-101 · Landesmittel: Wer bekommt den Spatenstich?
**Kategorie** Landespolitik · **Ebene** Land (Amt 4–6) · **Thema** Wirtschaft/Verkehr · **Basisgewicht** 1,0 · **Bedingungen** Amt ≥ Landtag; Haushaltsspielraum > 0; Jahresthema Verkehr/Wirtschaft erhöht das Gewicht ×1,6

> Das Land stellt 65 Millionen Euro für das Projekt „Mobilitätsdrehscheibe Nord“ bereit – mit dem Vermerk „Verteilung folgt“. Drei Abgeordnete aus drei Ortschaften behaupten gleichzeitig, sie hätten das Geld „nach Hause geholt“, der Rechnungshof räuspert sich vorsorglich.
>
> *Wie verteilst du die Landesmittel?*

| # | Option | Frame | Sofort-Effekte (Landesskala) | Wagnis |
|--:|---|---|---|---|
| 1 | Nach Proporz und Parteifreundschaft | Hinterzimmer-Deal | Par +3, Koalition +2, Med −2, Ges −1 | – |
| 2 | Offenes Vergabeverfahren mit Kriterien | Transparenz | Bel +2, Med +2, Par −1, Ges +2 | Durchsetzung ≥ 50 (Fraktion zieht mit): ✔ Par +2 · ✘ Par −3 |
| 3 | Alles in die eigene Heimatregion | Gefälligkeit | Bel +4 (Heimat), Med −1, Koalition −2, Ges −2 | – |

**Verzögerte Folgen:** Option 1: 30 % nach 8 Wochen *Rechnungshof-Bericht* (Med −4, Par −2, NPC „Rechnungshof“ −10). Option 3: 45 % nach 12 Wochen *Nachbarwahlkreis rebelliert* (Koalition −4, Folge-Event EV-102). Option 2: Langzeitbonus *Reformimage* (+1 Bel pro Amtsjahr, max. +4).
**Medienreaktion:** Hinterzimmer-Deal: lobend für CDU/CSU-nah (Pragmatismus), kritisch für Grüne, Linke; Transparenz: lobend für alle, am stärksten für Grüne und FDP.

---

### EV-102 · Nachtsitzung im Koalitionsausschuss
**Kategorie** Koalition · **Ebene** Bund (Amt 7–11) · **Thema** Regierung · **Basisgewicht** 1,2 · **Bedingungen** Teil einer Regierungskoalition; Koalitionsstabilität < 70; ein Streitgesetz im Verfahren

> Um 3 Uhr morgens dreht sich der Koalitionsausschuss um das Planungsbeschleunigungsgesetz. Der Partner verlangt das Verkehrsministerium „aus Prinzip“ und hat die roten Linien mit Filzstift gezogen – der Filzstift ist fast leer. Draußen warten Kameras, drinnen Erschöpfung und ein Buffet aus Keksen.
>
> *Wie löst du den Streit?*

| # | Option | Frame | Sofort-Effekte | Wagnis |
|--:|---|---|---|---|
| 1 | Tauschgeschäft: Ministerium gegen ein Ressort | Hinterzimmer-Deal | Koalitionsstabilität +8, Par +2, Med −2 | Durchsetzung ≥ 55: ✔ Stabilität +12 · ✘ Stabilität −6 |
| 2 | Rote Linie halten, Machtwort | Härte | Par +3, Stabilität −10, Bel +1 | – |
| 3 | Pause anordnen, vertrauensbildend sprechen | Dialog | Stabilität +5, Stress −4, Med +1 | Belastbarkeit ≥ 50: ✔ Stabilität +8 · ✘ Stress +6 |
| 4 | Vertrauensfrage stellen (Notbremse) | Angriff | Par −2, Stabilität −20, Neuwahl-Risiko +25 % | – |

**Verzögerte Folgen:** Option 1: Partner fordert in 3 Monaten eine „Gegenleistung“ (Folge-Event EV-102b). Option 2: 50 % Rücktritt einer Ministerin, Kabinettsumbildung (EV-102c). Option 4: Bundestag stimmt nach 14 Tagen ab; bei Scheitern Neuwahl.
**Medienreaktion:** Machtwort: lobend für CDU/CSU, AfD (Führungsstärke), kritisch für Grüne, SPD; Pause/Dialog: lobend für SPD, Grüne, FDP.

---

### EV-103 · Cyberangriff auf die Krankenhäuser
**Kategorie** Krisen · **Ebene** Bund (Amt 5–11) · **Thema** Digitalisierung/Sicherheit/Gesundheit · **Basisgewicht** 0,8 · **Bedingungen** Jahresthema Digitalisierung; kritische Infrastruktur-Sicherheit < 60

> Ein Cyberangriff legt die Krankenhäuser in der Region lahm: 1 200 Patient:innen werden verlegt, Hacker fordern 12 Milliarden Euro in Kryptowährung, die IT-Abteilung fordert Kaffee und einen Plan B. Die Verwaltung arbeitet wieder mit Stift und Papier.
>
> *Wie managst du die Krise?*

| # | Option | Frame | Sofort-Effekte | Wagnis |
|--:|---|---|---|---|
| 1 | Krisenstab, Bundeswehr-IT, keine Verhandlung | Härte | Bel +2, Med +2, Kasse −2 Mrd., Stress +3 | Belastbarkeit ≥ 55: ✔ Bel +4 · ✘ Bel −2 |
| 2 | Offen informieren, Fehler benennen | Transparenz | Bel +1, Med +3, Ges +2 | Integrität ≥ 50: ✔ Med +2 · ✘ Med −2 |
| 3 | Still verhandeln, um Schlimmeres zu verhindern | Hinterzimmer-Deal | Kasse −12 Mrd., Med −1 | Netzwerk ≥ 50: ✔ Lage beruhigt · ✘ Datenleck, Med −5 |

**Verzögerte Folgen:** Nach 4 Wochen *Untersuchungsausschuss „Cyberabwehr“* (Opposition: Med ±, je nach Option 1–3), Gesetzesvorschlag *Cybersicherheits-Stärkungsgesetz* wird als Gesetzesentwurf freigeschaltet (Bundestags-Pipeline, Kapitel 6).

---

### EV-104 · EU-Gipfel: Sanktionspaket
**Kategorie** Außen- und Europapolitik · **Ebene** Welt/EU (Amt 6–11) · **Thema** Außenpolitik/Energie · **Basisgewicht** 0,7 · **Bedingungen** Amt ≥ MP; Energieabhängigkeit > 40

> Brüssel legt ein Sanktionspaket vor: zwei Kilo Papier, Wirkung unklar. Ein Energielieferant droht, Verträge zu kündigen – es geht um 31 Milliarden Euro und um Prinzipien. Innenpolitisch will niemand frieren, außenpolitisch will niemand nachgeben, und ein Kompromiss existiert, aber niemand will ihn Kompromiss nennen.
>
> *Wie positionierst du Deutschland?*

| # | Option | Frame | Sofort-Effekte | Wagnis |
|--:|---|---|---|---|
| 1 | Sanktionen mittragen, Folgen abfedern | Härte | Bel −1, Ausland +4, Wirt −3, Kasse −8 Mrd. | – |
| 2 | Stille Diplomatie und Sonderlösung | Hinterzimmer-Deal | Wirt +1, Ausland −2, Med −2 | Netzwerk ≥ 55: ✔ Ausland +2, Wirt +2 · ✘ Leak, Med −4 |
| 3 | Energieunabhängigkeit beschleunigen | Klima und Umwelt | Umw +3, Wirt −1, Kasse −5 Mrd., Bel +1 | – |

**Verzögerte Folgen:** Option 1: nach 6 Wochen Preisschock (Bel −3, Energiepreis +12 %), Folge-Event *Entlastungspaket*. Option 3: nach 26 Wochen Bonus *Energiewende-Durchbruch* (Wirt +3, Umw +2).
`);
console.log(out.join('\n'));

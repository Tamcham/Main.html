/* ---------- Niederhüttingen: Milieus, Bezirke, Gegner ---------- */
const TOWN = { name: 'Niederhüttingen', ew: 38400, turnout: .56 };
const MILIEUS = [
  { id: 'jung', n: 'Innenstadt & Studis', share: .14, sal: [.10, .30, .20, .25, .05, .10] },
  { id: 'fam', n: 'Familien im Neubaugebiet', share: .20, sal: [.15, .20, .15, .10, .10, .30] },
  { id: 'sen', n: 'Senior:innen', share: .24, sal: [.10, .10, .10, .05, .30, .35] },
  { id: 'gew', n: 'Gewerbe & Mittelstand', share: .12, sal: [.40, .10, .20, .05, .15, .10] },
  { id: 'dorf', n: 'Dörfliche Ortsteile', share: .18, sal: [.15, .10, .25, .10, .20, .20] },
  { id: 'arb', n: 'Schichtarbeit & Pflege', share: .12, sal: [.20, .25, .10, .05, .10, .30] }
];
const MI = MILIEUS.map(m => m.id);
/* 24 Stimmbezirke: Typ = dominantes Milieu, Größe (Wahlberechtigte in Hundert) */
const DISTRICT_DEFS = [
  ['Altstadt Nord', 'jung', 16], ['Altstadt Süd', 'jung', 15], ['Bahnhofsviertel', 'jung', 14], ['Campus West', 'jung', 12], ['Hüttle-Ufer', 'fam', 18], ['Am Sonnenhang', 'fam', 20],
  ['Neubaugebiet Ost', 'fam', 22], ['Lindenallee', 'fam', 17], ['Stadtpark', 'sen', 19], ['Seniorenresidenz', 'sen', 14], ['Kirchplatz', 'sen', 18], ['Rathausviertel', 'sen', 17],
  ['Gewerbegebiet Nord', 'gew', 12], ['Gewerbegebiet Süd', 'gew', 14], ['Werksiedlung', 'arb', 16], ['Klinikviertel', 'arb', 15], ['Oberhüttingen', 'dorf', 9], ['Kleinbach', 'dorf', 6],
  ['Waldfeld', 'dorf', 7], ['Steinbrück', 'dorf', 8], ['Hohenau', 'dorf', 7], ['Tannrode', 'dorf', 5], ['Mühlheim-Nord', 'dorf', 8], ['Linden-Mitte', 'fam', 16]
];
function districtMix(type, idx) {
  const r = seeded(hashStr(type + idx));
  const w = MILIEUS.map(m => m.share * (m.id === type ? 4.2 : 0.55) * (0.8 + r() * .5));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map(x => x / s);
}
const DISTRICTS = DISTRICT_DEFS.map((d, i) => ({ n: d[0], type: d[1], size: d[2], mix: districtMix(d[1], i) }));

/* Gegnerfeld: passende Parteien zur Spielerpartei (keine Doppelung, CSU/CDU nach Region) */
const OPP_NAMES = {
  inc: ['Dr. Ulf Brandtner', 'Dr. Ingrid Thalhammer', 'Dr. Volker Amsel'], unab: 'Gerda Pfeifer', o1: ['Jens Ostermann', 'Nadine Rademacher'], o2: ['Mehmet Yilmaz-Kraus', 'Tanja Duvenbeck']
};
const OPP_PARTY_POOL = ['SPD', 'CDU', 'GRUENE', 'FDP', 'LINKE', 'AFD', 'BSW'];

/* ---------- NPCs ---------- */
const NPC0 = {
  kaem: { n: 'Brigitte Kowalczyk', r: 'Stadtkämmerin', e: '🧮', v: 45, d: 'Hütet die Kasse wie den Familienschmuck.' },
  press: { n: 'Kevin Lohmeyer', r: 'Reporter, Hüttinger Tageblatt', e: '📰', v: 40, d: 'Stellt Fragen, die man nicht beantworten will.' },
  party: { n: 'Gisela Hagedorn', r: 'Vorsitzende des Ortsverbands', e: '🤝', v: 55, d: 'Kennt jeden Stuhl im Parteiheim persönlich.' },
  fam: { n: 'Sam', r: 'Partner:in', e: '🏡', v: 70, d: 'Fragt sich, ob du Termine oder Familie gewählt hast.' }
};

/* ---------- Medien: Frames, Parteihaltung, Schlagzeilen ---------- */
/* Haltung der Parteien zu Entscheidungs-Frames (−1 = lehnt ab, +1 = begrüßt). Reihenfolge: CDU CSU SPD AFD GRUENE FDP LINKE BSW EIGEN */
const PIDX = { CDU: 0, CSU: 1, SPD: 2, AFD: 3, GRUENE: 4, FDP: 5, LINKE: 6, BSW: 7, EIGEN: 8 };
const FRAMES = {
  ausgaben: { n: 'Mehr Geld in die Hand nehmen', st: [-.2, -.2, .6, -.3, .4, -.8, .7, .3, 0] },
  sparen: { n: 'Sparen und Konsolidieren', st: [.6, .6, -.5, .0, -.3, .8, -.8, -.2, 0] },
  dialog: { n: 'Dialog und Beteiligung', st: [.2, .2, .5, -.2, .6, .1, .6, .1, .3] },
  ordnung: { n: 'Härte und Ordnung', st: [.6, .7, -.1, .6, -.5, .3, -.6, .3, -.2] },
  klima: { n: 'Klima und Umwelt', st: [-.2, -.2, .3, -.8, .9, -.3, .5, -.5, .1] },
  wirtschaft: { n: 'Standort und Wirtschaft', st: [.7, .7, .0, .1, -.2, .8, -.6, .0, .1] },
  sozial: { n: 'Sozialer Ausgleich', st: [.0, .2, .8, .2, .4, -.5, .9, .7, .1] },
  populismus: { n: 'Gefälligkeit und Show', st: [-.3, -.1, -.4, .5, -.5, -.3, -.2, .3, -.2] },
  transparenz: { n: 'Transparenz und Ehrlichkeit', st: [.2, .2, .4, .0, .6, .5, .4, .3, .5] },
  humor: { n: 'Humor und Nähe', st: [.3, .4, .3, .3, .2, .2, .2, .3, .5] },
  deal: { n: 'Hinterzimmer-Deal', st: [.0, .1, -.3, -.4, -.7, -.2, -.6, -.4, -.5] },
  aussitzen: { n: 'Aussitzen', st: [-.3, -.2, -.5, -.4, -.5, -.6, -.5, -.3, -.5] },
  angriff: { n: 'Angriff auf den Gegner', st: [.2, .3, .0, .6, -.2, .4, .2, .5, -.1] },
  einsatz: { n: 'Persönlicher Einsatz', st: [.4, .4, .5, .3, .5, .3, .5, .4, .5] }
};
/* Schlagzeilen: {n}=Nachname der Kandidatur, {o}=Ort */
const HL = {
  ausgaben: { pos: ['{n} investiert: „Endlich passiert was in {o}“', 'Mut zur Investition: {n} macht Geld locker'], neg: ['Schuldenkönig {n}? Die Rechnung zahlen wir alle', '{n} verteilt Geld, das {o} gar nicht hat'], neu: ['{n} kündigt Investitionen an – Zahlen folgen', 'Mehr Geld für {o}: Fachleute rechnen nach'] },
  sparen: { pos: ['{n} hält die Kasse zusammen: „Solide Politik“', 'Haushaltsdisziplin: {n} überzeugt die Kämmerei'], neg: ['Kahlschlag in {o}: {n} spart am falschen Ende', '{n} kürzt – und nennt es „Verantwortung“'], neu: ['{n} legt Sparliste vor', 'Haushalt: {n} bleibt vorsichtig'] },
  dialog: { pos: ['{n} hört zu: Bürgergespräch kommt gut an', 'Dialog statt Dekret: Lob für {n}'], neg: ['Noch ein Runder Tisch? {n} redet, {o} wartet', '{n} moderiert – entscheidet aber nicht'], neu: ['{n} lädt zum Bürgerdialog', 'Beteiligung in {o}: {n} setzt auf Gespräche'] },
  ordnung: { pos: ['{n} greift durch: „Sicherheit ist kein Luxus“', 'Klare Ansage von {n} – Anwohner:innen atmen auf'], neg: ['{n} setzt auf Härte – Kritik wächst', 'Law-and-Order in {o}: Zu viel, zu schnell?'], neu: ['{n} kündigt Kontrollen an', 'Ordnungsdienst in {o}: Stadtrat diskutiert'] },
  klima: { pos: ['{n} macht {o} klimafit – Applaus aus vielen Ecken', 'Grüne Wende mit Augenmaß: {n} setzt Zeichen'], neg: ['Klima-Kurs: {n} überfordert {o}', 'Ideologie statt Infrastruktur? Kritik an {n}'], neu: ['{n} legt Klimakonzept vor', 'Windräder, Wärme, Widerstand: {n} im Fokus'] },
  wirtschaft: { pos: ['{n} sichert Arbeitsplätze in {o}', 'Wirtschaft lobt {n}: „Endlich Planungssicherheit“'], neg: ['{n} hofiert die Wirtschaft – Kritik von links', 'Standortpolitik à la {n}: Wer zahlt die Zeche?'], neu: ['{n} trifft Unternehmer:innen', 'Gewerbe in {o}: {n} kündigt Runde an'] },
  sozial: { pos: ['{n} stärkt den Zusammenhalt in {o}', 'Sozial und machbar: {n} findet Zustimmung'], neg: ['Soziale Wohltaten? {n} verteilt, {o} zahlt', '{n} zementiert Verwaltungsaufwand'], neu: ['{n} kündigt Sozialpaket an', 'Zuschüsse für Familien: Details offen'] },
  populismus: { pos: ['{n} trifft den Nerv der Leute', 'Volksnah: {n} erntet Jubel'], neg: ['Show statt Substanz: {n} auf Stimmenfang', '{n} klatscht Beifall – und die Quittung kommt später'], neu: ['{n} gibt sich volksnah', 'Auftritt von {n} sorgt für Gesprächsstoff'] },
  transparenz: { pos: ['{n} legt alles offen – Respekt', 'Ehrlich währt am längsten: Lob für {n}'], neg: ['{n} räumt Fehler ein – und wird doch kritisiert', 'Offenheit wird zur Angriffsfläche'], neu: ['{n} veröffentlicht Unterlagen', 'Transparenz-Offensive von {n}'] },
  humor: { pos: ['{n} kann auch lustig: Video geht durch die Decke', 'Selbstironie gelungen: {o} lacht mit {n}'], neg: ['Cringe-Alarm: {n} bemüht sich zu sehr um Lacher', 'Humor? {n} verwechselt Wahlkampf mit Kabarett'], neu: ['{n} zeigt Humor – Reaktionen gemischt', 'Lockerer Auftritt von {n}'] },
  deal: { pos: ['{n} kann Politik: Einigung ohne Streit', 'Pragmatismus zahlt sich aus: {n} holt Ergebnis'], neg: ['Klüngel in {o}? {n} unter Verdacht', 'Hinterzimmer-Deal: {n} in Erklärungsnot'], neu: ['{n} verhandelt hinter verschlossenen Türen', 'Gespräche im Hinterzimmer: Niemand sagt was'] },
  angriff: { pos: ['{n} trifft den wunden Punkt – Publikum applaudiert', 'Scharfe Bilanz: {n} stellt den Amtsinhaber'], neg: ['{n} poltert – und verliert den Ton', 'Angriff im Affekt: {n} schießt übers Ziel'], neu: ['{n} geht den Amtsinhaber hart an', 'Wahlkampf wird rauer: {n} teilt aus'] },
  einsatz: { pos: ['{n} packt mit an – Bilder gehen durch {o}', 'Ärmel hoch: {n} zeigt Einsatz'], neg: ['Fototermin statt Hilfe? Kritik an {n}', '{n} inszeniert sich – {o} bleibt skeptisch'], neu: ['{n} hilft vor Ort', 'Einsatz von {n} in {o} – Stimmen gemischt'] },
  aussitzen: { pos: ['{n} bleibt gelassen – Lage beruhigt sich', 'Nichtstun gelungen: {n} hatte recht'], neg: ['{n} taucht ab, das Problem nicht', 'Aussitzen bis zum Wahltag? {o} verliert Geduld'], neu: ['{n} äußert sich nicht', 'Zurückhaltung von {n}: Was steckt dahinter?'] }
};
const OUTLETS = [
  { id: 'lok', n: 'Hüttinger Tageblatt', c: '', bias: 0, amp: 1, wrap: s => `„${s}“` },
  { id: 'bou', n: 'Kurier am Mittag', c: 'b', bias: -.15, amp: 1.5, wrap: s => s.toUpperCase().replace(/[„“]/g, '') + '!' },
  { id: 'soc', n: 'Social Media', c: 's', bias: 0, amp: 1.2, wrap: s => `💬 ${s} #Niederhüttingen` }
];
function mediaReaction(frame, party, risky, opts) {
  // Jede Redaktion bewertet denselben Frame je nach Parteihaltung, Tonlage und Skandalrisiko unterschiedlich
  const st = FRAMES[frame].st[PIDX[party]];
  const out = []; let score = 0;
  OUTLETS.forEach(o => {
    const x = (st + o.bias + (risky ? -.25 : 0) + gauss() * .18) * o.amp;
    const tone = x > .22 ? 'pos' : x < -.22 ? 'neg' : 'neu';
    const line = pick(HL[frame][tone]).replace(/\{n\}/g, G.nn).replace(/\{o\}/g, TOWN.name);
    out.push({ outlet: o, tone, text: o.wrap(line) });
    score += tone === 'pos' ? 1 : tone === 'neg' ? -1 : 0;
  });
  return { out, score, st };
}

/* ---------- Bund: Ausgangslage (fiktiv) und Institute ---------- */
const BUND0 = { CDU: 20.5, CSU: 5.5, SPD: 16.5, AFD: 21.0, GRUENE: 12.0, FDP: 4.5, LINKE: 6.5, BSW: 4.0, SONST: 9.5 };
const BUND_PARTIES = ['CDU', 'CSU', 'SPD', 'AFD', 'GRUENE', 'FDP', 'LINKE', 'BSW'];
const INSTITUTES = [
  { id: 'kom', n: 'Kompass-Institut', nn: 1500, bias: { CDU: .6, CSU: .1, SPD: -.3, AFD: -.4, GRUENE: .2, FDP: .1, LINKE: -.2, BSW: -.1 } },
  { id: 'elb', n: 'Elbe Forschungsgruppe', nn: 2400, bias: { CDU: -.3, CSU: .0, SPD: .4, AFD: .3, GRUENE: -.4, FDP: -.2, LINKE: .3, BSW: .2 } },
  { id: 'mei', n: 'Meinungsraum', nn: 1000, bias: { CDU: .1, CSU: .2, SPD: .0, AFD: -.2, GRUENE: .5, FDP: .3, LINKE: -.1, BSW: -.4 } }
];
const FRAKTIONEN = ['LINKE', 'SPD', 'GRUENE', 'FDP', 'BSW', 'UNION', 'AFD']; // Sitzordnung von links nach rechts
const FRK = {
  LINKE: { n: 'Linke', pos: [-.9, -.7] }, SPD: { n: 'SPD', pos: [-.5, -.3] }, GRUENE: { n: 'Grüne', pos: [-.3, -.85] },
  FDP: { n: 'FDP', pos: [.85, -.2] }, BSW: { n: 'BSW', pos: [-.4, .5] }, UNION: { n: 'Union', pos: [.5, .5] }, AFD: { n: 'AfD', pos: [.35, .9] }
};
function frkColor(f) { return f === 'UNION' ? pcolor('CDU') : pcolor(f); }
function frkAbbr(f) { return f === 'UNION' ? 'CDU/CSU' : f === 'GRUENE' ? 'Grüne' : f === 'LINKE' ? 'Linke' : f === 'AFD' ? 'AfD' : f; }

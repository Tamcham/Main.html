/* ---------- Parteien (Spielwerte – stilisiert, satirisch überhöht, nicht als Wahlempfehlung gedacht) ---------- */
const THEMES = [
  { id: 'wirt', n: 'Wirtschaft' }, { id: 'wohn', n: 'Wohnen' }, { id: 'verk', n: 'Verkehr' },
  { id: 'klim', n: 'Klima' }, { id: 'sich', n: 'Sicherheit' }, { id: 'soz', n: 'Soziales & Bildung' }
];
const TH = THEMES.map(t => t.id);

const PARTIES = {
  CDU: {
    id: 'CDU', abk: 'CDU', name: 'CDU', voll: 'Christlich Demokratische Union', color: '#8d96a8', cb: '#999999', diff: 2,
    slogan: 'Stabil. Solide. Seit jeher.', motto: 'Damit es bleibt, wie es sein sollte – nur ein bisschen besser.',
    kern: ['Wirtschaft', 'Sicherheit', 'Haushaltsdisziplin'], waehler: 'Mittelstand, Senior:innen, ländlicher Raum, Familien',
    staerken: ['Regierungserfahrung: Wirtschafts- und Verwaltungskompetenz', 'Dichtes Netz an Ortsverbänden', 'Hohe Kampagnenkasse'],
    schwaechen: ['Wirkt bei Zukunftsthemen behäbig', 'Flügelstreit: Wirtschaft vs. Soziales vs. Junge Union', 'Junge Wähler:innen schwer erreichbar'],
    fluegel: 'Wirtschaftsflügel · Sozialausschüsse · Junge Union', konflikt: 'Die K-Frage: Wer darf eigentlich Kanzler:in werden – und wer hat das schon zugesagt?',
    mech: { n: 'Stabilitätsanker', t: 'Schäden bei Wirtschaft und Gesellschaftsklima werden halbiert. Dafür bringen Klima-Vorstöße nur halb so viel Beliebtheit.' },
    bud: 30, par: 62, bel: 38, recog: .30, prof: [.65, .40, .45, .25, .65, .40], aff: [-.3, .2, .5, .7, .4, -.1], pers: 0
  },
  CSU: {
    id: 'CSU', abk: 'CSU', name: 'CSU', voll: 'Christlich-Soziale Union', color: '#3f86e0', cb: '#0072B2', diff: 2,
    slogan: 'Mia san mia. Und Sie auch, wenn’s passt.', motto: 'Bayern first – der Rest folgt mit Abstand.',
    kern: ['Heimat', 'Sicherheit', 'Landwirtschaft'], waehler: 'Dorf- und Kleinstadtbevölkerung, Mittelstand, Katholik:innen',
    staerken: ['Sonderrolle im Bund: Fraktionsgemeinschaft mit der CDU', 'Dominanz in Dorf und Bierzelt', 'Sehr hohe Kampagnenkasse'],
    schwaechen: ['Nur in Bayern wählbar – bundesweit kleiner Hebel', 'Reibt sich gern an der Schwesterpartei', 'Modernisierungsimage mau'],
    fluegel: 'Landesgruppe · Christlich-Soziale Arbeitnehmer · Junge Union Bayern', konflikt: 'Das Schwesterverhältnis: Drohen oder bitten, je nach Umfrage.',
    mech: { n: 'Mia-san-mia-Bonus', t: 'Dörfliche Ortsteile stehen fest hinter dir, Festauftritte im Bierzelt gelingen leichter (Trachtenbonus). Dafür bist du im Stadtzentrum fremd.' },
    bud: 34, par: 70, bel: 40, recog: .34, prof: [.65, .40, .45, .25, .70, .45], aff: [-.3, .3, .5, .6, .7, .0], pers: 0
  },
  SPD: {
    id: 'SPD', abk: 'SPD', name: 'SPD', voll: 'Sozialdemokratische Partei Deutschlands', color: '#e3404b', cb: '#D55E00', diff: 3,
    slogan: 'Respekt. Gerechtigkeit. Zusammenhalt.', motto: 'Wer arbeitet, soll sich auch was leisten können – und Urlaub.',
    kern: ['Soziales', 'Rente', 'Arbeit & Löhne'], waehler: 'Arbeitnehmer:innen, Gewerkschaftsmitglieder, Pflege und Bildung',
    staerken: ['Gewerkschafts-Netzwerk', 'Sozialkompetenz', 'Regierungs- und Kommunalerfahrung'],
    schwaechen: ['Streit zwischen Seeheimern, Parteilinken und Jusos', 'Kanzlerbonus schwer zu erreichen', 'Junge Wähler:innen wandern zu Grünen und Linken'],
    fluegel: 'Seeheimer Kreis · Parteilinke · Jusos', konflikt: 'Die Basis will mehr links, die Regierung will mehr Kompromiss.',
    mech: { n: 'Gewerkschafts-Netz', t: 'Schichtarbeit & Pflege stehen hinter dir, Tarif- und Streikthemen laufen besser. Sparmaßnahmen und Hinterzimmerdeals kosten doppelt Parteiloyalität.' },
    bud: 24, par: 58, bel: 36, recog: .28, prof: [.40, .60, .40, .35, .40, .70], aff: [.0, .2, .3, -.3, .0, .6], pers: 0
  },
  AFD: {
    id: 'AFD', abk: 'AfD', name: 'AfD', voll: 'Alternative für Deutschland', color: '#58b4ee', cb: '#56B4E9', diff: 5,
    slogan: 'Mut zur Wahrheit. Oder zumindest zur Lautstärke.', motto: 'Die da oben – wir hier unten. Schon wieder.',
    kern: ['Migration', 'Energiepreise', 'Sicherheit'], waehler: 'Protestwähler:innen, Ost- und ländliche Regionen, Schichtarbeit',
    staerken: ['Hohe Mobilisierung und emotionale Bindung der Kernwählerschaft', 'Dominanz in sozialen Medien', 'Starke Regionalhochburgen'],
    schwaechen: ['Andere Parteien schließen eine Zusammenarbeit aus (Kooperationssperre)', 'Hohes Skandal- und Beobachtungsrisiko', 'Schwache Verwaltungs- und Regierungserfahrung'],
    fluegel: 'Nationalkonservative · Wirtschaftsliberale · Radikale Flanke', konflikt: 'Wie viel Provokation darf sein, wie viel Regierungsfähigkeit muss sein?',
    mech: { n: 'Protest-Dynamik', t: 'Medienecho schlägt doppelt aus (nach oben wie unten), Skandalrisiko ×1,5. Schichtarbeit und Dörfer mobilisieren stärker. In der Stichwahl geben Mitbewerber-Wähler:innen seltener an dich weiter (Kooperationssperre).' },
    bud: 14, par: 66, bel: 34, recog: .30, prof: [.35, .30, .40, .10, .65, .30], aff: [-.5, -.1, .0, -.1, .3, .3], pers: 0
  },
  GRUENE: {
    id: 'GRUENE', abk: 'GRÜ', name: 'Grüne', voll: 'Bündnis 90/Die Grünen', color: '#46b762', cb: '#009E73', diff: 3,
    slogan: 'Veränderung ist das neue Normal.', motto: 'Wir retten die Welt – möglichst in 10 Punkten und ohne Dienstwagen.',
    kern: ['Klima', 'Verkehrswende', 'Bürgerrechte'], waehler: 'Junge, Studierende, urbane Akademiker:innen, Familien in der Stadt',
    staerken: ['Klimakompetenz', 'Starke Innenstadt- und Jugendbasis', 'Engagierte Mitglieder'],
    schwaechen: ['Realo/Fundi-Konflikt', 'Gegenwind auf dem Land', 'Zielkonflikt: Regieren vs. Prinzipien'],
    fluegel: 'Realos · Fundis · Parteilinke', konflikt: 'Kompromiss oder Prinzip – Delegierte entscheiden, Twitter kommentiert.',
    mech: { n: 'Realo/Fundi-Regler', t: 'Pragmatische Optionen bringen Beliebtheit, kosten aber Parteiloyalität – prinzipientreue Optionen umgekehrt. Dein Kurs wird im Profil angezeigt.' },
    bud: 20, par: 60, bel: 37, recog: .28, prof: [.35, .45, .55, .80, .30, .50], aff: [.8, .3, -.2, -.4, -.4, -.2], pers: 0
  },
  FDP: {
    id: 'FDP', abk: 'FDP', name: 'FDP', voll: 'Freie Demokratische Partei', color: '#f5c72e', cb: '#F0E442', diff: 4,
    slogan: 'Freiheit. Fortschritt. Finanzen im Griff.', motto: 'Weniger Staat, mehr Du – auch beim Steuerformular.',
    kern: ['Steuern', 'Digitalisierung', 'Bürgerfreiheit'], waehler: 'Selbstständige, Gründer:innen, Gewerbe, urbane Liberale',
    staerken: ['Wirtschafts- und Steuerprofil', 'Gute Spendenlage', 'Starke Stimme für Mittelstand und Gewerbe'],
    schwaechen: ['Bundesweit an der 5-%-Hürde', 'Koalitionsrisiko: Sollbruchstellen sind Markenzeichen', 'Wenig Kompetenz in Sozialthemen'],
    fluegel: 'Wirtschaftsliberale · Bürgerrechtsliberale', konflikt: 'Regieren und liefern – oder lieber nicht regieren, als schlecht zu regieren?',
    mech: { n: 'Freiheitsindex', t: 'Sparen und Entbürokratisieren bringen Zusatz-Beliebtheit, Spenden fließen um 50 % stärker. Sozialthemen wirken schwächer.' },
    bud: 22, par: 56, bel: 36, recog: .26, prof: [.70, .35, .50, .25, .35, .25], aff: [.0, .0, -.2, .6, -.1, -.4], pers: 0
  },
  LINKE: {
    id: 'LINKE', abk: 'LINKE', name: 'Die Linke', voll: 'Die Linke', color: '#d13f9b', cb: '#CC79A7', diff: 4,
    slogan: 'Für die Vielen, nicht für die Wenigen.', motto: 'Mieten runter, Löhne rauf, Laune bleibt.',
    kern: ['Mieten', 'Soziales', 'Umverteilung'], waehler: 'Jüngere Städter:innen, Geringverdienende, soziale Bewegungen',
    staerken: ['Starke Straßen- und Haustürpräsenz', 'Sozial- und Mietenkompetenz', 'Mobilisierte Basis'],
    schwaechen: ['Sehr kleine Kasse', 'Koalitionen schwierig', 'Flügelstreit Reformer vs. Bewegungslinke'],
    fluegel: 'Reformer · Bewegungslinke · Sozialistische Linke', konflikt: 'Regieren oder Protest – und wer trägt die Verantwortung für die Mieten?',
    mech: { n: 'Bewegung & Straße', t: 'Straßen- und Haustürwahlkampf wirken 1,5-fach, die Basis mobilisiert extra. Dafür ist die Kampagnenkasse klein.' },
    bud: 10, par: 64, bel: 33, recog: .22, prof: [.25, .65, .45, .45, .20, .70], aff: [.4, -.1, -.1, -.6, -.4, .3], pers: 0
  },
  BSW: {
    id: 'BSW', abk: 'BSW', name: 'BSW', voll: 'Bündnis für Soziale Wahrheit', color: '#a66be3', cb: '#E69F00', diff: 4,
    slogan: 'Vernunft. Gerechtigkeit. Ruhe im Karton.', motto: 'Links bei Löhnen, konservativ bei Kaffeefahrten.',
    kern: ['Soziales', 'Frieden', 'Migration'], waehler: 'Enttäuschte aller Lager, Ost- und ältere Wähler:innen, Geringverdienende',
    staerken: ['Sehr hohe Bekanntheit der Gründerfigur', 'Starke Medienpräsenz', 'Frische Marke'],
    schwaechen: ['Dünne Parteistruktur, wenige Ortsverbände', 'Abhängigkeit von der Gründerfigur', 'Programm noch in Arbeit'],
    fluegel: 'Gründerkreis · Quereinsteiger · Sozialpolitiker', konflikt: 'Wer darf beitreten – und wer darf widersprechen?',
    mech: { n: 'Gründerfigur', t: 'Charisma und Beliebtheit zählen 1,6-fach, die Parteistruktur dagegen fast nichts. Schwächere Mobilisierung am Wahltag.' },
    bud: 8, par: 44, bel: 40, recog: .42, prof: [.35, .30, .40, .15, .40, .65], aff: [-.2, -.1, .1, -.3, .1, .4], pers: 0
  },
  EIGEN: {
    id: 'EIGEN', name: 'Eigene Partei', voll: 'Neu gegründet', color: '#d6b16c', cb: '#FFFFFF', diff: 5,
    slogan: 'Neu. Anders. Ungetestet.', motto: '', kern: [], waehler: 'Noch niemand – genau das ist die Chance',
    staerken: ['Maximale Freiheit im Programm', 'Sehr hohes Wachstumspotenzial', 'Keine Altlasten'],
    schwaechen: ['Kaum Geld', 'Kaum Bekanntheit', 'Kinderkrankheiten: Mitglieder, Satzung, Schatzmeister'],
    fluegel: 'Gründungsmitglieder', konflikt: 'Wer ist hier eigentlich der Vorstand – und wo ist der Kugelschreiber?',
    mech: { n: 'Wachstumsspirale', t: 'Positive Medienberichte erzeugen Momentum: bis zu +10 Punkte Beliebtheit und Bekanntheit. Dafür fehlen Kasse und Struktur, und Kinderkrankheiten drohen.' },
    bud: 4, par: 50, bel: 30, recog: .08, prof: [.45, .45, .45, .45, .45, .45], aff: [0, 0, 0, 0, 0, 0], pers: 0
  }
};
const PARTY_ORDER = ['CDU', 'CSU', 'SPD', 'AFD', 'GRUENE', 'FDP', 'LINKE', 'BSW', 'EIGEN'];
function pcolor(id) { const p = PARTIES[id]; if (!p) return '#888'; return SET.cb ? p.cb : (id === 'EIGEN' && G && G.own ? G.own.color : p.color); }
function pname(id) { return id === 'EIGEN' && G && G.own && G.own.abk ? G.own.abk : (PARTIES[id] ? PARTIES[id].name : id); }

/* ---------- Hintergründe, Herkunft, Dialekte ---------- */
const STATS = [
  { id: 'cha', n: 'Charisma', d: 'Wirkung auf Menschen, Bierzelt, Bühne' },
  { id: 'iq', n: 'Intelligenz', d: 'Faktenwissen, Gesetze, Haushalte' },
  { id: 'dur', n: 'Durchsetzung', d: 'Macht, Verhandlungen, Fraktion' },
  { id: 'ehr', n: 'Integrität', d: 'Glaubwürdigkeit, Skandalfestigkeit' },
  { id: 'med', n: 'Medienwirkung', d: 'Schlagzeilen, Social Media, TV' },
  { id: 'res', n: 'Belastbarkeit', d: 'Stress, Nachtsitzungen, Krisen' },
  { id: 'net', n: 'Netzwerk', d: 'Kontakte, Berater:innen, Vorschau-Qualität' }
];
const BACKGROUNDS = {
  lehrer: { n: 'Lehrer:in', e: '📚', t: 'Erklären kannst du. Dass dir dabei keiner zuhört, kennst du aus der 9b.', st: { iq: 6, cha: 4 }, prof: { soz: .10 }, mil: { fam: .06 }, bud: 0, npc: 'Elternbeirat ist wohlgesonnen' },
  handwerk: { n: 'Handwerker:in', e: '🔧', t: 'Mit der Wasserwaage im Wahlkampf: Was schief ist, sieht man sofort.', st: { dur: 6, res: 5, net: 4 }, prof: { wirt: .06, wohn: .04 }, mil: { gew: .10 }, bud: 2, npc: 'Kreishandwerkerschaft hilft mit Plakaten' },
  jurist: { n: 'Jurist:in', e: '⚖️', t: 'Du liest das Kleingedruckte – und sogar das Kleingedruckte vom Kleingedruckten.', st: { iq: 8, ehr: 4 }, prof: { sich: .08 }, mil: {}, bud: 3, npc: 'Gutes Gespür für rechtssichere Formulierungen' },
  unternehmer: { n: 'Unternehmer:in', e: '🏭', t: 'Du hast Leute eingestellt und entlassen. Beides kommt im Wahlkampf gleich gut an.', st: { dur: 6, net: 6, ehr: -4 }, prof: { wirt: .12 }, mil: { gew: .14 }, bud: 8, npc: 'Spendenbereitschaft im Bekanntenkreis' },
  pflege: { n: 'Pflegekraft', e: '🩺', t: 'Schichtdienst, Nächte, Verantwortung – ein Wahlkampf ist dagegen fast Wellness.', st: { res: 8, ehr: 6 }, prof: { soz: .12 }, mil: { arb: .15, sen: .05 }, bud: 0, npc: 'Hohe Glaubwürdigkeit bei Gesundheitsthemen' },
  landwirt: { n: 'Landwirt:in', e: '🌾', t: 'Du stehst früh auf. Politik beginnt immerhin erst um zehn.', st: { res: 6, cha: 3 }, prof: { wirt: .04, verk: .06 }, mil: { dorf: .18 }, bud: 1, npc: 'Bauernverband unterstützt dich' },
  polizei: { n: 'Polizist:in', e: '🛡️', t: 'Du hast schon Schlimmeres gesehen als einen Gemeinderat. Knapp.', st: { dur: 6, ehr: 4, res: 4 }, prof: { sich: .12 }, mil: { sen: .08 }, bud: 0, npc: 'Vertrauen bei Sicherheitsthemen' },
  journalist: { n: 'Journalist:in', e: '🎙️', t: 'Du weißt, wie Schlagzeilen entstehen. Und wie man sie wieder loswird. Meistens.', st: { med: 8, cha: 4, net: 4 }, prof: {}, mil: {}, bud: 0, recog: .10, npc: 'Lokalreporter Lohmeyer ist dein Ex-Kollege (+20)' }
};
const HERKUNFT = {
  alt: { n: 'Alteingesessen', t: 'Dein Opa kannte schon den Vorvorgänger des Bürgermeisters.', recog: .12, st: { ehr: -2 } },
  zug: { n: 'Zugezogen', t: 'Frischer Blick, aber auch die Frage: „Woher kommen Sie eigentlich?“', recog: -.04, st: { iq: 3, med: 2 } },
  land: { n: 'Dorfkind', t: 'Die Ortsteile kennen dich vom Kindergarten.', mil: { dorf: .10 }, st: { res: 2 } },
  stadt: { n: 'Stadtkind', t: 'Altbau, Altglas und Ahnung von Nahverkehr.', mil: { jung: .08 }, st: { med: 2 } },
  mig: { n: 'Mit Migrationsgeschichte', t: 'Du baust Brücken – manchmal im wörtlichen Sinn, oft im Gespräch.', mil: { arb: .05, fam: .04 }, st: { cha: 2, net: 2 } },
  nachbar: { n: 'Aus der Nachbarstadt', t: 'Man kennt dich halb. Immerhin die bessere Hälfte.', recog: .04, st: { net: 3 } }
};
const DIALEKTE = {
  hoch: { n: 'Hochdeutsch', t: 'Tagesschau-Niveau. Ohne Tagesschau-Budget.' },
  bair: { n: 'Bairisch', t: 'Servus, Grüß Gott und „Des passt scho“.', bierzelt: 8, dorf: .05 },
  nord: { n: 'Norddeutsch', t: 'Moin. Das reicht als Rede.', dorf: .03 },
  saechs: { n: 'Sächsisch', t: 'Nu klar – Bürgernähe per Akzent.', dorf: .04 },
  rhein: { n: 'Rheinisch', t: 'Kölsch-Laune, Karnevals-Charme.', bierzelt: 8 },
  schwab: { n: 'Schwäbisch', t: 'Schaffe, schaffe – und Haushalte mit Kehrwoche.', dorf: .03 }
};
const FACES = [{ id: 'oval', n: 'Oval' }, { id: 'rund', n: 'Rund' }, { id: 'kantig', n: 'Kantig' }];
const HAIRS = [{ id: 'kurz', n: 'Kurz' }, { id: 'seit', n: 'Seitenscheitel' }, { id: 'lang', n: 'Lang' }, { id: 'bob', n: 'Bob' }, { id: 'dutt', n: 'Dutt' }, { id: 'glatze', n: 'Glatze' }, { id: 'locken', n: 'Locken' }];
const OUTFITS = [{ id: 'anzug', n: 'Anzug' }, { id: 'blazer', n: 'Blazer' }, { id: 'strick', n: 'Strickjacke' }, { id: 'tracht', n: 'Trachtenjanker' }, { id: 'hemd', n: 'Hemd, offen' }];
const ACCS = [{ id: 'none', n: 'Keins' }, { id: 'brille', n: 'Brille' }, { id: 'schal', n: 'Schal' }, { id: 'pin', n: 'Anstecker' }, { id: 'krawatte', n: 'Krawatte' }];
const SKINS = ['#f6dcc4', '#ecc39c', '#d9a47a', '#b97c56', '#8d5a3a', '#5e3a25'];
const HAIRC = ['#1d1a18', '#4a3426', '#8a5a34', '#c9a46a', '#b8b8b8', '#b5452a'];

/* Kampagnen-Slogans mit Zielgruppen-Wirkung auf Milieus (jung, fam, sen, gew, dorf, arb) */
const SLOGANS = [
  { t: 'Niederhüttingen: Mach was draus.', m: [.10, .05, -.04, .05, -.02, .02] },
  { t: 'Sicher. Sauber. Ehrlich.', m: [-.04, .05, .10, .04, .05, .02] },
  { t: 'Gutes Leben für alle Ortsteile.', m: [.02, .06, .04, .00, .10, .04] },
  { t: 'Bezahlbar wohnen. Bequem ankommen.', m: [.08, .10, .02, .00, .02, .08] },
  { t: 'Anpacken statt aussitzen.', m: [.03, .04, .03, .09, .04, .06] }
];

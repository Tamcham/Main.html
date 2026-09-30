/* ---------- Entscheidungskarten (handgeschriebene Kern-Events, Teil des 20er-Katalogs in docs/03) ----------
 * Effekte: b Beliebtheit, p Parteiloyalität, d Kasse (k€), m Medienecho, w Wirtschaft, u Umwelt, g Gesellschaftsklima, s Stress
 * pf = Profilgewinn je Thema, ml = Stimmung je Milieu, chk = Wagnis (Attributsprobe), later = verzögerte Folge (Schmetterlingseffekt)
 */
const V_FIRMA = ['Hollweg Metallbau GmbH', 'Brandtner Logistik KG', 'Kaltenbach Energie AG', 'Niehaus Landtechnik GmbH', 'Wendelin Verpackung & Söhne', 'Oberdorfer Brauerei AG', 'Rademacher Software GmbH'];
const V_PERSON = ['Sabine Hollweg', 'Dieter Kaltenbach', 'Ulrike Niehaus', 'Jürgen Abendroth', 'Heike Pfeifer', 'Thorsten Vollmer', 'Aylin Cordes', 'Bernd Lindemann'];
const V_VERBAND = ['vom Mieterverein', 'vom Heimatverein', 'von der Bürgerinitiative „Pro Hüttle“', 'vom Seniorenbeirat', 'vom Sportverein 1898'];

const O = (t, fr, fx, x) => Object.assign({ t, fr, fx }, x || {});

const CARDS = {
  'EV-001': {
    kat: 'Kommunal', e: '🌉', th: 'verk', w: 1.0, title: 'Die Brücke über die Hüttle',
    vars: () => ({ per: pick(V_PERSON), vb: pick(V_VERBAND) }),
    text: v => `Der Prüfbericht zur Hüttle-Brücke liest sich wie ein Gruselroman: „Tragfähigkeit: optimistisch.“ Seit gestern dürfen nur noch Fahrräder, Fußgänger und sehr mutige Traktoren rüber. ${v.per} ${v.vb} hat die Umleitungsschilder schon selbst gemalt.`,
    q: 'Wie positionierst du dich?',
    opts: [
      O('Sanierung versprechen – Finanzierung: Haushaltsumbau', 'ausgaben', { b: 3, p: 1, m: 1, w: 2, g: 1, s: 1 }, { pf: { verk: .08 }, promise: 'Hüttle-Brücke sanieren', ml: { dorf: .05, gew: .04 } }),
      O('Bürgerversammlung: Was ist uns die Brücke wert?', 'dialog', { b: 1, p: 1, d: -2, m: 1, g: 2, s: 1 }, { pf: { verk: .04 }, later: { after: 3, chance: .5, hl: 'Bürgerversammlung zur Brücke: 300 Leute, 40 Meinungen, eine Mehrheit für „irgendwas mit Sanieren“.', fx: { b: 1, g: 1 } } }),
      O('Sperren und neu denken: Rad- und Fußbrücke statt Lkw-Verkehr', 'klima', { b: 0, m: 1, w: -2, u: 3, g: 0 }, { pf: { klim: .06, verk: .03 }, ml: { jung: .07, gew: -.08, dorf: -.04 }, ideal: 1 })
    ]
  },
  'EV-002': {
    kat: 'Kommunal', e: '🌬️', th: 'klim', w: 1.0, title: 'Windrad am Waldrand',
    vars: () => ({ per: pick(V_PERSON) }),
    text: v => `Zwischen Kleinbach und dem Wald soll ein Windrad entstehen. ${v.per} sammelt Unterschriften („Nicht vor meiner Haustür, aber gern vor der von Steinbrück“), die Stadtwerke sprechen von „Zukunft“ und die Schafe von gar nichts.`,
    q: 'Wofür stehst du?',
    opts: [
      O('Genehmigen – mit Bürgerenergie-Beteiligung', 'klima', { b: 1, p: 1, m: 1, w: 1, u: 4, g: 0 }, { pf: { klim: .08, wirt: .02 }, promise: 'Bürgerenergie-Windrad', ml: { jung: .07, dorf: -.07 }, ideal: 1 }),
      O('Ablehnen – der Wald bleibt, wie er ist', 'populismus', { b: 2, m: 0, w: -1, u: -3, g: -1 }, { pf: { klim: -.04 }, ml: { dorf: .09, jung: -.07 }, ideal: -1 }),
      O('Bürgerentscheid ansetzen', 'dialog', { b: 1, p: 0, d: -1, m: 1, g: 2 }, { later: { after: 3, chance: .8, hl: 'Bürgerentscheid zum Windrad: 52 zu 48 – knapp, laut, demokratisch.', fx: { b: 1, g: 2, m: 1 } } })
    ]
  },
  'EV-003': {
    kat: 'Gesellschaft', e: '🍺', th: 'soz', w: 1.1, title: 'Schützenfest: Der Fassanstich',
    vars: () => ({ per: pick(V_PERSON) }),
    text: v => `Im Festzelt reicht dir ${v.per} den Holzhammer: „Jetzt zeigen Sie mal, was Sie können.“ 300 Leute schweigen, die Blaskapelle hält den Atem an, in der ersten Reihe filmt jemand. Das Fass sieht aus, als wüsste es mehr als du.`,
    q: 'Wie trittst du auf?',
    opts: [
      O('Selbst anzapfen – Volle Show', 'populismus', { b: 0 }, { ml: { dorf: .06 }, chk: { s: 'cha', dc: 52, bierzelt: true, ok: { fx: { b: 5, m: 4, p: 1, s: -1 }, t: 'Zwei Schläge, null Spritzer – das Zelt tobt.' }, bad: { fx: { b: -2, m: -3, s: 2 }, t: 'Bierdusche für die erste Reihe. Das Video hat schon 40.000 Aufrufe.' } } }),
      O('Der Wirtin den Vortritt lassen und Alkoholfreies bestellen', 'humor', { b: 1, m: 1, g: 1, s: -1 }, { ml: { fam: .04, sen: .03, dorf: -.02 } }),
      O('Kurze Rede halten, Hände schütteln', 'dialog', { b: 1, p: 1, s: 0 }, { ml: { dorf: .03 } })
    ]
  },
  'EV-004': {
    kat: 'Wirtschaft', e: '🏭', th: 'wirt', w: 1.1, title: 'Die Firma droht mit Abwanderung',
    vars: () => ({ firma: pick(V_FIRMA), per: pick(V_PERSON), zs: pick([60, 80, 120, 180, 240]) }),
    text: v => `${v.firma} droht mit Verlagerung: ${v.zs} Arbeitsplätze stehen auf dem Spiel, sagt ${v.per}. Die Nachbarstadt lockt schon mit Rabatten und einem Werbefilm mit Drohnenflug. Die Gewerbesteuer ist der halbe Haushalt – den der Amtsinhaber gern weiter verwalten würde.`,
    q: 'Wie hältst du die Firma im Ort?',
    opts: [
      O('Steuerrabatt im Hinterzimmer aushandeln', 'deal', { b: 1, p: 2, d: 4, m: -2, w: 3, g: -1 }, { pf: { wirt: .05 }, ml: { gew: .08, arb: .03 }, later: { after: 3, chance: .4, hl: 'Hinterzimmer-Deal mit {firma} wird im Stadtrat bekannt: „Wer wusste was?“', fx: { b: -3, m: -4, p: -1 } } }),
      O('Standortoffensive: Gewerbefläche, Glasfaser, feste Ansprechperson', 'wirtschaft', { b: 2, p: 1, m: 1, w: 3 }, { pf: { wirt: .08 }, promise: 'Standortoffensive Gewerbegebiet', ml: { gew: .10 } }),
      O('Nicht erpressbar sein – abwarten', 'aussitzen', { b: -1, m: -2, w: -2, s: -1 }, { later: { after: 4, chance: .6, hl: '{firma} verlagert einen Teilbetrieb: 80 Stellen fallen weg. Du schaust zu, der Amtsinhaber schweigt.', fx: { b: -2, w: -5, g: -2 } } })
    ]
  },
  'EV-005': {
    kat: 'Medien', e: '📰', th: 'med', w: .55, title: 'Der Lokalreporter hat Fragen',
    vars: () => ({ firma: pick(V_FIRMA) }),
    text: v => `Kevin Lohmeyer vom Hüttinger Tageblatt legt dir einen Zettel hin: Dein Ortsverband hat eine Spende von ${v.firma} erhalten – „völlig korrekt“, sagt der Schatzmeister und schwitzt dabei erstaunlich viel. Lohmeyer will bis Redaktionsschluss eine Antwort.`,
    q: 'Wie reagierst du?',
    opts: [
      O('Alle Unterlagen offenlegen', 'transparenz', { b: 0 }, { chk: { s: 'ehr', dc: 44, ok: { fx: { b: 3, m: 3, g: 1, s: 1 }, t: 'Du legst alles auf den Tisch – und es gibt nichts zu finden. Respekt.' }, bad: { fx: { b: -1, m: -2, s: 2 }, t: 'Bei der Durchsicht fällt eine Quittung auf, die keiner erklären kann.' } }, n: { press: 6 } }),
      O('Gegenangriff: Was ist mit dem Amtsinhaber und seinen Dienstreisen?', 'angriff', { b: 1, p: 1, m: -1, g: -2 }, { n: { press: -8 }, later: { after: 3, chance: .5, hl: 'Dienstreisen-Konter: Lohmeyer prüft nun beide Seiten – und macht daraus eine Serie.', fx: { m: -2, b: -1 } } }),
      O('Dementieren und abwarten', 'aussitzen', { b: -1, m: -2, s: 1 }, { n: { press: -5 } })
    ]
  },
  'EV-006': {
    kat: 'Kommunal', e: '🧸', th: 'soz', w: 1.1, title: 'Kita-Notstand',
    vars: () => ({ zs: pick([60, 90, 140, 210]) }),
    text: v => `${v.zs} Kinder, null Plätze: Der Elternbeirat demonstriert mit Kinderwagen vor dem Rathaus, die Sprechchöre sind überraschend rhythmisch. Eine Erzieherin hat per offenem Brief gekündigt – und der Brief geht viral.`,
    q: 'Was versprichst du?',
    opts: [
      O('Kita-Neubau und Erzieher:innen-Zuschlag', 'ausgaben', { b: 3, p: 1, m: 1, w: -1, g: 2 }, { pf: { soz: .09 }, promise: 'Kita-Neubau', ml: { fam: .10 } }),
      O('Bündnis mit Firmen: Betriebskitas und Tagesmütter', 'wirtschaft', { b: 2, m: 1, w: 1, g: 1, d: -1 }, { pf: { soz: .05, wirt: .03 }, ml: { fam: .06, gew: .04 } }),
      O('Notgruppen in bestehenden Räumen einrichten', 'sparen', { b: -1, m: -1, g: -1 }, { ml: { fam: -.07 } })
    ]
  },
  'EV-007': {
    kat: 'Krise', e: '🌊', th: 'sich', w: .9, title: 'Hochwasseralarm',
    vars: () => ({}),
    text: () => `Nach drei Tagen Dauerregen steigt die Hüttle. Die Feuerwehr bittet um Sandsäcke, die Kameras um Bilder. In Kleinbach laufen die ersten Keller voll, und der Amtsinhaber ist „auf Fortbildung“.`,
    q: 'Wie führst du?',
    opts: [
      O('Selbst mit Gummistiefeln anpacken', 'einsatz', { b: 1 }, { chk: { s: 'res', dc: 48, ok: { fx: { b: 5, m: 4, g: 2, s: 3 }, t: 'Vier Stunden Sandsäcke – dein Foto geht durch die Regionalpresse.' }, bad: { fx: { b: 2, m: 1, s: 8 }, t: 'Nach zwei Stunden schlappgemacht – aber du warst da. Das zählt.' } }, ml: { dorf: .07 } }),
      O('Krisenstab unterstützen und Ortsteile durchtelefonieren', 'dialog', { b: 2, p: 1, m: 1, g: 1, s: 2 }, { pf: { sich: .05 } }),
      O('Zuständigkeit bei Kreis und Land anmahnen', 'populismus', { b: -2, m: -2, g: -1 })
    ]
  },
  'EV-008': {
    kat: 'Medien', e: '🎤', th: 'med', w: 1.0, title: 'Podium: Du gegen den Amtsinhaber',
    vars: () => ({}),
    text: () => `In der Stadthalle steht das Podium: du gegen ${G.opp[0].name}. Die Moderatorin kündigt an, „nicht locker zu lassen“. Der Amtsinhaber hat Zahlen, Anekdoten und vermutlich Pfefferminzbonbons.`,
    q: 'Wie gehst du ins Duell?',
    opts: [
      O('Angriffslustig: Bilanz der letzten zwölf Jahre', 'angriff', { b: 0 }, { chk: { s: 'dur', dc: 54, ok: { fx: { b: 4, m: 3, p: 1 }, t: 'Du stellst die Frage, auf die er keine Antwort hat. Applaus.' }, bad: { fx: { b: -2, m: -2, p: -1 }, t: 'Er kontert mit einer Zahl von 2019. Dein Timing war schlechter als die Bahn.' } } }),
      O('Sachlich mit Faktenwissen', 'transparenz', { b: 0 }, { chk: { s: 'iq', dc: 48, ok: { fx: { b: 3, m: 2, g: 1 }, t: 'Du nennst Zahlen, Quellen und Fußnoten. Sogar die Moderation nickt.' }, bad: { fx: { b: 0, m: -1 }, t: 'Bei der Kita-Statistik verwechselst du Kinder mit Plätzen. Peinlich, aber lehrreich.' } } }),
      O('Charmant mit Humor', 'humor', { b: 0 }, { chk: { s: 'cha', dc: 50, ok: { fx: { b: 3, m: 3 }, t: 'Dein Witz über die Umgehungsstraße sitzt – selbst die erste Reihe lacht.' }, bad: { fx: { b: -1, m: -2 }, t: 'Der Gag landet im Niemandsland. Es hustet jemand.' } } })
    ]
  },
  'EV-009': {
    kat: 'Persönliches', e: '💶', th: 'wirt', w: .9, title: 'Eine großzügige Spende',
    vars: () => ({ firma: pick(V_FIRMA), per: pick(V_PERSON), sum: pick([12, 15, 18, 22]) }),
    text: v => `${v.firma} möchte deinen Wahlkampf mit ${v.sum}.000 Euro unterstützen – „weil Niederhüttingen Weitblick verdient“. Geschäftsführer:in ${v.per} lächelt, als hätte er schon einen Termin im Bürgermeisterbüro eingetragen.`,
    q: 'Was machst du mit der Spende?',
    opts: [
      O('Annehmen und sofort veröffentlichen', 'transparenz', { b: 1, p: 1, m: 1, g: 1 }, { fxf: v => ({ d: v.sum }), donation: true }),
      O('Annehmen – nicht zu laut darüber reden', 'deal', { p: 1, m: -1 }, { fxf: v => ({ d: v.sum }), donation: true, flag: 'spendeGeheim', later: { after: 2, chance: .75, card: 'EV-005' } }),
      O('Ablehnen und das öffentlich betonen', 'transparenz', { b: 2, p: -1, m: 2, g: 1, s: 1 }, { ideal: 1 })
    ]
  },
  'EV-010': {
    kat: 'Partei', e: '♟️', th: 'par', w: 1.0, title: 'Intrige im Ortsverband',
    vars: () => ({ per: pick(V_PERSON) }),
    text: v => `${v.per} aus dem Ortsverband sägt an deinem Stuhl: „Wir brauchen frischen Wind.“ Gemeint ist er/sie selbst. Gisela Hagedorn rät zu einem Gespräch. Das Parteiheim riecht nach Verschwörung und Filterkaffee.`,
    q: 'Wie begegnest du der Intrige?',
    opts: [
      O('Offene Konfrontation auf der Mitgliederversammlung', 'angriff', { b: 0 }, { ideal: 1, chk: { s: 'dur', dc: 52, ok: { fx: { p: 4, b: 1, m: 1 }, t: 'Du zählst Namen und Stimmen auf – der Saal rückt hinter dich.' }, bad: { fx: { p: -4, b: -1, m: -1, s: 3 }, t: 'Die Versammlung kippt. „Frischer Wind“ hat plötzlich Applaus.' } } }),
      O('Posten anbieten und den Rivalen einbinden', 'deal', { p: 2, m: 0, s: 0 }, { n: { party: 5 }, ideal: -1 }),
      O('Stillhalten und Mehrheiten zählen', 'aussitzen', { p: -1, s: -1 }, { later: { after: 3, chance: .45, hl: 'Interview der Rivalin: „Diese Kandidatur ist ein Fehler.“ Die Partei verschluckt sich am Filterkaffee.', fx: { p: -3, m: -2 } } })
    ]
  },
  'EV-011': {
    kat: 'Kommunal', e: '🏠', th: 'wohn', w: 1.1, title: 'Wohnungsnot vs. Streuobstwiese',
    vars: () => ({ firma: pick(V_FIRMA) }),
    text: v => `Niederhüttingen wächst, Wohnungen fehlen. Die Stadt besitzt eine Streuobstwiese am Hang: 140 Wohneinheiten möglich, 60 Bäume im Weg. Der Naturschutzbund hat schon Banner, der Bauträger ${v.firma} hat Pläne.`,
    q: 'Wofür entscheidest du dich?',
    opts: [
      O('Bauen – mit Ausgleichsflächen', 'wirtschaft', { b: 2, w: 3, u: -3, g: 1 }, { pf: { wohn: .10 }, promise: 'Neubaugebiet am Hang', ml: { fam: .08, jung: .05, dorf: .0 } }),
      O('Nachverdichten im Zentrum statt auf der Wiese', 'klima', { b: 1, p: 1, m: 1, w: 1, u: 2, g: 1 }, { pf: { wohn: .07, klim: .04 }, ml: { sen: -.04 } }),
      O('Wiese schützen, Mietendeckel fordern', 'sozial', { b: 1, m: 1, w: -2, u: 3, g: 1 }, { pf: { wohn: .05 }, ml: { jung: .06, gew: -.06 }, ideal: 1 })
    ]
  },
  'EV-012': {
    kat: 'Gesellschaft', e: '🎶', th: 'soz', w: 1.0, swipe: true, title: 'Clubsterben und Nachtruhe',
    vars: () => ({}),
    text: () => `Nach einer Lärmbeschwerde steht das „Kellerloch“ vor dem Aus, der letzte Club der Stadt. Die Senior:innen der Altstadt fordern Nachtruhe ab 22 Uhr, die Jungen Musik bis zum Morgengrauen. Beide haben Unterschriftenlisten – und Zeit.`,
    q: 'Links wischen: Sperrstunde · Rechts wischen: Nachtbürgermeister',
    opts: [
      O('Sperrstunde 22 Uhr', 'ordnung', { b: 1, m: -1, g: -1 }, { ml: { sen: .10, jung: -.12 } }),
      O('Nachtbürgermeister und Lärmschutzfonds', 'dialog', { b: 1, m: 2, d: -2, g: 2 }, { ml: { jung: .08, sen: -.05 }, pf: { soz: .02 } })
    ]
  },
  'EV-013': {
    kat: 'Medien', e: '📱', th: 'med', w: .9, title: 'Das Meme',
    vars: () => ({}),
    text: () => `Ein Meme zeigt dich als Zeichentrickfigur mit Helm und Zollstock. 18.000 Teilungen. Es ist, zugegeben, ein bisschen gut. Dein Social-Team bietet drei Varianten an: ernst, sarkastisch oder „selbstironisch-cringe“.`,
    q: 'Wie reagierst du?',
    opts: [
      O('Rechtliche Schritte androhen', 'ordnung', { b: -1, m: -2, s: 1 }, { later: { after: 2, chance: .5, hl: 'Streisand-Effekt: Das Meme hat jetzt 90.000 Teilungen. Jemand druckt es auf Tassen.', fx: { b: -1, m: -2 } } }),
      O('Mit eigenem Gegenmeme kontern', 'humor', { d: -1 }, { chk: { s: 'med', dc: 50, ok: { fx: { b: 3, m: 4 }, t: 'Dein Konter ist besser als das Original. Die Netzgemeinde ist entzückt.' }, bad: { fx: { b: -2, m: -3 }, t: 'Cringe-Alarm. Du wirst zum Meme des Memes.' } } }),
      O('Ignorieren und aussitzen', 'aussitzen', { m: -1, s: -1 })
    ]
  },
  'EV-014': {
    kat: 'Absurdes', e: '🐕', th: 'soz', w: .5, title: 'Das Hundekot-Problem',
    vars: () => ({}),
    text: () => `In der Bürgersprechstunde schiebt dir eine Dame einen Plastikbeutel unter die Nase: „Das ist das Hauptproblem dieser Stadt.“ Hinter ihr nicken vierzehn Menschen. Es riecht nach Wahlkampf.`,
    q: 'Was versprichst du der Stadt?',
    opts: [
      O('Kotbeutelspender an jeder Ecke', 'ausgaben', { b: 2, m: 1, g: 1 }, { ml: { sen: .06 } }),
      O('100 Euro Bußgeld und mehr Kontrollen', 'ordnung', { b: 1, g: -1 }, { ml: { sen: .08, jung: -.03 } }),
      O('DNA-Register für Hunde (Testphase)', 'humor', { b: -1, m: 3, g: -1 }, { later: { after: 3, chance: .6, hl: 'Bundesweit belächelt: „Kot-DNA-Register“ macht Niederhüttingen zur Schlagzeile der Woche.', fx: { m: 3, b: -1 } } }),
      O('Mit dem Beutel vor die Kamera: Humor', 'humor', { b: 0 }, { chk: { s: 'cha', dc: 46, ok: { fx: { b: 3, m: 3 }, t: 'Du hältst den Beutel wie einen Pokal. Der Kurier druckt es auf Seite 1.' }, bad: { fx: { b: -1, m: -2 }, t: 'Die Dame findet es respektlos. Die Kamera ebenfalls.' } } })
    ]
  },
  'EV-015': {
    kat: 'Wirtschaft', e: '🗑️', th: 'soz', w: .9, title: 'Streik bei den Stadtwerken',
    vars: () => ({}),
    text: () => `Die Müllabfuhr der Stadtwerke streikt. Am Kirchplatz stapeln sich die Tonnen, die Tauben haben ein Festmahl. Die Gewerkschaft fordert 8 Prozent, die Stadt bietet „Wertschätzung“.`,
    q: 'Wie gehst du mit dem Streik um?',
    opts: [
      O('Solidarität zeigen und an den Streikposten reden', 'sozial', { b: 1, p: 1, m: 1, w: -1, g: 1 }, { ml: { arb: .10, gew: -.08 } }),
      O('Vermitteln: Schlichtung anregen', 'dialog', { b: 2, p: 1, m: 1, g: 1 }, { n: { kaem: 5 } }),
      O('Notdienst und Ordnung fordern', 'ordnung', { w: 1, g: -2 }, { ml: { gew: .06, arb: -.10 } })
    ]
  },
  'EV-016': {
    kat: 'Innere Sicherheit', e: '🚉', th: 'sich', w: 1.0, title: 'Unruhe am Bahnhof',
    vars: () => ({}),
    text: () => `Am Bahnhof häufen sich Sachbeschädigungen. Der Stammtisch „Klare Kante“ fordert eine Bürgerwehr, der Jugendtreff mehr Personal, die Polizei höflich den Verzicht auf alles Dramatische.`,
    q: 'Was forderst du?',
    opts: [
      O('Videoüberwachung und Ordnungsdienst', 'ordnung', { b: 2, m: 1, g: -1, s: 1 }, { pf: { sich: .08 }, ml: { sen: .08, jung: -.06 } }),
      O('Streetwork und Jugendtreff ausbauen', 'sozial', { b: 1, p: 1, g: 2 }, { pf: { soz: .05, sich: .03 }, ml: { jung: .04, sen: -.03 } }),
      O('Runder Tisch: Polizei, Anwohner, Jugend', 'dialog', { b: 1, m: 1, g: 1, s: 1 }, { later: { after: 3, chance: .35, hl: 'Runder Tisch vertagt sich zum dritten Mal: „Wir bleiben im Gespräch.“', fx: { m: -2 } } })
    ]
  },
  'EV-017': {
    kat: 'Persönliches', e: '🏡', th: 'fam', w: .4, title: 'Familienabend oder Wahlkampftermin?',
    vars: () => ({}),
    text: () => `Sam steht im Flur: „Du bist so oft weg, dass sogar der Hund Termine anmeldet.“ Heute Abend wäre Familienessen. Gleichzeitig beginnt der Wahlkampftermin im Gewerbeverein. Beides ist „unverschiebbar“. Dein Stresspegel: Ahoi.`,
    q: 'Wofür entscheidest du dich?',
    opts: [
      O('Familie – der Wahlkampf kann kurz warten', 'dialog', { b: 0, m: 0, s: -8 }, { n: { fam: 10 } }),
      O('Wahltermin – Familie gleich danach', 'einsatz', { b: 1, p: 1, s: 4 }, { n: { fam: -10 }, ml: { gew: .04 } }),
      O('Familie zum Termin mitnehmen', 'humor', { b: 1, m: 1, s: 0 }, { chk: { s: 'cha', dc: 48, ok: { fx: { b: 2, m: 2 }, t: 'Das Familienfoto im Gewerbeverein wird zum Bild der Woche.' }, bad: { fx: { b: -1, m: -1, s: 3 }, t: 'Das Kind verlangt laut ein Eis. Sam schaut weg. Die Kamera nicht.' } }, n: { fam: 2 } })
    ]
  },
  'EV-EG1': {
    kat: 'Partei', e: '🌱', th: 'par', w: 0, title: 'Kinderkrankheiten',
    vars: () => ({}),
    text: () => `Dein Schatzmeister hat die Vereinskasse in seinen Privat-Rucksack gepackt („aus Versehen“), der Briefkasten ist voll mit Mitgliedsanträgen, und niemand weiß, wo der Kugelschreiber des Vorstands ist. Neugründungen sind auch Logistik.`,
    q: 'Wie stabilisierst du die junge Partei?',
    opts: [
      O('Satzung, Kassenprüfung und zwei Wochenenden Schulung', 'transparenz', { b: 0, p: 2, d: -2, m: 0, s: 3 }, { pf: {} }),
      O('Die Sache nach außen drehen: „Wir sind eben anders“', 'humor', { b: 1, m: 1, p: -1 }, {}),
      O('Kurzfristig alles über deine Privatkonten laufen lassen', 'deal', { p: 1, d: 3, m: -2, s: 1 }, { later: { after: 2, chance: .4, hl: 'Das Finanzamt hat Fragen zu deinem Privatkonto. Und die Presse auch.', fx: { b: -3, m: -3 } } })
    ]
  }
};
const CARD_IDS = Object.keys(CARDS).filter(k => k !== 'EV-EG1');

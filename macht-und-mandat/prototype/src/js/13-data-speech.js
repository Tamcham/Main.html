/* ---------- Bundestagsrede: Themen, Argumente, Zwischenrufe ----------
 * Argument: t Text, tag (fakt|emo|vision|humor|angriff), pos [Ökonomie −1 Umverteilung … +1 Markt, Kultur −1 progressiv … +1 konservativ]
 */
const SPEECH = {
  wohnen: {
    n: 'Wohnen & Mieten', e: '🏘️',
    beats: [
      { h: 'Einstieg', o: [
        { t: 'Die Miete ist für viele längst kein Kostenfaktor mehr, sondern ein Schicksal.', tag: 'emo', pos: [-.6, -.3] },
        { t: 'Die Zahlen sind eindeutig: Die Nachfrage wächst seit zehn Jahren schneller als das Angebot.', tag: 'fakt', pos: [0, 0] },
        { t: 'Wohnen wurde zur Chefsache erklärt – und dann zur Chefsache vertagt. {gegner}, erklären Sie das!', tag: 'angriff', pos: [.1, 0] }
      ] },
      { h: 'Analyse', o: [
        { t: 'Bauen ist teurer, Genehmigungen dauern 21 Monate – das ist keine Wohnungspolitik, das ist ein Geduldsspiel.', tag: 'fakt', pos: [.5, 0] },
        { t: 'Fragen Sie die Krankenschwester, die zwei Stunden pendelt, weil sie sich die Stadt nicht mehr leisten kann.', tag: 'emo', pos: [-.6, -.2] },
        { t: 'Ich will ein Land, in dem man nicht erben muss, um Eigentümer zu werden.', tag: 'vision', pos: [-.2, .2] }
      ] },
      { h: 'Lösung', o: [
        { t: 'Wir schaffen Bauland, beschleunigen Verfahren und senken die Baunebenkosten.', tag: 'fakt', pos: [.75, .1] },
        { t: 'Wir deckeln Mieten, bauen kommunal und sichern Sozialbindungen – Wohnen ist kein Spekulationsobjekt.', tag: 'vision', pos: [-.85, -.3] },
        { t: 'Wir verdichten, bauen um, nutzen leere Büros und seriellen Wohnungsbau – pragmatisch, ohne Ideologie.', tag: 'fakt', pos: [.1, -.4] }
      ] },
      { h: 'Schluss', o: [
        { t: 'Ein Zuhause ist mehr als eine Adresse. Es ist der Ort, an dem Zukunft beginnt.', tag: 'emo', pos: [-.2, 0] },
        { t: 'Ich würde Ihnen gern eine Wohnung anbieten, aber dafür müssen Sie erst ein Formular ausfüllen. In dreifacher Ausfertigung.', tag: 'humor', pos: [0, -.1] },
        { t: '{gegner}, Sie hatten Jahre Zeit. Jetzt reden wir über Ergebnisse.', tag: 'angriff', pos: [0, 0] }
      ] }
    ]
  },
  energie: {
    n: 'Energie & Klima', e: '⚡',
    beats: [
      { h: 'Einstieg', o: [
        { t: 'Wer im Winter die Heizrechnung öffnet, braucht heute starke Nerven.', tag: 'emo', pos: [-.3, 0] },
        { t: 'Erneuerbare liefern inzwischen fast 60 Prozent des Stroms – mehr als je zuvor, weniger als nötig.', tag: 'fakt', pos: [-.2, -.3] },
        { t: 'Die Energiewende braucht Tempo – und {gegner} liefert Sitzungen.', tag: 'angriff', pos: [0, 0] }
      ] },
      { h: 'Analyse', o: [
        { t: 'Industriestrom ist bei uns doppelt so teuer wie anderswo. Das kostet Arbeitsplätze.', tag: 'fakt', pos: [.7, .2] },
        { t: 'Kinder, die heute geboren werden, erleben 2050 ein Land, das wir jetzt gestalten – oder verspielen.', tag: 'emo', pos: [-.5, -.7] },
        { t: 'Energieunabhängigkeit ist Sicherheitspolitik. Punkt.', tag: 'vision', pos: [.2, .4] }
      ] },
      { h: 'Lösung', o: [
        { t: 'Netze, Speicher, Wasserstoff: mit festen Zielen und festen Terminen.', tag: 'fakt', pos: [-.1, -.4] },
        { t: 'Wir nutzen Kernkraft und Gas als Brücke, bis die Erneuerbaren tragen.', tag: 'fakt', pos: [.6, .6] },
        { t: 'Wir geben den Bürgern das Steuer: Bürgerenergie, Mieterstrom, weniger Bürokratie.', tag: 'vision', pos: [-.3, -.3] }
      ] },
      { h: 'Schluss', o: [
        { t: 'Energie ist Zukunft – aber sie muss bezahlbar bleiben.', tag: 'emo', pos: [0, 0] },
        { t: 'Bei dieser Energiepolitik wäre sogar mein Toaster beleidigt: Er soll sparen und trotzdem liefern.', tag: 'humor', pos: [0, 0] },
        { t: '{gegner}, Sie haben die Rechnung ausgestellt – wir zahlen sie.', tag: 'angriff', pos: [.1, 0] }
      ] }
    ]
  },
  haushalt: {
    n: 'Haushalt & Steuern', e: '💶',
    beats: [
      { h: 'Einstieg', o: [
        { t: 'Der Haushalt ist kein Wunschzettel, sondern ein Versprechen mit Kommastellen.', tag: 'fakt', pos: [.3, 0] },
        { t: 'Hinter jeder Zahl im Haushalt steht ein Schulbus, eine Pflegekraft, ein Radweg.', tag: 'emo', pos: [-.5, -.2] },
        { t: '{gegner} schafft es, Milliarden zu verplanen und trotzdem Lücken zu finden.', tag: 'angriff', pos: [.2, 0] }
      ] },
      { h: 'Analyse', o: [
        { t: 'Die Zinslast wächst schneller als die Investitionen – das ist wie Schulden im Dispo.', tag: 'fakt', pos: [.6, .2] },
        { t: 'Wer an der Zukunft spart, bezahlt sie später mit Zinsen – und mit Enttäuschung.', tag: 'emo', pos: [-.5, -.3] },
        { t: 'Ein starker Staat ist kein teurer Staat, sondern ein handlungsfähiger.', tag: 'vision', pos: [-.3, 0] }
      ] },
      { h: 'Lösung', o: [
        { t: 'Wir entlasten Mittelstand und Familien und streichen Subventionen.', tag: 'fakt', pos: [.8, 0] },
        { t: 'Wir besteuern große Vermögen stärker und investieren in Bildung und Verkehr.', tag: 'vision', pos: [-.8, -.2] },
        { t: 'Wir reformieren die Schuldenregel: Investieren ja, Verschleiern nein.', tag: 'fakt', pos: [-.1, -.1] }
      ] },
      { h: 'Schluss', o: [
        { t: 'Ein Haushalt zeigt, was uns wichtig ist. Lassen Sie uns zeigen, dass es die Menschen sind.', tag: 'emo', pos: [-.1, 0] },
        { t: 'Ich habe den Haushalt gelesen. Er ist spannend wie ein Krimi, in dem alle den Täter kennen: die Kommastelle.', tag: 'humor', pos: [0, 0] },
        { t: '{gegner}, reden Sie nicht von Verantwortung, solange Sie die Rechnung weiterreichen.', tag: 'angriff', pos: [.1, 0] }
      ] }
    ]
  }
};
const ZWISCHENRUFE = {
  LINKE: ['„Und die Reichen?!“', '„Sagen Sie das den Mieterinnen und Mietern!“'],
  SPD: ['„Das ist doch Schönfärberei!“', '„Wo bleibt die Gerechtigkeit?“'],
  GRUENE: ['„Und das Klima?!“', '„Das reicht hinten und vorne nicht!“'],
  FDP: ['„Wer soll das bezahlen?“', '„Bürokratie, Bürokratie!“'],
  BSW: ['„Reden Sie mal mit den normalen Leuten!“', '„Die Wähler sehen das anders!“'],
  UNION: ['„Das haben wir längst gemacht!“', '„Wo ist Ihre Gegenfinanzierung?“'],
  AFD: ['„Zeigen Sie mal Mut!“', '„Das Volk denkt anders!“']
};
const TONES = {
  sach: { n: 'Sachlich', d: 'Fakten wirken stärker, Angriffe verpuffen. Wenig Risiko.', m: { fakt: 1.3, vision: 1, emo: .85, humor: .9, angriff: .75 } },
  angr: { n: 'Angriffslustig', d: 'Angriffe zünden bei den eigenen Reihen – und bei den Kameras. Ordnungsruf-Risiko!', m: { fakt: .9, vision: .9, emo: .85, humor: 1, angriff: 1.45 } },
  emo: { n: 'Emotional', d: 'Geschichten und Visionen berühren. Zahlen wirken blass.', m: { fakt: .8, vision: 1.3, emo: 1.35, humor: 1, angriff: .9 } }
};

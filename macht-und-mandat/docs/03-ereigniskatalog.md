# 4 · Beispiel-Ereigniskatalog: 20 Events mit Optionen und Folgen

> Die Events **EV-001 bis EV-016** sind im spielbaren Prototyp implementiert; dieser Abschnitt wird aus den echten Spieldaten erzeugt (`tools/make-event-catalog.js`), damit Dokumentation und Spiel nicht auseinanderlaufen. **EV-101 bis EV-104** zeigen Ereignisse höherer Ebenen (Land, Bund, Welt) und sind für den Vertical Slice vorgesehen.

**Notation.** *Bel* Beliebtheit · *Par* Parteiloyalität · *Kasse* Wahlkampf-/Parteikasse in k€ (auf Landesebene Mio. €, im Bund Mrd. €, siehe Skalierung in Kapitel 7) · *Med* Medienecho · *Wirt/Umw/Ges* Zustand von Wirtschaft, Umwelt, Gesellschaftsklima · *Stress* Belastung der Figur. Werte sind **Grundwerte vor Modifikatoren** (Partei-Mechanik, Berufsbonus, Stress); die Medienreaktion fügt je nach Partei `±1…±3` Medienecho hinzu.

**Wagnis** = Attributsprobe. Erfolgschance `p = clamp(0,5 + (Attribut + Boni − Schwelle) / 80; 0,12; 0,92)`; bei Stress > 60 sinkt das Attribut um `0,4 × (Stress − 60)`.

**Medienreaktion.** Jede Option gehört zu einem *Frame* (z. B. „Mehr Geld in die Hand nehmen“). Jede Partei hat eine Haltung `−1…+1` zu jedem Frame; drei Medientypen (Lokalblatt, Boulevard, Social Media) bewerten den Frame mit Verzerrung und Rauschen. Dieselbe Entscheidung erzeugt so unterschiedliche Schlagzeilen, je nachdem, wer sie trifft.


---

### EV-001 · Die Brücke über die Hüttle
**Kategorie** Kommunal · **Ebene** Kommune (Amt 1–3) · **Thema** Verkehr · **Basisgewicht** 1  
**Gewicht ×1,35** bei Beruf: Landwirt:in · **×1,25** bei Partei: CSU, GRÜ

> Der Prüfbericht zur Hüttle-Brücke liest sich wie ein Gruselroman: „Tragfähigkeit: optimistisch.“ Seit gestern dürfen nur noch Fahrräder, Fußgänger und sehr mutige Traktoren rüber. Sabine Hollweg vom Mieterverein hat die Umleitungsschilder schon selbst gemalt.
>
> *Wie positionierst du dich?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Sanierung versprechen – Finanzierung: Haushaltsumbau *(Versprechen: Hüttle-Brücke sanieren)* | Mehr Geld in die Hand nehmen | Bel +3, Par +1, Med +1, Wirt +2, Ges +1, Stress +1 | – | Profil Verkehr +8, Dorf +5, Gewerbe +4 |
| 2 | Bürgerversammlung: Was ist uns die Brücke wert? | Dialog und Beteiligung | Bel +1, Par +1, Kasse −2k€, Med +1, Ges +2, Stress +1 | – | Profil Verkehr +4 |
| 3 | Sperren und neu denken: Rad- und Fußbrücke statt Lkw-Verkehr | Klima und Umwelt | Med +1, Wirt −2, Umw +3 | – | Profil Klima +6, Profil Verkehr +3, Jung +7, Gewerbe −8, Dorf −4 |

**Verzögerte Folgen**
- **Option 2** – mit 50 % Wahrscheinlichkeit nach 3 Wochen (Schmetterlingseffekt): „Bürgerversammlung zur Brücke: 300 Leute, 40 Meinungen, eine Mehrheit für „irgendwas mit Sanieren“.“ → Bel +1, Ges +1

**Medienreaktion (Haltung der Partei zum Frame)**
- *Mehr Geld in die Hand nehmen*: lobend für LINKE, SPD, GRÜ · kritisch für FDP, AfD, CSU
- *Dialog und Beteiligung*: lobend für GRÜ, LINKE, SPD · kritisch für AfD

---

### EV-002 · Windrad am Waldrand
**Kategorie** Kommunal · **Ebene** Kommune (Amt 1–3) · **Thema** Klima · **Basisgewicht** 1  
**Gewicht ×1,35** bei Beruf: Landwirt:in · **×1,25** bei Partei: GRÜ

> Zwischen Kleinbach und dem Wald soll ein Windrad entstehen. Sabine Hollweg sammelt Unterschriften („Nicht vor meiner Haustür, aber gern vor der von Steinbrück“), die Stadtwerke sprechen von „Zukunft“ und die Schafe von gar nichts.
>
> *Wofür stehst du?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Genehmigen – mit Bürgerenergie-Beteiligung *(Versprechen: Bürgerenergie-Windrad)* | Klima und Umwelt | Bel +1, Par +1, Med +1, Wirt +1, Umw +4 | – | Profil Klima +8, Profil Wirtschaft +2, Jung +7, Dorf −7 |
| 2 | Ablehnen – der Wald bleibt, wie er ist | Gefälligkeit und Show | Bel +2, Wirt −1, Umw −3, Ges −1 | – | Profil Klima −4, Dorf +9, Jung −7 |
| 3 | Bürgerentscheid ansetzen | Dialog und Beteiligung | Bel +1, Kasse −1k€, Med +1, Ges +2 | – | – |

**Verzögerte Folgen**
- **Option 3** – mit 80 % Wahrscheinlichkeit nach 3 Wochen (Schmetterlingseffekt): „Bürgerentscheid zum Windrad: 52 zu 48 – knapp, laut, demokratisch.“ → Bel +1, Med +1, Ges +2

**Medienreaktion (Haltung der Partei zum Frame)**
- *Klima und Umwelt*: lobend für GRÜ, LINKE, SPD · kritisch für AfD, BSW, FDP
- *Gefälligkeit und Show*: lobend für AfD, BSW · kritisch für GRÜ, SPD, FDP

---

### EV-003 · Schützenfest: Der Fassanstich
**Kategorie** Gesellschaft · **Ebene** Kommune (Amt 1–3) · **Thema** Soziales & Bildung · **Basisgewicht** 1,1  
**Gewicht ×1,35** bei Beruf: Lehrer:in, Pflegekraft · **×1,25** bei Partei: SPD, LINKE, BSW

> Im Festzelt reicht dir Sabine Hollweg den Holzhammer: „Jetzt zeigen Sie mal, was Sie können.“ 300 Leute schweigen, die Blaskapelle hält den Atem an, in der ersten Reihe filmt jemand. Das Fass sieht aus, als wüsste es mehr als du.
>
> *Wie trittst du auf?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Selbst anzapfen – Volle Show | Gefälligkeit und Show | – | Charisma ≥ 52: ✔ Bel +5, Par +1, Med +4, Stress −1 · ✘ Bel −2, Med −3, Stress +2 | Dorf +6 |
| 2 | Der Wirtin den Vortritt lassen und Alkoholfreies bestellen | Humor und Nähe | Bel +1, Med +1, Ges +1, Stress −1 | – | Familien +4, Senioren +3, Dorf −2 |
| 3 | Kurze Rede halten, Hände schütteln | Dialog und Beteiligung | Bel +1, Par +1 | – | Dorf +3 |

**Verzögerte Folgen**
- keine (Folgen sind sofort sichtbar)

**Medienreaktion (Haltung der Partei zum Frame)**
- *Gefälligkeit und Show*: lobend für AfD, BSW · kritisch für GRÜ, SPD, FDP
- *Humor und Nähe*: lobend für CSU, CDU, SPD · kritisch für – (keine ablehnende Partei)

---

### EV-004 · Die Firma droht mit Abwanderung
**Kategorie** Wirtschaft · **Ebene** Kommune (Amt 1–3) · **Thema** Wirtschaft · **Basisgewicht** 1,1  
**Gewicht ×1,35** bei Beruf: Handwerker:in, Unternehmer:in · **×1,25** bei Partei: CDU, FDP

> Hollweg Metallbau GmbH droht mit Verlagerung: 60 Arbeitsplätze stehen auf dem Spiel, sagt Sabine Hollweg. Die Nachbarstadt lockt schon mit Rabatten und einem Werbefilm mit Drohnenflug. Die Gewerbesteuer ist der halbe Haushalt – den der Amtsinhaber gern weiter verwalten würde.
>
> *Wie hältst du die Firma im Ort?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Steuerrabatt im Hinterzimmer aushandeln | Hinterzimmer-Deal | Bel +1, Par +2, Kasse +4k€, Med −2, Wirt +3, Ges −1 | – | Profil Wirtschaft +5, Gewerbe +8, Schicht +3 |
| 2 | Standortoffensive: Gewerbefläche, Glasfaser, feste Ansprechperson *(Versprechen: Standortoffensive Gewerbegebiet)* | Standort und Wirtschaft | Bel +2, Par +1, Med +1, Wirt +3 | – | Profil Wirtschaft +8, Gewerbe +10 |
| 3 | Nicht erpressbar sein – abwarten | Aussitzen | Bel −1, Med −2, Wirt −2, Stress −1 | – | – |

**Verzögerte Folgen**
- **Option 1** – mit 40 % Wahrscheinlichkeit nach 3 Wochen (Schmetterlingseffekt): „Hinterzimmer-Deal mit Hollweg Metallbau GmbH wird im Stadtrat bekannt: „Wer wusste was?““ → Bel −3, Par −1, Med −4
- **Option 3** – mit 60 % Wahrscheinlichkeit nach 4 Wochen (Schmetterlingseffekt): „Hollweg Metallbau GmbH verlagert einen Teilbetrieb: 80 Stellen fallen weg. Du schaust zu, der Amtsinhaber schweigt.“ → Bel −2, Wirt −5, Ges −2

**Medienreaktion (Haltung der Partei zum Frame)**
- *Hinterzimmer-Deal*: lobend für – (keine klare Haltung) · kritisch für GRÜ, LINKE, BSW
- *Standort und Wirtschaft*: lobend für FDP, CDU, CSU · kritisch für LINKE, GRÜ

---

### EV-005 · Der Lokalreporter hat Fragen
**Kategorie** Medien · **Ebene** Kommune (Amt 1–3) · **Thema** Medien · **Basisgewicht** 0,55  
**Gewicht ×1,35** bei Beruf: Journalist:in · **×1,25** bei Partei: –

> Kevin Lohmeyer vom Hüttinger Tageblatt legt dir einen Zettel hin: Dein Ortsverband hat eine Spende von Hollweg Metallbau GmbH erhalten – „völlig korrekt“, sagt der Schatzmeister und schwitzt dabei erstaunlich viel. Lohmeyer will bis Redaktionsschluss eine Antwort.
>
> *Wie reagierst du?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Alle Unterlagen offenlegen | Transparenz und Ehrlichkeit | – | Integrität ≥ 44: ✔ Bel +3, Med +3, Ges +1, Stress +1 · ✘ Bel −1, Med −2, Stress +2 | – |
| 2 | Gegenangriff: Was ist mit dem Amtsinhaber und seinen Dienstreisen? | Angriff auf den Gegner | Bel +1, Par +1, Med −1, Ges −2 | – | – |
| 3 | Dementieren und abwarten | Aussitzen | Bel −1, Med −2, Stress +1 | – | – |

**Verzögerte Folgen**
- **Option 2** – mit 50 % Wahrscheinlichkeit nach 3 Wochen (Schmetterlingseffekt): „Dienstreisen-Konter: Lohmeyer prüft nun beide Seiten – und macht daraus eine Serie.“ → Bel −1, Med −2

**Medienreaktion (Haltung der Partei zum Frame)**
- *Transparenz und Ehrlichkeit*: lobend für GRÜ, FDP, SPD · kritisch für – (keine ablehnende Partei)
- *Angriff auf den Gegner*: lobend für AfD, BSW, FDP · kritisch für GRÜ

---

### EV-006 · Kita-Notstand
**Kategorie** Kommunal · **Ebene** Kommune (Amt 1–3) · **Thema** Soziales & Bildung · **Basisgewicht** 1,1  
**Gewicht ×1,35** bei Beruf: Lehrer:in, Pflegekraft · **×1,25** bei Partei: SPD, LINKE, BSW

> 60 Kinder, null Plätze: Der Elternbeirat demonstriert mit Kinderwagen vor dem Rathaus, die Sprechchöre sind überraschend rhythmisch. Eine Erzieherin hat per offenem Brief gekündigt – und der Brief geht viral.
>
> *Was versprichst du?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Kita-Neubau und Erzieher:innen-Zuschlag *(Versprechen: Kita-Neubau)* | Mehr Geld in die Hand nehmen | Bel +3, Par +1, Med +1, Wirt −1, Ges +2 | – | Profil Soziales & Bildung +9, Familien +10 |
| 2 | Bündnis mit Firmen: Betriebskitas und Tagesmütter | Standort und Wirtschaft | Bel +2, Kasse −1k€, Med +1, Wirt +1, Ges +1 | – | Profil Soziales & Bildung +5, Profil Wirtschaft +3, Familien +6, Gewerbe +4 |
| 3 | Notgruppen in bestehenden Räumen einrichten | Sparen und Konsolidieren | Bel −1, Med −1, Ges −1 | – | Familien −7 |

**Verzögerte Folgen**
- keine (Folgen sind sofort sichtbar)

**Medienreaktion (Haltung der Partei zum Frame)**
- *Mehr Geld in die Hand nehmen*: lobend für LINKE, SPD, GRÜ · kritisch für FDP, AfD, CSU
- *Standort und Wirtschaft*: lobend für FDP, CDU, CSU · kritisch für LINKE, GRÜ

---

### EV-007 · Hochwasseralarm
**Kategorie** Krise · **Ebene** Kommune (Amt 1–3) · **Thema** Sicherheit · **Basisgewicht** 0,9  
**Gewicht ×1,35** bei Beruf: Jurist:in, Polizist:in · **×1,25** bei Partei: CDU, CSU, AfD

> Nach drei Tagen Dauerregen steigt die Hüttle. Die Feuerwehr bittet um Sandsäcke, die Kameras um Bilder. In Kleinbach laufen die ersten Keller voll, und der Amtsinhaber ist „auf Fortbildung“.
>
> *Wie führst du?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Selbst mit Gummistiefeln anpacken | Persönlicher Einsatz | Bel +1 | Belastbarkeit ≥ 48: ✔ Bel +5, Med +4, Ges +2, Stress +3 · ✘ Bel +2, Med +1, Stress +8 | Dorf +7 |
| 2 | Krisenstab unterstützen und Ortsteile durchtelefonieren | Dialog und Beteiligung | Bel +2, Par +1, Med +1, Ges +1, Stress +2 | – | Profil Sicherheit +5 |
| 3 | Zuständigkeit bei Kreis und Land anmahnen | Gefälligkeit und Show | Bel −2, Med −2, Ges −1 | – | – |

**Verzögerte Folgen**
- keine (Folgen sind sofort sichtbar)

**Medienreaktion (Haltung der Partei zum Frame)**
- *Persönlicher Einsatz*: lobend für SPD, GRÜ, LINKE · kritisch für – (keine ablehnende Partei)
- *Dialog und Beteiligung*: lobend für GRÜ, LINKE, SPD · kritisch für AfD

---

### EV-008 · Podium: Du gegen den Amtsinhaber
**Kategorie** Medien · **Ebene** Kommune (Amt 1–3) · **Thema** Medien · **Basisgewicht** 1  
**Gewicht ×1,35** bei Beruf: Journalist:in · **×1,25** bei Partei: –

> In der Stadthalle steht das Podium: du gegen Dr. Ulf Brandtner. Die Moderatorin kündigt an, „nicht locker zu lassen“. Der Amtsinhaber hat Zahlen, Anekdoten und vermutlich Pfefferminzbonbons.
>
> *Wie gehst du ins Duell?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Angriffslustig: Bilanz der letzten zwölf Jahre | Angriff auf den Gegner | – | Durchsetzung ≥ 54: ✔ Bel +4, Par +1, Med +3 · ✘ Bel −2, Par −1, Med −2 | – |
| 2 | Sachlich mit Faktenwissen | Transparenz und Ehrlichkeit | – | Intelligenz ≥ 48: ✔ Bel +3, Med +2, Ges +1 · ✘ Med −1 | – |
| 3 | Charmant mit Humor | Humor und Nähe | – | Charisma ≥ 50: ✔ Bel +3, Med +3 · ✘ Bel −1, Med −2 | – |

**Verzögerte Folgen**
- keine (Folgen sind sofort sichtbar)

**Medienreaktion (Haltung der Partei zum Frame)**
- *Angriff auf den Gegner*: lobend für AfD, BSW, FDP · kritisch für GRÜ
- *Transparenz und Ehrlichkeit*: lobend für GRÜ, FDP, SPD · kritisch für – (keine ablehnende Partei)

---

### EV-009 · Eine großzügige Spende
**Kategorie** Persönliches · **Ebene** Kommune (Amt 1–3) · **Thema** Wirtschaft · **Basisgewicht** 0,9  
**Gewicht ×1,35** bei Beruf: Handwerker:in, Unternehmer:in · **×1,25** bei Partei: CDU, FDP

> Hollweg Metallbau GmbH möchte deinen Wahlkampf mit 12.000 Euro unterstützen – „weil Niederhüttingen Weitblick verdient“. Geschäftsführer:in Sabine Hollweg lächelt, als hätte er schon einen Termin im Bürgermeisterbüro eingetragen.
>
> *Was machst du mit der Spende?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Annehmen und sofort veröffentlichen | Transparenz und Ehrlichkeit | Bel +1, Par +1, Kasse +12k€, Med +1, Ges +1 | – | – |
| 2 | Annehmen – nicht zu laut darüber reden | Hinterzimmer-Deal | Par +1, Kasse +12k€, Med −1 | – | – |
| 3 | Ablehnen und das öffentlich betonen | Transparenz und Ehrlichkeit | Bel +2, Par −1, Med +2, Ges +1, Stress +1 | – | – |

**Verzögerte Folgen**
- **Option 2** – mit 75 % Wahrscheinlichkeit nach 2 Wochen das Folge-Event **EV-005**

**Medienreaktion (Haltung der Partei zum Frame)**
- *Transparenz und Ehrlichkeit*: lobend für GRÜ, FDP, SPD · kritisch für – (keine ablehnende Partei)
- *Hinterzimmer-Deal*: lobend für – (keine klare Haltung) · kritisch für GRÜ, LINKE, BSW

---

### EV-010 · Intrige im Ortsverband
**Kategorie** Partei · **Ebene** Kommune (Amt 1–3) · **Thema** Partei · **Basisgewicht** 1  
**Gewicht ×1,35** bei Beruf: – · **×1,25** bei Partei: –

> Sabine Hollweg aus dem Ortsverband sägt an deinem Stuhl: „Wir brauchen frischen Wind.“ Gemeint ist er/sie selbst. Gisela Hagedorn rät zu einem Gespräch. Das Parteiheim riecht nach Verschwörung und Filterkaffee.
>
> *Wie begegnest du der Intrige?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Offene Konfrontation auf der Mitgliederversammlung | Angriff auf den Gegner | – | Durchsetzung ≥ 52: ✔ Bel +1, Par +4, Med +1 · ✘ Bel −1, Par −4, Med −1, Stress +3 | – |
| 2 | Posten anbieten und den Rivalen einbinden | Hinterzimmer-Deal | Par +2 | – | – |
| 3 | Stillhalten und Mehrheiten zählen | Aussitzen | Par −1, Stress −1 | – | – |

**Verzögerte Folgen**
- **Option 3** – mit 45 % Wahrscheinlichkeit nach 3 Wochen (Schmetterlingseffekt): „Interview der Rivalin: „Diese Kandidatur ist ein Fehler.“ Die Partei verschluckt sich am Filterkaffee.“ → Par −3, Med −2

**Medienreaktion (Haltung der Partei zum Frame)**
- *Angriff auf den Gegner*: lobend für AfD, BSW, FDP · kritisch für GRÜ
- *Hinterzimmer-Deal*: lobend für – (keine klare Haltung) · kritisch für GRÜ, LINKE, BSW

---

### EV-011 · Wohnungsnot vs. Streuobstwiese
**Kategorie** Kommunal · **Ebene** Kommune (Amt 1–3) · **Thema** Wohnen · **Basisgewicht** 1,1  
**Gewicht ×1,35** bei Beruf: Handwerker:in · **×1,25** bei Partei: LINKE

> Niederhüttingen wächst, Wohnungen fehlen. Die Stadt besitzt eine Streuobstwiese am Hang: 140 Wohneinheiten möglich, 60 Bäume im Weg. Der Naturschutzbund hat schon Banner, der Bauträger Hollweg Metallbau GmbH hat Pläne.
>
> *Wofür entscheidest du dich?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Bauen – mit Ausgleichsflächen *(Versprechen: Neubaugebiet am Hang)* | Standort und Wirtschaft | Bel +2, Wirt +3, Umw −3, Ges +1 | – | Profil Wohnen +10, Familien +8, Jung +5, Dorf −0 |
| 2 | Nachverdichten im Zentrum statt auf der Wiese | Klima und Umwelt | Bel +1, Par +1, Med +1, Wirt +1, Umw +2, Ges +1 | – | Profil Wohnen +7, Profil Klima +4, Senioren −4 |
| 3 | Wiese schützen, Mietendeckel fordern | Sozialer Ausgleich | Bel +1, Med +1, Wirt −2, Umw +3, Ges +1 | – | Profil Wohnen +5, Jung +6, Gewerbe −6 |

**Verzögerte Folgen**
- keine (Folgen sind sofort sichtbar)

**Medienreaktion (Haltung der Partei zum Frame)**
- *Standort und Wirtschaft*: lobend für FDP, CDU, CSU · kritisch für LINKE, GRÜ
- *Klima und Umwelt*: lobend für GRÜ, LINKE, SPD · kritisch für AfD, BSW, FDP

---

### EV-012 · Clubsterben und Nachtruhe
**Kategorie** Gesellschaft · **Ebene** Kommune (Amt 1–3) · **Thema** Soziales & Bildung · **Basisgewicht** 1 · **Wisch-Karte (2 Optionen)**  
**Gewicht ×1,35** bei Beruf: Lehrer:in, Pflegekraft · **×1,25** bei Partei: SPD, LINKE, BSW

> Nach einer Lärmbeschwerde steht das „Kellerloch“ vor dem Aus, der letzte Club der Stadt. Die Senior:innen der Altstadt fordern Nachtruhe ab 22 Uhr, die Jungen Musik bis zum Morgengrauen. Beide haben Unterschriftenlisten – und Zeit.
>
> *Links wischen: Sperrstunde · Rechts wischen: Nachtbürgermeister*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Sperrstunde 22 Uhr | Härte und Ordnung | Bel +1, Med −1, Ges −1 | – | Senioren +10, Jung −12 |
| 2 | Nachtbürgermeister und Lärmschutzfonds | Dialog und Beteiligung | Bel +1, Kasse −2k€, Med +2, Ges +2 | – | Profil Soziales & Bildung +2, Jung +8, Senioren −5 |

**Verzögerte Folgen**
- keine (Folgen sind sofort sichtbar)

**Medienreaktion (Haltung der Partei zum Frame)**
- *Härte und Ordnung*: lobend für CSU, CDU, AfD · kritisch für LINKE, GRÜ
- *Dialog und Beteiligung*: lobend für GRÜ, LINKE, SPD · kritisch für AfD

---

### EV-013 · Das Meme
**Kategorie** Medien · **Ebene** Kommune (Amt 1–3) · **Thema** Medien · **Basisgewicht** 0,9  
**Gewicht ×1,35** bei Beruf: Journalist:in · **×1,25** bei Partei: –

> Ein Meme zeigt dich als Zeichentrickfigur mit Helm und Zollstock. 18.000 Teilungen. Es ist, zugegeben, ein bisschen gut. Dein Social-Team bietet drei Varianten an: ernst, sarkastisch oder „selbstironisch-cringe“.
>
> *Wie reagierst du?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Rechtliche Schritte androhen | Härte und Ordnung | Bel −1, Med −2, Stress +1 | – | – |
| 2 | Mit eigenem Gegenmeme kontern | Humor und Nähe | Kasse −1k€ | Medienwirkung ≥ 50: ✔ Bel +3, Med +4 · ✘ Bel −2, Med −3 | – |
| 3 | Ignorieren und aussitzen | Aussitzen | Med −1, Stress −1 | – | – |

**Verzögerte Folgen**
- **Option 1** – mit 50 % Wahrscheinlichkeit nach 2 Wochen (Schmetterlingseffekt): „Streisand-Effekt: Das Meme hat jetzt 90.000 Teilungen. Jemand druckt es auf Tassen.“ → Bel −1, Med −2

**Medienreaktion (Haltung der Partei zum Frame)**
- *Härte und Ordnung*: lobend für CSU, CDU, AfD · kritisch für LINKE, GRÜ
- *Humor und Nähe*: lobend für CSU, CDU, SPD · kritisch für – (keine ablehnende Partei)

---

### EV-014 · Das Hundekot-Problem
**Kategorie** Absurdes · **Ebene** Kommune (Amt 1–3) · **Thema** Soziales & Bildung · **Basisgewicht** 0,5  
**Gewicht ×1,35** bei Beruf: Lehrer:in, Pflegekraft · **×1,25** bei Partei: SPD, LINKE, BSW

> In der Bürgersprechstunde schiebt dir eine Dame einen Plastikbeutel unter die Nase: „Das ist das Hauptproblem dieser Stadt.“ Hinter ihr nicken vierzehn Menschen. Es riecht nach Wahlkampf.
>
> *Was versprichst du der Stadt?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Kotbeutelspender an jeder Ecke | Mehr Geld in die Hand nehmen | Bel +2, Med +1, Ges +1 | – | Senioren +6 |
| 2 | 100 Euro Bußgeld und mehr Kontrollen | Härte und Ordnung | Bel +1, Ges −1 | – | Senioren +8, Jung −3 |
| 3 | DNA-Register für Hunde (Testphase) | Humor und Nähe | Bel −1, Med +3, Ges −1 | – | – |
| 4 | Mit dem Beutel vor die Kamera: Humor | Humor und Nähe | – | Charisma ≥ 46: ✔ Bel +3, Med +3 · ✘ Bel −1, Med −2 | – |

**Verzögerte Folgen**
- **Option 3** – mit 60 % Wahrscheinlichkeit nach 3 Wochen (Schmetterlingseffekt): „Bundesweit belächelt: „Kot-DNA-Register“ macht Niederhüttingen zur Schlagzeile der Woche.“ → Bel −1, Med +3

**Medienreaktion (Haltung der Partei zum Frame)**
- *Mehr Geld in die Hand nehmen*: lobend für LINKE, SPD, GRÜ · kritisch für FDP, AfD, CSU
- *Härte und Ordnung*: lobend für CSU, CDU, AfD · kritisch für LINKE, GRÜ

---

### EV-015 · Streik bei den Stadtwerken
**Kategorie** Wirtschaft · **Ebene** Kommune (Amt 1–3) · **Thema** Soziales & Bildung · **Basisgewicht** 0,9  
**Gewicht ×1,35** bei Beruf: Lehrer:in, Pflegekraft · **×1,25** bei Partei: SPD, LINKE, BSW

> Die Müllabfuhr der Stadtwerke streikt. Am Kirchplatz stapeln sich die Tonnen, die Tauben haben ein Festmahl. Die Gewerkschaft fordert 8 Prozent, die Stadt bietet „Wertschätzung“.
>
> *Wie gehst du mit dem Streik um?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Solidarität zeigen und an den Streikposten reden | Sozialer Ausgleich | Bel +1, Par +1, Med +1, Wirt −1, Ges +1 | – | Schicht +10, Gewerbe −8 |
| 2 | Vermitteln: Schlichtung anregen | Dialog und Beteiligung | Bel +2, Par +1, Med +1, Ges +1 | – | – |
| 3 | Notdienst und Ordnung fordern | Härte und Ordnung | Wirt +1, Ges −2 | – | Gewerbe +6, Schicht −10 |

**Verzögerte Folgen**
- keine (Folgen sind sofort sichtbar)

**Medienreaktion (Haltung der Partei zum Frame)**
- *Sozialer Ausgleich*: lobend für LINKE, SPD, BSW · kritisch für FDP
- *Dialog und Beteiligung*: lobend für GRÜ, LINKE, SPD · kritisch für AfD

---

### EV-016 · Unruhe am Bahnhof
**Kategorie** Innere Sicherheit · **Ebene** Kommune (Amt 1–3) · **Thema** Sicherheit · **Basisgewicht** 1  
**Gewicht ×1,35** bei Beruf: Jurist:in, Polizist:in · **×1,25** bei Partei: CDU, CSU, AfD

> Am Bahnhof häufen sich Sachbeschädigungen. Der Stammtisch „Klare Kante“ fordert eine Bürgerwehr, der Jugendtreff mehr Personal, die Polizei höflich den Verzicht auf alles Dramatische.
>
> *Was forderst du?*

| # | Option | Frame | Sofort-Effekte | Wagnis | Profil / Milieus |
|--:|---|---|---|---|---|
| 1 | Videoüberwachung und Ordnungsdienst | Härte und Ordnung | Bel +2, Med +1, Ges −1, Stress +1 | – | Profil Sicherheit +8, Senioren +8, Jung −6 |
| 2 | Streetwork und Jugendtreff ausbauen | Sozialer Ausgleich | Bel +1, Par +1, Ges +2 | – | Profil Soziales & Bildung +5, Profil Sicherheit +3, Jung +4, Senioren −3 |
| 3 | Runder Tisch: Polizei, Anwohner, Jugend | Dialog und Beteiligung | Bel +1, Med +1, Ges +1, Stress +1 | – | – |

**Verzögerte Folgen**
- **Option 3** – mit 35 % Wahrscheinlichkeit nach 3 Wochen (Schmetterlingseffekt): „Runder Tisch vertagt sich zum dritten Mal: „Wir bleiben im Gespräch.““ → Med −2

**Medienreaktion (Haltung der Partei zum Frame)**
- *Härte und Ordnung*: lobend für CSU, CDU, AfD · kritisch für LINKE, GRÜ
- *Sozialer Ausgleich*: lobend für LINKE, SPD, BSW · kritisch für FDP

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


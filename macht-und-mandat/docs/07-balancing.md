# 10 · Balancing-Konzept für Umfragen, Wahlergebnisse und Bundestagsmehrheiten

> Dieses Kapitel ist **messbasiert**: Zwei Simulationswerkzeuge erzeugen alle Zahlen.
> `tools/balance-sim.js` – Monte Carlo für *Umfragen → Wahlergebnis → Sitze → Mehrheiten* (Bund, ohne Spieler).
> `tools/balance-prototype.js` – lässt den **echten Prototyp** im Headless-Browser 400× je Partei durchspielen (Zufallsspiel vs. „geschicktes“ Spiel).
> `tools/tune-prototype.js` – kalibriert die Schwierigkeits-Offsets per Bisektion.

## 10.1 Ziele (Design-Vorgaben)

| # | Ziel | Zielwert | Gemessen (Ist) |
|---|---|---|---|
| Z1 | **Keine Partei ist unspielbar** (Kommune, Zufallsspiel) | Siegquote 10–70 % | 15–65 % ✓ |
| Z2 | **Können lohnt sich** (geschicktes vs. Zufallsspiel) | + 30…70 Prozentpunkte | + 31…+ 63 pp ✓ |
| Z3 | **Schwierigkeit entspricht der Sterne-Anzeige** | CDU/CSU leicht … AfD/Eigene schwer | CDU 65 % … AfD 15 %, Eigene 15 % ✓ |
| Z4 | **Bundestag: 5–7 Fraktionen** | ≥ 80 % der Läufe | 6–7 Fraktionen in 81 %, 5–8 in > 99 % ✓ |
| Z5 | **Ergebnis-Unsicherheit** | Stärkste Kraft nicht zu 100 % vorhersehbar | Union 68 % / AfD 32 % (ohne Spieler) ✓ |
| Z6 | **Kleine Parteien zittern** | FDP/BSW < 5 % in 50–70 % | FDP 57 %, BSW 70 % ✓ |
| Z7 | **Koalitionsoptionen** (mit Kooperationssperre) | Zweierbündnis 20–30 %, Dreierbündnis 65–75 % | **12 % / 88 %** ⚠ (siehe 10.6) |
| Z8 | **Keine ergebnislose Wahl** | „keine Mehrheit“ < 3 % | 0,0 % ✓ |
| Z9 | **Fairness-Zufall** | keine Glücks-/Pechsträhnen > 8 | längste Strähne 7 ✓ (Kap. 7.7) |

## 10.2 Methodik

**A · Bundes-Monte-Carlo (ohne Spieler).** 10 000 Legislaturen à 208 Wochen mit dem Umfragemodell aus Kapitel 6.6 (Zeitgeist-AR(1), Ereignisschocks, Regierungsmalus), gefolgt von Wahltags-Rauschen `N(0; 1,3 pp)`, Direktmandaten (Anteil ∝ Zweitstimmenanteil³ · Konzentration), Sainte-Laguë (630 Sitze, 5-%-Hürde, Grundmandatsklausel) und Koalitionssuche (minimale Gewinnkoalitionen unter Berücksichtigung der Unvereinbarkeiten).

**B · Kommune (Prototyp).** Je Partei 400 Spiele mit 8 Berufen im Wechsel, 12 zufällig verteilten Attributspunkten, gleichmäßigem Kampagnenbudget (70 % der Kasse) und 10 Karten. Zwei Policies: **Zufall** (gleichverteilt) und **„geschickt“** (greedy nach Vorschau: `Σ (Bel + 0,6·Med + 0,3·Par + 0,15·Kasse) + Profilbonus − Folgenrisiko`, Erwartungswert über Wagnisse).

## 10.3 Ergebnisse Bundesebene (ohne Spielereinfluss)

**Fiktive Ausgangslage:** CDU 20,5 · CSU 5,5 · SPD 16,5 · AfD 21,0 · Grüne 12,0 · FDP 4,5 · Linke 6,5 · BSW 4,0 · Sonstige 9,5.

| Partei | Start | Ø Ergebnis | 10 %-Quantil | 90 %-Quantil | P(< 5 %) | P(stärkste Kraft) |
|---|--:|--:|--:|--:|--:|--:|
| CDU | 20,5 | 18,8 | 16,4 | 21,2 | 0,0 % | **67,8 %** *(als Union)* |
| CSU | 5,5 | 5,0 | 3,3 | 6,8 | 48,7 % | (mit CDU) |
| SPD | 16,5 | 15,1 | 12,9 | 17,4 | 0,0 % | 0,0 % |
| AfD | 21,0 | 22,3 | 19,7 | 24,8 | 0,0 % | **32,1 %** |
| Grüne | 12,0 | 12,8 | 10,7 | 14,9 | 0,0 % | 0,0 % |
| FDP | 4,5 | 4,7 | 2,9 | 6,5 | 57,0 % | 0,0 % |
| Linke | 6,5 | 6,9 | 5,1 | 8,7 | 8,7 % | 0,0 % |
| BSW | 4,0 | 4,2 | 2,4 | 6,0 | 70,3 % | 0,0 % |

**Parlamentsstruktur:** 4 Fraktionen 0,4 % · 5: 8,9 % · 6: 41,8 % · **7: 39,5 %** · 8: 9,3 %.

| Kooperationssperre | Keine Mehrheit | Zweierbündnis möglich | Dreierbündnis nötig | Ø Koalitionsoptionen |
|---|--:|--:|--:|--:|
| **An** (Standard) | 0,0 % | **12,2 %** | 87,8 % | 1,53 |
| **Aus** (Sandbox) | 0,0 % | 84,8 % | 15,2 % | 5,43 |

### „Wie stark muss der Spieler sein?“
Kampagnen-Bonus Δ in Prozentpunkten für die Spielerpartei (Gegner verlieren anteilig durch Normierung). Zellen: *stärkste Kraft / Regierungsbeteiligung / Kanzler:in*.

| Partei | Δ = 0 pp | Δ = +3 pp | Δ = +6 pp | Δ = +9 pp |
|---|---|---|---|---|
| CDU | 67,5 / 100 / 98,3 % | 91,7 / 100 / 99,9 % | 98,8 / 100 / 100 % | 100 / 100 / 100 % |
| CSU | 69,2 / 100 / 98,3 % | 91,5 / 100 / 100 % | 98,9 / 100 / 100 % | 99,9 / 100 / 100 % |
| SPD | 0,0 / 99,4 / 1,7 % | 1,1 / 100 / 9,4 % | 10,9 / 100 / 28,8 % | 45,5 / 100 / 59,9 % |
| AfD | 31,6 / 0,0 / 0,0 % | 67,2 / 0 / 0 % | 90,8 / 0 / 0 % | 98,7 / 0 / 0 % |
| Grüne | 0,0 / 91,2 / 0,1 % | 0,0 / 97,4 / 2,8 % | 1,1 / 99,8 / 14,6 % | 15,3 / 100 / 40,0 % |
| FDP | 0,0 / 28,2 / 0,0 % | 0,0 / 73,7 / 0 % | 0,0 / 91,5 / 0 % | 0,0 / 98,7 / 0,4 % |
| Linke | 0,0 / 0,5 / 0,0 % | 0 / 2,4 / 0 % | 0 / 7,6 / 0,6 % | 0 / 21,3 / 11,2 % |
| BSW | 0,0 / 14,0 / 0,0 % | 0 / 55,8 / 0 % | 0 / 78,0 / 0 % | 0 / 90,3 / 0 % |

**Lesart & Konsequenzen:**
1. **Union** ist „leicht“, aber nicht trivial: 68 % Stärkste-Kraft-Chance ohne Zutun.
2. **AfD** braucht Δ ≈ +2 pp für eine Mehrheit der *Stärkste-Kraft*-Fälle (+3 pp: 67 %) – wird aber wegen der Kooperationssperre **nie** Regierung. Das ist ein bewusster Schwierigkeitsgrad: Der Weg zur Macht führt über **Erosionsmechanik**, Direktmandate, Stichwahlen auf Kommunal-/Landesebene oder die **Sandbox-Option** (Sperre aus).
3. **SPD/Grüne** benötigen Δ ≈ +6…+9 pp für Platz 1: *realistisch nur mit sehr gutem Spiel* (Kanzlerbonus, TV-Duell, Themenhoheit). Regierungsbeteiligung ist dagegen **fast immer** möglich – zu leicht (siehe 10.6).
4. **Linke/BSW/FDP** sind „Nischenpfade“: Regierungsbeteiligung nur mit Δ ≥ +3 (FDP/BSW) bzw. Δ ≥ +9 (Linke).

## 10.4 Ergebnisse Kommune (Prototyp, 400 Spiele je Partei)

**Schwierigkeits-Offsets** (`HCAP`, nur für die Spieler:in; positive Werte helfen):

| Partei | Offset | Ziel-Siegquote (Zufall) | **Zufallsspiel** | **Geschicktes Spiel** | Median Stimmanteil (1. Runde, Zufall) | 10 %–90 %-Band |
|---|--:|--:|--:|--:|--:|--:|
| CDU | −0,10 | 60 % | **65 %** | **96 %** | 36,2 % | 29,8–42,9 |
| CSU | −0,40 | 60 % | **56 %** | **87 %** | 35,5 % | 28,7–43,0 |
| SPD | −0,20 | 45 % | **45 %** | **91 %** | 32,5 % | 25,6–39,7 |
| Grüne | +0,10 | 40 % | **37 %** | **86 %** | 32,2 % | 25,6–39,0 |
| FDP | +0,45 | 25 % | **22 %** | **85 %** | 31,1 % | 25,4–37,8 |
| Linke | +0,20 | 25 % | **27 %** | **64 %** | 29,3 % | 22,5–36,3 |
| BSW | −0,25 | 35 % | **21 %** | **82 %** | 27,2 % | 20,4–37,2 |
| AfD | +0,65 | 20 % | **15 %** | **50 %** | 34,9 % | 28,2–42,4 |
| Eigene | −0,10 | 15 % | **15 %** | **60 %** | 23,5 % | 17,5–34,5 |

- **Fast jede Wahl geht in die Stichwahl** (fünf Kandidat:innen): erste Runde < 50 % in > 99 % der Zufalls- und in 89–100 % der „geschickten“ Spiele (realistisch für OB-Wahlen).
- Der **Offset** ist *kein* Geschenk, sondern kompensiert strukturelle Unterschiede (Affinitäten, Kooperationssperre, Milieu-Breite). Er steht in der Schwierigkeitsanzeige („★“) und ist im Sandbox-Modus abschaltbar.
- **Geschicktes Spiel** verbessert die Siegquote um **+31 bis +63 pp** – bei CDU/CSU am wenigsten (Deckeleffekt bei ~90 %), bei FDP/BSW am meisten; AfD und Linke bleiben mit 50 % bzw. 64 % am schwersten, weil dort strukturelle Hürden (Stichwahl-Abzug, Affinitätslücken) wirken.

## 10.5 Kalibrierungs-Logbuch (Was die Simulation aufgedeckt hat)

| # | Befund | Ursache | Korrektur |
|---|---|---|---|
| 1 | CSU fiel in 4 Jahren von 6 auf 2,3 % | Regierungsmalus war **absolut** (−4 pp) statt relativ | relativ: `G = B · min(0,14; 0,0007·t)` ✓ |
| 2 | Union in 98 % der Läufe stärkste Kraft | Ausgangslage Union 25 + 6 gegenüber AfD 19 zu groß | Start CDU 20,5 / CSU 5,5 / AfD 21,0 ✓ → 68 % / 32 % |
| 3 | Kommune: CDU 96 %, CSU 99 %, AfD 0 %, FDP 3 % (Zufallsspiel) | Parteiaffinität (`A = 1,5`) dominiert das Kommunalergebnis | `A = 0,8`, `C = 1,9`, `R = 0,9` (Person vor Partei) |
| 4 | Offsets wirkten auch auf die KI-Gegner | `HCAP` ging in `utility` für *alle* Kandidaturen ein | Offset nur für `me` |
| 5 | „Geschicktes Spiel“ gewinnt 91–98 % | Beliebtheits-Gewinne (~+35 in 10 Karten) schlugen zu stark auf die Persönlichkeit durch | `B = 0,42` (vorher 0,75): geschicktes Spiel 50–96 % (AfD 50 %, Linke 64 %, Eigene 60 %) ✓ |
| 6 | Kaum Unterschied zwischen Medien-Varianz-Parteien | AfD-Faktor ×1,5 nur im Medienecho | zusätzlich Folgen-Wahrscheinlichkeit ×1,25 ✓ |

## 10.6 Offene Punkte / Tuning-Hebel

| Problem | Beobachtung | Hebel | Plan |
|---|---|---|---|
| **Z7: Zu wenig Zweierbündnisse** unter Kooperationssperre (12 % statt 20–30 %) | AfD (21 %) + Kooperationssperre bindet ~22 % der Sitze | AfD-Start 19 % (−2 pp), Union +1 pp; `Sonstige`-Anteil 9,5 → 12 % (mehr „verlorene“ Stimmen) | Szenario-Varianten „Fragmentiert/Polarisiert“ |
| **Regierungsbeteiligung zu leicht** (SPD/Grüne ≈ 99 %) | nur Arithmetik, keine Programm-Kompatibilität | Kompatibilitäts-Score (Kap. 5.9: Fachrunden, rote Linien, Z_i > 0,45) | Vertical Slice |
| **SPD/Grüne kaum Platz 1** | strukturell 0 % bei Δ = 0 | Kanzlerbonus `c`, Themen-Hoheit, Duell-Minispiel; Szenario „Comeback“ | Balancing in Alpha |
| **Linke praktisch ohne Regierungschance** | Unvereinbarkeit Union/FDP | Szenarien („Linke im Aufwind“), Mehrheitsoption Rot-Grün-Rot ab ~46 % | Szenario-Design |
| **Eigene Partei** | 15 % Zufallsspiel, 60 % geschickt | Gründungs-Boni (Momentum), Wachstumskurve | Live-Telemetrie |

## 10.7 Schwierigkeitsgrade

| Stufe | Offset-Skalierung | Ereignis-Härte | Umfrage-Rauschen | Stress-Wirkung | Vorschau-Qualität | Zielgruppe |
|---|--:|--:|--:|--:|--:|---|
| **Leicht** („Hospitant:in“) | ×1,5 (positive), ×0,5 (negative) | Folgenrisiko × 0,6 | × 0,7 | × 0,5 | +0,2 | Einsteiger:innen |
| **Normal** („Abgeordnete:r“) | ×1,0 | × 1,0 | × 1,0 | × 1,0 | ±0 | Standard |
| **Schwer** („Fraktionsvorsitz“) | ×0,5 (positive), ×1,3 (negative) | × 1,3 | × 1,3 | × 1,3 | −0,1 | Erfahrene |
| **Legende** („Kanzler:in“) | 0 (alle Offsets aus) | × 1,6, Skandalketten häufiger | × 1,6 | × 1,6 | −0,2 | Hardcore |
| **Sandbox** | frei einstellbar | frei | frei | frei | frei | Experimente, Szenarien |

**Szenario-Modus:** *Krisenkanzler* (Start im Kanzleramt, Stabilität 40), *Kleinstpartei an die Macht* (Eigene Partei bei 2 %, Ziel Regierungsbeteiligung), *Gelber Schreck* (FDP zwischen 4 und 6 %, Sperrklausel-Zittern), *Die Brandmauer bröckelt* (Erosion an).

## 10.8 Wahlergebnis-Balancing in der Praxis (Live-Regler)

| Regler | Wirkung | Sicherheitsgrenzen |
|---|---|---|
| `k` (Trägheit) | Geschwindigkeit, mit der Umfragen reagieren | 0,10–0,25 |
| `σ_Z` | Zeitgeist-Volatilität | × 0,7 … × 1,5 |
| Regierungsmalus | Legislatur-Verlust Regierungsparteien | 8–20 % rel. |
| Wahltagsrauschen | Umfragefehler | 1,0–2,0 pp |
| Direktmandats-Konzentration | regionale Hochburgen | CSU 4–6, Linke 1,4–2,0, AfD 1,2–1,6 |
| Kooperationssperre | Modus *Standard / Erosion / Aus* | – |
| `HCAP` | Start-Offset je Partei | ±0,8 |

## 10.9 Automatisierte Regression

- **Nightly-Sim:** `balance-sim` (N = 20 000) + `balance-prototype` (N = 400 je Partei) – Abweichungen > 5 pp zu den Zielwerten brechen den Build.
- **Golden-Seed-Tests:** fester Seed → identisches Wahlergebnis (Determinismus, Kap. 13).
- **Live-Telemetrie (opt-in):** Siegquote je Partei/Schwierigkeit, Abbruchstellen, durchschnittliche Stress-Werte, Option-Wahlverteilung je Ereignis (Ziel: keine Option > 60 %, außer als „Dominanz-Alarm“ markiert).
- **Dominanz-Checks:** Keine Option darf in *allen* Kategorien (Bel, Par, Med) dominieren – prüfen per Skript über das Archetypen-Raster (Kap. 7.4).

## 10.10 Reproduktion

```bash
node tools/balance-sim.js 10000                    # Bund: Verteilungen, Strukturen, Spielerwirkung
node tools/balance-prototype.js '{}'               # Kommune: Zufallsspiel
node tools/balance-prototype.js '{"skilled":1}'    # Kommune: geschicktes Spiel
node tools/tune-prototype.js                       # Offsets neu kalibrieren (~1 min)
```

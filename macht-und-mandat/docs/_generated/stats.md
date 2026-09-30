## A. Pool-Größen

| Pool | Größe |
|---|---:|
| ort | 2.880 |
| person | 3.100 |
| firma | 3.000 |
| projekt | 96 |
| branche | 30 |
| medium | 10 |
| medium_nat | 10 |
| gesetz | 24 |
| ministerium | 14 |
| verband | 16 |
| stimmung | 8 |
| wetter | 10 |
| jahreszeit | 4 |
| thema | 11 |
| fest | 10 |
| tier | 10 |
| land | 12 |
| bauwerk | 10 |
| sum_k | 12 |
| sum_m | 12 |
| sum_g | 12 |
| zahl_j | 40 |
| zahl_s | 119 |
| zahl_p | 35 |

## B. Kombinatorik je Template (Auszug + Summen)

Templates: 50; Textvarianten je Template (min): 12; Ø Slot-Produkt: 7.67e+12; geometr. Mittel Gesamtvarianten: 3.87e+9; Summe (50): 4.60e+15

| Kategorie | Templates | Ø Textvarianten | Ø Slots | kleinste Gesamtzahl |
|---|---:|---:|---:|---:|
| Kommunal | 5 | 12.0 | 5.2 | 7.9e+9 |
| Landespolitik | 3 | 12.0 | 4.7 | 7.5e+7 |
| Bundespolitik | 4 | 12.0 | 4.0 | 1.2e+8 |
| Wirtschaft | 4 | 12.0 | 4.8 | 3.6e+6 |
| Außen- und Europapolitik | 3 | 12.0 | 4.0 | 1.1e+8 |
| Innere Sicherheit und Migration | 4 | 12.0 | 5.0 | 3.3e+7 |
| Krisen und Katastrophen | 4 | 12.0 | 5.0 | 8.3e+6 |
| Medien | 4 | 12.0 | 4.0 | 3.3e+7 |
| Persönliches | 4 | 12.0 | 4.0 | 1.2e+7 |
| Partei | 3 | 12.0 | 4.0 | 1.6e+8 |
| Koalition | 3 | 12.0 | 4.0 | 6.7e+7 |
| Gesellschaft und Kultur | 3 | 12.0 | 4.3 | 7.2e+8 |
| Positives | 3 | 12.0 | 4.7 | 4.9e+7 |
| Absurdes und Satirisches | 3 | 12.0 | 5.0 | 5.5e+8 |

## C. Konservative Zählung (Wahrnehmungs-Deckel)

CAP=3: 5.400 wahrnehmbar verschiedene Ereignisse aus nur 50 Templates (Ø 108 je Template)
CAP=5: 15.000 wahrnehmbar verschiedene Ereignisse aus nur 50 Templates (Ø 300 je Template)
CAP=10: 60.000 wahrnehmbar verschiedene Ereignisse aus nur 50 Templates (Ø 1.200 je Template)

## D. 20-Stunden-Simulation (nur 50 Templates = Worst Case)

20 h, Kommune→Bund (Wachstum), mit Fairness: 1800 Ereignisse | identische Volltexte: 0 | Template-Wiederkehr: Median 25 Ereignisse, 5 %-Perzentil 9 | Glücksanteil 51.2 % | längste Strähne 7 | Strähnenfenster 0/36
20 h, Kommune→Bund (Wachstum), ohne Fairness: 1800 Ereignisse | identische Volltexte: 0 | Template-Wiederkehr: Median 25 Ereignisse, 5 %-Perzentil 8 | Glücksanteil 51.6 % | längste Strähne 10 | Strähnenfenster 5/36
20 h, nur Bund-Ebene, mit Fairness: 1800 Ereignisse | identische Volltexte: 0 | Template-Wiederkehr: Median 25 Ereignisse, 5 %-Perzentil 9 | Glücksanteil 49.9 % | längste Strähne 7 | Strähnenfenster 0/36
100 h Dauertest, Kommune→Bund: 9000 Ereignisse | identische Volltexte: 508 | Template-Wiederkehr: Median 26 Ereignisse, 5 %-Perzentil 9 | Glücksanteil 49.8 % | längste Strähne 9 | Strähnenfenster 0/180

# PLUTO – "Taste beyond earth." (42 s cinema / online spot)

Epic movie-trailer meets premium chocolate ad: dark, glossy, space-grade luxury,
ending in a bright German singalong jingle.

| | |
|---|---|
| Length | 42.0 s (8 shots + 10.8 s end card) |
| Picture | 1920×1080, 24 fps, 2.39:1 scope letterbox, filmic grade |
| Sound | Stereo, 48 kHz, −14 LUFS integrated, −1 dBTP |
| Product | `assets/pluto_bar_reference.jpg` (start frame / product reference) |

## Script & shot list

| Time | Shot | Picture | Sound / VO |
|---|---|---|---|
| 0:00–0:05 | **Arrival** | Black, stars. Pluto rises and glows; slow push through floating chocolate shards, the bar drifts in and turns its label to camera. | Sub drone + low brass swell, metallic creaks. VO (whisper): *"Far beyond… the edge of everything…"* Riser into the crack. |
| 0:05–0:08.6 | **The Crack** | Macro push-in; the bar snaps in half in zero-g, foil tears ("PLU" / "TO"), caramel strings stretch, shards hang in the air. | Layered chocolate snap + glass-like crunch, sub-boom, 3.6 s cave reverb (40 ms pre-delay), ping-pong echo, whip whoosh. |
| 0:08.6–0:12 | **Cocoa** | Split cocoa pod, roasted beans tumbling, cocoa-dust nebula. | VO: *"Slow-roasted cocoa…"* — D-minor pulse, Dm pad. |
| 0:12–0:15.8 | **Caramel & Hazelnut** | Molten caramel ribbon spiralling like a galaxy arm, hazelnuts orbiting and cracking. | VO: *"Golden caramel… roasted hazelnut…"* — B♭ pad. |
| 0:15.8–0:19.1 | **Milk** | Milk wave and molten chocolate collide, forming the wrapper's cream cloud splotches. | VO: *"…and creamy Alpine milk."* — F pad. |
| 0:19.1–0:23.1 | **Layers** | Broken half rotates: chocolate shell, caramel core, hazelnut, cocoa wafer, a caramel drip. | VO: *"Forged in the cold. Made to melt."* — C pad, riser + brass build. |
| 0:23.1–0:27.3 | **Landing** | Bar descends onto Pluto's regolith; low-gravity dust cloud, chocolate splash. | Impact boom, dust swell, low brass hit. |
| 0:27.3–0:32.3 | **Hero** | 45° orbit, light sweep across the label, settles on a clean centred packshot. | D-major lift. VO: *"Pluto… Taste beyond earth."* |
| 0:32.3–0:43.1 | **End card + Jingle** | Freeze of the packshot, slow push-in, "PLUTO" + "Taste beyond earth." fade in, fade to black. | Bling, 2-beat clap count-in, then the jingle (glockenspiel melody, plucked bass, claps, pad), rising "ta-daa" + sub-boom + whoosh. |

**Jingle (spoken-rhythm, layered female + male + pitched "kids" voice):**
> Pluto, Pluto – Schoko-Riegel, kosmisch gut,
> macht die Kleinen und die Großen froh und voller Mut!

## How it was made

- **Keyframes:** GPT Image 2.5 (Higgsfield), each conditioned on the product reference so
  the wrapper and the hand-lettered "PLUTO" stay identical in every shot.
- **Shots:** Kling 3.0 (Higgsfield), silent, 5 s each, animated from those keyframes
  (start/end-frame interpolation for arrival, crack, landing and hero). Prompts ask for
  "real ARRI / Phantom footage, practical effects, real physics, no morphing"; the first
  crack take morphed the label, so it was re-shot between two fixed keyframes.
- **Voices:** ElevenLabs v4 via Higgsfield, stability 0.35. Trailer VO = deep preset
  voice (median F0 ≈ 68 Hz); the jingle uses a bright female and a bright male voice. The
  reference spot (`assets/PLUTO_Kinospot_15s_ref.mp4`) has no spoken voice to clone.
- **Everything else is local and procedural:** `sound_design.py` synthesises the drone,
  brass, risers, chocolate snap/crunch, sub-booms, reverbs, ping-pong echo, space
  ambience, whooshes and the whole jingle music bed, then mixes with VO side-chain
  ducking (≈ −7 dB under VO, −4 dB under the jingle).
- **Edit / "not AI" finishing:** `build_spot.py` keeps only the cleanest 3–5 s of each
  generation, hard-cuts on whooshes, crops to 2.39:1 and applies one grade over all shots
  (warm highlights / cool shadows, halation, 1 px lens fringing, soft vignette, temporal
  film grain) so the shots read as one camera package.

## Rebuild

```bash
python3 build_spot.py edit.json   # needs ffmpeg, numpy, scipy, Pillow, Montserrat font
```

`edit.json` is the edit decision list: shot sources and in/out points, hit points,
VO placements, end-card layout. Changing a number there re-cuts picture **and** re-mixes
sound in one pass.

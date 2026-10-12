#!/usr/bin/env python3
"""PLUTO – "Taste beyond earth." Procedural sound design + music + final mix.

Everything except the voices is synthesised here (numpy/scipy), so the spot has
no licensing strings attached. Usage:

    python3 sound_design.py timeline.json out.wav

timeline.json holds the cut points, hit points and voice-over placements, so the
same engine re-mixes any re-edit of the picture.
"""
import json
import subprocess
import sys

import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(7)


# ----------------------------------------------------------------- helpers --
def secs(n):
    return int(round(n * SR))


def tvec(dur):
    return np.arange(secs(dur)) / SR


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x, axis=0)


def sweep_lp(x, f0, f1, curve=2.0, block=512):
    """Block-wise low-pass whose cutoff glides f0 -> f1 (mono)."""
    out = np.zeros_like(x)
    zi = None
    n = len(x)
    for i in range(0, n, block):
        p = (i / max(n - 1, 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        s = sos("lowpass", min(fc, SR * 0.45))
        if zi is None:
            zi = signal.sosfilt_zi(s) * 0
        out[i:i + block], zi = signal.sosfilt(s, x[i:i + block], zi=zi)
    return out


def env_adsr(n, a, d, s, r, sustain_len=None):
    a, d, r = secs(a), secs(d), secs(r)
    sl = max(n - a - d - r, 0) if sustain_len is None else secs(sustain_len)
    e = np.concatenate([
        np.linspace(0, 1, max(a, 1)),
        np.linspace(1, s, max(d, 1)),
        np.full(sl, s),
        np.linspace(s, 0, max(r, 1)),
    ])
    return np.pad(e, (0, max(n - len(e), 0)))[:n]


def expdecay(dur, tau):
    return np.exp(-tvec(dur) / tau)


def saw(f, t, detune=0.0):
    ph = (f * (1 + detune)) * t
    return 2 * (ph - np.floor(ph + 0.5))


def noise(dur):
    return RNG.standard_normal(secs(dur))


def brown(dur):
    b = np.cumsum(noise(dur))
    b = filt(b, "highpass", 15)
    return b / (np.abs(b).max() + 1e-9)


def stereo(x, pan=0.0):
    """Equal-power pan, pan in [-1, 1]."""
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def widen(x, ms=11):
    """Mono -> wide stereo via a short Haas offset + decorrelation."""
    d = secs(ms / 1000)
    left = x
    right = np.concatenate([np.zeros(d), x[:-d]]) if d else x
    return np.stack([left, right], axis=1) * 0.75


def reverb(x, rt60=2.5, predelay=0.02, wet=0.35, damp=6000, seed=1):
    """Convolution reverb with a synthetic, decorrelated stereo IR."""
    rng = np.random.default_rng(seed)
    n = secs(rt60 * 1.2)
    t = np.arange(n) / SR
    decay = np.exp(-6.9 * t / rt60)
    irs = []
    for _ in range(2):
        ir = rng.standard_normal(n) * decay
        ir = filt(ir, "lowpass", damp)
        ir = np.concatenate([np.zeros(secs(predelay)), ir])
        irs.append(ir / np.sqrt((ir ** 2).sum()))
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    out = np.zeros((len(x) + len(irs[0]) - 1, 2))
    for ch in range(2):
        out[:, ch] = signal.fftconvolve(x[:, ch], irs[ch])
    dry = np.pad(x, ((0, len(out) - len(x)), (0, 0)))
    return dry * (1 - wet) + out * wet * 2.2


def pingpong(x, delay=0.375, fb=0.55, taps=7, lp=4500):
    if x.ndim == 2:
        x = x.mean(axis=1)
    d = secs(delay)
    out = np.zeros((len(x) + d * taps, 2))
    tap = x.copy()
    for k in range(1, taps + 1):
        tap = filt(tap, "lowpass", lp) * fb
        ch = k % 2
        out[k * d:k * d + len(tap), ch] += tap
    return out


class Bus:
    def __init__(self, dur):
        self.buf = np.zeros((secs(dur), 2))

    def add(self, x, at, gain=1.0):
        if x.ndim == 1:
            x = stereo(x)
        i = secs(at)
        if i >= len(self.buf):
            return
        j = min(i + len(x), len(self.buf))
        if i < 0:
            x, i = x[-i:], 0
            j = min(len(x), len(self.buf))
        self.buf[i:j] += x[: j - i] * gain


def norm(x, peak=0.9):
    return x * (peak / (np.abs(x).max() + 1e-9))


def note(name):
    names = {"C": -9, "C#": -8, "Db": -8, "D": -7, "D#": -6, "Eb": -6, "E": -5,
             "F": -4, "F#": -3, "Gb": -3, "G": -2, "G#": -1, "Ab": -1, "A": 0,
             "A#": 1, "Bb": 1, "B": 2}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[pitch] + (octave - 4) * 12) / 12)


def load_audio(path, semitones=0):
    """Decode to float stereo; optional pitch shift that keeps the timing."""
    af = []
    if semitones:
        r = 2 ** (semitones / 12)
        af = ["-af", f"asetrate={SR}*{r:.6f},aresample={SR},atempo={1 / r:.6f}"]
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, *af, "-ac", "2", "-ar", str(SR),
         "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


# ------------------------------------------------------------- instruments --
def sub_drone(dur):
    t = tvec(dur)
    f = note("D1")
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.18 * t)
    x = (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t)
         + 0.15 * np.tanh(3 * np.sin(2 * np.pi * f * t)))
    return x * lfo


def brass_swell(chord, dur, f0=180, f1=1800, a=None):
    t = tvec(dur)
    x = np.zeros_like(t)
    for n in chord:
        f = note(n)
        for det in (-0.004, 0.0, 0.0045):
            x += saw(f, t, det)
    x = sweep_lp(x / (3 * len(chord)), f0, f1, curve=1.6)
    e = env_adsr(len(t), a if a is not None else dur * 0.8, 0.1, 1.0, 0.35)
    return np.tanh(1.8 * x * e)


def pad(chord, dur, bright=1400, attack=0.8, release=1.2):
    t = tvec(dur)
    x = np.zeros_like(t)
    for n in chord:
        f = note(n)
        for det in (-0.006, -0.002, 0.003, 0.007):
            x += saw(f, t, det)
    x = filt(x / (4 * len(chord)), "lowpass", bright)
    return x * env_adsr(len(t), attack, 0.3, 0.85, release)


def riser(dur, f0=180, f1=2400):
    t = tvec(dur)
    p = (t / dur) ** 2.2
    nz = noise(dur)
    out = np.zeros_like(t)
    blk = 1024
    for i in range(0, len(t), blk):
        fc = f0 * (f1 / f0) ** p[i]
        b = sos("bandpass", [fc * 0.7, min(fc * 1.4, SR * 0.45)])
        out[i:i + blk] = signal.sosfilt(b, nz[i:i + blk])
    ph = np.cumsum(f0 * (f1 / f0) ** p / SR)
    tone = 0.25 * np.sin(2 * np.pi * ph)
    return (out * 2.5 + tone) * (t / dur) ** 1.8


def sub_boom(dur=2.2, f0=95, f1=30, tau=0.55):
    t = tvec(dur)
    f = f1 + (f0 - f1) * np.exp(-t / 0.09)
    ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph) * expdecay(dur, tau)
    click = filt(noise(0.012), "lowpass", 2500) * expdecay(0.012, 0.003)
    x[:len(click)] += click * 0.6
    return np.tanh(1.6 * x)


def choc_snap():
    """Layered chocolate snap: transient click, woody crack, crisp crumbs."""
    dur = 0.6
    out = np.zeros(secs(dur))
    click = filt(noise(0.006), "highpass", 1800) * expdecay(0.006, 0.0012)
    out[:len(click)] += click * 1.4
    crack = filt(noise(0.09), "bandpass", [900, 5200]) * expdecay(0.09, 0.018)
    out[:len(crack)] += crack * 1.1
    body = filt(noise(0.12), "bandpass", [180, 700]) * expdecay(0.12, 0.03)
    out[:len(body)] += body * 0.9
    for _ in range(22):  # crunchy crumbs / glass-like grains
        at = secs(RNG.uniform(0.004, 0.35) ** 1.3)
        g = filt(noise(0.012), "bandpass",
                 sorted([RNG.uniform(2500, 5000), RNG.uniform(6000, 11000)]))
        g *= expdecay(0.012, 0.0025) * RNG.uniform(0.15, 0.6)
        out[at:at + len(g)] += g[: len(out) - at]
    return out


def glass_crunch():
    out = np.zeros(secs(0.7))
    for _ in range(40):
        at = secs(RNG.uniform(0, 0.45))
        f = RNG.uniform(3000, 9000)
        t = tvec(0.03)
        ping = np.sin(2 * np.pi * f * t) * expdecay(0.03, 0.006)
        ping += filt(noise(0.03), "highpass", 5000) * expdecay(0.03, 0.003)
        out[at:at + len(ping)] += ping[: len(out) - at] * RNG.uniform(0.05, 0.25)
    return out


def whoosh(dur=0.9, peak=0.65, lo=250, hi=3500):
    t = tvec(dur)
    nz = noise(dur)
    p = np.clip(t / dur, 0, 1)
    out = np.zeros_like(t)
    blk = 1024
    for i in range(0, len(t), blk):
        x = p[i]
        fc = lo * (hi / lo) ** (np.sin(np.pi * x) ** 1.5)
        b = sos("bandpass", [fc * 0.6, min(fc * 1.6, SR * 0.45)])
        out[i:i + blk] = signal.sosfilt(b, nz[i:i + blk])
    e = np.where(p < peak, (p / peak) ** 2.5, ((1 - p) / (1 - peak)) ** 1.2)
    return out * e * 2.0


def metal_creak(dur=1.6):
    t = tvec(dur)
    f = RNG.uniform(140, 320) * (1 + 0.08 * np.sin(2 * np.pi * RNG.uniform(0.6, 1.4) * t))
    ph = np.cumsum(f) / SR
    excite = np.abs(filt(noise(dur), "lowpass", 30))
    excite /= excite.max() + 1e-9
    x = sum(np.sin(2 * np.pi * k * ph) / k for k in (1, 2.03, 3.1, 4.7))
    return filt(x * excite * env_adsr(len(t), 0.25, 0.3, 0.6, 0.6), "highpass", 90)


def glock(f, dur=1.6):
    t = tvec(dur)
    x = (np.sin(2 * np.pi * f * t) * expdecay(dur, 0.55)
         + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * expdecay(dur, 0.18)
         + 0.22 * np.sin(2 * np.pi * f * 5.40 * t) * expdecay(dur, 0.08)
         + 0.10 * np.sin(2 * np.pi * f * 8.93 * t) * expdecay(dur, 0.04))
    x[: secs(0.002)] *= np.linspace(0, 1, secs(0.002))
    return x


def pluck_bass(f, dur=0.45):
    """Karplus-Strong plucked bass."""
    n = secs(dur)
    period = int(SR / f)
    buf = RNG.uniform(-1, 1, period)
    buf = filt(buf, "lowpass", 1200)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        nxt = (i + 1) % period
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + buf[nxt])
    out += 0.4 * np.sin(2 * np.pi * f * tvec(dur)) * expdecay(dur, 0.25)
    return out * env_adsr(n, 0.002, 0.05, 0.9, 0.05)


def clap():
    out = np.zeros(secs(0.25))
    for k, off in enumerate((0, 0.009, 0.018, 0.028)):
        b = filt(noise(0.2), "bandpass", [900, 2600]) * expdecay(0.2, 0.012 if k < 3 else 0.06)
        i = secs(off)
        out[i:i + len(b)] += b[: len(out) - i]
    return out


def bling():
    return sum(glock(note(n), 2.5) * g for n, g in (("D6", 0.6), ("A6", 0.4), ("D7", 0.3)))


# ---------------------------------------------------------------- the spot --
def build(cfg):
    T = cfg["duration"]
    music, sfx, amb, vox, jvox = Bus(T), Bus(T), Bus(T), Bus(T), Bus(T)
    crack, land, jingle_t = cfg["crack_t"], cfg["land_t"], cfg["jingle_t"]

    # 1. Arrival: sub drone + low brass swell + riser into the crack.
    d = sub_drone(crack + 0.3) * env_adsr(secs(crack + 0.3), 2.5, 0.1, 1.0, 0.3)
    music.add(widen(d), 0, 0.55)
    music.add(widen(brass_swell(["D2", "A2", "D3", "F3"], crack - 0.4, 120, 1600)), 0.6, 0.45)
    music.add(widen(riser(2.6)), crack - 2.6, 0.35)
    sfx.add(widen(whoosh(1.6, 0.85, 150, 1800)), crack - 1.4, 0.25)

    # 2. The crack: snap + crunch + sub boom, huge cave verb + ping-pong.
    snap = choc_snap()
    crunch = glass_crunch()
    hit = np.zeros(secs(0.8))
    hit[: len(snap)] += snap
    hit[: len(crunch)] += crunch * 0.8
    sfx.add(reverb(hit, rt60=3.6, predelay=0.04, wet=0.45, damp=7000, seed=3), crack, 0.9)
    sfx.add(pingpong(hit * 0.6, delay=0.33, fb=0.5, taps=6), crack, 0.35)
    sfx.add(widen(sub_boom(2.8, 110, 28, 0.8)), crack, 0.95)
    sfx.add(widen(whoosh(0.5, 0.3, 600, 6000)), crack - 0.05, 0.35)   # whip pan

    # 3. Ingredients: restrained cinematic pulse in D minor, chords per cut.
    seq = cfg["ingredient_cuts"]  # list of [start, end, chord]
    for s, e, chord in seq:
        music.add(widen(pad(chord, e - s + 1.0, 1100, 0.4, 1.0)), s, 0.28)
    bpm = 100
    beat = 60 / bpm
    start, end = seq[0][0], seq[-1][1]
    k = 0
    while start + k * beat / 2 < end:
        at = start + k * beat / 2
        root = next(c for s, e, c in seq if s <= at < e + 1e-6)[0]
        f = note(root[:-1] + "1") if root[-1] != "1" else note(root)
        tt = tvec(0.22)
        b = np.sin(2 * np.pi * f * 2 * tt) * expdecay(0.22, 0.07)
        music.add(widen(b), at, 0.22 if k % 2 == 0 else 0.12)
        k += 1
    for s, _, _ in seq[1:]:
        sfx.add(widen(sub_boom(1.0, 70, 32, 0.25)), s, 0.35)
    # tension riser into the landing
    music.add(widen(riser(3.4, 120, 1800)), land - 3.4, 0.28)
    music.add(widen(brass_swell(["D2", "A2", "D3"], 3.4, 90, 900, a=3.0)), land - 3.4, 0.3)

    # 4. Landing: boom, dust swell, low brass hit.
    sfx.add(widen(sub_boom(3.0, 90, 26, 0.7)), land, 0.55)
    sfx.add(reverb(filt(noise(1.8), "lowpass", 900) * env_adsr(secs(1.8), 0.05, 0.4, 0.4, 1.2),
                   rt60=2.0, wet=0.4), land, 0.22)
    sfx.add(reverb(choc_snap() * 0.5, rt60=2.8, predelay=0.04, wet=0.5), land + 0.05, 0.4)
    music.add(reverb(brass_swell(["D2", "A2", "D3", "F#3"], 2.6, 2400, 600, a=0.02),
                     rt60=3.0, wet=0.4), land, 0.45)

    # 5. Hero: warm D major lift under the slogan.
    hero_end = jingle_t
    music.add(widen(pad(["D3", "F#3", "A3", "D4"], hero_end - land + 0.8, 1800, 1.5, 0.8)), land + 0.6, 0.3)
    music.add(widen(brass_swell(["D3", "A3", "D4", "F#4"], hero_end - land - 0.4, 300, 2200)),
              land + 0.8, 0.22)
    music.add(widen(sub_drone(hero_end - land) * env_adsr(secs(hero_end - land), 1.0, 0.1, 1, 0.6)),
              land, 0.25)

    # 6. Space ambience the whole way, whoosh on every camera move / cut.
    a = brown(T)
    a = filt(a, "lowpass", 260)
    hum = 0.06 * np.sin(2 * np.pi * 55 * tvec(T)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tvec(T)))
    amb_env = np.ones(secs(T))
    amb_env[secs(jingle_t):] = np.linspace(1, 0.25, secs(T) - secs(jingle_t))
    amb.add(widen((a * 0.5 + hum) * amb_env), 0, 0.5)
    for at in cfg["creaks"]:
        amb.add(reverb(metal_creak(), rt60=3.0, wet=0.6, seed=int(at * 10)), at, 0.08)
    for at in cfg["cuts"]:
        sfx.add(widen(whoosh(0.8, 0.7, 200, 3000)), at - 0.56, 0.22)

    # 7. Voice-over: close-mic trailer voice + light reverb.
    for path, at, gain in cfg["vo"]:
        v = load_audio(path)
        v = filt(v, "highpass", 50)
        vox.add(reverb(v, rt60=1.1, predelay=0.015, wet=0.12, seed=9), at, gain)

    # 8. Jingle: bright, bouncy, D major, glock + plucked bass + claps + pad.
    jv_len = cfg["jingle_vox_len"]
    intro_beats = 2
    jbpm = float(np.clip(16 * 60 / jv_len, 112, 150))
    jb = 60 / jbpm
    t0 = jingle_t
    vox_at = t0 + intro_beats * jb
    sfx.add(widen(bling()), t0 - 0.02, 0.35)
    sfx.add(widen(whoosh(0.9, 0.8, 300, 5000)), t0 - 0.7, 0.3)
    chords = [["D3", "F#3", "A3"], ["G3", "B3", "D4"], ["E3", "G3", "B3"], ["A3", "C#4", "E4"],
              ["D3", "F#3", "A3"]]
    roots = ["D2", "G2", "E2", "A2", "D2"]
    # melody: (beat offset within 4 bars, note, length in beats)
    mel = [(0, "D5", 1), (1, "D5", 1), (2, "F#5", 1), (3, "A5", 1),
           (4, "B5", 1), (5, "A5", 0.5), (5.5, "F#5", 0.5), (6, "D5", 1), (7, "A4", 1),
           (8, "E5", 0.5), (8.5, "F#5", 0.5), (9, "G5", 0.5), (9.5, "A5", 0.5),
           (10, "B5", 0.5), (10.5, "A5", 0.5), (11, "G5", 0.5), (11.5, "F#5", 0.5),
           (12, "E5", 1), (13, "A4", 0.5), (13.5, "C#5", 0.5), (14, "D5", 0.5), (14.5, "F#5", 0.5),
           (15, "A5", 1), (16, "D6", 2)]  # rising "ta-daa"
    for b in range(intro_beats):  # count-in: claps + glock pickup
        sfx.add(widen(clap()), t0 + b * jb, 0.25)
    for off, n, ln in mel:
        music.add(widen(glock(note(n), max(ln * jb * 2.5, 0.8))), vox_at + off * jb, 0.32)
    for bar in range(5):
        bs = vox_at + bar * 4 * jb
        music.add(widen(pad(chords[bar], 4 * jb + (1.5 if bar == 4 else 0.2), 2600, 0.05, 0.6)), bs, 0.16)
        for e8 in range(8 if bar < 4 else 2):
            r = roots[bar] if e8 % 4 != 2 else roots[bar][:-1] + str(int(roots[bar][-1]) + 1)
            music.add(widen(pluck_bass(note(r), jb * 0.48)), bs + e8 * jb / 2, 0.42)
        if bar < 4:
            for bt in (1, 3):
                music.add(widen(clap()), bs + bt * jb, 0.28)
    tada = vox_at + 16 * jb
    sfx.add(widen(bling()), tada, 0.5)
    sfx.add(widen(sub_boom(2.5, 80, 30, 0.6)), tada, 0.55)
    sfx.add(widen(whoosh(1.2, 0.35, 400, 7000)), tada + 0.05, 0.22)

    for path, gain, pan, shift in cfg["jingle_vox"]:
        v = load_audio(path, shift).mean(axis=1)   # shift>0: brighter "kids" layer
        if shift:
            v = filt(v, "highpass", 220)
        jvox.add(reverb(stereo(v, pan), rt60=0.9, wet=0.15, seed=11), vox_at - 0.05, gain)

    # ---------------------------------------------------------------- mix --
    def envelope(x, att=0.01, rel=0.35):
        m = np.abs(x).max(axis=1)
        e = np.zeros_like(m)
        a_c, r_c = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
        lvl = 0.0
        step = 64
        for i in range(0, len(m), step):
            v = m[i:i + step].max()
            c = a_c if v > lvl else r_c
            lvl = c ** step * lvl + (1 - c ** step) * v
            e[i:i + step] = lvl
        return e / (e.max() + 1e-9)

    duck_vo = 1 - 0.55 * np.clip(envelope(vox.buf) * 3, 0, 1)        # ~ -7 dB under VO
    duck_j = 1 - 0.35 * np.clip(envelope(jvox.buf) * 3, 0, 1)        # ~ -4 dB under jingle
    duck = (duck_vo * duck_j)[:, None]
    mix = (music.buf * duck * 0.9 + amb.buf * duck * 0.8 + sfx.buf * 0.85
           + vox.buf * 1.0 + jvox.buf * 0.95)
    # tail fade to black
    fo = secs(cfg["fade_out"])
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    mix = filt(mix, "highpass", 22)
    mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.6) * 0.89
    return mix


if __name__ == "__main__":
    cfg = json.load(open(sys.argv[1]))
    out = build(cfg)
    pcm = (np.clip(out, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2",
                    "-i", "-", sys.argv[2]], input=pcm, check=True)
    print("wrote", sys.argv[2], f"{len(out) / SR:.2f}s")

#!/usr/bin/env python3
"""PLUTO – "Taste beyond earth." Edit, grade, end card and final mux.

    python3 build_spot.py edit.json

edit.json lists the generated clips (URL or local path) with in/out points,
voice-over takes and the end-card settings. The script

  1. trims every shot, upscales it, crops to a 2.39:1 scope frame and applies a
     filmic grade (warm highlights / cool shadows, halation, slight lens
     fringing, vignette, temporal grain) so the shots cut together like one
     camera package,
  2. builds the end card from the last frame of the hero shot (slow push-in,
     vignette, "PLUTO" + "Taste beyond earth." fading in, fade to black),
  3. writes timeline.json for sound_design.py, renders the mix and muxes the
     final master (H.264 High, 1080p, 24 fps, AAC 320k, -14 LUFS).
"""
import json
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1920, 1080
SCOPE_H = 804                     # 1920 / 2.39
BAR = (H - SCOPE_H) // 2
FPS = 24

GRADE = ",".join([
    "eq=contrast=1.07:saturation=0.93:gamma=0.97",
    "colorbalance=rs=-0.03:gs=-0.01:bs=0.05:rm=0.01:bm=-0.01:rh=0.05:gh=0.015:bh=-0.04",
    "rgbashift=rh=-1:bh=1",
    "vignette=angle=PI/7:mode=forward",
])
HALATION = ("split[a][b];[b]curves=all='0/0 0.6/0 1/1',gblur=sigma=14,"
            "colorchannelmixer=rr=1:gg=0.55:bb=0.35[h];[a][h]blend=all_mode=screen:all_opacity=0.22")
GRAIN = "noise=c0s=9:c0f=t+u:c1s=3:c1f=t+u:c2s=3:c2f=t+u"


def run(cmd):
    subprocess.run(cmd, check=True)


def fetch(src, dst):
    if not os.path.exists(dst):
        if src.startswith("http"):
            run(["curl", "-sfL", "-o", dst, src])
        else:
            run(["cp", src, dst])
    return dst


def scope_chain(extra="", focus=0.5):
    """focus = vertical centre of the 2.39 crop as a fraction of frame height."""
    pre = (f"scale={W}:-2:flags=lanczos,"
           f"crop={W}:{SCOPE_H}:0:'max(0,min(ih-{SCOPE_H},ih*{focus}-{SCOPE_H}/2))',"
           f"fps={FPS},setsar=1")
    chain = f"{pre},cas=strength=0.55,{GRADE}"
    if extra:
        chain += "," + extra
    return f"{chain},{HALATION},{GRAIN},pad={W}:{H}:0:{BAR}:black,format=yuv420p"


def render_shot(src, t_in, t_out, dst, fade_in=0.0, focus=0.5):
    dur = t_out - t_in
    if os.environ.get("REUSE") and os.path.exists(dst):
        return dur
    extra = f"fade=t=in:st=0:d={fade_in}" if fade_in else ""
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t_in}", "-t", f"{dur}", "-i", src,
         "-filter_complex", f"[0:v]{scope_chain(extra, focus)}[v]", "-map", "[v]", "-an",
         "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-r", str(FPS), dst])
    return dur


def title_layers(cfg, out_dir):
    """Letter-spaced title + tagline rendered as transparent PNGs."""
    font_dir = "/usr/share/fonts/truetype/higgsfield"
    big = ImageFont.truetype(os.path.join(font_dir, "Montserrat-ExtraBold.ttf"), cfg.get("title_size", 104))
    small = ImageFont.truetype(os.path.join(font_dir, "Montserrat-ExtraBold.ttf"), cfg.get("tag_size", 34))
    cream = (244, 236, 222, 255)

    def spaced(draw, y, text, font, tracking):
        widths = [draw.textlength(c, font=font) for c in text]
        total = sum(widths) + tracking * (len(text) - 1)
        x = (W - total) / 2
        for c, w in zip(text, widths):
            draw.text((x, y), c, font=font, fill=cream)
            x += w + tracking

    paths = []
    layers = [("title", cfg.get("title", "PLUTO"), big, cfg.get("title_y", 0), 38),
              ("tag", cfg.get("tagline", "Taste beyond earth."), small, cfg["tag_y"], cfg.get("tag_tracking", 9))]
    for k, (name, text, font, y, tracking) in enumerate([l for l in layers if l[1]]):
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        spaced(ImageDraw.Draw(layer), y, text, font, tracking)
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        shadow.putalpha(layer.split()[3].filter(ImageFilter.GaussianBlur(14)).point(lambda a: int(a * 0.85)))
        glow = layer.filter(ImageFilter.GaussianBlur(6))
        comp = Image.alpha_composite(shadow, glow)
        comp = Image.alpha_composite(comp, layer)
        if k == 0 and cfg.get("shade", 0):
            # soft dark band behind the titles so they read over the planet
            shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            top, bottom = BAR, cfg["shade_to"]
            px = shade.load()
            for yy in range(top, bottom):
                a = int(255 * cfg["shade"] * (1 - (yy - top) / (bottom - top)) ** 1.4)
                for xx in range(0, W, 1):
                    px[xx, yy] = (0, 0, 0, a)
            comp = Image.alpha_composite(shade, comp)
        p = os.path.join(out_dir, f"{name}.png")
        comp.save(p)
        paths.append((name, p))
    return paths


def enhance_pack(img, box):
    """Make the wrapper read more premium, without any re-generation.

    GrabCut isolates the bar inside `box` (fractions x0, y0, x1, y1), then only the
    pack gets: local contrast (CLAHE), a gentle S-curve for deeper chocolate foil,
    a little more colour, boosted specular highlights (gloss) and crisper lettering.
    Returns the enhanced float RGB image and the soft pack mask.
    """
    import cv2
    import numpy as np
    h, w = img.shape[:2]
    x0, y0, x1, y1 = (int(v * s) for v, s in zip(box, (w, h, w, h)))
    k = 4
    small = cv2.resize(img, (w // k, h // k), interpolation=cv2.INTER_AREA)
    gc = np.zeros(small.shape[:2], np.uint8)
    bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(cv2.cvtColor(small, cv2.COLOR_RGB2BGR), gc,
                (x0 // k, y0 // k, (x1 - x0) // k, (y1 - y0) // k), bgd, fgd, 6,
                cv2.GC_INIT_WITH_RECT)
    m = np.where((gc == 1) | (gc == 3), 1.0, 0.0).astype(np.float32)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    m = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)
    m = np.clip(cv2.GaussianBlur(m, (0, 0), 5), 0, 1)

    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    lum, ca, cb = cv2.split(lab)
    lum = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(12, 12)).apply(lum)
    enh = cv2.cvtColor(cv2.merge([lum, ca, cb]), cv2.COLOR_LAB2RGB).astype(np.float32) / 255
    luma = enh.mean(axis=2, keepdims=True)
    dark = np.clip((0.55 - luma) / 0.35, 0, 1)                    # chocolate foil
    light = np.clip((luma - 0.55) / 0.3, 0, 1)                    # cream label + splotches
    foil = 0.6 * enh + 0.4 * enh * enh * (3 - 2 * enh)            # S-curve: deeper foil
    hsv = cv2.cvtColor((np.clip(foil, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.15, 0, 255)
    foil = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32) / 255
    cream = np.array([0.985, 0.955, 0.9], np.float32)             # clean, bright cream
    label = enh * 0.8 + cream * 0.2 * luma / 0.85
    enh = dark * foil + light * label + (1 - dark - light) * enh
    enh = enh + 0.18 * np.clip((luma - 0.62) / 0.38, 0, 1) ** 2 * dark.max()  # gloss
    enh = np.clip(enh + 0.7 * (enh - cv2.GaussianBlur(enh, (0, 0), 2.0)), 0, 1)  # crisp edges
    base = img.astype(np.float32) / 255
    return base * (1 - m[..., None]) + enh * m[..., None], m


def render_endcard(src, dur, dst, cfg, work):
    """Freeze the hero's last frame, enhance the pack, slow push-in with a light
    sweep across the wrapper, titles, fade out."""
    if os.environ.get("REUSE") and os.path.exists(dst):
        return
    import cv2
    import numpy as np
    still = os.path.join(work, "endcard_still.png")
    run(["ffmpeg", "-v", "error", "-y", "-sseof", "-0.08", "-i", src, "-frames:v", "1",
         "-vf", f"scale={W * 2}:-2:flags=lanczos", still])
    img = np.array(Image.open(still).convert("RGB"))
    mask = np.ones(img.shape[:2], np.float32)
    if cfg.get("pack_box"):
        img, mask = enhance_pack(img, cfg["pack_box"])
    else:
        img = img.astype(np.float32) / 255
    sh, sw = img.shape[:2]
    pre = (int(W * 1.2), int(round(W * 1.2 * sh / sw)))   # area-downscale once, warp mildly
    img = cv2.resize(img, pre, interpolation=cv2.INTER_AREA)
    mask = cv2.resize(mask, pre, interpolation=cv2.INTER_AREA)
    zh = int(round(W * sh / sw / 2)) * 2
    sw, sh = pre
    frames = int(round(dur * FPS))
    zoom = cfg.get("zoom", 0.07)
    focus = cfg.get("focus", 0.5)
    cy = int(max(0, min(zh - SCOPE_H, zh * focus - SCOPE_H / 2)))
    sweep = cfg.get("sweep")           # {"start": s, "dur": s, "strength": 0..1}
    yy, xx = np.mgrid[0:zh, 0:W].astype(np.float32)

    layers = title_layers(cfg, work)
    fade_out = cfg["fade_out"]
    starts = {"title": cfg.get("title_in", 0.6), "tag": cfg["tag_in"]}
    fc = (f"[0:v]crop={W}:{SCOPE_H}:0:{cy},{GRADE},{HALATION},{GRAIN},"
          f"pad={W}:{H}:0:{BAR}:black[o0];")
    inputs = []
    for i, (name, path) in enumerate(layers, start=1):
        fc += (f"[{i}:v]format=rgba,fade=t=in:st={starts[name]}:d=1.2:alpha=1[t{i}];"
               f"[o{i - 1}][t{i}]overlay=0:0:shortest=1[o{i}];")
        inputs += ["-loop", "1", "-t", f"{dur}", "-i", path]
    fc += f"[o{len(layers)}]fade=t=out:st={dur - fade_out}:d={fade_out},format=yuv420p[v]"
    proc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{zh}", "-r", str(FPS), "-i", "-", *inputs,
         "-filter_complex", fc, "-map", "[v]", "-frames:v", str(frames),
         "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-r", str(FPS), dst],
        stdin=subprocess.PIPE)
    for f in range(frames):
        z = 1 + zoom * f / frames                       # smooth sub-pixel push-in
        cw, ch = sw / z, sh / z
        M = np.float32([[W / cw, 0, -(sw - cw) / 2 * W / cw],
                        [0, zh / ch, -(sh - ch) / 2 * zh / ch]])
        frame = cv2.warpAffine(img, M, (W, zh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        if sweep:
            p = (f / FPS - sweep["start"]) / sweep["dur"]
            if -0.2 < p < 1.2:
                m = cv2.warpAffine(mask, M, (W, zh), flags=cv2.INTER_LINEAR)
                cx = -0.25 * W + p * 1.5 * W
                band = np.exp(-(((xx - cx) + 0.45 * (yy - zh / 2)) / (0.06 * W)) ** 2)
                warm = np.array([1.0, 0.93, 0.8], np.float32)
                frame = 1 - (1 - frame) * (1 - (band * m * sweep["strength"])[..., None] * warm)
        proc.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())
    proc.stdin.close()
    if proc.wait():
        raise RuntimeError("end card encode failed")


def main():
    cfg = json.load(open(sys.argv[1]))
    work = cfg.get("work_dir", "work")
    os.makedirs(work, exist_ok=True)

    parts, t, starts = [], 0.0, {}
    for i, shot in enumerate(cfg["shots"]):
        src = fetch(shot["src"], os.path.join(work, f"src_{shot['name']}.mp4"))
        dst = os.path.join(work, f"shot_{i:02d}_{shot['name']}.mp4")
        dur = render_shot(src, shot["in"], shot["out"], dst, shot.get("fade_in", 0),
                          shot.get("focus", 0.5))
        starts[shot["name"]] = t
        parts.append(dst)
        t += dur

    ec = cfg["endcard"]
    hero_src = os.path.join(work, f"src_{ec['from_shot']}.mp4")
    ec_path = os.path.join(work, "shot_99_endcard.mp4")
    render_endcard(hero_src, ec["duration"], ec_path, ec, work)
    starts["endcard"] = t
    parts.append(ec_path)
    total = t + ec["duration"]

    concat = os.path.join(work, "concat.txt")
    with open(concat, "w") as f:
        f.writelines(f"file '{os.path.abspath(p)}'\n" for p in parts)
    picture = os.path.join(work, "picture.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", concat,
         "-c", "copy", picture])

    def at(ref):  # "shot+offset" -> absolute seconds
        name, off = ref
        return starts[name] + off

    vo_dir = os.path.join(work, "vo")
    os.makedirs(vo_dir, exist_ok=True)
    vo = [[fetch(v["src"], os.path.join(vo_dir, v["name"] + ".mp3")), at(v["at"]), v.get("gain", 1.0)]
          for v in cfg["vo"]]
    jv = [[fetch(v["src"], os.path.join(vo_dir, v["name"] + ".mp3")), v["gain"], v["pan"], v.get("shift", 0)]
          for v in cfg.get("jingle_vox", [])]
    timeline = {
        "duration": total,
        "crack_t": at(cfg["hits"]["crack"]),
        "land_t": at(cfg["hits"]["land"]),
        "jingle_t": starts["endcard"] + cfg["hits"].get("jingle_offset", 0.0),
        "jingle_vox_len": cfg.get("jingle_vox_len", 0),
        "sting_offset": ec["tag_in"] - cfg["hits"].get("jingle_offset", 0.0),
        "cuts": [starts[s["name"]] for s in cfg["shots"][1:]] + [starts["endcard"]],
        "ingredient_cuts": [[at(a), at(b), c] for a, b, c in cfg["ingredient_cuts"]],
        "creaks": cfg.get("creaks", [2.5, 9.0, 17.0, 24.0]),
        "vo": vo,
        "jingle_vox": jv,
        "fade_out": ec["fade_out"],
    }
    tl = os.path.join(work, "timeline.json")
    json.dump(timeline, open(tl, "w"), indent=1)
    mix = os.path.join(work, "mix.wav")
    run([sys.executable, os.path.join(HERE, "sound_design.py"), tl, mix])

    out = cfg.get("output", "PLUTO_TasteBeyondEarth.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", picture, "-i", mix,
         "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", "48000",
         "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart",
         "-c:a", "aac", "-b:a", "320k", "-shortest", out])
    print(json.dumps({"output": out, "duration": total, "starts": starts}, indent=1))


if __name__ == "__main__":
    main()

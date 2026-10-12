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
    chain = f"{pre},{GRADE}"
    if extra:
        chain += "," + extra
    return f"{chain},{HALATION},{GRAIN},pad={W}:{H}:0:{BAR}:black,format=yuv420p"


def render_shot(src, t_in, t_out, dst, fade_in=0.0, focus=0.5):
    dur = t_out - t_in
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
    for name, text, font, y, tracking in (
            ("title", cfg.get("title", "PLUTO"), big, cfg["title_y"], 38),
            ("tag", cfg.get("tagline", "Taste beyond earth."), small, cfg["tag_y"], 9)):
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        spaced(ImageDraw.Draw(layer), y, text, font, tracking)
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        shadow.putalpha(layer.split()[3].filter(ImageFilter.GaussianBlur(14)).point(lambda a: int(a * 0.85)))
        glow = layer.filter(ImageFilter.GaussianBlur(6))
        comp = Image.alpha_composite(shadow, glow)
        comp = Image.alpha_composite(comp, layer)
        if name == "title" and cfg.get("shade", 0):
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
        paths.append(p)
    return paths


def render_endcard(src, dur, dst, cfg, work):
    """Freeze the hero's last frame, slow push-in, vignette, titles, fade out."""
    still = os.path.join(work, "endcard_still.png")
    run(["ffmpeg", "-v", "error", "-y", "-sseof", "-0.08", "-i", src, "-frames:v", "1",
         "-vf", f"scale={W * 2}:-2:flags=lanczos", still])
    title, tag = title_layers(cfg, work)
    frames = int(round(dur * FPS))
    zoom = cfg.get("zoom", 0.07)
    sw, sh = Image.open(still).size
    zh = int(round(W * sh / sw / 2)) * 2
    focus = cfg.get("focus", 0.5)
    cy = int(max(0, min(zh - SCOPE_H, zh * focus - SCOPE_H / 2)))
    t_title, t_tag = cfg["title_in"], cfg["tag_in"]
    fade_out = cfg["fade_out"]
    fc = (
        f"[0:v]zoompan=z='1+{zoom}*on/{frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":d={frames}:s={W}x{zh}:fps={FPS},"
        f"crop={W}:{SCOPE_H}:0:{cy},{GRADE},{HALATION},{GRAIN},"
        f"pad={W}:{H}:0:{BAR}:black[bg];"
        f"[1:v]format=rgba,fade=t=in:st={t_title}:d=1.2:alpha=1[t1];"
        f"[2:v]format=rgba,fade=t=in:st={t_tag}:d=1.0:alpha=1[t2];"
        f"[bg][t1]overlay=0:0:shortest=1[o1];[o1][t2]overlay=0:0:shortest=1,"
        f"fade=t=out:st={dur - fade_out}:d={fade_out},format=yuv420p[v]"
    )
    run(["ffmpeg", "-v", "error", "-y", "-i", still,
         "-loop", "1", "-t", f"{dur}", "-i", title, "-loop", "1", "-t", f"{dur}", "-i", tag,
         "-filter_complex", fc, "-map", "[v]", "-frames:v", str(frames),
         "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-r", str(FPS), dst])


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
          for v in cfg["jingle_vox"]]
    timeline = {
        "duration": total,
        "crack_t": at(cfg["hits"]["crack"]),
        "land_t": at(cfg["hits"]["land"]),
        "jingle_t": starts["endcard"] + cfg["hits"].get("jingle_offset", 0.0),
        "jingle_vox_len": cfg["jingle_vox_len"],
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

"""Compose KanaGO's App Store screenshots (v7) from real app captures.

Each panel is an HTML page rendered by headless Chrome at the exact upload size, then
flattened to opaque RGB with ffmpeg. Needs Google Chrome, ffmpeg and the SF Pro Rounded
fonts in /Library/Fonts. English is the default for both marketing copy and app UI.
Source PNGs in design/appstore/captures/<locale> take precedence over the site's shots.
The baked-in capture island is removed; the original SVG frame supplies one island.

    python3 scripts/appstore_assets.py                 # full export
    python3 scripts/appstore_assets.py --draft DIR     # 1206 × 2622 panels + preview only
    python3 scripts/appstore_assets.py --draft DIR --theme vivid
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "design/appstore"
ASSETS = ROOT / "site/app/assets"
CHROME = os.environ.get("KANAGO_CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
W, H = 1206, 2622
SIZES = [(1206, 2622), (1320, 2868)]
VERSION = 7
DEFAULT_LOCALE = "en-US"
SOURCE_URLS: dict[tuple[str, str], str] = {}

# One grid for every panel. The frame (1406 × 2822) holds a 1206 × 2622 screen at (100, 100).
# PHONE_Y puts the canvas edge at screen y ≈ 2380, just above the tab bar, so it is never sliced.
PHONE_W = 1040
K = PHONE_W / 1406
PHONE_X = (W - PHONE_W) / 2
PHONE_Y = 788


def source_path(name: str, locale: str) -> Path:
    capture = OUT / "captures" / locale / f"{name}.png"
    site_shots = ASSETS / "shots" / ("es" if locale == "es-ES" else "")
    source = capture if capture.exists() else site_shots / f"{name}.webp"
    if not source.exists():
        raise SystemExit(f"Missing real {locale} app capture: {name}. No other-language fallback is allowed.")
    return source


def shot(name: str, locale: str) -> str:
    return SOURCE_URLS.get((name, locale), source_path(name, locale).as_uri())


def prepare_sources(locale: str, work: Path) -> None:
    """Normalize only the simulator's hardware mask, preserving all app pixels.

    iOS can bake the island into the framebuffer even with --mask=ignored. Only
    erase it when its surrounding ring is a single flat color; otherwise stop.
    """
    for panel in PANELS:
        name = panel["source"]
        source = source_path(name, locale)
        dimensions = subprocess.check_output([
            "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
            "-of", "csv=p=0", str(source)], text=True).strip()
        if dimensions != f"{W},{H}":
            raise SystemExit(f"{source}: expected {W} × {H}, got {dimensions}")
        pixels = subprocess.check_output([
            "ffmpeg", "-v", "error", "-i", str(source), "-vf", "crop=400:134:403:30,format=rgb24",
            "-frames:v", "1", "-f", "rawvideo", "-"])
        def pixel(x: int, y: int) -> bytes:
            offset = (y * 400 + x) * 3
            return pixels[offset:offset + 3]
        if pixel(200, 67) != b"\x00\x00\x00":
            SOURCE_URLS[name, locale] = source.as_uri()
            continue
        ring = {pixel(x, y) for x in range(400) for y in (0, 133)}
        ring.update(pixel(x, y) for y in range(134) for x in (0, 399))
        if len(ring) != 1:
            raise SystemExit(f"{source}: background around the capture island is not flat; recapture before exporting.")
        color = next(iter(ring)).hex()
        clean = work / f"{locale}-{name}-clean.png"
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-i", str(source), "-vf",
            f"drawbox=x=409:y=36:w=388:h=122:color=0x{color}:t=fill,format=rgb24",
            "-frames:v", "1", str(clean)], check=True)
        SOURCE_URLS[name, locale] = clean.as_uri()
        print(f"{locale}/{name}: removed capture island; kept SVG frame island")


def asset(path: str) -> str:
    return (ASSETS / path).as_uri()


def screen_y(y: float, top: float = PHONE_Y) -> float:
    return top + (100 + y) * K


def phone_top(cut_y: float) -> float:
    """Place the canvas edge in a deliberate gap in the source UI."""
    return H - (100 + cut_y) * K


def phone(name: str, locale: str, top: float = PHONE_Y) -> str:
    return (f'<div class="phone" style="left:{PHONE_X}px;top:{top}px;width:{PHONE_W}px">'
            f'<div class="screen"><img src="{shot(name, locale)}"></div></div>')


def lift(name: str, locale: str, box: tuple[int, int, int, int], top: float = PHONE_Y, scale=.88, radius=78, dy=0.0) -> str:
    """One real card, lifted straight off the phone and centred on the spot it occupies."""
    x0, y0, x1, y1 = box
    cx = PHONE_X + (100 + (x0 + x1) / 2) * K
    cy = screen_y((y0 + y1) / 2, top) + dy
    w, h = (x1 - x0) * scale, (y1 - y0) * scale
    return (f'<div class="lift" style="left:{cx - w / 2:.1f}px;top:{cy - h / 2:.1f}px;width:{w:.1f}px;height:{h:.1f}px;'
            f'border-radius:{radius * scale:.1f}px">'
            f'<img src="{shot(name, locale)}" style="width:{W * scale:.1f}px;left:{-x0 * scale:.1f}px;top:{-y0 * scale:.1f}px"></div>')


def pet(name: str, x: float, y: float, width: float, rotate=0.0, glow=False, behind=False) -> str:
    halo = '<div class="halo"></div>' if glow else ""
    layer = "pet behind" if behind else "pet"
    return (f'<div class="{layer}" style="left:{x}px;top:{y}px;width:{width}px;transform:rotate({rotate}deg)">'
            f'{halo}<img src="{asset(f"kana/pet-{name}.svg")}"></div>')


def phone_pet(name: str, top: float = PHONE_Y, height=270, glow=False, drop=18, offset_x=0, behind=True) -> str:
    """Place an upright mascot partly behind the phone, with one deliberate offset for Path."""
    art = {"wow": 911 / 1130, "study": 832 / 1104, "alarm": 959 / 936, "party": 871 / 951, "hello": 1061 / 1164,
           "wave": 871 / 954, "happy": 867 / 1190, "cool": 845 / 1041, "peek": 602 / 840}[name]
    width = height / art
    return pet(name, (W - width) / 2 + offset_x, top + 46 + drop - height, width, glow=glow, behind=behind)


def header(label: str, jp: str, lines: list[str], sub: str, top=170, note="") -> str:
    tag = f'<div class="label"><b>{jp}</b><i></i>{label}</div>' if label else ""
    title = "".join(f"<span>{line}</span>" for line in lines)
    extra = f'<small>{note}</small>' if note else ""
    return f'<header style="top:{top}px">{tag}<h1>{title}</h1><p>{sub}</p>{extra}</header>'


CSS = """
@font-face { font-family: R; font-weight: 500; src: url(file:///Library/Fonts/SF-Pro-Rounded-Medium.otf); }
@font-face { font-family: R; font-weight: 600; src: url(file:///Library/Fonts/SF-Pro-Rounded-Semibold.otf); }
@font-face { font-family: R; font-weight: 700; src: url(file:///Library/Fonts/SF-Pro-Rounded-Bold.otf); }
@font-face { font-family: R; font-weight: 800; src: url(file:///Library/Fonts/SF-Pro-Rounded-Heavy.otf); }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1206px; height: 2622px; overflow: hidden; background: var(--b2); }
body { position: relative; font-family: R, system-ui; -webkit-font-smoothing: antialiased; }
.canvas { position: absolute; inset: 0; overflow: hidden;
  background: radial-gradient(75% 34% at 50% 66%, var(--tint), transparent 100%),
              radial-gradient(90% 28% at 50% -4%, var(--top), transparent 100%),
              linear-gradient(180deg, var(--b1), var(--b2)); }
header { position: absolute; left: 70px; right: 70px; z-index: 5; text-align: center; color: var(--ink); }
.label { display: inline-flex; align-items: center; gap: 16px; font: 700 34px R; letter-spacing: .01em; color: var(--label); }
.label b { font: 600 32px "Hiragino Maru Gothic ProN"; font-weight: 400; letter-spacing: .06em; }
.label i { width: 8px; height: 8px; border-radius: 4px; background: currentColor; opacity: .45; }
h1 { margin-top: 24px; font: 800 126px/1.02 R; letter-spacing: -.035em; }
h1 span { display: block; }
h1 span + span { color: var(--accent); }
header p { margin-top: 34px; font: 500 44px/1.3 R; letter-spacing: -.012em; color: var(--sub); }
header small { display: block; margin-top: 18px; font: 600 28px R; color: var(--note); letter-spacing: .01em; }
.phone { position: absolute; aspect-ratio: 1406 / 2822; z-index: 2;
  filter: drop-shadow(0 60px 70px var(--shade)) drop-shadow(0 14px 18px var(--shade2)); }
.phone::before { content: ""; position: absolute; inset: 1.88% 3.84%; border-radius: 26% / 12.9%; background: #000; }
.phone::after { content: ""; position: absolute; inset: 0; z-index: 2; background: url(FRAME) center / 100% 100% no-repeat; }
.screen { position: absolute; left: 7.112%; top: 3.544%; width: 85.775%; height: 92.913%;
  border-radius: 10.78% / 4.96%; overflow: hidden; background: #000; }
.screen img { display: block; width: 100%; height: 100%; }
.lift { position: absolute; z-index: 6; overflow: hidden; background: #fff;
  box-shadow: 0 2px 3px rgba(35,33,39,.06), 0 22px 40px -10px var(--shade), 0 70px 110px -30px var(--shade); }
.lift img { position: absolute; max-width: none; }
.pet { position: absolute; z-index: 7; }
.pet.behind { z-index: 1; }
.pet img { position: relative; display: block; width: 100%; filter: drop-shadow(0 22px 26px var(--shade2)); }
.halo { position: absolute; inset: -30%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(242,58,124,.9) 0, rgba(242,58,124,.9) 55%, rgba(242,58,124,.36) 75%, transparent 100%); }
.logo { position: absolute; left: 50%; transform: translateX(-50%); z-index: 5; }
""".replace("FRAME", asset("iphone-frame.svg"))

# Feature tints are the app's fills (KanaGO/Design/Theme.swift) softened to a pastel aura.
TINTS = {"pink": "#FFC6DA", "sky": "#C7E3FF", "mint": "#C4EDD7", "grape": "#DDD0FF", "sun": "#FFE6A6"}
# Paper backgrounds: near-white at the headline, the feature's pastel where the phone sits.
PAPERS = {"pink": ("#FFF8FA", "#FFE3ED"), "sky": ("#F7FBFF", "#DDECFF"), "mint": ("#F5FCF8", "#D9F2E4"),
          "grape": ("#FAF7FF", "#E7DFFF"), "sun": ("#FFFCF3", "#FFEFC9")}

THEMES = {
    # Paper: the app's cream, ink type, brand pink accent; each panel carries its feature's aura.
    "paper": dict(top="rgba(255,255,255,.95)", ink="#232127", accent="#F23A7C",
                  label="#C2255B", sub="#6B6670", note="#9A95A0", shade="rgba(86,40,62,.20)",
                  shade2="rgba(86,40,62,.12)"),
    # Vivid: the widgets' pink gradient everywhere, white type.
    "vivid": dict(b1="#FF6FA0", b2="#D92A6B", top="rgba(255,190,214,.55)", ink="#FFFFFF", accent="#FFFFFF",
                  label="#FFFFFF", sub="rgba(255,255,255,.88)", note="rgba(255,255,255,.75)",
                  shade="rgba(110,8,48,.40)", shade2="rgba(110,8,48,.24)", tint="rgba(255,255,255,.18)"),
    # Ink: the app's dark surface with a pink glow.
    "ink": dict(b1="#211D25", b2="#0F0D12", top="rgba(242,58,124,.28)", ink="#FFFFFF", accent="#FF6F9C",
                label="#FF6F9C", sub="rgba(255,255,255,.70)", note="rgba(255,255,255,.5)",
                shade="rgba(0,0,0,.6)", shade2="rgba(0,0,0,.4)", tint="rgba(242,58,124,.30)"),
}


def inicio(theme: str, locale: str) -> str:
    top = 984  # canvas edge falls between the word of the day and its meaning
    logo = "logo.svg"
    return "".join([
        f'<img class="logo" src="{asset(logo)}" style="top:92px;width:220px">',
        header("", "", ["Japanese,", "one day at a time."] if locale == "en-US" else ["Japonés,", "un día a la vez."],
               "Little lessons with Kana-chan." if locale == "en-US" else "Lecciones cortas con Kana-chan.", top=292),
        phone("home", locale, top),
        phone_pet("peek", top=top, height=440 * 602 / 840, glow=theme == "ink", drop=0, behind=False),
    ])


def kana(theme: str, locale: str) -> str:
    top = phone_top(2224)  # gap between the T and N rows; Gojūon remains above the lift
    return "".join([
        header("Hiragana & katakana" if locale == "en-US" else "Hiragana y katakana", "かな",
               ["Master", "your kana."] if locale == "en-US" else ["Domina", "el kana."],
               "Listen, trace, and practice every sound." if locale == "en-US" else "Escucha, traza y repasa cada sonido."),
        phone("kana", locale, top),
        lift("kana", locale, (60, 1305, 1146, 1605), top=top),
        phone_pet("wow", top=top, drop=36, glow=theme == "ink"),
    ])


def ruta(theme: str, locale: str) -> str:
    top = phone_top(2278) if locale == "en-US" else PHONE_Y  # gap between locked nodes, safely above the tab bar
    return "".join([
        header("A guided path" if locale == "en-US" else "Ruta guiada", "みち",
               ["From kana", "to N1."] if locale == "en-US" else ["Del kana", "al N1."],
               "A clear path, one lesson at a time." if locale == "en-US" else "Una ruta clara, lección a lección."),
        phone("path", locale, top),
        lift("path", locale, (62, 1295, 1145, 1563) if locale == "en-US" else (62, 1397, 1145, 1663), top=top, radius=80),
        phone_pet("party", top=top, height=340, drop=48, offset_x=-110, glow=theme == "ink"),
    ])


def historias(theme: str, locale: str) -> str:
    top = phone_top(2292)  # gap after the fourth story, before the next row and tab bar
    return "".join([
        header("Stories" if locale == "en-US" else "Historias", "よむ",
               ["Read real", "Japanese."] if locale == "en-US" else ["Lee japonés", "de verdad."],
               "Stories at your level. Tap to translate." if locale == "en-US" else "Historias a tu nivel. Toca y traduce."),
        phone("read", locale, top),
        lift("read", locale, (62, 1080, 1145, 1336), top=top),
        phone_pet("study", top=top, glow=theme == "ink"),
    ])


def habla(theme: str, locale: str) -> str:
    top = phone_top(2292) if locale == "en-US" else PHONE_Y
    return "".join([
        header("Conversation" if locale == "en-US" else "Conversación", "はなす",
               ["Speak like", "you're in Tokyo."] if locale == "en-US" else ["Habla como", "en Tokio."],
               "Shops, restaurants, hotels. Real situations." if locale == "en-US" else "Tienda, restaurante, hotel: situaciones reales."),
        phone("talk", locale, top),
        lift("talk", locale, (62, 1080, 1145, 1336) if locale == "en-US" else (62, 1113, 1145, 1370), top=top),
        phone_pet("wave", top=top, glow=theme == "ink"),
    ])


def jlpt(theme: str, locale: str) -> str:
    top = phone_top(2110)  # clean blank area below the selected answer, before the feedback panel
    return "".join([
        header("Practice tests" if locale == "en-US" else "Exámenes de práctica", "しけん",
               ["Get ready", "for the JLPT."] if locale == "en-US" else ["Llega listo", "al JLPT."],
               "Timed practice tests, N5 to N1." if locale == "en-US" else "Simulacros N5–N1 con cronómetro.",
               note="Independent practice · Unofficial" if locale == "en-US" else "Práctica independiente · No oficial"),
        phone("exam", locale, top),
        lift("exam", locale, (62, 1452, 1145, 1620), top=top, radius=62),
        phone_pet("alarm", top=top, height=340, drop=28, glow=theme == "ink"),
    ])


PANELS = [
    dict(slug="01-inicio", tint="pink", build=inicio, title="Japonés, un día a la vez.", source="home"),
    dict(slug="02-kana", tint="pink", build=kana, title="Domina el kana.", source="kana"),
    dict(slug="03-ruta", tint="sky", build=ruta, title="Del kana al N1.", source="path"),
    dict(slug="04-historias", tint="sun", build=historias, title="Lee japonés de verdad.", source="read"),
    dict(slug="05-habla", tint="mint", build=habla, title="Habla como en Tokio.", source="talk"),
    dict(slug="06-jlpt", tint="grape", build=jlpt, title="Llega listo al JLPT.", source="exam"),
]


ENGLISH_PANELS = [
    ("01-home", "Japanese, one day at a time."),
    ("02-kana", "Master your kana."),
    ("03-path", "From kana to N1."),
    ("04-stories", "Read real Japanese."),
    ("05-speak", "Speak like you're in Tokyo."),
    ("06-jlpt", "Get ready for the JLPT."),
]


def panels_for(locale: str) -> list[dict]:
    if locale == "es-ES":
        return PANELS
    return [dict(panel, slug=slug, title=title) for panel, (slug, title) in zip(PANELS, ENGLISH_PANELS)]


def page(panel: dict, theme: str, zoom_factor: float, locale: str = DEFAULT_LOCALE) -> str:
    values = dict(THEMES[theme])
    values.setdefault("tint", TINTS[panel["tint"]])
    values.setdefault("b1", PAPERS[panel["tint"]][0])
    values.setdefault("b2", PAPERS[panel["tint"]][1])
    variables = ";".join(f"--{k}:{v}" for k, v in values.items())
    return (f'<!doctype html><html lang="{locale}" style="zoom:{zoom_factor}"><head><meta charset="utf-8"><style>{CSS}</style></head>'
            f'<body style="{variables}"><div class="canvas">{panel["build"](theme, locale)}</div></body></html>')


def render(html: str, size: tuple[int, int], dest: Path, work: Path) -> None:
    source = work / f"{dest.stem}-{size[0]}.html"
    raw = work / f"{dest.stem}-{size[0]}.png"
    source.write_text(html)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
                    "--force-device-scale-factor=1", f"--window-size={size[0]},{size[1] + 128}",
                    "--virtual-time-budget=4000", f"--screenshot={raw}", source.as_uri()],
                   check=True, capture_output=True)
    # Chrome's window can reserve 87 px outside the viewport. Render past the
    # canvas edge, then crop it exactly, so composited phones cannot leave a footer.
    flatten(raw, dest, size, crop=True)


def flatten(source: Path, dest: Path, size: tuple[int, int], crop=False) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    geometry = f"crop={size[0]}:{size[1]}:0:0" if crop else f"scale={size[0]}:{size[1]}:flags=lanczos"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(source),
                    "-vf", f"{geometry},format=rgb24", "-frames:v", "1", str(dest)], check=True)


def contact_sheet(images: list[Path], dest: Path, columns: int, thumb_w: int, gap=24) -> None:
    inputs = sum((["-i", str(p)] for p in images), [])
    scaled = "".join(f"[{i}:v]scale={thumb_w}:-1:flags=lanczos[s{i}];" for i in range(len(images)))
    th = round(thumb_w * H / W)
    layout = "|".join(f"{(i % columns) * (thumb_w + gap)}_{(i // columns) * (th + gap)}" for i in range(len(images)))
    graph = (scaled + "".join(f"[s{i}]" for i in range(len(images))) +
             f"xstack=inputs={len(images)}:layout={layout}:fill=#E9E5E1,"
             f"pad=iw+{gap * 2}:ih+{gap * 2}:{gap}:{gap}:color=#E9E5E1,format=rgb24")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", graph, "-frames:v", "1", str(dest)],
                   check=True)


def draft(directory: Path, theme: str, locale: str) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        prepare_sources(locale, Path(tmp))
        for panel in panels_for(locale):
            render(page(panel, theme, 1, locale), (W, H), directory / f"{panel['slug']}.png", Path(tmp))
    contact_sheet(sorted(directory.glob("0*.png")), directory / "preview.png", 3, 480)


def export(theme: str, locale: str) -> None:
    metadata = []
    with tempfile.TemporaryDirectory() as tmp:
        prepare_sources(locale, Path(tmp))
        for old in (OUT / locale).glob("*/*.png"):
            old.unlink()
        for panel in panels_for(locale):
            for width, height in SIZES:
                dest = OUT / locale / f"iphone-{width}x{height}" / f"{panel['slug']}.png"
                render(page(panel, theme, width / W, locale), (width, height), dest, Path(tmp))
                metadata.append(dict(file=str(dest.relative_to(OUT)), width=width, height=height, mode="RGB",
                                     source=panel["source"], title=panel["title"], locale=locale,
                                     theme=theme, version=VERSION, dynamic_island="SVG frame only"))
            flatten(OUT / locale / "iphone-1206x2622" / f"{panel['slug']}.png",
                    OUT / locale / "preview-459x998" / f"{panel['slug']}.png", (459, 998))
    uploads = sorted((OUT / locale / "iphone-1206x2622").glob("*.png"))
    contact_sheet(uploads, OUT / "preview.png", 3, 480)
    contact_sheet(uploads, OUT / "preview-strip.png", 6, 300)
    (OUT / "manifest.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
    with ZipFile(OUT / f"KanaGO-AppStore-{'en' if locale == 'en-US' else 'es'}.zip", "w", ZIP_DEFLATED) as package:
        for width, height in SIZES:
            for path in sorted((OUT / locale / f"iphone-{width}x{height}").glob("*.png")):
                package.write(path, str(path.relative_to(OUT / locale)))
        for name in ["README.md", "design.md", "manifest.json", "preview.png", "preview-strip.png"]:
            package.write(OUT / name, name)
    print(f"Created {len(PANELS)} {locale} panels × {len(SIZES)} upload sizes + previews in {OUT}")


if __name__ == "__main__":
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg is required")
    parser = argparse.ArgumentParser()
    parser.add_argument("--draft", type=Path, help="render 1206 × 2622 panels and a preview into this folder only")
    parser.add_argument("--compare", action="store_true", help="also write themes.png: panels 01 and 03 in every theme")
    parser.add_argument("--theme", default="paper", choices=sorted(THEMES))
    parser.add_argument("--locale", default=DEFAULT_LOCALE, choices=["en-US", "es-ES"], help="language for both copy and real app captures")
    args = parser.parse_args()
    if args.draft:
        draft(args.draft, args.theme, args.locale)
    else:
        export(args.theme, args.locale)
    if args.compare:
        with tempfile.TemporaryDirectory() as tmp:
            shots = []
            prepare_sources(args.locale, Path(tmp))
            for theme in THEMES:
                localized = panels_for(args.locale)
                for panel in (localized[0], localized[2]):
                    dest = Path(tmp) / f"{theme}-{panel['slug']}.png"
                    render(page(panel, theme, 1, args.locale), (W, H), dest, Path(tmp))
                    shots.append(dest)
            contact_sheet(shots, OUT / "themes.png", 6, 300)

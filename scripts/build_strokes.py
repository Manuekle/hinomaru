#!/usr/bin/env python3
"""Builds KanaGO/Resources/Data/strokes.json from KanjiVG.

Only the characters the app asks learners to write are kept: every kana in alphabet.json
plus each character of the short kana/kanji cards in decks.json (the same rule as
LessonItem.writable and WriteSession.writable). Each stroke becomes a polyline in KanjiVG's
109×109 box, sampled every ~2 units along the curve, in writing order.

    curl -LO https://github.com/KanjiVG/kanjivg/releases/download/r20260714/kanjivg-20260714.xml.gz
    python3 scripts/build_strokes.py kanjivg-20260714.xml.gz

KanjiVG © Ulrich Apel, CC BY-SA 3.0 (https://kanjivg.tagaini.net) — strokes.json is a
derived work under the same licence; the app credits it in Ajustes.
"""
import gzip
import json
import math
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "KanaGO/Resources/Data"
OUT = DATA / "strokes.json"
SPACING = 2.0


def is_writable_char(ch):
    o = ord(ch)
    return 0x3040 <= o <= 0x30FF or 0x4E00 <= o <= 0x9FAF


def wanted_chars():
    chars = set()

    def walk(node):
        if isinstance(node, dict):
            jp = node.get("jp")
            if isinstance(jp, str) and "romaji" in node:
                jp = jp.strip()
                if 1 <= len(jp) <= 3:
                    chars.update(c for c in jp if is_writable_char(c))
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(json.loads((DATA / "alphabet.json").read_text()))
    walk(json.loads((DATA / "decks.json").read_text()))
    return chars


TOKEN = re.compile(r"[MmCcSsLlZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?")


def bezier(p0, p1, p2, p3, steps=24):
    out = []
    for i in range(1, steps + 1):
        t = i / steps
        u = 1 - t
        out.append((
            u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
        ))
    return out


def flatten(d):
    """SVG path data (KanjiVG only uses M/m, C/c, S/s) to a dense polyline."""
    tokens = TOKEN.findall(d)
    pts, cur, start, last_ctrl, cmd, i = [], (0.0, 0.0), (0.0, 0.0), None, None, 0

    def nums(n):
        nonlocal i
        vals = [float(t) for t in tokens[i:i + n]]
        i += n
        return vals

    while i < len(tokens):
        if tokens[i].isalpha():
            cmd = tokens[i]
            i += 1
            if cmd in "Zz":
                pts.append(start)
                cur = start
                continue
        rel = cmd.islower()
        c = cmd.upper()
        ox, oy = cur if rel else (0.0, 0.0)
        if c == "M":
            x, y = nums(2)
            cur = start = (ox + x, oy + y)
            pts.append(cur)
            cmd = "l" if rel else "L"  # extra pairs after M are line-tos
            last_ctrl = None
        elif c == "L":
            x, y = nums(2)
            cur = (ox + x, oy + y)
            pts.append(cur)
            last_ctrl = None
        elif c == "C":
            x1, y1, x2, y2, x, y = nums(6)
            p1, p2, p3 = (ox + x1, oy + y1), (ox + x2, oy + y2), (ox + x, oy + y)
            pts += bezier(cur, p1, p2, p3)
            cur, last_ctrl = p3, p2
        elif c == "S":
            x2, y2, x, y = nums(4)
            p1 = (2 * cur[0] - last_ctrl[0], 2 * cur[1] - last_ctrl[1]) if last_ctrl else cur
            p2, p3 = (ox + x2, oy + y2), (ox + x, oy + y)
            pts += bezier(cur, p1, p2, p3)
            cur, last_ctrl = p3, p2
        else:
            raise ValueError(f"unsupported path command {cmd} in {d}")
    return pts


def resample(pts, spacing=SPACING):
    """Evenly spaced points along the polyline, keeping both ends."""
    seg = [math.dist(a, b) for a, b in zip(pts, pts[1:])]
    total = sum(seg)
    n = max(2, round(total / spacing) + 1)
    out, j, acc = [pts[0]], 0, 0.0
    for k in range(1, n - 1):
        target = total * k / (n - 1)
        while j < len(seg) - 1 and acc + seg[j] < target:
            acc += seg[j]
            j += 1
        t = (target - acc) / seg[j] if seg[j] else 0
        a, b = pts[j], pts[j + 1]
        out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    out.append(pts[-1])
    return out


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    raw = gzip.open(src).read() if src.suffix == ".gz" else src.read_bytes()
    root = ET.fromstring(raw)
    wanted = wanted_chars()
    out = {}
    for kanji in root.iter("kanji"):
        m = re.fullmatch(r"kvg:kanji_([0-9a-f]+)", kanji.get("id", ""))
        if not m:
            continue  # stylistic variants (-Kaisho, -Vert…)
        ch = chr(int(m.group(1), 16))
        if ch not in wanted:
            continue
        paths = [p for p in kanji.iter() if p.tag == "path"]
        paths.sort(key=lambda p: int(re.search(r"-s(\d+)$", p.get("id")).group(1)))
        strokes = []
        for p in paths:
            poly = resample(flatten(p.get("d")))
            strokes.append([round(v, 1) for xy in poly for v in xy])
        out[ch] = strokes
    missing = sorted(wanted - out.keys())
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":"), sort_keys=True))
    print(f"{len(out)} characters, {sum(len(s) for s in out.values())} strokes → {OUT.relative_to(ROOT)} "
          f"({OUT.stat().st_size // 1024} KB)")
    if missing:
        print("missing from KanjiVG:", "".join(missing))


if __name__ == "__main__":
    main()

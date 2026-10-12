#!/usr/bin/env python3
"""Clean a vectorized Kana-chan SVG for the app, widgets and site.

The vectorizer leaves tiny translucent slivers (fill-opacity 0.04-0.6) along the edges of
shapes; over the black body they show up as thin light lines. Everything else comes out at
0.98-0.99 opacity, which lets colored widget backgrounds tint the black body. This drops the
slivers, makes every remaining shape opaque and gives the file a real width/height (asset
catalogs read the size from it).

usage: clean_pet_svg.py in.svg out.svg
"""
import re
import sys

src, dst = sys.argv[1], sys.argv[2]
svg = open(src, encoding="utf-8").read()

def keep(m):
    style = m.group(2)
    op = re.search(r"fill-opacity:([\d.]+)", style)
    if op and float(op.group(1)) < 0.9:
        return ""
    style = re.sub(r"fill-opacity:[\d.]+;?", "", style).strip()
    return f'<path d="{m.group(1)}"' + (f' style="{style}"' if style else "") + "/>"

svg, n = re.subn(r'\s*<path d="([^"]*)" style="([^"]*)"\s*/>', lambda m: ("\n            " + keep(m)) if keep(m) else "", svg)
svg = re.sub(r"<!DOCTYPE[^>]*>\s*", "", svg)
svg = re.sub(r'\s*xmlns:affinity="[^"]*"', "", svg)
vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
svg = re.sub(r'width="100%" height="100%"', f'width="{vb.group(1)}" height="{vb.group(2)}"', svg, count=1)
open(dst, "w", encoding="utf-8").write(svg)

before = len(re.findall(r"<path ", open(src, encoding="utf-8").read()))
after = len(re.findall(r"<path ", svg))
print(f"{src.split('/')[-1]}: {before} -> {after} paths")

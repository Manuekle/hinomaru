#!/usr/bin/env python3
"""Erase the Dynamic Island that iOS 27 simulators bake into screenshots.

The landing's iPhone frame (assets/iphone-frame.svg) draws its own island, so app shots must
come without one. `simctl io screenshot` paints it into the framebuffer even with
--mask=ignored, so this fills the pill with the background around it. It only does so when
that background is one flat colour (every KanaGO screen has a plain top); otherwise it stops
and leaves the file alone.

Usage: python3 scripts/remove_island.py in.png out.png
"""
import sys

from PIL import Image

# The island on a 1206 × 2622 iPhone 17/18 Pro screenshot, measured: x 415–790, y 42–151.
BOX = (409, 36, 797, 158)
RING = 6


def main(src, dst):
    im = Image.open(src).convert("RGB")
    if im.size != (1206, 2622):
        sys.exit(f"{src}: expected 1206 × 2622, got {im.size[0]} × {im.size[1]}")
    x0, y0, x1, y1 = BOX
    if im.getpixel(((x0 + x1) // 2, (y0 + y1) // 2)) != (0, 0, 0):
        im.save(dst)
        print(f"{dst}: no island")
        return
    ring = set()
    for x in range(x0 - RING, x1 + RING):
        ring.add(im.getpixel((x, y0 - RING)))
        ring.add(im.getpixel((x, y1 + RING)))
    for y in range(y0 - RING, y1 + RING):
        ring.add(im.getpixel((x0 - RING, y)))
        ring.add(im.getpixel((x1 + RING, y)))
    if len(ring) != 1:
        sys.exit(f"{src}: the background around the island isn't flat; erase it by hand")
    im.paste(ring.pop(), BOX)
    im.save(dst)
    print(f"{dst}: island removed")


if __name__ == "__main__":
    main(*sys.argv[1:3])

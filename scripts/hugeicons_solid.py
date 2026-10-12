# Usage: pip install skia-pathops picosvg, run hugeicons.js first, then: python3 hugeicons_solid.py <Assets.xcassets dir>
# Hugeicons' free set is stroke-only, so the solid twins (hi.<name>.fill) are built here from the
# outline SVGs: fill the silhouette, then knock the inner details out, like SF Symbols' .fill variants.
import json, os, sys
import pathops
from picosvg.svg import SVG
from picosvg.svg_pathops import skia_path
from picosvg.svg_types import SVGPath

W = 1.8  # matches STROKE in hugeicons.js
ROUND = dict(cap=pathops.LineCap.ROUND_CAP, join=pathops.LineJoin.ROUND_JOIN, miter_limit=4)


def P(d):
    return skia_path(SVGPath(d=d).as_cmd_seq(), "nonzero")


def circle(cx, cy, r):
    return P(f"M{cx - r} {cy}a{r} {r} 0 1 0 {2 * r} 0a{r} {r} 0 1 0 {-2 * r} 0Z")


def line(p, w=W):
    out = pathops.Path(p)
    out.stroke(w, ROUND["cap"], ROUND["join"], ROUND["miter_limit"])
    out.convertConicsToQuads()
    return out


def area(p, w=W):
    """The region a closed stroked shape covers once filled: interior plus its stroke."""
    return U(p, line(p, w))


def U(*ps):
    return pathops.op(ps[0], ps[1], pathops.PathOp.UNION) if len(ps) == 2 else U(U(ps[0], ps[1]), *ps[2:]) if len(ps) > 2 else ps[0]


def D(a, *cuts):
    for c in cuts:
        a = pathops.op(a, c, pathops.PathOp.DIFFERENCE)
    return a


def I(a, b):
    return pathops.op(a, b, pathops.PathOp.INTERSECTION)


def scaled(p, s, cx=12, cy=12):
    return p.transform(s, 0, 0, s, cx * (1 - s), cy * (1 - s))


SQUIRCLE = P("M2.5 12C2.5 7.52 2.5 5.28 3.89 3.89C5.28 2.5 7.52 2.5 12 2.5C16.48 2.5 18.72 2.5 20.11 3.89C21.5 5.28 21.5 7.52 21.5 12C21.5 16.48 21.5 18.72 20.11 20.11C18.72 21.5 16.48 21.5 12 21.5C7.52 21.5 5.28 21.5 3.89 20.11C2.5 18.72 2.5 16.48 2.5 12Z")

# e = the outline icon's shapes, in document order.
RECIPES = {
    # tab bar
    "home": lambda e: D(area(e[0]), line(e[1], W + 0.4)),
    "library": lambda e: U(area(e[0]), line(e[1]), line(e[2])),
    # the globe's circle carries a transform picosvg drops, so it is redrawn here
    "globe": lambda e: U(D(area(circle(13.5, 9, 7)), line(e[3]), line(e[4])), line(e[5]), line(e[0]), line(e[1])),
    "kana": lambda e: D(area(SQUIRCLE), *(line(scaled(p, 0.72), 1.6) for p in e)),
    "book": lambda e: D(U(area(e[0]), area(e[1])), line(P("M12 7V18.6"), 1.3)),
    "user": lambda e: D(area(e[2]), area(e[1]), I(area(_closed(e[0], "L5.5 23L18.5 23Z")), circle(12, 12, 8.4))),
    # learn modes
    "route": lambda e: U(D(area(e[0]), circle(18, 6, 1.5)), area(e[2]), line(e[3])),
    "cards": lambda e: U(D(area(e[0]), area(e[1])), line(e[2])),
    "exam": lambda e: U(area(e[0]), D(area(_closed(e[1], "Z")), line(e[0], W + 2.8)), area(e[2])),
    # roadmap nodes
    "dumbbell": lambda e: U(area(e[1]), area(e[2]), line(e[0]), line(e[3])),
    "headphones": lambda e: U(line(e[0]), area(e[1]), area(e[2])),
    "quiz": lambda e: D(area(e[0]), line(e[1]), line(e[2])),
    "crown": lambda e: U(D(area(e[2]), circle(12, 12.75, 1.3)), line(e[0])),
    "tick": lambda e: line(e[0], 2.6),
    "lock": lambda e: U(D(area(e[2]), area(e[0])), line(e[1])),
    # toggles and feedback
    "bookmark": lambda e: area(e[0]),
    "star": lambda e: area(e[0]),
    "checkCircle": lambda e: D(area(e[0]), line(e[1])),
    "cancelCircle": lambda e: D(area(e[0]), line(e[1])),
    "arrowRightCircle": lambda e: D(area(e[0]), line(e[1])),
    "subtitle": lambda e: D(area(e[0]), line(e[1]), line(e[2])),
    "play": lambda e: area(e[0]),
    "pause": lambda e: U(area(e[0]), area(e[1])),
    "sparkle": lambda e: area(e[0]),
    "bell": lambda e: U(area(e[1]), D(area(_closed(e[0], "Z")), line(e[1], W + 2.4))),
    # mascot stickers
    "heart": lambda e: area(e[0]),
    "heartbreak": lambda e: D(area(e[0]), line(e[1], 1.6)),
    "sun": lambda e: U(area(e[0]), line(e[1])),
    "exclamation": lambda e: U(line(P("M12 5V14.4"), 3.2), circle(12, 18.9, 1.8)),
    "fire": lambda e: area(e[0]),
    "droplet": lambda e: D(area(e[0]), line(e[1])),
}

_D = {}  # skia path id -> source d, to extend open paths


def _closed(p, tail):
    return P(_D[id(p)] + tail)


def _sub(p, i, tail=""):
    """The i-th subpath (split on M) of a multi-part source path."""
    parts = ["M" + s for s in _D[id(p)].split("M") if s.strip()]
    return P(parts[i] + tail)


def fmt(v):
    s = f"{v:.3f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def to_d(p):
    p = pathops.Path(p)
    p.convertConicsToQuads()
    p.simplify(fix_winding=True)
    cmd = {pathops.PathVerb.MOVE: "M", pathops.PathVerb.LINE: "L", pathops.PathVerb.QUAD: "Q",
           pathops.PathVerb.CUBIC: "C", pathops.PathVerb.CLOSE: "Z"}
    return "".join(cmd[verb] + " ".join(fmt(c) for pt in pts for c in pt) for verb, pts in p)


def main(xcassets):
    root = os.path.join(xcassets, "Hugeicons")
    for name, recipe in RECIPES.items():
        src = os.path.join(root, f"hi.{name}.imageset", f"{name}.svg")
        shapes = []
        for s in SVG.parse(src).shapes():
            path = s.as_path()
            sp = skia_path(path.as_cmd_seq(), "nonzero")
            _D[id(sp)] = path.d
            shapes.append(sp)
        d = to_d(recipe(shapes))
        dst = os.path.join(root, f"hi.{name}.fill.imageset")
        os.makedirs(dst, exist_ok=True)
        with open(os.path.join(dst, f"{name}.fill.svg"), "w") as f:
            f.write(f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="{d}" fill="#000000"/></svg>\n')
        with open(os.path.join(dst, "Contents.json"), "w") as f:
            json.dump({
                "images": [{"filename": f"{name}.fill.svg", "idiom": "universal"}],
                "info": {"author": "xcode", "version": 1},
                "properties": {"preserves-vector-representation": True, "template-rendering-intent": "template"},
            }, f, indent=2)
    # hand-drawn solids that replace a recipe: scripts/<name>.fill.svg
    here = os.path.dirname(os.path.abspath(__file__))
    for name in ("brush",):
        dst = os.path.join(root, f"hi.{name}.fill.imageset")
        os.makedirs(dst, exist_ok=True)
        with open(os.path.join(here, f"{name}.fill.svg")) as src, open(os.path.join(dst, f"{name}.fill.svg"), "w") as f:
            f.write(src.read())
        with open(os.path.join(dst, "Contents.json"), "w") as f:
            json.dump({
                "images": [{"filename": f"{name}.fill.svg", "idiom": "universal"}],
                "info": {"author": "xcode", "version": 1},
                "properties": {"preserves-vector-representation": True, "template-rendering-intent": "template"},
            }, f, indent=2)
    print(len(RECIPES) + 1, "solid icons")


if __name__ == "__main__":
    main(sys.argv[1])

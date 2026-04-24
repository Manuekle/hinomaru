# Fonts

Hinomaru uses two type families, both loaded from Google Fonts at runtime:

- **Inter Tight** — display + UI (Latin). 400 / 500 / 600 / 700.
- **Noto Sans JP** — Japanese (hiragana, katakana, kanji). 400 / 500 / 600 / 700.

They are imported in `colors_and_type.css` via a single `@import` statement, so no local font files are required.

## Substitution note

These are **flagged substitutions**. The user did not provide licensed brand fonts. If the team has a preferred sans-serif (e.g. a licensed Söhne, Founders Grotesk, or a custom face) and a preferred Japanese face, drop in `woff2` files here and update the `--font-ui` / `--font-jp` CSS variables.

Metric-matched guidance:
- Inter Tight → Söhne, Founders Grotesk, GT Walsheim, or Aeonik would all work with minimal layout drift.
- Noto Sans JP → Klim Söhne Japanese, TBUDGothic, or Hiragino Kaku Gothic.

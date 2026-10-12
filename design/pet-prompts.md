# Kana-chan: new poses for the widgets

The widgets change with the time of day (KanaGOWidget, `Moment`). Today they reuse the six pets we
have: love, wow, happy, meh, angry, sad. These new poses would give each moment its own Kana-chan,
the way Duolingo's widgets do.

## Delivery rules (all pets)

- SVG, transparent background, same look as `KanaGO/Assets.xcassets/Pets/*`. A PNG at 1200 px or
  more also works.
- Kana-chan sits on the bottom edge of the canvas. The widgets crop her at the bottom-right
  corner, so her face has to sit in the lower half of the canvas.
- Accessories (hearts, drops, Zzz, confetti) go at the top or the right, never at the left. The
  widget text is at the top-left and accessories on the left collide with it.
- No white die-cut border around the character. The user rejected it in the widgets.
- File names: `pet.<name>.svg`. They go in both asset catalogs (app and widget).

## Base style (paste it before every prompt)

> Kana-chan, a kawaii mascot for a Japanese-learning app: a chubby black ink-blob shaped like a
> rounded teardrop/onigiri, with a small pointed tip flicking up at the top right. Glossy near-black
> body (#1D1D1D) with a thick black outline and a soft gray highlight. A small pink spiral curl
> (#F28CA8) on the forehead. Big expressive white eyes drawn as rounded white shapes with black
> outlines, tiny stubby dark-gray hands. Flat vector sticker art, LINE-sticker style, bold clean
> outlines, flat colors with one subtle highlight, no gradients, no text. Accessory palette: pink
> #FF6F9C, warm yellow #FCD28D / #F5D57E, sky blue #5EC5FA, cream #FCF4E6. Transparent background,
> character resting on the bottom edge, centered, full body visible, accessories only on the top or
> right side.

## Poses

| File | Widget moment | Prompt (after the base style) |
|---|---|---|
| `pet.study` | `ready`, morning | Wearing a pink sports headband, holding a yellow pencil like a sword, determined happy eyes, small sparkle stars at the top right. Energetic "let's study!" pose. |
| `pet.wave` | `start`, not onboarded | Waving hello with one tiny hand raised high, big friendly open eyes, a small pink heart floating at the top right. Welcoming. |
| `pet.cool` | `done`, goal met early | Lounging relaxed, wearing round black sunglasses with a white glint, one hand behind the head, a small yellow sun sticker at the top right. Chill and proud. |
| `pet.party` | `done` on 7, 30 and 100-day streaks | Wearing a pink-and-yellow striped party hat, eyes squeezed shut with joy (^ ^), confetti and streamers bursting at the top and right, holding a tiny party popper. |
| `pet.melt` | `late`, evening | Starting to melt into a small black puddle at the bottom, worried wobbly eyes looking at the viewer, two big blue sweat drops at the top right. Nervous, still cute. |
| `pet.alarm` | `late`, alternative | Hugging a big yellow ringing alarm clock with motion lines, wide startled eyes, a blue "!" mark at the top right. |
| `pet.panic` | `last`, late night | Panicking, the top of the blob on fire with stylized orange-yellow flames, screaming mouth, spiral or teary eyes, tiny hands up in the air. Dramatic but cute, not scary. |
| `pet.sleep` | `lost`, the streak is gone | Asleep and slumped, eyes closed as gentle curves, a navy nightcap with a yellow pom-pom, "Z z" letters drifting up at the top right in sky blue. Calm, a little sad. |
| `pet.cry` | `lost`, alternative | Crying big cartoon tears that pool into a small blue puddle, a cracked pink heart at the top right. |
| `pet.peek` | Medium widgets, any moment | Only the top half of the blob peeking up from the bottom edge, both tiny hands gripping the edge, curious big eyes, pink curl visible. The bottom of the canvas cuts her at the hands. |

## Delivered (2026-10-12)

All ten arrived as `~/Downloads/7pet.svg` to `16pet.svg` and were cleaned with
`scripts/clean_pet_svg.py` (drops the vectorizer's translucent slivers, makes every shape opaque,
sets a real width/height):

| File | Pose |
|---|---|
| 7pet | `pet.wave` |
| 8pet | `pet.sleep` |
| 9pet | `pet.study` |
| 10pet | `pet.melt` |
| 11pet | `pet.alarm` |
| 12pet | `pet.cool` (sun's cream ring recolored amber; body and hands given the black outline the others have) |
| 13pet | `pet.panic` |
| 14pet | `pet.cry` (viewBox trimmed to the drawing) |
| 15pet | `pet.peek` |
| 16pet | `pet.party` |

## Where they go

`KanaGOWidget/Shared+Widget.swift` → `Moment.pet(_:at:)`:

| Moment | Pet |
|---|---|
| `start` | `pet.wave` |
| `ready` | `pet.study` |
| `going` | `pet.wow` |
| `done` | `pet.party` on milestone streaks (7, 14, 30, 50, 100…), otherwise `pet.cool` |
| `late` | `pet.alarm` until 20:00, then `pet.melt` |
| `last` | `pet.panic` |
| `lost` | `pet.sleep` at night (21:00–6:00), otherwise `pet.cry` |

The medium word-of-the-day widget uses `pet.peek`.

The landing (`site/app/index.html`, `#widgets` section) uses the same pets as `/assets/kana/pet-*.svg`.

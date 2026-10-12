# KanaGO! App Store screenshots — v7

The primary series is in **English**, including the real app interface: Home, Kana, Path, Stories, Speak, and JLPT. It keeps the approved paper design with a pastel for each feature, centered headlines, straight callouts, and Kana-chan peeking from behind the phone. Path has a larger mascot placed slightly left; JLPT has a larger centered mascot. The opening pose and the Stories and Speak illustrations keep their established character. Only the current English delivery is included.

The phone uses the original `iphone-frame.svg`, including its Dynamic Island. The island baked into simulator captures is removed before composition, so only the SVG island appears. The generator checks that the surrounding capture background is flat before removing the hardware mask; it stops if that check fails.

## Upload files

| Folder | Portrait dimensions | Use |
| --- | --- | --- |
| `iphone-1206x2622/` | 1206 × 2622 px | iPhone with Dynamic Island, medium display |
| `iphone-1320x2868/` | 1320 × 2868 px | iPhone with Dynamic Island, large display |

Each upload folder contains the same six numbered PNGs. Upload images are opaque RGB, without an alpha channel. `preview.png` and `preview-strip.png` are review sheets, not upload files. `KanaGO-AppStore-en.zip` contains all twelve upload PNGs, the manifest, documentation, and the primary review sheets.

Both upload dimensions are listed in [Apple’s screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/), checked October 12, 2026.

## Capture sources

All six primary screens were captured from the native SwiftUI app on the iPhone 17 Pro simulator. The captures were made with an isolated capture app using the fictional name Aki and selecting the relevant screen at launch. Temporary builds, draft renders, and source captures are not included in this final delivery. JLPT shows the first vocabulary question with its correct answer selected.

Conversation descriptions now follow the app’s selected language. Every bundled scenario has an English context; the list and conversation intro read it from the same localized model method. Japanese learning content remains Japanese.

Callouts crop the same app image shown inside the phone. Their coordinates are checked against the selected language. The logo, phone frame, and mascot illustrations are original project assets.

## Regenerate

Regeneration requires the generator from the iOS repository, the website brand assets, and six original app captures (`home`, `kana`, `path`, `read`, `talk`, and `exam`) placed in `design/appstore/captures/en-US/`. The composited upload PNGs are final artwork and cannot replace the original app captures.

```bash
python3 scripts/appstore_assets.py
python3 scripts/appstore_assets.py --draft build/appstore-draft
python3 scripts/appstore_assets.py --compare
```

English is the default. `--locale es-ES` selects Spanish copy and Spanish captures. Other options: `--theme paper|vivid|ink` (default: `paper`) and `--draft FOLDER` (1206 × 2622 only, plus a review sheet).

Dependencies: Python’s standard library, Google Chrome (or `KANAGO_CHROME`), `ffmpeg`/`ffprobe`, SF Pro Rounded in `/Library/Fonts`, and the brand assets in `site/app/assets/`. Chrome renders each panel at its exact upload size; ffmpeg exports opaque RGB PNGs.

The generator prefers `captures/<locale>/<screen>.png`, with a same-language fallback to the website’s real captures. It never substitutes a Spanish screen into an English panel. Replacement captures must be 1206 × 2622; review the callout coordinates and lower crop whenever the app layout changes.

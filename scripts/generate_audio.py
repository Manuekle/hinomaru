"""Pre-generate KanaGO! speech with ElevenLabs into KanaGO/Resources/Audio.

Every Japanese string the app reads aloud becomes `tts_<sha1(text)[:16]>.m4a` (Yona,
the "Kawaii" voice) or `tts_kasane_<sha1(text)[:16]>.m4a` (Kasane, the "Cool" voice);
`Speaker` looks the clip up by the same hash and falls back to AVSpeechSynthesizer
when there is none. Clips that already exist are skipped, so re-running after the
monthly credit reset just continues where the last run stopped.

Usage:
    python3 scripts/generate_audio.py --dry-run     # list tiers and credit cost
    python3 scripts/generate_audio.py               # generate until credits run out
    python3 scripts/generate_audio.py --voice kasane
    python3 scripts/generate_audio.py --voice kasane --reencode   # after changing the bitrate
    python3 scripts/generate_audio.py --reserve 2000

Needs ELEVENLABS_API_KEY in .env.local (repo root) or the environment.
"""
import argparse
import concurrent.futures as cf
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "KanaGO/Resources/Data"
OUT = ROOT / "KanaGO/Resources/Audio"
CACHE = ROOT / "build/tts-cache"
MANIFEST = ROOT / "build/tts-manifest.json"

# name -> (ElevenLabs voice id, clip file prefix, mp3 cache subfolder)
VOICES = {
    "yona": ("iRDEKpk9hSfW2qkoxsr7", "tts_", ""),            # Yona – Clear & Calm (Kawaii)
    "kasane": ("ioLsi3BGjCKHDhF2fNod", "tts_kasane_", "kasane"),  # Kasane – relaxed (Cool)
}
MODEL_ID = "eleven_v4"
API = "https://api.elevenlabs.io/v1"

KANA_ONLY = re.compile(r"^[぀-ヿー・ ]+$")
KANJI_ONLY = re.compile(r"^[一-鿿々]+$")
FURIGANA = re.compile(r"（[぀-ヿー・]+）")  # 下旬（げじゅん） -> read once
SILENT = {"っ", "ッ", "ー"}


def key(text):
    return hashlib.sha1(text.strip().encode("utf-8")).hexdigest()[:16]


def load(name):
    return json.loads((DATA / f"{name}.json").read_text("utf-8"))


def collect():
    """Ordered (tier, text the app passes, text sent to the TTS) — most used first."""
    items = []

    def add(tier, text, spoken=None):
        if not text or not text.strip() or text.strip() in SILENT:
            return
        spoken = FURIGANA.sub("", spoken or text).strip()
        items.append((tier, text.strip(), spoken))

    alphabet = load("alphabet")
    decks = load("decks")
    stories = load("stories")
    songs = load("songs")
    convs = load("conversations")
    jlpt = load("jlpt")

    # 1 · kana, words and vocab: the single words tapped most often
    for s in alphabet["sections"]:
        for g in s["groups"]:
            for c in g["chars"]:
                add(1, c["jp"])
    for words in alphabet["words"].values():
        for w in words:
            add(1, w["jp"])
    add(1, "こんにちは、カナです！")
    for d in decks:
        for c in d.get("cards") or []:
            reading = None
            # lone kanji (一, 足) are ambiguous: read the first listed reading instead
            if not c.get("kana") and KANJI_ONLY.match(c["jp"]):
                first = c.get("romaji", "").split("/")[0].strip()
                if KANA_ONLY.match(first):
                    reading = first
            add(1, c["jp"], reading)
            add(1, c.get("kana"))
    for s in stories:
        for v in s.get("vocab") or []:
            add(1, v["jp"], v.get("kana"))
            add(1, v.get("kana"))
    for s in songs:
        for v in s.get("vocab") or []:
            add(1, v["jp"], v.get("kana"))
            add(1, v.get("kana"))

    # 2 · example sentences (cards, sentence builder, grammar)
    for d in decks:
        for c in d.get("cards") or []:
            add(2, c.get("example"))
        for g in d.get("grammar") or []:
            exs = g.get("examples") or []
            for ex in exs:
                add(2, ex.get("jp"))
            if not exs:
                add(2, g.get("pattern"), (g.get("pattern") or "").replace("〜", "").replace("～", ""))

    # 3 · conversations (NPC lines and the learner's choices)
    for cv in convs:
        for t in cv.get("turns") or []:
            add(3, t.get("jp"))
            add(3, (t.get("next_npc") or {}).get("jp"))
            for ch in t.get("choices") or []:
                add(3, ch.get("jp"))

    # 4 · JLPT listening dialogues
    for lv in jlpt["levels"]:
        for sec in lv["sections"]:
            for m in sec["mondai"]:
                for q in m.get("questions") or []:
                    for line in q.get("dialogue") or []:
                        add(4, line["text"])

    # 5 · full story read-alouds (long)
    for s in stories:
        add(5, s.get("body_jp"))

    seen, ordered = set(), []
    for tier, text, spoken in items:
        k = key(text)
        if k not in seen:
            seen.add(k)
            ordered.append((tier, k, text, spoken))
    return ordered


def api_key():
    if os.environ.get("ELEVENLABS_API_KEY"):
        return os.environ["ELEVENLABS_API_KEY"]
    env = ROOT / ".env.local"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("ELEVENLABS_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("ELEVENLABS_API_KEY missing (.env.local or environment)")


def remaining_credits(xi):
    req = urllib.request.Request(f"{API}/user/subscription", headers={"xi-api-key": xi})
    with urllib.request.urlopen(req, timeout=30) as r:
        sub = json.load(r)
    return sub["character_limit"] - sub["character_count"]


def synth(xi, voice, k, spoken):
    voice_id, prefix, sub = VOICES[voice]
    mp3 = CACHE / sub / f"{k}.mp3"
    if not mp3.exists():
        body = json.dumps({"text": spoken, "model_id": MODEL_ID, "language_code": "ja"}).encode()
        url = f"{API}/text-to-speech/{voice_id}?output_format=mp3_44100_64"
        for attempt in range(5):
            req = urllib.request.Request(url, data=body, method="POST", headers={
                "xi-api-key": xi, "Content-Type": "application/json", "Accept": "audio/mpeg"})
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    mp3.write_bytes(r.read())
                break
            except urllib.error.HTTPError as e:
                detail = e.read().decode("utf-8", "replace")[:200]
                if e.code == 429 or e.code >= 500:
                    time.sleep(2 * (attempt + 1))
                    continue
                raise RuntimeError(f"HTTP {e.code}: {detail}")
        else:
            raise RuntimeError("gave up after retries")
    encode(mp3, OUT / f"{prefix}{k}.m4a")


def encode(mp3, m4a):
    # 32 kbps mono AAC: plenty for speech, keeps both voices around 80 MB
    subprocess.run(["afconvert", str(mp3), str(m4a), "-f", "m4af", "-d", "aac", "-b", "32000"],
                   check=True, capture_output=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--reserve", type=int, default=1000, help="credits to leave unspent")
    ap.add_argument("--max-tier", type=int, default=5)
    ap.add_argument("--voice", choices=sorted(VOICES), default="yona")
    ap.add_argument("--reencode", action="store_true",
                    help="re-encode existing clips from the mp3 cache (no credits)")
    args = ap.parse_args()
    prefix = VOICES[args.voice][1]

    if args.reencode:
        cache = CACHE / VOICES[args.voice][2]
        clips = sorted(OUT.glob(f"{prefix}*.m4a"))
        if args.voice == "yona":  # tts_ also matches tts_kasane_
            clips = [c for c in clips if not c.name.startswith("tts_kasane_")]
        with cf.ThreadPoolExecutor(max_workers=8) as pool:
            jobs = [pool.submit(encode, cache / f"{c.stem[len(prefix):]}.mp3", c) for c in clips]
            failed = sum(1 for j in cf.as_completed(jobs) if j.exception())
        print(f"re-encoded {len(clips) - failed}/{len(clips)} {args.voice} clips")
        return

    items = [i for i in collect() if i[0] <= args.max_tier]
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({k: t for _, k, t, _ in items}, ensure_ascii=False, indent=0), "utf-8")
    todo = [i for i in items if not (OUT / f"{prefix}{i[1]}.m4a").exists()]

    for tier in sorted({i[0] for i in items}):
        all_t = [i for i in items if i[0] == tier]
        left = [i for i in todo if i[0] == tier]
        print(f"tier {tier}: {len(all_t)} clips, {sum(len(i[3]) for i in all_t)} chars"
              f" ({len(left)} missing, {sum(len(i[3]) for i in left)} chars)")
    if args.dry_run:
        return

    xi = api_key()
    budget = remaining_credits(xi) - args.reserve
    print(f"credits available: {budget} (after reserve {args.reserve})")
    batch, spent = [], 0
    for item in todo:  # tiers in order; stop at the first clip that does not fit
        if spent + len(item[3]) > budget:
            break
        batch.append(item)
        spent += len(item[3])
    print(f"generating {len(batch)}/{len(todo)} clips, ~{spent} credits")

    OUT.mkdir(parents=True, exist_ok=True)
    (CACHE / VOICES[args.voice][2]).mkdir(parents=True, exist_ok=True)
    done = failed = 0
    with cf.ThreadPoolExecutor(max_workers=3) as pool:  # starter plan: 3 concurrent requests
        futs = {pool.submit(synth, xi, args.voice, k, spoken): (k, text) for _, k, text, spoken in batch}
        for f in cf.as_completed(futs):
            k, text = futs[f]
            try:
                f.result()
                done += 1
            except Exception as e:  # noqa: BLE001 — log and keep going
                failed += 1
                print(f"  fail {text[:30]!r}: {e}", file=sys.stderr)
            if (done + failed) % 100 == 0:
                print(f"  {done + failed}/{len(batch)}", flush=True)
    print(f"done: {done} ok, {failed} failed, {len(todo) - len(batch)} left for next credit reset")


if __name__ == "__main__":
    main()

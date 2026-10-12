#!/usr/bin/env python3
"""Measure the voice clips in app/assets/voices for the landing's level meters.

For every mp3 it writes the loudness envelope (25 frames a second, one digit 0–9 per
frame) and the moment speech ends, so the page can light the text and move the bars in
time with the real voice without routing audio through Web Audio (which the iPhone's
silent switch mutes).

Usage: python3 scripts/voice_envelopes.py   (needs ffmpeg)
"""
import array
import json
import math
import subprocess
from pathlib import Path

VOICES = Path(__file__).resolve().parents[1] / "app/assets/voices"
FPS = 25
RATE = 16000


def envelope(path):
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(RATE), "-f", "s16le", "-"],
        capture_output=True, check=True).stdout
    samples = array.array("h", pcm)
    step = RATE // FPS
    rms = []
    for i in range(0, len(samples), step):
        frame = samples[i:i + step]
        rms.append(math.sqrt(sum(s * s for s in frame) / max(1, len(frame))) / 32768)
    peak = max(rms) or 1
    # Perceptual-ish scale: quiet syllables still move the bars.
    levels = [min(9, round(9 * math.sqrt(r / peak))) for r in rms]
    voiced = [i for i, r in enumerate(rms) if r > peak * 0.06]
    end = (voiced[-1] + 1) / FPS if voiced else len(rms) / FPS
    return "".join(map(str, levels)), round(end, 2)


def main():
    out = {}
    for mp3 in sorted(VOICES.glob("*.mp3")):
        env, end = envelope(mp3)
        out[mp3.stem] = {"end": end, "env": env}
    target = VOICES / "envelopes.json"
    target.write_text(json.dumps(out, separators=(",", ":")) + "\n")
    print(f"{len(out)} clips -> {target.relative_to(VOICES.parents[2])}")


if __name__ == "__main__":
    main()

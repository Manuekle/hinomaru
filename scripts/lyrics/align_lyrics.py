"""Time songs.json lyrics against their YouTube clips, for the karaoke fill.

Each lyric line carries `time` (when the voice starts), `end` (when it stops) and, for lines
with several space-separated phrases, `marks` (when each phrase starts). The app fills the
karaoke line phrase by phrase from them (`LyricTiming.fraction`).

    ctc     download the clip (yt-dlp), split off the vocals (demucs) and force-align each line's
            romaji to them (torchaudio MMS_FA CTC) → build/lyrics/<id>.ctc.json
    marks   (Swift, needs the system Japanese tokenizer) map the romaji timings onto the Japanese
            phrases and flag doubtful lines → build/lyrics/<id>.marks.json
    apply   write time/end/marks into songs.json

Usage:
    python3 -m venv build/lyrics-venv
    build/lyrics-venv/bin/pip install torch torchaudio demucs soundfile    # plus `brew install yt-dlp`
    build/lyrics-venv/bin/python scripts/lyrics/align_lyrics.py ctc unravel
    swift scripts/lyrics/lyric_marks.swift unravel
    python3 scripts/lyrics/align_lyrics.py apply unravel

Lines flagged SHIFT/GAP/LONG or with a low score need a listen. CTC can run away on lo-fi
samples or chants; re-align a few lines inside a time range with
    align_lyrics.py ctc <id> --window FIRST LAST FROM_S TO_S
or set those times by hand in songs.json.
"""
import argparse
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SONGS = ROOT / "KanaGO/Resources/Data/songs.json"
WORK = ROOT / "build/lyrics"


def seconds(mmss):
    parts = [float(p) for p in mmss.split(":")]
    return parts[0] * 60 + parts[1] if len(parts) == 2 else parts[0]


def romaji_words(romaji):
    s = unicodedata.normalize("NFKD", romaji)
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"[^a-z' ]", " ", s)
    return [w.strip("'") for w in s.split() if w.strip("'")]


def vocals(song):
    """The clip's vocal stem, downloading and separating it on first use."""
    sid = song["id"]
    stem = WORK / "sep/htdemucs" / sid / "vocals.wav"
    if stem.exists():
        return stem
    audio = WORK / f"{sid}.m4a"
    if not audio.exists():
        subprocess.run(["yt-dlp", "-q", "--no-warnings", "-f", "140/bestaudio", "-o", str(audio),
                        f"https://www.youtube.com/watch?v={song['youtubeId']}"], check=True)
    wav = WORK / f"{sid}.wav"
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-i", str(audio), str(wav)], check=True)
    subprocess.run([sys.executable, "-m", "demucs", "--two-stems", "vocals", "-n", "htdemucs",
                    "-o", str(WORK / "sep"), str(wav)], check=True, capture_output=True)
    return stem


class Aligner:
    def __init__(self):
        import torch
        import torchaudio

        self.torch = torch
        self.F = torchaudio.functional
        bundle = torchaudio.pipelines.MMS_FA
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        self.model = bundle.get_model(with_star=True).eval().to(self.device)
        self.dictionary = bundle.get_dict(star="*")
        self.sr = bundle.sample_rate

    def load(self, path, start, end):
        import soundfile as sf

        data, sr = sf.read(path, dtype="float32", always_2d=True)
        wav = self.F.resample(self.torch.from_numpy(data.T).mean(0, keepdim=True), sr, self.sr)
        return wav[:, int(start * self.sr):int(end * self.sr)]

    def emission(self, wav):
        # 30 s windows with 2 s of context either side keep memory flat
        win, ctx, out = 30 * self.sr, 2 * self.sr, []
        with self.torch.inference_mode():
            for start in range(0, wav.shape[1], win):
                a, b = max(start - ctx, 0), min(start + win + ctx, wav.shape[1])
                em, _ = self.model(wav[:, a:b].to(self.device))
                em = em.cpu()
                fps = em.shape[1] / ((b - a) / self.sr)
                lo = round((start - a) / self.sr * fps)
                hi = lo + round((min(start + win, wav.shape[1]) - start) / self.sr * fps)
                out.append(em[:, lo:hi])
        return self.torch.cat(out, 1)

    def align(self, song, first, last, start, end):
        """Word timings for lines first..last, searched only within [start, end] seconds."""
        wav = self.load(vocals(song), start, end)
        em = self.emission(wav)
        frame = wav.shape[1] / self.sr / em.shape[1]
        # every line's romaji, with a star between lines to soak up ad-libs and backing vocals
        words, owner = ["*"], [None]
        for i in range(first, last + 1):
            for w in romaji_words(song["lyrics"][i].get("romaji") or ""):
                words.append(w)
                owner.append(i)
            words.append("*")
            owner.append(None)
        tokens = [self.dictionary[c] for w in words for c in w]
        aligned, scores = self.F.forced_align(em, self.torch.tensor([tokens], dtype=self.torch.int32), blank=0)
        spans = self.F.merge_tokens(aligned[0], scores[0].exp())
        lines, k = {i: [] for i in range(first, last + 1)}, 0
        for w, o in zip(words, owner):
            ws = spans[k:k + len(w)]
            k += len(w)
            if o is None:
                continue
            frames = sum(s.end - s.start for s in ws)
            lines[o].append({"w": w, "s": round(start + ws[0].start * frame, 3),
                             "e": round(start + ws[-1].end * frame, 3),
                             "score": round(sum(s.score * (s.end - s.start) for s in ws) / max(frames, 1), 3)})
        return lines


def ctc(song, aligner, window=None):
    out = WORK / f"{song['id']}.ctc.json"
    if window:
        first, last, a, b = window
        result = json.loads(out.read_text())
    else:
        first, last, a, b = 0, len(song["lyrics"]) - 1, 0, seconds(song["end"]) + 1.5
        result = [{"line": i, "words": []} for i in range(len(song["lyrics"]))]
    for i, ws in aligner.align(song, int(first), int(last), float(a), float(b)).items():
        result[i]["words"] = ws
    out.write_text(json.dumps(result, ensure_ascii=False, indent=1))
    print(f"{song['id']}: {out.relative_to(ROOT)}")


def num(x):
    x = round(x, 1)
    return int(x) if x == int(x) else x


def apply(songs, ids):
    for s in songs:
        if s["id"] not in ids:
            continue
        marks = json.loads((WORK / f"{s['id']}.marks.json").read_text())
        for i, (line, m) in enumerate(zip(s["lyrics"], marks)):
            new = {"time": num(m["time"]), "end": num(m["end"])}
            if len(line["text"].split()) > 1:
                new["marks"] = [num(x) for x in m["marks"]]
            s["lyrics"][i] = {**new, **{k: v for k, v in line.items() if k not in ("time", "end", "marks")}}
        # a line can't still be filling once the next one has started
        for a, b in zip(s["lyrics"], s["lyrics"][1:]):
            a["end"] = min(a["end"], b["time"])
        print(f"{s['id']}: {len(s['lyrics'])} lines")
    SONGS.write_text(json.dumps(songs, ensure_ascii=False, separators=(",", ":")), "utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=["ctc", "apply"])
    ap.add_argument("ids", nargs="+", help="song ids from songs.json")
    ap.add_argument("--window", nargs=4, metavar=("FIRST", "LAST", "FROM_S", "TO_S"),
                    help="re-align only lines FIRST..LAST inside FROM_S..TO_S seconds")
    args = ap.parse_args()
    songs = json.loads(SONGS.read_text("utf-8"))
    unknown = set(args.ids) - {s["id"] for s in songs}
    if unknown:
        sys.exit(f"unknown song ids: {', '.join(sorted(unknown))}")
    WORK.mkdir(parents=True, exist_ok=True)
    if args.step == "apply":
        apply(songs, set(args.ids))
        return
    aligner = Aligner()
    for s in songs:
        if s["id"] in args.ids:
            ctc(s, aligner, args.window)


if __name__ == "__main__":
    main()

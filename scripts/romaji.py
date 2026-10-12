"""Romaji and word splits for the bundled Japanese text, from a real morphological analyzer.

The app's runtime fallback (Romaji.from, the system tokenizer) reads 私 as "watakushi", the
particle は as "ha" and drops small っ ("i~tsu ta"), so everything we ship is romanized here:

  stories.json  body_words   each paragraph as bunsetsu ("私は", "七時に", "起きます。") with
                             romaji, kana reading, the content word inside it, its dictionary
                             form and the story vocab entry it carries — the immersive reader
                             lays these out and makes them tappable
                body_romaji  the paragraphs' romaji, one line each
                vocab.romaji
  decks.json    cards' example_romaji, grammar examples' romaji

  python3 -m venv .venv && .venv/bin/pip install cutlet fugashi unidic-lite
  .venv/bin/python scripts/romaji.py            # rewrite the JSON files
  .venv/bin/python scripts/romaji.py --check    # print the stories' splits, change nothing
"""

import argparse
import json
import re
import sys
from pathlib import Path

import cutlet

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "KanaGO/Resources/Data"

CUT = cutlet.Cutlet(use_foreign_spelling=False)  # コーヒー -> koohii, not "coffee"
CUT.add_exception("弁当", "bentou")  # cutlet's own list has "bento"; the app writes long vowels as ou
TAGGER = CUT.tagger

# UniDic readings that are right but not what a learner meets first.
READING = {"私": ("わたし", "watashi"), "日本": ("にほん", "nihon"), "明日": ("あした", "ashita"),
           "何時": ("なんじ", "nanji"), "東京": ("とうきょう", "Toukyou"),  # not asu, itsu, Tokyo
           "こんにちは": ("こんにちは", "konnichiwa"), "こんばんは": ("こんばんは", "konbanwa")}
# Readings that depend on the next morpheme: 七時 しちじ, 一冊 いっさつ, 日光浴 (not the town)…
BEFORE = {("七", "時"): ("しち", "shichi"), ("四", "時"): ("よ", "yo"), ("九", "時"): ("く", "ku"),
          ("四", "人"): ("よ", "yo"), ("七", "月"): ("しち", "shichi"), ("四", "月"): ("し", "shi"),
          ("九", "月"): ("く", "ku"), ("一", "冊"): ("いっ", "is"), ("一", "週間"): ("いっ", "is"),
          ("一", "回"): ("いっ", "ik"), ("一", "杯"): ("いっ", "ip"), ("日光", "浴"): ("にっこう", "nikkou"),
          ("何", "を"): ("なに", "nani"), ("何", "が"): ("なに", "nani")}
# …and on the previous one: 土曜日 どようび, 一日中 いちにちじゅう, 少し辛かった (spicy, not painful)
AFTER = {("曜", "日"): ("び", "bi"), ("誕生", "日"): ("び", "bi"), ("日", "中"): ("じゅう", "juu"),
         ("少し", "辛かっ"): ("からかっ", "karakat"), ("二", "本"): ("ほん", "hon"),
         ("お", "父"): ("とう", "tou"), ("お", "母"): ("かあ", "kaa"), ("お", "兄"): ("にい", "nii"),
         ("お", "姉"): ("ねえ", "nee"), ("お", "祖父"): ("じい", "jii"), ("お", "祖母"): ("ばあ", "baa")}

OPENING = set("「『（(〈《【“‘")
CLOSING = set("」』）)〉》】”’")
PUNCT_ROMAJI = {"、": ",", "。": ".", "！": "!", "？": "?", "「": "\"", "」": "\"", "『": "\"", "』": "\"",
                "（": "(", "）": ")", "…": "…", "・": " ", "〜": "~", "：": ":", "；": ";"}
KANJI = re.compile(r"[一-鿿々〆]")
KATAKANA = re.compile(r"^[゠-ヿ]+$")
HIRAGANA = re.compile(r"^[぀-ゟー]+$")
# Verb endings that are particles to UniDic but join the verb: 起きて, 食べたり, 飲みながら
TE_FORM = {"て", "で", "ば", "たり", "だり", "ちゃ", "じゃ", "ながら"}
# Words UniDic splits that romaji writes as one: itsumo, demo, nandemo, sorekara, dakara
ONE_WORD = {("いつ", "も"), ("で", "も"), ("何", "で"), ("それ", "で"), ("それ", "から"), ("だ", "から"),
            ("の", "で"), ("いえ", "ど"), ("ど", "も"), ("これ", "から")}
# Name suffixes written with a hyphen (Tanaka-san, ten'in-san), except after お/ご or 皆 (otousan, minasan)
HONORIFIC = {"さん", "ちゃん", "くん", "君", "様", "さま", "先生"}
# Example sentences UniDic can't read right even from kanji: kana-only text it splits mid-word
# (は|こ, か|いしゃ), 辛い read as tsurai next to curry, 回|薬 taken as one word.
FIXED = {
    "はこのなかになにがありますか。": "Hako no naka ni nani ga arimasu ka.",
    "ひこうきでにほんへいきます。": "Hikouki de nihon e ikimasu.",
    "かいしゃではたらきます。": "Kaisha de hatarakimasu.",
    "じゅういちじにねます。": "Juuichiji ni nemasu.",
    "ガルシアともうします。": "Garushia to moushimasu.",
    "一日に三回薬を飲みます。": "Ichinichi ni sankai kusuri o nomimasu.",
    "日本のカレーは辛くないです。": "Nihon no karee wa karaku nai desu.",
    "交差点で事故がありました。": "Kousaten de jiko ga arimashita.",
}


def hiragana(kata):
    return "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in kata)


def morphemes(text):
    """UniDic morphemes with context-aware romaji (cutlet joins っ across morphemes)."""
    words = TAGGER(cutlet.normalize_text(text))
    tokens = CUT.romaji_tokens(words, capitalize=False)
    out = []
    for i, (w, t) in enumerate(zip(words, tokens)):
        f = w.feature
        prev = words[i - 1].surface if i > 0 else None
        nxt = words[i + 1].surface if i + 1 < len(words) else None
        kana = f.kana if f.kana and f.kana != "*" else w.surface
        kana = kana if KATAKANA.match(w.surface) else hiragana(kana)
        roma = t.surface
        # cutlet title-cases proper nouns; UniDic also tags some plain hiragana words (なつ) as names
        if HIRAGANA.match(w.surface):
            roma = roma.lower()
        prev_key = next((k for k in AFTER if k[1] == w.surface and prev and prev.endswith(k[0])), None)
        glue = prev_key is not None and prev_key[1] in ("日", "中")  # doyoubi, ichinichijuu
        if w.surface in READING:
            kana, roma = READING[w.surface]
        elif (w.surface, nxt) in BEFORE:
            kana, roma = BEFORE[(w.surface, nxt)]
        elif prev_key:
            kana, roma = AFTER[prev_key]
        elif f.pos1 == "助詞" and w.surface == "を":
            roma = "o"  # cutlet keeps "wo"; Hepburn and the cards use "o"
        base = f.orthBase if f.orthBase and f.orthBase != "*" else w.surface
        out.append(dict(s=w.surface, pos1=f.pos1, pos2=f.pos2, pos3=f.pos3, cform=f.cForm or "",
                        base=base, kana=kana, roma=roma, space=t.space, glue=glue))
    return out


def is_punct(m):
    return m["pos1"] in ("補助記号", "空白") or m["s"] in PUNCT_ROMAJI


def is_number(m):
    return m["pos2"] == "数詞"


def is_te(m):
    return m["pos1"] == "助詞" and m["pos2"] in ("接続助詞", "副助詞") and m["s"] in TE_FORM


def is_compound(m, prev):
    """読み|始める, 分かりやす|そう: a verb/looks-like ending on a verb stem."""
    stem = prev["cform"].startswith("連用形")
    if m["pos1"] == "動詞" and m["pos2"] == "非自立可能":
        return prev["pos1"] == "動詞" and stem
    if m["pos1"] == "形状詞" and m["pos2"] == "助動詞語幹":
        return prev["pos1"] in ("接尾辞", "形容詞") or stem
    return False


def attaches(m, prev):
    """Whether morpheme `m` belongs to the bunsetsu that `prev` (its last morpheme) ends."""
    if prev["pos1"] == "接頭辞":
        return True
    p1 = m["pos1"]
    if p1 in ("助詞", "助動詞", "接尾辞"):
        return True
    if p1 == "名詞" and prev["pos1"] in ("名詞", "接尾辞"):
        if is_number(prev):  # 十五, 七時, 十五分 — but not 一つも 本
            return is_number(m) or m["pos3"] == "助数詞可能"
        # 毎日 勉強は, not 毎日勉強は; but 日曜日
        return prev["pos3"] != "副詞可能" or m["pos3"] == "助数詞可能" or m["glue"]
    if is_compound(m, prev):  # 分かりやすそう (looks easy); 降るそう (they say it rains) stays apart
        return True
    if p1 in ("動詞", "形容詞") and m["pos2"] == "非自立可能":
        # 食べて いる, 勉強 する, 食べたく ない
        if is_te(prev):
            return True
        if m["base"] == "する" and prev["pos1"] == "名詞" and prev["pos3"] == "サ変可能":
            return True
        if p1 == "形容詞" and prev["pos1"] in ("助動詞", "動詞", "形容詞"):
            return True
    return False


def join_roma(ms):
    out = ""
    for i, m in enumerate(ms):
        out += PUNCT_ROMAJI.get(m["s"], m["roma"]) if is_punct(m) else m["roma"]
        if i == len(ms) - 1:
            break
        n = ms[i + 1]
        if is_punct(n) or m["s"] in OPENING:
            continue
        if n["s"] in HONORIFIC and n["pos1"] == "接尾辞" and m["s"] not in ("皆", "みな", "みんな") \
                and not (i > 0 and ms[i - 1]["pos1"] == "接頭辞"):
            out += "-"
            continue
        if n["s"] in ("でしょう", "だろう"):  # hare deshou, not haredeshou
            out += " "
            continue
        if is_number(m) and (is_number(n) or n["pos3"] == "助数詞可能" or n["pos1"] == "接尾辞"):
            continue  # shichiji, juugofun, nijikan
        if n["pos1"] == "接尾辞" or n["glue"] or is_te(n) or is_compound(n, m) or (m["s"], n["s"]) in ONE_WORD:
            continue
        if (n["s"] == "語" and m["pos2"] == "固有名詞") or (KATAKANA.match(m["s"]) and KATAKANA.match(n["s"])):
            continue  # nihongo, chekkuin
        if re.search(r"[bcdfghjkmpqrstvwxz]$", m["roma"]):
            continue  # a small っ waiting for its consonant: wakariyasukat|ta
        # particles stand apart ("desu ga", "iku to"), which cutlet glues after endings
        if m["space"] or n["pos1"] == "助詞":
            out += " "
    return out.replace("masendeshi", "masen deshi").strip()


def bunsetsu(text):
    """Splits text into reading units: content word + its particles/endings + punctuation."""
    units, cur, opening = [], [], []
    for m in morphemes(text):
        if is_punct(m):
            if m["s"] in OPENING or not (cur or units):
                opening.append(m)
            elif cur:
                cur.append(m)
            else:
                units[-1].append(m)
            continue
        last = cur[-1] if cur else None
        # a quote's closing bracket keeps its particle: 「おはよう」と
        quoted = last is not None and last["s"] in CLOSING and m["pos1"] == "助詞"
        if cur and (opening or (is_punct(last) and not quoted) or not (quoted or attaches(m, last))):
            units.append(cur)
            cur = []
        if cur:
            cur.append(m)
        else:
            cur, opening = opening + [m], []
    if cur:
        units.append(cur)
    if opening:  # text ending in an opening bracket
        if units:
            units[-1].extend(opening)
        else:
            units.append(opening)
    return [word(u) for u in units]


def word(ms):
    jp = "".join(m["s"] for m in ms)
    content = [m for m in ms if not is_punct(m)]
    out = {"jp": jp}
    if not content:
        return out
    out["romaji"] = join_roma(ms)
    if KANJI.search(jp):
        out["kana"] = "".join(m["kana"] for m in content)
    # the content word: prefix + noun(s) / verb stem, up to its first particle or ending
    head = []
    for m in content:
        if head and (m["pos1"] in ("助詞", "助動詞") or m["pos2"] in ("非自立可能", "助動詞語幹")):
            break
        head.append(m)
    head_s = "".join(m["s"] for m in head)
    if head_s != core(jp):
        out["head"] = head_s
    main = next((m for m in head if m["pos1"] not in ("接頭辞", "接尾辞")), head[0])
    if main is head[-1] and main["base"] != head_s:
        out["base"] = main["base"]  # 起き -> 起きる, お茶 -> 茶
    return out


def core(jp):
    """A unit without its brackets and punctuation."""
    return jp.strip("、。！？!?…・「」『』（）()〈〉《》【】“”‘’ ")


def keys(u):
    k = {core(u["jp"]), u.get("head"), u.get("base")}
    if u.get("head"):
        k |= {u["head"] + "い", u["head"] + "する"}  # 分かりやす(い), 緊張(する)
    return {x for x in k if x}


def mark_vocab(paras, vocab):
    """Tags each unit with the story vocab entry it shows, merging units for phrases (朝 早く)."""
    missing = []
    for v in vocab:
        jp = v["jp"]
        found = False
        for ws in paras:
            for i, u in enumerate(ws):
                if "vocab" in u:
                    continue
                if jp in keys(u) or (len(jp) > 1 and core(u["jp"]).startswith(jp)):
                    u["vocab"] = jp
                    found = True
                    break
                # a phrase over several units: 写真を + 撮る, 心が + 落ち着く(落ち着きました)
                for n in (2, 3, 4):
                    run = ws[i:i + n]
                    if len(run) < n or any("vocab" in r for r in run):
                        break
                    lead = "".join(core(r["jp"]) for r in run[:-1])
                    if any(lead + k == jp or (lead + k).startswith(jp) for k in keys(run[-1])):
                        ws[i:i + n] = [merge(run, jp)]
                        found = True
                        break
                if found:
                    break
            if found:
                break
        if not found:
            missing.append(jp)
    return missing


def merge(run, jp):
    out = {"jp": "".join(r["jp"] for r in run), "romaji": " ".join(r["romaji"] for r in run if "romaji" in r)}
    if any("kana" in r for r in run):
        out["kana"] = "".join(r.get("kana") or core(r["jp"]) for r in run)
    out["head"] = jp
    out["vocab"] = jp
    return out


def sentence_romaji(units):
    text = " ".join(u["romaji"] for u in units if "romaji" in u)
    text = re.sub(r" ([,.!?)…])", r"\1", text)
    # capitalize each sentence
    return re.sub(r"(^\"?|[.!?…]\s+\"?)([a-z])", lambda m: m.group(1) + m.group(2).upper(), text)


def romanize(text):
    return sentence_romaji(bunsetsu(text))


def guessed(text):
    """UniDic fell back to single characters (さん|び|ゃ|く), so its split can't be trusted."""
    return any(m["pos1"] == "記号" and not is_punct(m) or m["pos2"] == "フィラー" for m in morphemes(text))


def word_romaji(jp, kana):
    """A vocab entry, read from its kanji so UniDic splits it right (まいあさ alone -> "ma i asa"),
    unless that reading isn't the listed one."""
    units = bunsetsu(jp)
    if hiragana("".join(u.get("kana", core(u["jp"])) for u in units)) == hiragana(kana):
        return " ".join(u["romaji"] for u in units if "romaji" in u)
    return kana_romaji(kana)


def kana_romaji(word):
    """A lone kana word, letter by letter: いぬ -> inu, ウイスキー -> uisukii."""
    return CUT.map_kana(hiragana(word))


def dump(path, data, compact):
    sep = (",", ":") if compact else (", ", ": ")
    path.write_text(json.dumps(data, ensure_ascii=False, separators=sep), "utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="print the stories' splits, write nothing")
    args = ap.parse_args()

    stories = json.loads((DATA / "stories.json").read_text("utf-8"))
    for s in stories:
        paras = [bunsetsu(p) for p in s["body_jp"].split("\n") if p.strip()]  # Story.paragraphs
        for v in s.get("vocab") or []:
            v["romaji"] = word_romaji(v["jp"], v["kana"])
        missing = mark_vocab(paras, s.get("vocab") or [])
        if missing:
            print(f"{s['id']}: vocab not in the text: {' '.join(missing)}", file=sys.stderr)
        s["body_words"] = paras
        s["body_romaji"] = "\n".join(sentence_romaji(ws) for ws in paras)
        if args.check:
            print(f"\n# {s['id']}")
            for ws in paras:
                print(" ".join(f"[{u['jp']}]" if "vocab" in u else u["jp"] for u in ws))
                print(" ".join(u.get("kana", u["jp"]) for u in ws))
                print(sentence_romaji(ws))

    decks = json.loads((DATA / "decks.json").read_text("utf-8"))
    filled = 0
    for d in decks:
        for c in d.get("cards") or []:
            ex = c.get("example")
            if not ex:
                continue
            if d["kind"] in ("Hiragana", "Katakana"):  # the examples are single words: あめ, アイス
                c["example_romaji"] = kana_romaji(ex)
            elif not guessed(ex):
                # analyze the card's own word in kanji (としょかんで -> 図書館で): kana-only text
                # is where UniDic splits words wrong; the reading, and so the romaji, is the same
                kana = c.get("kana")
                text = ex.replace(kana, c["jp"]) if kana and KANJI.search(c["jp"]) else ex
                # every example is regenerated: the imported ones mix macrons with "ou" and
                # split verbs apart ("tabe mashi ta")
                c["example_romaji"] = FIXED.get(ex) or romanize(text)
            else:
                if not c.get("example_romaji"):
                    print(f"no romaji for {ex!r}", file=sys.stderr)
                continue  # keep the imported one
            filled += 1
        for g in d.get("grammar") or []:
            for ex in g.get("examples") or []:
                if guessed(ex["jp"]):
                    print(f"no romaji for {ex['jp']!r}", file=sys.stderr)
                else:
                    ex["romaji"] = FIXED.get(ex["jp"]) or romanize(ex["jp"])
                    filled += 1
    print(f"{filled} example sentences romanized", file=sys.stderr)

    if not args.check:
        dump(DATA / "stories.json", stories, compact=False)
        dump(DATA / "decks.json", decks, compact=True)


if __name__ == "__main__":
    main()

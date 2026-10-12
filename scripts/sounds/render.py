#!/usr/bin/env python3
"""Render scripts/sounds/patches.json to KanaGO/Resources/Sounds/<name>.wav.

Runs the procedural-sounds player (player.js) on an OfflineAudioContext in headless Chrome,
so the files sound exactly like the patches do on https://procedural-sounds.vercel.app.

    python3 scripts/sounds/render.py
"""
import base64, http.server, json, pathlib, subprocess, sys, threading

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "KanaGO" / "Resources" / "Sounds"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

HARNESS = r"""
const RATE = 44100;
function wav(chans) {
  const n = chans[0].length, nc = chans.length, bytes = 44 + n * nc * 2;
  const b = new DataView(new ArrayBuffer(bytes));
  const str = (o, s) => [...s].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF"); b.setUint32(4, bytes - 8, true); str(8, "WAVE"); str(12, "fmt ");
  b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, nc, true);
  b.setUint32(24, RATE, true); b.setUint32(28, RATE * nc * 2, true); b.setUint16(32, nc * 2, true);
  b.setUint16(34, 16, true); str(36, "data"); b.setUint32(40, n * nc * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++) {
    const v = Math.max(-1, Math.min(1, chans[c][i]));
    b.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2;
  }
  let s = ""; const u = new Uint8Array(b.buffer);
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}
async function renderAll() {
  const result = {};
  for (const [name, patch] of Object.entries(PATCHES)) {
    if (name.startsWith("_")) continue;
    let end = 0, tail = 0.15;
    for (const l of patch.layers || [patch]) {
      const e = l.envelope || {}; const dur = l.envelope ? (e.attack || 0) + e.decay + (e.release || 0) : 0.5;
      end = Math.max(end, (l.delay || 0) + dur + 0.1);
      for (const fx of l.effects || []) tail = Math.max(tail, fx.type === "delay" ? 1.2 : (fx.decay || 0.5) + 0.1);
    }
    const ctx = new OfflineAudioContext(2, Math.ceil((end + tail) * RATE), RATE);
    playSound(patch, ctx);
    const buf = await ctx.startRendering();
    const chans = [buf.getChannelData(0), buf.getChannelData(1)];
    let peak = 0, last = 0;
    for (const c of chans) for (let i = 0; i < c.length; i++) { const a = Math.abs(c[i]); if (a > peak) peak = a; if (a > 0.0004) last = Math.max(last, i); }
    const keep = Math.min(chans[0].length, last + Math.round(0.02 * RATE));
    const fade = Math.round(0.01 * RATE), scale = (patch.peak || 0.7) / (peak || 1);
    const outCh = chans.map(c => { const o = c.slice(0, keep); for (let i = 0; i < keep; i++) { o[i] *= scale; if (i > keep - fade) o[i] *= (keep - i) / fade; } return o; });
    result[name] = { wav: wav(outCh), seconds: +(keep / RATE).toFixed(3), rawPeak: +peak.toFixed(4) };
  }
  return result;
}
renderAll().then(r => r, e => ({ error: String(e) }))
  .then(r => fetch("/result", { method: "POST", body: JSON.stringify(r) }));
"""


def main():
    patches = json.loads((HERE / "patches.json").read_text())
    page = f"""<!doctype html><meta charset="utf-8">
<script>{(HERE / "player.js").read_text()}</script>
<script>const PATCHES = {json.dumps(patches)};{HARNESS}</script>""".encode()
    result, done = {}, threading.Event()

    # The page renders, then POSTs the WAVs back here (headless --dump-dom would snapshot too early).
    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page)

        def do_POST(self):
            result.update(json.loads(self.rfile.read(int(self.headers["Content-Length"]))))
            self.send_response(204)
            self.end_headers()
            done.set()

        def log_message(self, *args):
            pass

    server = http.server.HTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    chrome = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
                               f"--user-data-dir={HERE / '.chrome-profile'}",
                               f"http://127.0.0.1:{server.server_port}/"],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        if not done.wait(60):
            sys.exit("render timed out")
    finally:
        chrome.terminate()
        server.shutdown()
    if "error" in result:
        sys.exit(result["error"])
    OUT.mkdir(parents=True, exist_ok=True)
    for name, r in result.items():
        (OUT / f"{name}.wav").write_bytes(base64.b64decode(r["wav"]))
        print(f"{name:8} {r['seconds']:.3f}s  raw peak {r['rawPeak']}")


if __name__ == "__main__":
    main()

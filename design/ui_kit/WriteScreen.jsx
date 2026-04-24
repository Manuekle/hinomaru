// Handwriting / kanji tracing screen — user writes on a canvas as if on paper.
// Includes a TTS pronunciation button using window.speechSynthesis (ja-JP).

function WriteScreen({ cards, onExit, onDone }) {
  const [i, setI] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(true);
  const canvasRef = React.useRef(null);
  const drawing = React.useRef(false);
  const strokes = React.useRef([]);
  const card = cards[i];

  // TTS — Japanese text-to-speech via the Web Speech API.
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const setupCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 6;
  };

  React.useEffect(() => { setupCanvas(); /* eslint-disable-next-line */ }, [i]);

  const getPos = (e) => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };
  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    strokes.current.push([{ x, y }]);
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    strokes.current[strokes.current.length - 1].push({ x, y });
  };
  const end = () => { drawing.current = false; };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    strokes.current = [];
    setSubmitted(false);
  };

  const check = () => { setSubmitted(true); };

  const next = () => {
    if (i >= cards.length - 1) onDone({ correct: cards.length, total: cards.length, mode: 'write' });
    else { setI(i + 1); setSubmitted(false); strokes.current = []; setShowGuide(true); setTimeout(setupCanvas, 0); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--paper)' }}>
      <div style={{ height: 2, background: 'var(--ink-200)' }}>
        <div style={{ height: '100%', width: `${((i+1)/cards.length) * 100}%`, background: 'var(--hinomaru-red)', transition: 'width 240ms var(--ease-brand)' }}/>
      </div>
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a onClick={onExit} style={{ cursor: 'pointer', color: 'var(--fg-secondary)' }}><Icon name="x" size={22}/></a>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)' }}>{i + 1} / {cards.length}</div>
        <div style={{ width: 22 }}/>
      </div>

      <div style={{ flex: 1, padding: '24px 24px 40px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Prompt header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-tertiary)', marginBottom: 8 }}>Write this character</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em' }}>{card.en}</div>
            <button onClick={() => speak(card.jp)} aria-label="Play pronunciation"
              style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sumi)' }}>
              <Icon name="speaker" size={18}/>
            </button>
          </div>
          <div style={{ fontSize: 13, letterSpacing: '0.04em', color: 'var(--fg-secondary)', marginTop: 6 }}>{card.romaji}</div>
        </div>

        {/* Writing pad — paper-like card */}
        <div style={{ position: 'relative', background: '#fff', borderRadius: 24, boxShadow: '0 1px 2px rgba(26,26,26,0.04)', aspectRatio: '1/1', overflow: 'hidden' }}>
          {/* Genkōyōshi grid guides */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '50%', left: 16, right: 16, height: 1, background: 'var(--ink-200)', borderTop: '1px dashed var(--ink-200)', background: 'transparent', borderTopStyle: 'dashed', borderTopWidth: 1, borderTopColor: '#E8E6E2' }}/>
            <div style={{ position: 'absolute', left: '50%', top: 16, bottom: 16, width: 0, borderLeft: '1px dashed #E8E6E2' }}/>
            <div style={{ position: 'absolute', inset: 16, border: '1px solid var(--ink-200)', borderRadius: 12 }}/>
          </div>
          {/* Faint character guide */}
          {showGuide && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ fontFamily: 'var(--font-jp)', fontSize: 220, fontWeight: 500, color: submitted ? '#E8E6E2' : '#F2F2F1', lineHeight: 1 }}>{card.jp}</div>
            </div>
          )}
          <canvas ref={canvasRef}
            onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={move} onTouchEnd={end}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}/>
          {/* Canvas toolbar */}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
            <button onClick={() => setShowGuide(!showGuide)} title={showGuide ? 'Hide guide' : 'Show guide'}
              style={{ height: 32, padding: '0 12px', borderRadius: 999, border: '1px solid var(--ink-200)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--sumi)' }}>
              {showGuide ? 'Hide guide' : 'Show guide'}
            </button>
            <button onClick={clear} aria-label="Clear"
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--ink-200)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sumi)' }}>
              <Icon name="eraser" size={16}/>
            </button>
          </div>
        </div>

        {/* Feedback */}
        {submitted && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: '#E9F3EE', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#1d5d43' }}>Nice trace.</div>
              <div style={{ fontSize: 13, color: '#1d5d43', opacity: 0.8 }}>Compare your strokes to the guide above.</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          {!submitted
            ? <>
                <Button kind="secondary" onClick={clear}>Clear</Button>
                <Button kind="primary" full onClick={check}>Done</Button>
              </>
            : <Button kind="primary" full size="lg" onClick={next}>{i >= cards.length - 1 ? 'Finish' : 'Continue'}</Button>
          }
        </div>
      </div>
    </div>
  );
}
window.WriteScreen = WriteScreen;

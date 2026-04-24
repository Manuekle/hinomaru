// Type the answer — simple write-the-translation.

function TypeScreen({ cards, onExit, onDone }) {
  const [i, setI] = React.useState(0);
  const [answer, setAnswer] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [correct, setCorrect] = React.useState(0);

  const card = cards[i];
  const isCorrect = answer.trim().toLowerCase() === card.en.toLowerCase();

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    if (isCorrect) setCorrect(c => c + 1);
  };
  const next = () => {
    if (i >= cards.length - 1) onDone({ correct, total: cards.length, mode: 'type' });
    else { setSubmitted(false); setAnswer(''); setI(i + 1); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--paper)' }}>
      <div style={{ height: 2, background: 'var(--ink-200)' }}>
        <div style={{ height: '100%', width: `${((i+1)/cards.length) * 100}%`, background: 'var(--hinomaru-red)' }}/>
      </div>
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a onClick={onExit} style={{ cursor: 'pointer', color: 'var(--fg-secondary)' }}><Icon name="x" size={22}/></a>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)' }}>{i + 1} / {cards.length}</div>
        <div style={{ width: 22 }}/>
      </div>

      <div style={{ flex: 1, padding: '32px 24px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 48, textAlign: 'center', boxShadow: '0 1px 2px rgba(26,26,26,0.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-tertiary)', marginBottom: 16 }}>Type the meaning in English</div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 72, fontWeight: 500, color: 'var(--sumi)', lineHeight: 1 }}>{card.jp}</div>
          <div style={{ fontSize: 13, letterSpacing: '0.04em', color: 'var(--fg-secondary)', marginTop: 12 }}>{card.romaji}</div>
        </div>

        <div style={{ marginTop: 24 }}>
          <input autoFocus value={answer} onChange={e => setAnswer(e.target.value)} disabled={submitted}
            onKeyDown={e => { if (e.key === 'Enter') submitted ? next() : submit(); }}
            placeholder="Your answer"
            style={{
              width: '100%', boxSizing: 'border-box', height: 56, padding: '0 20px',
              border: '1.5px solid ' + (submitted ? (isCorrect ? '#2E7D5B' : '#BC002D') : 'var(--ink-200)'),
              background: submitted ? (isCorrect ? '#E9F3EE' : '#FDECEF') : '#fff',
              color: submitted ? (isCorrect ? '#1d5d43' : '#9A0025') : 'var(--sumi)',
              borderRadius: 16, fontSize: 18, fontFamily: 'var(--font-ui)', fontWeight: 500, outline: 'none',
            }}/>
          {submitted && !isCorrect && (
            <div style={{ fontSize: 13, color: '#9A0025', marginTop: 8 }}>The answer is <strong>{card.en}</strong>.</div>
          )}
          <div style={{ marginTop: 20 }}>
            {!submitted
              ? <Button kind="primary" full size="lg" disabled={!answer.trim()} onClick={submit}>Check</Button>
              : <Button kind={isCorrect ? 'primary' : 'dark'} full size="lg" onClick={next}>{i >= cards.length - 1 ? 'Finish' : 'Continue'}</Button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
window.TypeScreen = TypeScreen;

// Multiple choice — pick the right meaning.

function QuizScreen({ cards, onExit, onDone }) {
  const [i, setI] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const [correct, setCorrect] = React.useState(0);

  const card = cards[i];
  // Build 3 distractors from the other card meanings, stable per index.
  const options = React.useMemo(() => {
    const others = cards.filter((_, j) => j !== i).map(c => c.en);
    const picks = [];
    const seed = i * 13 + 7;
    for (let k = 0; k < 2 && others.length; k++) {
      const idx = (seed + k * 3) % others.length;
      picks.push(others.splice(idx, 1)[0]);
    }
    const all = [...picks, card.en];
    // deterministic shuffle
    return all.sort((a, b) => ((a.charCodeAt(0) + i) % 7) - ((b.charCodeAt(0) + i) % 7));
  }, [i]);

  const onPick = (opt) => {
    if (picked) return;
    setPicked(opt);
    if (opt === card.en) setCorrect(c => c + 1);
  };

  const next = () => {
    if (i >= cards.length - 1) onDone({ correct: correct + (picked === card.en ? 0 : 0), total: cards.length, mode: 'quiz' });
    else { setPicked(null); setI(i + 1); }
  };

  const isCorrect = picked === card.en;

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
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-tertiary)', marginBottom: 16 }}>What does this mean?</div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 64, fontWeight: 500, color: 'var(--sumi)', lineHeight: 1 }}>{card.jp}</div>
          <div style={{ fontSize: 13, letterSpacing: '0.04em', color: 'var(--fg-secondary)', marginTop: 12 }}>{card.romaji}</div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => {
            let style = { padding: '18px 20px', background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, fontWeight: 500, fontSize: 16, color: 'var(--sumi)', cursor: picked ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'var(--font-ui)', transition: 'all 120ms var(--ease-brand)' };
            if (picked) {
              if (opt === card.en) style = { ...style, background: '#E9F3EE', border: '1.5px solid #2E7D5B', color: '#1d5d43', fontWeight: 600 };
              else if (opt === picked) style = { ...style, background: '#FDECEF', border: '1.5px solid #BC002D', color: '#9A0025', fontWeight: 600 };
              else style = { ...style, opacity: 0.5 };
            }
            return <button key={opt} onClick={() => onPick(opt)} style={style}>{opt}</button>;
          })}
        </div>

        {picked && (
          <div style={{ marginTop: 20, padding: 16, borderRadius: 16, background: isCorrect ? '#E9F3EE' : '#FDECEF', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: isCorrect ? '#1d5d43' : '#9A0025' }}>
                {isCorrect ? 'Correct.' : 'Not quite.'}
              </div>
              {!isCorrect && <div style={{ fontSize: 13, color: '#9A0025', opacity: 0.8 }}>The answer is <em>{card.en}</em>.</div>}
            </div>
            <Button kind={isCorrect ? 'primary' : 'dark'} onClick={next}>{i >= cards.length - 1 ? 'Finish' : 'Continue'}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
window.QuizScreen = QuizScreen;

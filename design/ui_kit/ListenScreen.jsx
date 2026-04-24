// Listen mode — hear the word, pick the right Japanese spelling.
function ListenScreen({ cards, onExit, onDone, lang }) {
  const t = (k, v) => window.HM_I18N.t(k, lang, v);
  const [i, setI] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const [correct, setCorrect] = React.useState(0);
  const card = cards[i];

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };
  React.useEffect(() => { const id = setTimeout(() => speak(card.jp), 360); return () => clearTimeout(id); }, [i]);

  const options = React.useMemo(() => {
    const others = cards.filter((_, j) => j !== i);
    const picks = [];
    const seed = i * 17 + 3;
    for (let k = 0; k < 2 && others.length; k++) {
      const idx = (seed + k * 5) % others.length;
      picks.push(others.splice(idx, 1)[0]);
    }
    return [...picks, card].sort((a, b) => ((a.jp.charCodeAt(0) + i) % 7) - ((b.jp.charCodeAt(0) + i) % 7));
  }, [i]);

  const onPick = (opt) => {
    if (picked) return;
    setPicked(opt);
    if (opt.jp === card.jp) setCorrect(c => c + 1);
  };
  const next = () => {
    if (i >= cards.length - 1) onDone({ correct: correct + (picked && picked.jp === card.jp ? 0 : 0), total: cards.length, mode: 'listen' });
    else { setPicked(null); setI(i + 1); }
  };
  const isCorrect = picked && picked.jp === card.jp;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--paper)', animation: 'hm-fade 240ms var(--ease-brand)' }}>
      <div style={{ height: 2, background: 'var(--ink-200)' }}>
        <div style={{ height: '100%', width: `${((i+1)/cards.length) * 100}%`, background: 'var(--hinomaru-red)', transition: 'width 360ms var(--ease-brand)' }}/>
      </div>
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a onClick={onExit} style={{ cursor: 'pointer', color: 'var(--fg-secondary)' }}><Icon name="x" size={22}/></a>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)' }}>{i + 1} / {cards.length}</div>
        <div style={{ width: 22 }}/>
      </div>

      <div key={i} style={{ flex: 1, padding: '32px 24px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box', animation: 'hm-slide-up 320ms var(--ease-brand)' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 48, textAlign: 'center', boxShadow: '0 1px 2px rgba(26,26,26,0.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-tertiary)', marginBottom: 20 }}>{t('session.listenPrompt')}</div>
          <button onClick={() => speak(card.jp)} aria-label="Play"
            style={{ width: 96, height: 96, borderRadius: '50%', border: 'none', background: 'var(--hinomaru-red)', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 0 rgba(188,0,45,0.35)', animation: 'hm-pulse 2.2s var(--ease-brand) infinite' }}>
            <Icon name="volume" size={40} color="#fff"/>
          </button>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--fg-secondary)' }}>{t('session.playAgain')}</div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => {
            let style = { padding: '22px 20px', background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, cursor: picked ? 'default' : 'pointer', textAlign: 'center', fontFamily: 'var(--font-jp)', fontSize: 28, fontWeight: 500, color: 'var(--sumi)', transition: 'all 180ms var(--ease-brand)' };
            if (picked) {
              if (opt.jp === card.jp) style = { ...style, background: '#E9F3EE', border: '1.5px solid #2E7D5B', color: '#1d5d43' };
              else if (opt.jp === picked.jp) style = { ...style, background: '#FDECEF', border: '1.5px solid #BC002D', color: '#9A0025' };
              else style = { ...style, opacity: 0.5 };
            }
            return <button key={opt.jp} onClick={() => onPick(opt)} style={style}>{opt.jp}</button>;
          })}
        </div>

        {picked && (
          <div style={{ marginTop: 20, padding: 16, borderRadius: 16, background: isCorrect ? '#E9F3EE' : '#FDECEF', display: 'flex', alignItems: 'center', gap: 12, animation: 'hm-slide-up 240ms var(--ease-brand)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: isCorrect ? '#1d5d43' : '#9A0025' }}>
                {isCorrect ? t('session.correct') : t('session.wrong')}
              </div>
              <div style={{ fontSize: 13, color: isCorrect ? '#1d5d43' : '#9A0025', opacity: 0.8 }}>
                {card.jp} · {card.romaji} · {lang === 'es' ? card.es : card.en}
              </div>
            </div>
            <Button kind={isCorrect ? 'primary' : 'dark'} onClick={next}>{i >= cards.length - 1 ? t('session.finish') : t('session.continue')}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
window.ListenScreen = ListenScreen;

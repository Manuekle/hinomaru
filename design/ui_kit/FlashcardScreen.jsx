// Flashcard session — flip, swipe through cards, then summary.

function FlashcardScreen({ cards, onExit, onDone }) {
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const card = cards[i];

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const next = () => {
    setFlipped(false);
    if (i >= cards.length - 1) onDone({ correct: cards.length, total: cards.length, mode: 'flashcards' });
    else setTimeout(() => setI(i + 1), 120);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--paper)' }}>
      <div style={{ height: 2, background: 'var(--ink-200)' }}>
        <div style={{ height: '100%', width: `${((i+1)/cards.length) * 100}%`, background: 'var(--hinomaru-red)', transition: 'width 240ms var(--ease-brand)' }}/>
      </div>
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a onClick={onExit} style={{ cursor: 'pointer', color: 'var(--fg-secondary)', display: 'inline-flex', alignItems: 'center' }}><Icon name="x" size={22}/></a>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)' }}>{i + 1} / {cards.length}</div>
        <Icon name="bookmark" size={20} color="var(--fg-tertiary)"/>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 32 }}>
        <div onClick={() => setFlipped(!flipped)}
          style={{ width: '100%', maxWidth: 360, aspectRatio: '3/4', cursor: 'pointer', perspective: 1200 }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', transition: 'transform 480ms var(--ease-brand)', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
            {/* Front */}
            <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 24, boxShadow: '0 4px 16px rgba(26,26,26,0.06), 0 2px 4px rgba(26,26,26,0.04)', backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 32, textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: 24, left: 24, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-tertiary)' }}>{card.romaji ? 'Word' : ''}</div>
              <div style={{ fontFamily: 'var(--font-jp)', fontSize: 96, fontWeight: 500, color: 'var(--sumi)', lineHeight: 1 }}>{card.jp}</div>
              <button onClick={(e) => { e.stopPropagation(); speak(card.jp); }} aria-label="Play pronunciation"
                style={{ marginTop: 20, width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sumi)' }}>
                <Icon name="volume" size={18}/>
              </button>
              <div style={{ marginTop: 16, fontSize: 12, color: 'var(--fg-tertiary)' }}>Tap card to flip</div>
            </div>
            {/* Back */}
            <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 24, boxShadow: '0 4px 16px rgba(26,26,26,0.06), 0 2px 4px rgba(26,26,26,0.04)', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 32, textAlign: 'center', gap: 8 }}>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--sumi)', lineHeight: 1 }}>{card.en}</div>
              <div style={{ fontSize: 14, letterSpacing: '0.04em', color: 'var(--fg-secondary)' }}>{card.romaji}</div>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--ink-200)', width: '80%' }}>
                <div style={{ fontFamily: 'var(--font-jp)', fontSize: 16, color: 'var(--sumi)' }}>{card.ex}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginTop: 4 }}>{card.exEn}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 360 }}>
          <Button kind="secondary" full onClick={next}><Icon name="x" size={18}/> Again</Button>
          <Button kind="primary" full onClick={next}><Icon name="check" size={18}/> Got it</Button>
        </div>
      </div>
    </div>
  );
}
window.FlashcardScreen = FlashcardScreen;

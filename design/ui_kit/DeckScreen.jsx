// Deck detail — choose a study mode.

function DeckScreen({ deck, onStart, onBack }) {
  const modes = [
    { id: 'flashcards', title: 'Flashcards', desc: 'Flip cards to test recall.', icon: 'cards' },
    { id: 'quiz',       title: 'Multiple choice', desc: 'Pick the right meaning.', icon: 'check' },
    { id: 'type',       title: 'Type the answer', desc: 'Write the translation.', icon: 'type' },
    { id: 'write',      title: 'Write the kanji', desc: 'Trace the character by hand.', icon: 'pen' },
  ];
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 120px' }}>
      <a onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-secondary)', cursor: 'pointer', marginBottom: 32 }}>
        <Icon name="arrow-left" size={16}/> Back
      </a>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Pill kind="red">{deck.level}</Pill>
        <Pill kind="ink">{deck.kind}</Pill>
      </div>
      <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{deck.title}</h1>
      <p style={{ fontSize: 18, color: 'var(--fg-secondary)', margin: 0, lineHeight: 1.55 }}>{deck.desc}</p>
      <div style={{ marginTop: 28 }}>
        <ProgressBar value={(deck.learned / deck.count) * 100} height={6}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)' }}>
          <span>{deck.learned} learned</span><span>{deck.count - deck.learned} to go</span>
        </div>
      </div>

      <div style={{ marginTop: 48, fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 12 }}>Choose a mode</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {modes.map(m => (
          <div key={m.id} onClick={() => onStart(m.id)}
            style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, background: 'var(--ink-100)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sumi)' }}>
              <Icon name={m.icon} size={20}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{m.desc}</div>
            </div>
            <Icon name="arrow-right" size={18} color="var(--fg-tertiary)"/>
          </div>
        ))}
      </div>
    </div>
  );
}
window.DeckScreen = DeckScreen;

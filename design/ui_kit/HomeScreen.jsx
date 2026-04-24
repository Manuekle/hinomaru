// Home — level filter + deck list.

function HomeScreen({ user, decks, onOpenDeck, onSignOut }) {
  const [level, setLevel] = React.useState('N5');
  const [streak] = React.useState(14);
  const filtered = decks.filter(d => d.level === level);
  const totalLearned = decks.reduce((s,d) => s + d.learned, 0);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)' }}>
          {streak}-day streak
        </div>
        <a onClick={onSignOut} style={{ fontSize: 12, color: 'var(--fg-tertiary)', cursor: 'pointer' }}>Sign out</a>
      </div>
      <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
        Learn Japanese, one card a day.
      </h1>
      <p style={{ fontSize: 16, color: 'var(--fg-secondary)', margin: 0 }}>
        {totalLearned} cards learned so far. Pick up where you left off.
      </p>

      <div style={{ display: 'flex', gap: 8, marginTop: 32, marginBottom: 20, overflowX: 'auto' }}>
        {['N5','N4','N3','N2','N1'].map(l => (
          <button key={l} onClick={() => setLevel(l)}
            style={{ height: 36, padding: '0 16px', borderRadius: 999,
              border: '1px solid ' + (level === l ? 'var(--sumi)' : 'var(--ink-200)'),
              background: level === l ? 'var(--sumi)' : '#fff',
              color: level === l ? '#fff' : 'var(--sumi)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-tertiary)', border: '1px dashed var(--ink-200)', borderRadius: 24, gridColumn: '1 / -1' }}>
            Nothing here yet. Try another level.
          </div>
        )}
        {filtered.map(deck => (
          <div key={deck.id} onClick={() => onOpenDeck(deck)}
            style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 24, padding: 20, cursor: 'pointer', transition: 'box-shadow 120ms var(--ease-brand)', boxShadow: '0 1px 2px rgba(26,26,26,0.04)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,26,26,0.06), 0 2px 4px rgba(26,26,26,0.04)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(26,26,26,0.04)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Pill kind="red">{deck.level}</Pill>
              <span style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{deck.count} cards</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 4 }}>
              {deck.kind}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>{deck.title}</div>
            <div style={{ fontSize: 14, color: 'var(--fg-secondary)', marginTop: 4, lineHeight: 1.5 }}>{deck.desc}</div>
            <div style={{ marginTop: 20 }}>
              <ProgressBar value={(deck.learned / deck.count) * 100} height={4} color={deck.learned === deck.count ? '#2E7D5B' : 'var(--hinomaru-red)'}/>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginTop: 8 }}>
                {deck.learned === deck.count ? '✓ Complete' : `${deck.learned} of ${deck.count} learned`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
window.HomeScreen = HomeScreen;

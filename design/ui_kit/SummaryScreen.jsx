// Session summary.

function SummaryScreen({ result, deck, onReturn }) {
  const pct = Math.round((result.correct / result.total) * 100);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Watermark red circle */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 320, height: 320, background: 'var(--hinomaru-red)', borderRadius: '50%', opacity: 0.06, pointerEvents: 'none' }}/>
      <div style={{ position: 'relative', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 16 }}>Session complete</div>
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{result.correct} / {result.total}</div>
        <div style={{ fontSize: 18, color: 'var(--fg-secondary)', marginTop: 12 }}>
          {pct === 100 ? 'All correct. Come back tomorrow.' : pct >= 70 ? 'Solid. A short review will lock it in.' : 'Try the same deck again when you have a few minutes.'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 40 }}>
          <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--fg-secondary)' }}>Deck</span><span style={{ fontWeight: 600 }}>{deck?.title || '—'}</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--fg-secondary)' }}>Accuracy</span><span style={{ fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--fg-secondary)' }}>Streak</span><span style={{ fontWeight: 600 }}>15 days</span>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <Button kind="primary" full size="lg" onClick={onReturn}>Back to home</Button>
        </div>
      </div>
    </div>
  );
}
window.SummaryScreen = SummaryScreen;

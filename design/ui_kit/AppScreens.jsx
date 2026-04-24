// Review, Stats, Profile screens.

function ReviewScreen({ lang, onStart, onBack }) {
  const t = (k, v) => window.HM_I18N.t(k, lang, v);
  const queue = window.HM_DATA.reviewQueue;
  const cards = window.HM_DATA.cards;
  const due = queue.filter(q => q.dueIn === 0);
  const soon = queue.filter(q => q.dueIn > 0);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 120px', animation: 'hm-fade 240ms var(--ease-brand)' }}>
      <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{t('review.title')}</h1>
      <p style={{ fontSize: 16, color: 'var(--fg-secondary)', margin: 0, lineHeight: 1.55, maxWidth: 520 }}>{t('review.subtitle')}</p>

      {due.length === 0 ? (
        <div style={{ marginTop: 32, padding: 48, textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px solid var(--ink-200)' }}>
          <div style={{ fontSize: 18, color: 'var(--fg-secondary)' }}>{t('review.empty')}</div>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 28 }}>
            <Button kind="primary" size="lg" onClick={() => onStart(due.map(q => cards[q.cardIdx]))}>{t('review.start', { n: due.length })}</Button>
          </div>

          <div style={{ marginTop: 32, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 10 }}>{t('review.due')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {due.map((q, k) => {
              const c = cards[q.cardIdx];
              return <ReviewRow key={k} card={c} streak={q.streak} lang={lang}/>;
            })}
          </div>

          {soon.length > 0 && (<>
            <div style={{ marginTop: 32, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 10 }}>{t('review.soon')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {soon.map((q, k) => {
                const c = cards[q.cardIdx];
                return <ReviewRow key={k} card={c} streak={q.streak} lang={lang} dueIn={q.dueIn}/>;
              })}
            </div>
          </>)}
        </>
      )}
    </div>
  );
}
function ReviewRow({ card, streak, lang, dueIn }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-jp)', fontSize: 28, fontWeight: 500, minWidth: 40 }}>{card.jp}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{lang === 'es' ? card.es : card.en}</div>
        <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{card.romaji}</div>
      </div>
      {dueIn != null
        ? <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>+{dueIn}d</div>
        : <Pill kind="red">×{streak}</Pill>}
    </div>
  );
}
window.ReviewScreen = ReviewScreen;

function StatsScreen({ lang }) {
  const t = (k, v) => window.HM_I18N.t(k, lang, v);
  const weekly = window.HM_DATA.weekly;
  const max = Math.max(...weekly);
  const days = lang === 'es' ? ['L','M','X','J','V','S','D'] : ['M','T','W','T','F','S','S'];
  const decks = window.HM_DATA.decks;
  const recent = window.HM_DATA.recentSessions;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 120px', animation: 'hm-fade 240ms var(--ease-brand)' }}>
      <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 24px' }}>{t('stats.title')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        <StatCard label={t('stats.totalLearned')} value="124" lang={lang}/>
        <StatCard label={t('stats.streak')} value="14" lang={lang} suffix={lang === 'es' ? 'días' : 'days'}/>
        <StatCard label={t('stats.accuracy')} value="89%" lang={lang}/>
        <StatCard label={t('stats.minutes')} value="312" lang={lang}/>
      </div>

      <div style={{ marginTop: 32, background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 24, padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 16 }}>{t('stats.weekly')}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 140, gap: 12 }}>
          {weekly.map((v, k) => (
            <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: `${(v/max) * 100}%`, background: k === weekly.length - 1 ? 'var(--hinomaru-red)' : 'var(--ink-200)', borderRadius: 6, transition: 'height 480ms var(--ease-brand)', animation: `hm-grow 600ms ${k * 60}ms var(--ease-brand) backwards` }}/>
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>{days[k]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 12 }}>{t('stats.byLevel')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['N5','N4','N3','N2','N1'].map(l => {
            const ld = decks.filter(d => d.level === l);
            const total = ld.reduce((s,d) => s + d.count, 0);
            const learned = ld.reduce((s,d) => s + d.learned, 0);
            const pct = total ? (learned/total) * 100 : 0;
            return <div key={l} style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Pill kind="red">{l}</Pill><span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{learned} / {total || '—'}</span></div>
                <div style={{ fontSize: 13, color: 'var(--fg-secondary)', fontWeight: 600 }}>{Math.round(pct)}%</div>
              </div>
              <ProgressBar value={pct} height={4}/>
            </div>;
          })}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 12 }}>{t('stats.recent')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent.map((s, k) => (
            <div key={k} style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.deck}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>{lang === 'es' ? s.dateEs : s.dateEn} · {s.mode} · {s.cards}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.accuracy >= 90 ? '#2E7D5B' : s.accuracy >= 70 ? 'var(--sumi)' : '#BC002D' }}>{s.accuracy}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function StatCard({ label, value, suffix }) {
  return <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: '14px 16px' }}>
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)' }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 6 }}>{value}{suffix && <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', marginLeft: 4 }}>{suffix}</span>}</div>
  </div>;
}
window.StatsScreen = StatsScreen;

function ProfileScreen({ user, lang, setLang, settings, setSettings, onSignOut }) {
  const t = (k, v) => window.HM_I18N.t(k, lang, v);
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px 120px', animation: 'hm-fade 240ms var(--ease-brand)' }}>
      <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 24px' }}>{t('you.title')}</h1>

      <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 24, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>{user.email[0].toUpperCase()}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{user.email.split('@')[0]}</div>
          <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{user.email}</div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <SettingRow label={t('you.language')}>
          <LangToggle value={lang} onChange={setLang}/>
        </SettingRow>
        <SettingRow label={t('you.translation')}>
          <LangToggle value={settings.translation} onChange={v => setSettings({ ...settings, translation: v })}/>
        </SettingRow>
        <SettingRow label={t('you.soundOn')}>
          <Switch value={settings.autoPlay} onChange={v => setSettings({ ...settings, autoPlay: v })}/>
        </SettingRow>
        <SettingRow label={t('you.daily')}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[10, 20, 40].map(n => (
              <button key={n} onClick={() => setSettings({ ...settings, daily: n })}
                style={{ height: 32, padding: '0 12px', borderRadius: 999, border: '1px solid ' + (settings.daily === n ? 'var(--sumi)' : 'var(--ink-200)'), background: settings.daily === n ? 'var(--sumi)' : '#fff', color: settings.daily === n ? '#fff' : 'var(--sumi)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                {t('you.cards', { n })}
              </button>
            ))}
          </div>
        </SettingRow>
      </div>

      <div style={{ marginTop: 32 }}>
        <Button kind="secondary" full onClick={onSignOut}>{t('you.signout')}</Button>
      </div>
    </div>
  );
}
function SettingRow({ label, children }) {
  return <div style={{ padding: '16px 0', borderBottom: '1px solid var(--ink-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
    <div style={{ fontSize: 14, color: 'var(--fg-primary)' }}>{label}</div>
    <div>{children}</div>
  </div>;
}
function LangToggle({ value, onChange }) {
  return <div style={{ display: 'inline-flex', background: 'var(--ink-100)', borderRadius: 999, padding: 3 }}>
    {[{ id: 'en', label: 'EN' }, { id: 'es', label: 'ES' }].map(o => (
      <button key={o.id} onClick={() => onChange(o.id)}
        style={{ height: 28, padding: '0 14px', borderRadius: 999, border: 'none', background: value === o.id ? '#fff' : 'transparent', color: value === o.id ? 'var(--sumi)' : 'var(--fg-secondary)', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: value === o.id ? '0 1px 2px rgba(26,26,26,0.06)' : 'none', transition: 'all 180ms var(--ease-brand)', letterSpacing: '0.05em' }}>
        {o.label}
      </button>
    ))}
  </div>;
}
function Switch({ value, onChange }) {
  return <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 999, background: value ? 'var(--hinomaru-red)' : 'var(--ink-300)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 180ms var(--ease-brand)' }}>
    <div style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 180ms var(--ease-brand)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}/>
  </button>;
}
window.ProfileScreen = ProfileScreen;
window.LangToggle = LangToggle;

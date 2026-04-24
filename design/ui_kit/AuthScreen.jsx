// Auth screen — sign in / sign up toggle. Any credentials work.
const { useState: useStateAuth } = React;

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useStateAuth('signin');
  const [email, setEmail] = useStateAuth('');
  const [password, setPassword] = useStateAuth('');

  const submit = (e) => {
    e.preventDefault();
    onAuth({ email: email || 'hana@example.com' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <LogoMark size={48} />
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Hinomaru</div>
          <div style={{ fontSize: 14, color: 'var(--fg-secondary)', textAlign: 'center' }}>
            {mode === 'signin' ? 'Sign in to save your progress.' : 'Create an account to save your progress.'}
          </div>
        </div>

        <form onSubmit={submit} style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 8 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              style={{ width: '100%', boxSizing: 'border-box', height: 48, padding: '0 16px', border: '1px solid var(--ink-200)', borderRadius: 16, background: '#fff', fontSize: 16, fontFamily: 'var(--font-ui)', color: 'var(--sumi)', outline: 'none' }}/>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-secondary)', marginBottom: 8 }}>Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              style={{ width: '100%', boxSizing: 'border-box', height: 48, padding: '0 16px', border: '1px solid var(--ink-200)', borderRadius: 16, background: '#fff', fontSize: 16, fontFamily: 'var(--font-ui)', color: 'var(--sumi)', outline: 'none' }}/>
          </div>
          <Button type="submit" kind="primary" full size="md">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-secondary)' }}>
            {mode === 'signin' ? "New here?" : 'Have an account?'}{' '}
            <a onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ color: 'var(--sumi)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </a>
          </div>
        </form>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg-tertiary)', marginTop: 20 }}>
          Supabase auth, mocked in this prototype.
        </div>
      </div>
    </div>
  );
}

window.AuthScreen = AuthScreen;

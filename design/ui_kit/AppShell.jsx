// App shell + route switch.

function AppShell() {
  const [user, setUser] = React.useState(null);
  const [route, setRoute] = React.useState({ name: 'home' });
  const [decks, setDecks] = React.useState(window.HM_DATA.decks);
  const cards = window.HM_DATA.cards;

  if (!user) return <AuthScreen onAuth={u => setUser(u)}/>;

  const openDeck = (deck) => setRoute({ name: 'deck', deck });
  const startMode = (mode) => setRoute({ name: mode, deck: route.deck });
  const onDone = (result) => setRoute({ name: 'summary', result, deck: route.deck });

  let body;
  switch (route.name) {
    case 'home':       body = <HomeScreen user={user} decks={decks} onOpenDeck={openDeck} onSignOut={() => setUser(null)}/>; break;
    case 'deck':       body = <DeckScreen deck={route.deck} onStart={startMode} onBack={() => setRoute({ name: 'home' })}/>; break;
    case 'flashcards': body = <FlashcardScreen cards={cards} onExit={() => setRoute({ name: 'deck', deck: route.deck })} onDone={onDone}/>; break;
    case 'quiz':       body = <QuizScreen cards={cards} onExit={() => setRoute({ name: 'deck', deck: route.deck })} onDone={onDone}/>; break;
    case 'type':       body = <TypeScreen cards={cards} onExit={() => setRoute({ name: 'deck', deck: route.deck })} onDone={onDone}/>; break;
    case 'write':      body = <WriteScreen cards={cards} onExit={() => setRoute({ name: 'deck', deck: route.deck })} onDone={onDone}/>; break;
    case 'summary':    body = <SummaryScreen result={route.result} deck={route.deck} onReturn={() => setRoute({ name: 'home' })}/>; break;
  }

  const showChrome = route.name === 'home' || route.name === 'deck';
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }} data-screen-label={`01 ${route.name}`}>
      {showChrome && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10, height: 64, background: '#fff', borderBottom: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setRoute({ name: 'home' })}>
            <LogoMark size={20}/>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>Hinomaru</div>
          </div>
          <div style={{ display: 'flex', gap: 28, fontSize: 14, color: 'var(--fg-secondary)' }}>
            <span style={{ color: 'var(--sumi)', fontWeight: 600, cursor: 'pointer' }}>Learn</span>
            <span style={{ cursor: 'pointer' }}>Review</span>
            <span style={{ cursor: 'pointer' }}>Stats</span>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
            {user.email[0].toUpperCase()}
          </div>
        </div>
      )}
      {body}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppShell/>);

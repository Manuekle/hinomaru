# Hinomaru — Web App UI Kit

Interactive recreation of the Hinomaru Japanese-learning web app. The `index.html` boots a click-through prototype: sign in → pick a deck → start a flashcard / multiple-choice / typing session → see session summary.

## Components (JSX, globally shared)

- `AppShell.jsx` — page frame, top bar + mobile tab bar, route switch
- `AuthScreen.jsx` — sign-in screen
- `HomeScreen.jsx` — deck list with level filter
- `DeckScreen.jsx` — deck detail + mode picker
- `FlashcardScreen.jsx` — flip flashcards
- `QuizScreen.jsx` — multiple choice
- `TypeScreen.jsx` — type the answer
- `SummaryScreen.jsx` — session complete
- `Primitives.jsx` — Button, Pill, Card, ProgressBar, Icon (Lucide-style inline SVG)
- `data.js` — sample deck + card data

## Tech choices for the prototype

React via CDN + Babel-in-browser. The real app uses SvelteKit but the **visual output** is what matters in a UI kit; components are deliberately thin — mostly markup + Tailwind-ish inline styles mapped to `colors_and_type.css` tokens.

## Fidelity notes

- Real Supabase auth is mocked — any email/password signs you in.
- The flashcard flip uses a 3D transform per the brand spec (480ms, `cubic-bezier(0.32, 0.72, 0, 1)`).
- Session progress persists to `localStorage` within one prototype visit.

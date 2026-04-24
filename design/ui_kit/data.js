window.HM_DATA = {
  levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
  decks: [
    { id: 'n5-daily',    level: 'N5', kind: 'Vocabulary', kindEs: 'Vocabulario', title: 'Daily conversation', titleEs: 'Conversación diaria', desc: "Words you'll hear first. About 5 minutes per session.", descEs: 'Palabras que oirás primero. Unos 5 minutos por sesión.', count: 12, learned: 4 },
    { id: 'n5-hiragana', level: 'N5', kind: 'Hiragana',   kindEs: 'Hiragana',    title: 'All 46 characters',  titleEs: 'Los 46 caracteres',   desc: "Foundational. Start here if it's your first time.",         descEs: 'La base. Empieza aquí si es tu primera vez.',              count: 46, learned: 46 },
    { id: 'n5-katakana', level: 'N5', kind: 'Katakana',   kindEs: 'Katakana',    title: 'All 46 characters',  titleEs: 'Los 46 caracteres',   desc: 'Used for foreign loanwords and emphasis.',                   descEs: 'Para extranjerismos y énfasis.',                            count: 46, learned: 12 },
    { id: 'n5-kanji',    level: 'N5', kind: 'Kanji',      kindEs: 'Kanji',       title: 'First 80 kanji',     titleEs: 'Los primeros 80 kanji', desc: 'Numbers, days, directions, and people.',                  descEs: 'Números, días, direcciones y personas.',                    count: 80, learned: 0 },
    { id: 'n4-food',     level: 'N4', kind: 'Vocabulary', kindEs: 'Vocabulario', title: 'Food and drink',     titleEs: 'Comida y bebida',     desc: 'Ordering, ingredients, and mealtime phrases.',               descEs: 'Para pedir, ingredientes y frases de mesa.',                count: 148, learned: 0 },
  ],
  cards: [
    { jp: '水',     romaji: 'mizu',      en: 'water',            es: 'agua',           ex: '水を飲みます。',       exEn: 'I drink water.',              exEs: 'Bebo agua.' },
    { jp: '本',     romaji: 'hon',       en: 'book',             es: 'libro',          ex: '本を読みます。',       exEn: 'I read a book.',              exEs: 'Leo un libro.' },
    { jp: '今日',   romaji: 'kyō',       en: 'today',            es: 'hoy',            ex: '今日は月曜日です。',   exEn: 'Today is Monday.',            exEs: 'Hoy es lunes.' },
    { jp: '食べる', romaji: 'taberu',    en: 'to eat',           es: 'comer',          ex: 'パンを食べます。',     exEn: 'I eat bread.',                exEs: 'Como pan.' },
    { jp: '友達',   romaji: 'tomodachi', en: 'friend',           es: 'amigo',          ex: '友達と話します。',     exEn: 'I talk with a friend.',       exEs: 'Hablo con un amigo.' },
    { jp: '学校',   romaji: 'gakkō',     en: 'school',           es: 'escuela',        ex: '学校へ行きます。',     exEn: 'I go to school.',             exEs: 'Voy a la escuela.' },
    { jp: '猫',     romaji: 'neko',      en: 'cat',              es: 'gato',           ex: '猫が好きです。',       exEn: 'I like cats.',                exEs: 'Me gustan los gatos.' },
    { jp: '朝',     romaji: 'asa',       en: 'morning',          es: 'mañana',         ex: '朝が好きです。',       exEn: 'I like mornings.',            exEs: 'Me gustan las mañanas.' },
    { jp: '桜',     romaji: 'sakura',    en: 'cherry blossom',   es: 'flor de cerezo', ex: '桜が咲きます。',       exEn: 'The cherry blossoms bloom.',  exEs: 'Florecen los cerezos.' },
    { jp: '山',     romaji: 'yama',      en: 'mountain',         es: 'montaña',        ex: '山に登ります。',       exEn: 'I climb the mountain.',       exEs: 'Subo la montaña.' },
    { jp: '車',     romaji: 'kuruma',    en: 'car',              es: 'coche',          ex: '車を運転します。',     exEn: 'I drive a car.',              exEs: 'Conduzco un coche.' },
    { jp: '先生',   romaji: 'sensei',    en: 'teacher',          es: 'profesor',       ex: '先生に聞きます。',     exEn: 'I ask the teacher.',          exEs: 'Le pregunto al profesor.' },
  ],
  // Review queue — a subset of cards with scheduled intervals (days since last seen).
  reviewQueue: [
    { cardIdx: 0, dueIn: 0, streak: 3 },
    { cardIdx: 3, dueIn: 0, streak: 1 },
    { cardIdx: 5, dueIn: 0, streak: 2 },
    { cardIdx: 7, dueIn: 0, streak: 4 },
    { cardIdx: 2, dueIn: 1, streak: 5 },
    { cardIdx: 9, dueIn: 2, streak: 2 },
    { cardIdx: 11, dueIn: 3, streak: 1 },
  ],
  // Weekly minutes per day (Mon..Sun)
  weekly: [8, 12, 5, 15, 22, 10, 18],
  recentSessions: [
    { dateEn: 'Today',          dateEs: 'Hoy',       deck: 'Daily conversation', accuracy: 92, mode: 'flashcards', cards: 12 },
    { dateEn: 'Yesterday',      dateEs: 'Ayer',      deck: 'Daily conversation', accuracy: 83, mode: 'quiz',       cards: 12 },
    { dateEn: '2 days ago',     dateEs: 'Hace 2 días', deck: 'Hiragana',         accuracy: 100, mode: 'write',     cards: 10 },
    { dateEn: '3 days ago',     dateEs: 'Hace 3 días', deck: 'Hiragana',         accuracy: 95, mode: 'flashcards', cards: 10 },
  ],
};

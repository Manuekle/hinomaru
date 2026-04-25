const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const URL_BASE = `${SUPABASE_URL}/rest/v1`;

const HEADERS = {
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const grammar = [
  { jp: '〜は〜です', romaji: 'wa desu', en: '[A] is [B] (copula)', es: '[A] es [B]', example: 'これはほんです。', example_en: 'This is a book.', example_es: 'Esto es un libro.' },
  { jp: '〜じゃありません', romaji: 'ja arimasen', en: 'is not (polite negative)', es: 'no es (formal)', example: 'これはほんじゃありません。', example_en: 'This is not a book.', example_es: 'Esto no es un libro.' },
  { jp: '〜が〜います', romaji: 'ga imasu', en: 'there is [living thing]', es: 'hay [ser vivo]', example: 'ねこがいます。', example_en: 'There is a cat.', example_es: 'Hay un gato.' },
  { jp: '〜が〜あります', romaji: 'ga arimasu', en: 'there is [object]', es: 'hay [objeto]', example: 'つくえがあります。', example_en: 'There is a desk.', example_es: 'Hay un escritorio.' },
  { jp: '〜を〜します', romaji: 'wo shimasu', en: 'to do [action]', es: 'hacer [acción]', example: 'しゅくだいをします。', example_en: 'I do homework.', example_es: 'Hago la tarea.' },
  { jp: '〜に行きます', romaji: 'ni ikimasu', en: 'to go to [place]', es: 'ir a [lugar]', example: 'がっこうにいきます。', example_en: 'I go to school.', example_es: 'Voy a la escuela.' },
  { jp: '〜で〜します', romaji: 'de shimasu', en: 'to do [action] by/with [means]', es: 'hacer con / por [medio]', example: 'バスでいきます。', example_en: 'I go by bus.', example_es: 'Voy en autobús.' },
  { jp: '〜から〜まで', romaji: 'kara made', en: 'from ... to ...', es: 'desde ... hasta ...', example: 'くじからごじまで。', example_en: 'From 9 to 5.', example_es: 'De 9 a 5.' },
  { jp: '〜と〜', romaji: 'A to B', en: '[A] and [B] (exhaustive list)', es: '[A] y [B]', example: 'パンとたまごをたべます。', example_en: 'I eat bread and eggs.', example_es: 'Como pan y huevos.' },
  { jp: '〜たい', romaji: 'tai', en: 'want to do', es: 'querer hacer', example: 'たべたいです。', example_en: 'I want to eat.', example_es: 'Quiero comer.' },
  { jp: '〜ましょう', romaji: 'mashou', en: "let's do ...", es: 'vamos a hacer ...', example: 'たべましょう。', example_en: "Let's eat.", example_es: 'Comamos.' },
  { jp: '〜ませんか', romaji: 'masen ka', en: "why don't we...? / shall we?", es: '¿por qué no...?', example: 'いきませんか？', example_en: "Why don't we go?", example_es: '¿Por qué no vamos?' },
  { jp: '〜てください', romaji: 'te kudasai', en: 'please do ...', es: 'por favor, haz ...', example: 'みてください。', example_en: 'Please look.', example_es: 'Por favor, mira.' },
  { jp: '〜てもいいですか', romaji: 'te mo ii desu ka', en: 'may I...? / is it okay to...?', es: '¿puedo...?', example: 'はいってもいいですか？', example_en: 'May I enter?', example_es: '¿Puedo entrar?' },
  { jp: '〜てはいけません', romaji: 'te wa ikemasen', en: 'must not do', es: 'no se debe / no está permitido', example: 'ここではなしてはいけません。', example_en: 'You must not talk here.', example_es: 'No debes hablar aquí.' },
  { jp: '〜なければなりません', romaji: 'nakereba narimasen', en: 'must / have to do', es: 'tener que / deber', example: 'いかなければなりません。', example_en: 'I have to go.', example_es: 'Tengo que ir.' },
  { jp: '〜ている', romaji: 'te iru', en: 'to be doing (progressive)', es: 'estar haciendo', example: 'たべています。', example_en: 'I am eating.', example_es: 'Estoy comiendo.' },
  { jp: '〜た', romaji: 'ta', en: 'did (plain past)', es: 'hice (pasado informal)', example: 'たべた。', example_en: 'I ate.', example_es: 'Comí.' },
  { jp: '〜ない', romaji: 'nai', en: "don't do (plain negative)", es: 'no hacer (informal)', example: 'たべない。', example_en: "I don't eat.", example_es: 'No como.' },
  { jp: '〜のが好きです', romaji: 'no ga suki desu', en: 'I like to do ...', es: 'me gusta hacer ...', example: 'うたうのがすきです。', example_en: 'I like to sing.', example_es: 'Me gusta cantar.' },
  { jp: '〜から (reason)', romaji: 'kara (reason)', en: 'because (reason clause)', es: 'porque (cláusula razón)', example: 'あついから、みずをのみます。', example_en: "Because it's hot, I drink water.", example_es: 'Porque hace calor, bebo agua.' },
  { jp: '〜ので', romaji: 'node', en: 'because / since (softer)', es: 'ya que / dado que', example: 'あめなので、うちにいます。', example_en: "Since it's raining, I stay home.", example_es: 'Como llueve, me quedo en casa.' },
  { jp: '〜が (but)', romaji: 'ga (but)', en: 'but / however (soft contrast)', es: 'pero / sin embargo (suave)', example: 'にほんごはすきですが、むずかしいです。', example_en: 'I like Japanese, but it is hard.', example_es: 'Me gusta el japonés, pero es difícil.' },
  { jp: '〜も', romaji: 'mo', en: 'also / too / even', es: 'también / incluso', example: 'わたしもがくせいです。', example_en: 'I am also a student.', example_es: 'Yo también soy estudiante.' },
  { jp: '〜よりも', romaji: 'yori mo', en: 'more than ...', es: 'más que ...', example: 'ねこはいぬよりもすきです。', example_en: 'I like cats more than dogs.', example_es: 'Me gustan más los gatos que los perros.' },
  { jp: '〜の方が', romaji: 'no hou ga', en: '[A] is more ... (comparison)', es: '[A] es más ... (comparación)', example: 'これのほうがいいです。', example_en: 'This one is better.', example_es: 'Este es mejor.' },
  { jp: '〜ことができます', romaji: 'koto ga dekimasu', en: 'can / be able to do', es: 'poder hacer', example: 'にほんごをはなすことができます。', example_en: 'I can speak Japanese.', example_es: 'Puedo hablar japonés.' },
  { jp: '〜たことがあります', romaji: 'ta koto ga arimasu', en: 'have done before (experience)', es: 'haber hecho antes (experiencia)', example: 'にほんにいったことがあります。', example_en: 'I have been to Japan.', example_es: 'He estado en Japón.' },
  { jp: '〜つもりです', romaji: 'tsumori desu', en: 'plan to / intend to', es: 'tener la intención de', example: 'にほんにいくつもりです。', example_en: 'I plan to go to Japan.', example_es: 'Tengo la intención de ir a Japón.' },
  { jp: '〜かもしれません', romaji: 'kamoshiremasen', en: 'might / may (uncertainty)', es: 'puede que / tal vez', example: 'かれはこないかもしれません。', example_en: 'He might not come.', example_es: 'Puede que él no venga.' },
];

async function seed() {
  console.log('Seeding n5-grammar with', grammar.length, 'cards...');
  
  const cards = grammar.map((g, i) => ({
    deck_id: 'n5-grammar',
    jp: g.jp,
    romaji: g.romaji,
    en: g.en,
    es: g.es,
    example: g.example,
    example_en: g.example_en,
    example_es: g.example_es,
    sort_order: i + 1,
  }));

  const res = await fetch(`${URL_BASE}/cards`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(cards)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error inserting cards:', res.status, text);
    return;
  }

  console.log('Cards inserted successfully!');

  // Update card_count
  const res2 = await fetch(`${URL_BASE}/decks?id=eq.n5-grammar`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ card_count: cards.length })
  });

  if (res2.ok) {
    console.log('card_count updated to', cards.length);
  } else {
    console.error('Error updating card_count:', await res2.text());
  }
}

seed();

const URL = 'https://ambiocrendaqohjcudtj.supabase.co/rest/v1/cards';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYmlvY3JlbmRhcW9oamN1ZHRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkwMjg5MywiZXhwIjoyMDkyNDc4ODkzfQ.l6IHpQ7slr85iVfq14oh8orzv4RzUYhDdYPzVIcDwlY';

const cards = [
  {deck_id:'n5-numbers',jp:'一',romaji:'ichi',en:'one',es:'uno',example:'一、二、三。',example_en:'One, two, three.',example_es:'Uno, dos, tres.',sort_order:1},
  {deck_id:'n5-numbers',jp:'二',romaji:'ni',en:'two',es:'dos',example:'二つあります。',example_en:'There are two.',example_es:'Hay dos.',sort_order:2},
  {deck_id:'n5-numbers',jp:'三',romaji:'san',en:'three',es:'tres',example:'三時です。',example_en:'It is three o\'clock.',example_es:'Son las tres.',sort_order:3},
  {deck_id:'n5-numbers',jp:'四',romaji:'yon / shi',en:'four',es:'cuatro',example:'四年生です。',example_en:'I am a fourth-year student.',example_es:'Soy estudiante de cuarto año.',sort_order:4},
  {deck_id:'n5-numbers',jp:'五',romaji:'go',en:'five',es:'cinco',example:'五円玉。',example_en:'Five yen coin.',example_es:'Moneda de cinco yenes.',sort_order:5},
  {deck_id:'n5-numbers',jp:'六',romaji:'roku',en:'six',es:'seis',example:'六月です。',example_en:'It is June.',example_es:'Es junio.',sort_order:6},
  {deck_id:'n5-numbers',jp:'七',romaji:'nana / shichi',en:'seven',es:'siete',example:'七時におきます。',example_en:'I wake up at seven.',example_es:'Me despierto a las siete.',sort_order:7},
  {deck_id:'n5-numbers',jp:'八',romaji:'hachi',en:'eight',es:'ocho',example:'八百屋。',example_en:'Greengrocer.',example_es:'Frutería.',sort_order:8},
  {deck_id:'n5-numbers',jp:'九',romaji:'kyuu / ku',en:'nine',es:'nueve',example:'九時からです。',example_en:'It starts from nine o\'clock.',example_es:'Empieza a partir de las nueve.',sort_order:9},
  {deck_id:'n5-numbers',jp:'十',romaji:'juu',en:'ten',es:'diez',example:'十円です。',example_en:'It is ten yen.',example_es:'Son diez yenes.',sort_order:10},
  {deck_id:'n5-numbers',jp:'百',romaji:'hyaku',en:'hundred',es:'cien',example:'百円ショップ。',example_en:'100 yen shop.',example_es:'Tienda de 100 yenes.',sort_order:11},
  {deck_id:'n5-numbers',jp:'千',romaji:'sen',en:'thousand',es:'mil',example:'千円札。',example_en:'1000 yen bill.',example_es:'Billete de mil yenes.',sort_order:12},
  {deck_id:'n5-numbers',jp:'万',romaji:'man',en:'ten thousand',es:'diez mil',example:'一万円。',example_en:'Ten thousand yen.',example_es:'Diez mil yenes.',sort_order:13},
  {deck_id:'n5-numbers',jp:'零',romaji:'rei / zero',en:'zero',es:'cero',example:'零点。',example_en:'Zero points.',example_es:'Cero puntos.',sort_order:14},
  {deck_id:'n5-numbers',jp:'十一',romaji:'juu-ichi',en:'eleven',es:'once',example:'十一日です。',example_en:'It is the 11th.',example_es:'Es el día once.',sort_order:15},
  {deck_id:'n5-numbers',jp:'十二',romaji:'juu-ni',en:'twelve',es:'doce',example:'十二ヶ月。',example_en:'Twelve months.',example_es:'Doce meses.',sort_order:16},
  {deck_id:'n5-numbers',jp:'二十',romaji:'ni-juu',en:'twenty',es:'veinte',example:'二十歳です。',example_en:'I am twenty years old.',example_es:'Tengo veinte años.',sort_order:17},
  {deck_id:'n5-numbers',jp:'三十',romaji:'san-juu',en:'thirty',es:'treinta',example:'三十分。',example_en:'Thirty minutes.',example_es:'Treinta minutos.',sort_order:18},
  {deck_id:'n5-numbers',jp:'四十',romaji:'yon-juu',en:'forty',es:'cuarenta',example:'四十度。',example_en:'Forty degrees.',example_es:'Cuarenta grados.',sort_order:19},
  {deck_id:'n5-numbers',jp:'五十',romaji:'go-juu',en:'fifty',es:'cincuenta',example:'五十円。',example_en:'Fifty yen.',example_es:'Cincuenta yenes.',sort_order:20},
];

async function insert(batch) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates',
    },
    body: JSON.stringify(batch),
  });
  const text = await res.text();
  console.log(res.status, text.slice(0, 100));
}

for (let i = 0; i < cards.length; i += 10) {
  await insert(cards.slice(i, i + 10));
}

// Update card_count
const r = await fetch(`https://ambiocrendaqohjcudtj.supabase.co/rest/v1/cards?select=count&deck_id=eq.n5-numbers`, {
  headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Prefer': 'count=exact' }
});
const count = parseInt(r.headers.get('content-range')?.split('/')[1] || '0');
const u = await fetch(`https://ambiocrendaqohjcudtj.supabase.co/rest/v1/decks?id=eq.n5-numbers`, {
  method: 'PATCH',
  headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ card_count: count })
});
console.log(`n5-numbers: ${count} cards, update ${u.status}`);

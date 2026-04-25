const URL = 'https://ambiocrendaqohjcudtj.supabase.co/rest/v1/cards';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYmlvY3JlbmRhcW9oamN1ZHRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkwMjg5MywiZXhwIjoyMDkyNDc4ODkzfQ.l6IHpQ7slr85iVfq14oh8orzv4RzUYhDdYPzVIcDwlY';

const cards = [
  {deck_id:'n5-numbers',jp:'二千万',romaji:'ni-sen-man',en:'20,000,000',es:'veinte millones',example:'二千万円の家。',example_en:'A 20 million yen house.',example_es:'Una casa de 20 millones de yenes.',sort_order:21},
  {deck_id:'n5-numbers',jp:'一日',romaji:'tsuitachi',en:'1st day of month',es:'primer día del mes',example:'一日は休みです。',example_en:'The 1st is a holiday.',example_es:'El día uno es festivo.',sort_order:22},
  {deck_id:'n5-numbers',jp:'二日',romaji:'futsuka',en:'2nd day of month',es:'segundo día del mes',example:'二日に会いましょう。',example_en:"Let's meet on the 2nd.",example_es:'Reunámonos el día dos.',sort_order:23},
  {deck_id:'n5-numbers',jp:'三日',romaji:'mikka',en:'3rd day of month',es:'tercer día del mes',example:'三日坊主。',example_en:'Someone who gives up easily (after 3 days).',example_es:'Alguien que se rinde pronto (a los 3 días).',sort_order:24},
  {deck_id:'n5-numbers',jp:'四日',romaji:'yokka',en:'4th day of month',es:'cuarto día del mes',example:'四日は木曜日です。',example_en:'The 4th is Thursday.',example_es:'El día cuatro es jueves.',sort_order:25},
  {deck_id:'n5-numbers',jp:'五日',romaji:'itsuka',en:'5th day of month',es:'quinto día del mes',example:'五日後に行きます。',example_en:'I will go in five days.',example_es:'Iré en cinco días.',sort_order:26},
  {deck_id:'n5-numbers',jp:'六日',romaji:'muika',en:'6th day of month',es:'sexto día del mes',example:'六日間。',example_en:'For six days.',example_es:'Durante seis días.',sort_order:27},
  {deck_id:'n5-numbers',jp:'七日',romaji:'nanoka',en:'7th day of month',es:'séptimo día del mes',example:'七日は私の誕生日です。',example_en:'The 7th is my birthday.',example_es:'El siete es mi cumpleaños.',sort_order:28},
  {deck_id:'n5-numbers',jp:'八日',romaji:'youka',en:'8th day of month',es:'octavo día del mes',example:'八日にお願いします。',example_en:'On the 8th, please.',example_es:'El día ocho, por favor.',sort_order:29},
  {deck_id:'n5-numbers',jp:'九日',romaji:'kokonoka',en:'9th day of month',es:'noveno día del mes',example:'九日は暇ですか。',example_en:'Are you free on the 9th?',example_es:'¿Estás libre el nueve?',sort_order:30},
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

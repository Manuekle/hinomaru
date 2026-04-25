const URL = 'https://ambiocrendaqohjcudtj.supabase.co/rest/v1/cards';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYmlvY3JlbmRhcW9oamN1ZHRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkwMjg5MywiZXhwIjoyMDkyNDc4ODkzfQ.l6IHpQ7slr85iVfq14oh8orzv4RzUYhDdYPzVIcDwlY';

const cards = [
  // N2 Grammar (Final 14)
  {deck_id:'n2-grammar',jp:'〜に応じて',romaji:'ni oujite',en:'depending on / in accordance with',es:'según / de acuerdo con',example:'予算に応じて、プランを選びます。',example_en:'We choose a plan depending on the budget.',example_es:'Elegimos un plan según el presupuesto.',sort_order:17},
  {deck_id:'n2-grammar',jp:'〜抜きにしては',romaji:'nuki ni shite wa',en:'without / leaving out',es:'sin / dejando de lado',example:'彼の協力抜きにしては、成功しなかった。',example_en:'Without his cooperation, we wouldn\'t have succeeded.',example_es:'Sin su cooperación, no habríamos tenido éxito.',sort_order:18},
  {deck_id:'n2-grammar',jp:'〜を契機に',romaji:'wo keiki ni',en:'as an opportunity / trigger',es:'a raíz de / como oportunidad',example:'転職を契機に、新しい街へ越した。',example_en:'Using the job change as an opportunity, I moved to a new city.',example_es:'A raíz del cambio de trabajo, me mudé a una ciudad nueva.',sort_order:19},
  {deck_id:'n2-grammar',jp:'〜を込めて',romaji:'wo komete',en:'with all (heart / love)',es:'con todo el (corazón / amor)',example:'愛を込めて、手紙を書きました。',example_en:'I wrote a letter with all my love.',example_es:'Escribí una carta con todo mi amor.',sort_order:20},
  {deck_id:'n2-grammar',jp:'〜につき',romaji:'ni tsuki',en:'because of / per',es:'debido a / por cada',example:'雨天につき、試合は中止です。',example_en:'Due to rain, the match is cancelled.',example_es:'Debido a la lluvia, el partido se cancela.',sort_order:21},
  {deck_id:'n2-grammar',jp:'〜を問わず',romaji:'wo towazu',en:'regardless of',es:'sin importar / independientemente de',example:'年齢を問わず、誰でも参加できます。',example_en:'Regardless of age, anyone can participate.',example_es:'Sin importar la edad, cualquiera puede participar.',sort_order:22},
  {deck_id:'n2-grammar',jp:'〜にかかわらず',romaji:'ni kakawarazu',en:'regardless of',es:'independientemente de',example:'天候にかかわらず、出発します。',example_en:'Regardless of the weather, we will depart.',example_es:'Independientemente del clima, saldremos.',sort_order:23},
  {deck_id:'n2-grammar',jp:'〜からいえば',romaji:'kara ieba',en:'from the point of view of',es:'desde el punto de vista de',example:'経験からいえば、これが最善だ。',example_en:'Speaking from experience, this is the best.',example_es:'Hablando desde la experiencia, esto es lo mejor.',sort_order:24},
  {deck_id:'n2-grammar',jp:'〜だけに',romaji:'dake ni',en:'precisely because',es:'precisamente porque',example:'期待していただけに、がっかりした。',example_en:'Precisely because I had high expectations, I was disappointed.',example_es:'Precisamente porque tenía altas expectativas, me decepcioné.',sort_order:25},
  {deck_id:'n2-grammar',jp:'〜たところで',romaji:'ta tokoro de',en:'even if (negative result)',es:'aunque / por mucho que',example:'今から急いだところで、間に合わない。',example_en:'Even if we hurry now, we won\'t make it.',example_es:'Por mucho que nos apresuremos ahora, no llegaremos a tiempo.',sort_order:26},
  {deck_id:'n2-grammar',jp:'〜ものなら',romaji:'mono nara',en:'if one can / if it were possible',es:'si fuera posible',example:'戻れるものなら、過去に戻りたい。',example_en:'If I could go back, I\'d return to the past.',example_es:'Si pudiera volver, volvería al pasado.',sort_order:27},
  {deck_id:'n2-grammar',jp:'〜ないことには',romaji:'nai koto ni wa',en:'unless',es:'a menos que',example:'実物を見ないことには、判断できない。',example_en:'Unless I see the actual thing, I cannot judge.',example_es:'A menos que vea el objeto real, no puedo juzgar.',sort_order:28},
  {deck_id:'n2-grammar',jp:'〜ものの',romaji:'mono no',en:'although',es:'aunque / a pesar de que',example:'大学は卒業したものの、就職先がない。',example_en:'Although I graduated from university, I have no job.',example_es:'Aunque me gradué de la universidad, no tengo trabajo.',sort_order:29},
  {deck_id:'n2-grammar',jp:'〜つつある',romaji:'tsutsu aru',en:'in the process of',es:'estar en proceso de',example:'景気は回復しつつある。',example_en:'The economy is in the process of recovering.',example_es:'La economía está en proceso de recuperación.',sort_order:30},

  // N1 Grammar (Final 14)
  {deck_id:'n1-grammar',jp:'〜を皮切りに',romaji:'wo kawakiri ni',en:'starting with',es:'empezando con',example:'東京公演を皮切りに、全国ツアーが始まる。',example_en:'Starting with the Tokyo performance, the national tour begins.',example_es:'Empezando con la actuación en Tokio, comienza la gira nacional.',sort_order:17},
  {deck_id:'n1-grammar',jp:'〜というところだ',romaji:'to iu tokoro da',en:'at most',es:'a lo sumo / como mucho',example:'給料は、まあ２０万円というところだ。',example_en:'My salary is, well, about 200,000 yen at most.',example_es:'Mi salario es, bueno, unos 200,000 yenes a lo sumo.',sort_order:18},
  {deck_id:'n1-grammar',jp:'〜までもない',romaji:'made mo nai',en:'needless to say / no need to',es:'no hace falta ni / innecesario',example:'言うまでもないが、健康は大切だ。',example_en:'It goes without saying, but health is important.',example_es:'No hace falta ni decirlo, pero la salud es importante.',sort_order:19},
  {deck_id:'n1-grammar',jp:'〜までだ',romaji:'made da',en:'only / just (no other way)',es:'solo / simplemente',example:'誰もやらないなら、私がやるまでだ。',example_en:'If no one else does it, I\'ll just do it myself.',example_es:'Si nadie más lo hace, simplemente lo haré yo mismo.',sort_order:20},
  {deck_id:'n1-grammar',jp:'〜にかたくない',romaji:'ni katakunai',en:'not difficult to (imagine / see)',es:'no es difícil de (imaginar)',example:'彼の落胆ぶりは想像にかたくない。',example_en:'It\'s not hard to imagine his disappointment.',example_es:'No es difícil imaginar su decepción.',sort_order:21},
  {deck_id:'n1-grammar',jp:'〜といったらない',romaji:'to ittara nai',en:'extremely / indescribably',es:'no hay palabras para describir',example:'その美しさといったらなかった。',example_en:'Her beauty was indescribable.',example_es:'Su belleza era indescriptible.',sort_order:22},
  {deck_id:'n1-grammar',jp:'〜かぎりだ',romaji:'kagiri da',en:'extremely / feel very',es:'sumamente / me siento muy',example:'こんなに褒められて、嬉しいかぎりだ。',example_en:'To be praised this much, I\'m extremely happy.',example_es:'Al ser elogiado tanto, me siento sumamente feliz.',sort_order:23},
  {deck_id:'n1-grammar',jp:'〜はおろか',romaji:'wa oroka',en:'not to mention / let alone',es:'ya no digamos / ni hablar de',example:'歩くことはおろか、立つこともできない。',example_en:'I can\'t even stand, let alone walk.',example_es:'Ni siquiera puedo estar de pie, ya no digamos caminar.',sort_order:24},
  {deck_id:'n1-grammar',jp:'〜たりとも',romaji:'tari tomo',en:'not even (a small amount)',es:'ni siquiera (un poco)',example:'一分たりとも無駄にできない。',example_en:'We can\'t waste even a single minute.',example_es:'No podemos desperdiciar ni un solo minuto.',sort_order:25},
  {deck_id:'n1-grammar',jp:'〜すら',romaji:'sura',en:'even',es:'incluso / hasta',example:'自分の名前すら忘れてしまった。',example_en:'I even forgot my own name.',example_es:'Incluso olvidé mi propio nombre.',sort_order:26},
  {deck_id:'n1-grammar',jp:'〜だの〜だの',romaji:'dano dano',en:'things like A and B (critical)',es:'cosas como A y B (crítico)',example:'忙しいだの暇がないだの、文句ばかりだ。',example_en:'Complaining about being busy and having no time.',example_es:'Quejándose de estar ocupado y no tener tiempo.',sort_order:27},
  {deck_id:'n1-grammar',jp:'〜ともなく',romaji:'tomo naku',en:'without really (intending)',es:'sin querer realmente',example:'見るともなくテレビを眺めていた。',example_en:'I was gazing at the TV without really watching it.',example_es:'Estaba mirando la tele sin verla realmente.',sort_order:28},
  {deck_id:'n1-grammar',jp:'〜ごとき',romaji:'gotoki',en:'like / as (literary / humble)',es:'como / tal como',example:'私ごときが口を出すことではない。',example_en:'It\'s not for someone like me to speak up.',example_es:'No es para alguien como yo el hablar.',sort_order:29},
  {deck_id:'n1-grammar',jp:'〜んばかりだ',romaji:'n bakari da',en:'as if / about to',es:'como si fuera a',example:'彼は泣き出さんばかりの顔をしていた。',example_en:'He looked as if he was about to burst into tears.',example_es:'Tenía cara como si fuera a echarse a llorar.',sort_order:30},
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

const decks = ['n2-grammar','n1-grammar'];
for (const id of decks) {
  const r = await fetch(`https://ambiocrendaqohjcudtj.supabase.co/rest/v1/cards?select=count&deck_id=eq.${id}`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Prefer': 'count=exact' }
  });
  const count = parseInt(r.headers.get('content-range')?.split('/')[1] || '0');
  const u = await fetch(`https://ambiocrendaqohjcudtj.supabase.co/rest/v1/decks?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ card_count: count })
  });
  console.log(`${id}: ${count} cards, update ${u.status}`);
}

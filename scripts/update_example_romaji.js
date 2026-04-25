const URL_BASE = 'https://ambiocrendaqohjcudtj.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYmlvY3JlbmRhcW9oamN1ZHRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkwMjg5MywiZXhwIjoyMDkyNDc4ODkzfQ.l6IHpQ7slr85iVfq14oh8orzv4RzUYhDdYPzVIcDwlY';

const HEADERS = {
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const updates = [
  { jp: '〜は〜です', example_romaji: 'Kore wa hon desu.' },
  { jp: '〜じゃありません', example_romaji: 'Kore ja arimasen.' },
  { jp: '〜が〜います', example_romaji: 'Neko ga imasu.' },
  { jp: '〜が〜あります', example_romaji: 'Tsukue ga arimasu.' },
  { jp: '〜を〜します', example_romaji: 'Shukudai wo shimasu.' },
  { jp: '〜に行きます', example_romaji: 'Gakkou ni ikimasu.' },
  { jp: '〜で〜します', example_romaji: 'Basu de ikimasu.' },
  { jp: '〜から〜まで', example_romaji: 'Kuji kara goji made.' },
  { jp: '〜と〜', example_romaji: 'Pan to tamago wo tabemasu.' },
  { jp: '〜たい', example_romaji: 'Tabetai desu.' },
  { jp: '〜ましょう', example_romaji: 'Tabemashou.' },
  { jp: '〜ませんか', example_romaji: 'Ikimasen ka?' },
  { jp: '〜てください', example_romaji: 'Mite kudasai.' },
  { jp: '〜てもいいですか', example_romaji: 'Haittemo ii desu ka?' },
  { jp: '〜てはいけません', example_romaji: 'Koko de hanashite wa ikemasen.' },
  { jp: '〜なければなりません', example_romaji: 'Ikanakereba narimasen.' },
  { jp: '〜ている', example_romaji: 'Tabete imasu.' },
  { jp: '〜た', example_romaji: 'Tabeta.' },
  { jp: '〜ない', example_romaji: 'Tabenai.' },
  { jp: '〜のが好きです', example_romaji: 'Utau no ga suki desu.' },
  { jp: '〜から (reason)', example_romaji: 'Atsui kara, mizu wo nomimasu.' },
  { jp: '〜ので', example_romaji: 'Ame nanode, uchi ni imasu.' },
  { jp: '〜が (but)', example_romaji: 'Nihongo wa suki desuga, muzukashii desu.' },
  { jp: '〜も', example_romaji: 'Watashi mo gakusei desu.' },
  { jp: '〜よりも', example_romaji: 'Neko wa inu yori mo suki desu.' },
  { jp: '〜の方が', example_romaji: 'Kore no hou ga ii desu.' },
  { jp: '〜ことができます', example_romaji: 'Nihongo wo hanasu koto ga dekimasu.' },
  { jp: '〜たことがあります', example_romaji: 'Nihon ni itta koto ga arimasu.' },
  { jp: '〜つもりです', example_romaji: 'Nihon ni iku tsumori desu.' },
  { jp: '〜かもしれません', example_romaji: 'Kare wa konai kamoshiremasen.' },
];

async function update() {
  console.log('Updating examples with Romaji in extra field...');
  for (const item of updates) {
    const res = await fetch(`${URL_BASE}/cards?jp=eq.${encodeURIComponent(item.jp)}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ extra: { example_romaji: item.example_romaji } })
    });
    if (res.ok) {
      console.log(`Updated ${item.jp}`);
    } else {
      console.error(`Failed ${item.jp}: ${await res.status} ${await res.text()}`);
    }
  }
}

update();

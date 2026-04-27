-- Update stories with longer bodies and more comprehensive quizzes (10 questions each)
-- Part 1: Stories 1, 2, and 3

-- Story 1: My Morning Routine
UPDATE stories
SET body_jp = '毎朝、私は七時に起きます。まず窓を開けて、外の新鮮な空気を吸います。それから台所へ行って、冷たい水で顔を洗います。
朝ごはんは、いつもトーストと卵とコーヒーです。時々、バナナやりんごなどの果物も食べます。朝ごはんはとても大切だと思います。
食事の後で、歯を磨いて、服を着ます。八時に家を出ます。学校までは自転車で十五分くらいかかります。
学校では友達に会うのがとても楽しみです。毎日勉強は大変ですが、頑張ります。夜は十一時に寝ます。',
body_en = 'Every morning, I wake up at seven. First, I open the window and breathe in the fresh outside air. Then I go to the kitchen and wash my face with cold water.
Breakfast is always toast, eggs, and coffee. Sometimes I also eat fruit like bananas or apples. I think breakfast is very important.
After eating, I brush my teeth and get dressed. I leave the house at eight. It takes about fifteen minutes to get to school by bicycle.
I really look forward to meeting my friends at school. Studying every day is hard, but I do my best. At night, I go to bed at eleven.',
body_es = 'Cada mañana me levanto a las siete. Primero abro la ventana y respiro el aire fresco del exterior. Luego voy a la cocina y me lavo la cara con agua fría.
El desayuno siempre es tostadas, huevos y café. A veces también como fruta como plátanos o manzanas. Creo que el desayuno es muy importante.
Después de comer, me cepillo los dientes y me visto. Salgo de casa a las ocho. Tardo unos quince minutos en llegar a la escuela en bicicleta.
Tengo muchas ganas de ver a mis amigos en la escuela. Estudiar todos los días es difícil, pero me esfuerzo al máximo. Por la noche me acuesto a las once.',
vocab = '[
  {"jp":"毎朝","kana":"まいあさ","en":"every morning","es":"cada mañana"},
  {"jp":"窓","kana":"まど","en":"window","es":"ventana"},
  {"jp":"新鮮な","kana":"しんせんな","en":"fresh","es":"fresco"},
  {"jp":"空気","kana":"くうき","en":"air","es":"aire"},
  {"jp":"吸います","kana":"すいます","en":"to breathe/smoke","es":"respirar"},
  {"jp":"台所","kana":"だいどころ","en":"kitchen","es":"cocina"},
  {"jp":"洗います","kana":"あらいます","en":"to wash","es":"lavar"},
  {"jp":"朝ごはん","kana":"あさごはん","en":"breakfast","es":"desayuno"},
  {"jp":"果物","kana":"くだもの","en":"fruit","es":"fruta"},
  {"jp":"大切","kana":"たいせつ","en":"important","es":"importante"},
  {"jp":"歯","kana":"は","en":"teeth","es":"dientes"},
  {"jp":"磨いて","kana":"みがいて","en":"to brush","es":"cepillar"},
  {"jp":"服","kana":"ふく","en":"clothes","es":"ropa"},
  {"jp":"着ます","kana":"きます","en":"to wear","es":"vestirse"},
  {"jp":"八時","kana":"はちじ","en":"8 o''clock","es":"las ocho"},
  {"jp":"自転車","kana":"じてんしゃ","en":"bicycle","es":"bicicleta"},
  {"jp":"十五分","kana":"じゅうごふん","en":"15 minutes","es":"15 minutos"},
  {"jp":"楽しみ","kana":"たのしみ","en":"looking forward to","es":"tener ganas"},
  {"jp":"大変","kana":"たいへん","en":"hard / difficult","es":"difícil"},
  {"jp":"寝ます","kana":"ねます","en":"to sleep","es":"dormir"}
]',
quiz = '[
  {
    "q": "What time does the narrator wake up?",
    "q_jp": "語り手は何時に起きますか？",
    "q_romaji": "Katarite wa nan-ji ni okimasu ka?",
    "q_es": "¿A qué hora se levanta el narrador?",
    "o": ["Six o''clock", "Seven o''clock", "Eight o''clock", "Nine o''clock"],
    "o_jp": ["六時", "七時", "八時", "九時"],
    "o_romaji": ["Roku-ji", "Shichi-ji", "Hachi-ji", "Ku-ji"],
    "o_es": ["A las seis", "A las siete", "A las ocho", "A las nueve"],
    "a": 1
  },
  {
    "q": "What is the first thing they do after waking up?",
    "q_jp": "起きた後で、まず何をしますか？",
    "q_romaji": "Okita ato de, mazu nani o shimasu ka?",
    "q_es": "¿Qué es lo primero que hace después de despertarse?",
    "o": ["Eat breakfast", "Wash face", "Open the window", "Brush teeth"],
    "o_jp": ["朝ごはんを食べる", "顔を洗う", "窓を開ける", "歯を磨く"],
    "o_romaji": ["Asagohan o taberu", "Kao o arau", "Mado o akeru", "Ha o migaku"],
    "o_es": ["Desayunar", "Lavarse la cara", "Abrir la ventana", "Cepillarse los dientes"],
    "a": 2
  },
  {
    "q": "What do they drink for breakfast?",
    "q_jp": "朝ごはんに何を飲みますか？",
    "q_romaji": "Asagohan ni nani o nomimasu ka?",
    "q_es": "¿Qué bebe para desayunar?",
    "o": ["Tea", "Water", "Milk", "Coffee"],
    "o_jp": ["お茶", "水", "牛乳", "コーヒー"],
    "o_romaji": ["Ocha", "Mizu", "Gyūnyū", "Kōhī"],
    "o_es": ["Té", "Agua", "Leche", "Café"],
    "a": 3
  },
  {
    "q": "What fruit do they sometimes eat?",
    "q_jp": "時々何の果物を食べますか？",
    "q_romaji": "Tokidoki nan no kudamono o tabemasu ka?",
    "q_es": "¿Qué fruta come a veces?",
    "o": ["Oranges", "Bananas and apples", "Grapes", "Strawberries"],
    "o_jp": ["オレンジ", "バナナとりんご", "ぶどう", "いちご"],
    "o_romaji": ["Orenji", "Banana to ringo", "Budō", "Ichigo"],
    "o_es": ["Naranjas", "Plátanos y manzanas", "Uvas", "Fresas"],
    "a": 1
  },
  {
    "q": "What does the narrator think about breakfast?",
    "q_jp": "語り手は朝ごはんについてどう思いますか？",
    "q_romaji": "Katarite wa asagohan ni tsuite dō omoimasu ka?",
    "q_es": "¿Qué piensa el narrador sobre el desayuno?",
    "o": ["It is boring", "It is not needed", "It is very important", "It is expensive"],
    "o_jp": ["つまらない", "いらない", "とても大切", "高い"],
    "o_romaji": ["Tsumaranai", "Iranai", "Totemo taisetsu", "Takai"],
    "o_es": ["Es aburrido", "No es necesario", "Es muy importante", "Es caro"],
    "a": 2
  },
  {
    "q": "What do they do after eating breakfast?",
    "q_jp": "朝ごはんの後で何をしますか？",
    "q_romaji": "Asagohan no ato de nani o shimasu ka?",
    "q_es": "¿Qué hace después de desayunar?",
    "o": ["Sleep", "Watch TV", "Read a book", "Brush teeth and dress up"],
    "o_jp": ["寝る", "テレビを見る", "本を読む", "歯を磨いて服を着る"],
    "o_romaji": ["Neru", "Terebi o miru", "Hon o yomu", "Ha o migaite fuku o kiru"],
    "o_es": ["Dormir", "Ver la tele", "Leer un libro", "Cepillarse los dientes y vestirse"],
    "a": 3
  },
  {
    "q": "What time do they leave the house?",
    "q_jp": "何時に家を出ますか？",
    "q_romaji": "Nan-ji ni ie o demasu ka?",
    "q_es": "¿A qué hora sale de casa?",
    "o": ["Seven", "Eight", "Nine", "Seven-thirty"],
    "o_jp": ["七時", "八時", "九時", "七時半"],
    "o_romaji": ["Shichi-ji", "Hachi-ji", "Ku-ji", "Shichi-ji han"],
    "o_es": ["A las siete", "A las ocho", "A las nueve", "Siete y media"],
    "a": 1
  },
  {
    "q": "How do they go to school?",
    "q_jp": "どうやって学校に行きますか？",
    "q_romaji": "Dōyatte gakkō ni ikimasu ka?",
    "q_es": "¿Cómo va a la escuela?",
    "o": ["By bus", "By train", "By bicycle", "Walking"],
    "o_jp": ["バスで", "電車で", "自転車で", "歩いて"],
    "o_romaji": ["Basu de", "Densha de", "Jitensha de", "Aruite"],
    "o_es": ["En autobús", "En tren", "En bicicleta", "Caminando"],
    "a": 2
  },
  {
    "q": "How long does it take to get to school?",
    "q_jp": "学校までどのくらいかかりますか？",
    "q_romaji": "Gakkō made dono kurai kakarimasu ka?",
    "q_es": "¿Cuánto tiempo tarda en llegar a la escuela?",
    "o": ["5 minutes", "10 minutes", "15 minutes", "30 minutes"],
    "o_jp": ["五分", "十分", "十五分", "三十分"],
    "o_romaji": ["Go-fun", "Juppun", "Jūgo-fun", "Sanjū-fun"],
    "o_es": ["5 minutos", "10 minutos", "15 minutos", "30 minutos"],
    "a": 2
  },
  {
    "q": "What time do they go to sleep?",
    "q_jp": "何時に寝ますか？",
    "q_romaji": "Nan-ji ni nemasu ka?",
    "q_es": "¿A qué hora se duerme?",
    "o": ["Ten o''clock", "Eleven o''clock", "Twelve o''clock", "Nine o''clock"],
    "o_jp": ["十時", "十一時", "十二時", "九時"],
    "o_romaji": ["Jū-ji", "Jūichi-ji", "Jūni-ji", "Ku-ji"],
    "o_es": ["A las diez", "A las once", "A las doce", "A las nueve"],
    "a": 1
  }
]'::jsonb
WHERE title_en = 'My Morning Routine';

-- Story 2: The Weather Today
UPDATE stories
SET body_jp = '今日はとてもいい天気です。空は青くて、雲が一つもありません。太陽が明るくて、少し暑いです。
私は軽いTシャツを着て、外に出ます。近くの公園まで歩いて行きます。公園にはたくさんの花が咲いていて、とてもきれいです。
ベンチに座って、本を読みます。風が気持ちいいです。子供たちが元気に走っています。犬も遊んでいます。
午後からは雨が降るそうですが、今はとても静かです。このような日は、外でゆっくりするのが一番好きです。',
body_en = 'Today the weather is very good. The sky is blue and there isn''t a single cloud. The sun is bright and it''s a little hot.
I put on a light T-shirt and go outside. I walk to a nearby park. Many flowers are blooming in the park, and it''s very beautiful.
I sit on a bench and read a book. The breeze feels good. Children are running around energetically. Dogs are also playing.
I heard it might rain in the afternoon, but right now it''s very quiet. On days like this, I like relaxing outside the most.',
body_es = 'Hoy hace muy buen tiempo. El cielo está azul y no hay ni una sola nube. El sol brilla y hace un poco de calor.
Me pongo una camiseta ligera y salgo. Camino hasta un parque cercano. Muchas flores están floreciendo en el parque y es muy hermoso.
Me siento en un banco y leo un libro. La brisa se siente bien. Los niños corren con energía. Los perros también están jugando.
He oído que podría llover por la tarde, pero ahora mismo está muy tranquilo. En días como este, lo que más me gusta es relajarme al aire libre.',
vocab = '[
  {"jp":"天気","kana":"てんき","en":"weather","es":"tiempo / clima"},
  {"jp":"青い","kana":"あおい","en":"blue","es":"azul"},
  {"jp":"雲","kana":"くも","en":"cloud","es":"nube"},
  {"jp":"太陽","kana":"たいよう","en":"sun","es":"sol"},
  {"jp":"明るい","kana":"あかるい","en":"bright","es":"brillante"},
  {"jp":"暑い","kana":"あつい","en":"hot","es":"calor"},
  {"jp":"軽い","kana":"かるい","en":"light (weight)","es":"ligero"},
  {"jp":"歩いて","kana":"あるいて","en":"walking","es":"caminando"},
  {"jp":"咲いて","kana":"さいて","en":"blooming","es":"floreciendo"},
  {"jp":"座って","kana":"すわって","en":"sitting","es":"sentado"},
  {"jp":"風","kana":"かぜ","en":"wind / breeze","es":"viento"},
  {"jp":"気持ちいい","kana":"きもちいい","en":"feels good","es":"se siente bien"},
  {"jp":"元気に","kana":"げんきに","en":"energetically / healthy","es":"con energía"},
  {"jp":"遊んで","kana":"あそんで","en":"playing","es":"jugando"},
  {"jp":"午後","kana":"ごご","en":"afternoon","es":"tarde"},
  {"jp":"静か","kana":"しずか","en":"quiet","es":"tranquilo"},
  {"jp":"ゆっくり","kana":"ゆっくり","en":"slowly / relax","es":"despacio / relajado"},
  {"jp":"一番","kana":"いちばん","en":"the best / number one","es":"el mejor / lo que más"}
]',
quiz = '[
  {
    "q": "How is the weather today?",
    "q_jp": "今日の天気はどうですか？",
    "q_romaji": "Kyō no tenki wa dō desu ka?",
    "q_es": "¿Cómo está el tiempo hoy?",
    "o": ["Rainy", "Cloudy", "Very good", "Snowy"],
    "o_jp": ["雨", "曇り", "とてもいい", "雪"],
    "o_romaji": ["Ame", "Kumori", "Totemo ii", "Yuki"],
    "o_es": ["Lluvioso", "Nublado", "Muy bueno", "Nevado"],
    "a": 2
  },
  {
    "q": "How many clouds are in the sky?",
    "q_jp": "空に雲がいくつありますか？",
    "q_romaji": "Sora ni kumo ga ikutsu arimasu ka?",
    "q_es": "¿Cuántas nubes hay en el cielo?",
    "o": ["Many", "None", "Two", "One"],
    "o_jp": ["たくさん", "一つもない", "二つ", "一つ"],
    "o_romaji": ["Takusan", "Hitotsu mo nai", "Futatsu", "Hitotsu"],
    "o_es": ["Muchas", "Ninguna", "Dos", "Una"],
    "a": 1
  },
  {
    "q": "What is the narrator wearing?",
    "q_jp": "語り手は何を着ていますか？",
    "q_romaji": "Katarite wa nani o kite imasu ka?",
    "q_es": "¿Qué lleva puesto el narrador?",
    "o": ["A heavy coat", "A light T-shirt", "A sweater", "A suit"],
    "o_jp": ["重いコート", "軽いTシャツ", "セーター", "スーツ"],
    "o_romaji": ["Omoi kōto", "Karui T-shatsu", "Sētā", "Sūtsu"],
    "o_es": ["Un abrigo pesado", "Una camiseta ligera", "Un suéter", "Un traje"],
    "a": 1
  },
  {
    "q": "Where is the narrator going?",
    "q_jp": "語り手はどこへ行きますか？",
    "q_romaji": "Katarite wa doko e ikimasu ka?",
    "q_es": "¿A dónde va el narrador?",
    "o": ["School", "Work", "Park", "Store"],
    "o_jp": ["学校", "仕事", "公園", "店"],
    "o_romaji": ["Gakkō", "Shigoto", "Kōen", "Mise"],
    "o_es": ["Escuela", "Trabajo", "Parque", "Tienda"],
    "a": 2
  },
  {
    "q": "How does the narrator get to the park?",
    "q_jp": "どうやって公園に行きますか？",
    "q_romaji": "Dōyatte kōen ni ikimasu ka?",
    "q_es": "¿Cómo llega al parque?",
    "o": ["By bus", "By bicycle", "By car", "Walking"],
    "o_jp": ["バスで", "自転車で", "車で", "歩いて"],
    "o_romaji": ["Basu de", "Jitensha de", "Kuruma de", "Aruite"],
    "o_es": ["En autobús", "En bicicleta", "En coche", "Caminando"],
    "a": 3
  },
  {
    "q": "What is blooming in the park?",
    "q_jp": "公園に何が咲いていますか？",
    "q_romaji": "Kōen ni nani ga saite imasu ka?",
    "q_es": "¿Qué está floreciendo en el parque?",
    "o": ["Trees", "Flowers", "Grass", "Fruit"],
    "o_jp": ["木", "花", "草", "果物"],
    "o_romaji": ["Ki", "Hana", "Kusa", "Kudamono"],
    "o_es": ["Árboles", "Flores", "Hierba", "Fruta"],
    "a": 1
  },
  {
    "q": "What does the narrator do on the bench?",
    "q_jp": "ベンチで何をしますか？",
    "q_romaji": "Benchi de nani o shimasu ka?",
    "q_es": "¿Qué hace el narrador en el banco?",
    "o": ["Sleep", "Eat", "Read a book", "Call a friend"],
    "o_jp": ["寝る", "食べる", "本を読む", "友達に電話する"],
    "o_romaji": ["Neru", "Taberu", "Hon o yomu", "Tomodachi ni denwa suru"],
    "o_es": ["Dormir", "Comer", "Leer un libro", "Llamar a un amigo"],
    "a": 2
  },
  {
    "q": "How are the children in the park?",
    "q_jp": "公園の子供たちはどうですか？",
    "q_romaji": "Kōen no kodomotachi wa dō desu ka?",
    "q_es": "¿Cómo están los niños en el parque?",
    "o": ["Quiet", "Energetic", "Sleepy", "Sad"],
    "o_jp": ["静か", "元気", "眠い", "悲しい"],
    "o_romaji": ["Shizuka", "Genki", "Nemui", "Kanashii"],
    "o_es": ["Tranquilos", "Energéticos", "Somnolientos", "Tristes"],
    "a": 1
  },
  {
    "q": "What might happen in the afternoon?",
    "q_jp": "午後に何が起きるかもしれませんか？",
    "q_romaji": "Gogo ni nani ga okiru kamoshiremasen ka?",
    "q_es": "¿Qué podría pasar por la tarde?",
    "o": ["Snow", "Wind", "Rain", "Heat wave"],
    "o_jp": ["雪", "風", "雨", "猛暑"],
    "o_romaji": ["Yuki", "Kaze", "Ame", "Mōsho"],
    "o_es": ["Nieve", "Viento", "Lluvia", "Ola de calor"],
    "a": 2
  },
  {
    "q": "What does the narrator like doing on days like this?",
    "q_jp": "このような日に何をするのが好きですか？",
    "q_romaji": "Kono yōna hi ni nani o suru no ga suki desu ka?",
    "q_es": "¿Qué le gusta hacer al narrador en días como este?",
    "o": ["Studying", "Working", "Relaxing outside", "Cleaning"],
    "o_jp": ["勉強", "仕事", "外でゆっくりする", "掃除"],
    "o_romaji": ["Benkyō", "Shigoto", "Soto de yukkuri suru", "Sōji"],
    "o_es": ["Estudiar", "Trabajar", "Relajarse fuera", "Limpiar"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'The Weather Today';

-- Story 3: My Family
UPDATE stories
SET body_jp = '私の家族は四人です。父と母、妹、そして私です。私たちは東京の静かな家に住んでいます。
父は会社員で、毎日忙しいですが、週末はよく釣りに行きます。母は料理がとても上手です。母の作るカレーは世界で一番おいしいです。
妹は高校生です。彼女は音楽が好きで、いつもピアノを練習しています。将来はピアニストになりたいそうです。
夕方はみんなで居間に集まります。テレビを見たり、その日の出来事を話したりします。家族と一緒に過ごす時間は、私にとって一番大切な時間です。',
body_en = 'There are four people in my family. My father, mother, younger sister, and me. We live in a quiet house in Tokyo.
My father is an office worker and is busy every day, but on weekends he often goes fishing. My mother is very good at cooking. The curry she makes is the most delicious in the world.
My younger sister is a high school student. She likes music and is always practicing the piano. She says she wants to be a pianist in the future.
In the evening, we all gather in the living room. We watch TV and talk about the day''s events. The time I spend with my family is the most important time for me.',
body_es = 'Somos cuatro personas en mi familia. Mi padre, mi madre, mi hermana menor y yo. Vivimos en una casa tranquila en Tokio.
Mi padre es oficinista y está ocupado todos los días, pero los fines de semana suele ir a pescar. Mi madre cocina muy bien. El curry que hace es el más rico del mundo.
Mi hermana menor es estudiante de secundaria. Le gusta la música y siempre está practicando el piano. Dice que quiere ser pianista en el futuro.
Por la tarde, todos nos reunimos en el salón. Vemos la televisión y hablamos de lo que ha pasado durante el día. El tiempo que paso con mi familia es el más importante para mí.',
vocab = '[
  {"jp":"家族","kana":"かぞく","en":"family","es":"familia"},
  {"jp":"四人","kana":"よにん","en":"four people","es":"cuatro personas"},
  {"jp":"東京","kana":"とうきょう","en":"Tokyo","es":"Tokio"},
  {"jp":"静かな","kana":"しずかな","en":"quiet","es":"tranquilo"},
  {"jp":"住んでいます","kana":"すんでいます","en":"to live","es":"vivir"},
  {"jp":"会社員","kana":"かいしゃいん","en":"office worker","es":"oficinista"},
  {"jp":"忙しい","kana":"いそがしい","en":"busy","es":"ocupado"},
  {"jp":"週末","kana":"しゅうまつ","en":"weekend","es":"fin de semana"},
  {"jp":"釣り","kana":"つり","en":"fishing","es":"pesca"},
  {"jp":"上手","kana":"じょうず","en":"skillful / good at","es":"hábil / bueno en"},
  {"jp":"料理","kana":"りょうり","en":"cooking / dish","es":"cocina / plato"},
  {"jp":"高校生","kana":"こうこうせい","en":"high school student","es":"estudiante de secundaria"},
  {"jp":"練習","kana":"れんしゅう","en":"practice","es":"práctica"},
  {"jp":"将来","kana":"しょうらい","en":"future","es":"futuro"},
  {"jp":"居間","kana":"いま","en":"living room","es":"salón"},
  {"jp":"出来事","kana":"できごと","en":"event / happening","es":"suceso / evento"},
  {"jp":"過ごす","kana":"すごす","en":"to spend (time)","es":"pasar (tiempo)"},
  {"jp":"時間","kana":"じかん","en":"time","es":"tiempo"}
]',
quiz = '[
  {
    "q": "How many people are in the narrator''s family?",
    "q_jp": "語り手の家族は何人ですか？",
    "q_romaji": "Katarite no kazoku wa nan-nin desu ka?",
    "q_es": "¿Cuántas personas hay en la familia del narrador?",
    "o": ["Three", "Four", "Five", "Six"],
    "o_jp": ["三人", "四人", "五人", "六人"],
    "o_romaji": ["San-nin", "Yo-nin", "Go-nin", "Roku-nin"],
    "o_es": ["Tres", "Cuatro", "Cinco", "Seis"],
    "a": 1
  },
  {
    "q": "Where does the family live?",
    "q_jp": "家族はどこに住んでいますか？",
    "q_romaji": "Kazoku wa doko ni sunde imasu ka?",
    "q_es": "¿Dónde vive la familia?",
    "o": ["Osaka", "Kyoto", "Tokyo", "Fukuoka"],
    "o_jp": ["大阪", "京都", "東京", "福岡"],
    "o_romaji": ["Ōsaka", "Kyōto", "Tōkyō", "Fukuoka"],
    "o_es": ["Osaka", "Kioto", "Tokio", "Fukuoka"],
    "a": 2
  },
  {
    "q": "What is the father''s job?",
    "q_jp": "お父さんの仕事は何ですか？",
    "q_romaji": "Otōsan no shigoto wa nan desu ka?",
    "q_es": "¿Cuál es el trabajo del padre?",
    "o": ["Doctor", "Teacher", "Office worker", "Chef"],
    "o_jp": ["医者", "先生", "会社員", "料理人"],
    "o_romaji": ["Isha", "Sensei", "Kaishayin", "Ryōrinin"],
    "o_es": ["Médico", "Profesor", "Oficinista", "Cocinero"],
    "a": 2
  },
  {
    "q": "What does the father do on weekends?",
    "q_jp": "お父さんは週末に何をしますか？",
    "q_romaji": "Otōsan wa shūmatsu ni nani o shimasu ka?",
    "q_es": "¿Qué hace el padre los fines de semana?",
    "o": ["Golf", "Fishing", "Swimming", "Hiking"],
    "o_jp": ["ゴルフ", "釣り", "水泳", "ハイキング"],
    "o_romaji": ["Gorufu", "Tsuri", "Suiei", "Haikinggu"],
    "o_es": ["Golf", "Pesca", "Natación", "Senderismo"],
    "a": 1
  },
  {
    "q": "What is the mother good at?",
    "q_jp": "お母さんは何が上手ですか？",
    "q_romaji": "Okāsan wa nani ga jōzu desu ka?",
    "q_es": "¿En qué es buena la madre?",
    "o": ["Singing", "Sports", "Cooking", "Driving"],
    "o_jp": ["歌", "スポーツ", "料理", "運転"],
    "o_romaji": ["Uta", "Supōtsu", "Ryōri", "Unten"],
    "o_es": ["Cantar", "Deportes", "Cocinar", "Conducir"],
    "a": 2
  },
  {
    "q": "What is the mother''s best dish?",
    "q_jp": "お母さんの料理で何が一番おいしいですか？",
    "q_romaji": "Okāsan no ryōri de nani ga ichiban oishii desu ka?",
    "q_es": "¿Cuál es el mejor plato de la madre?",
    "o": ["Sushi", "Ramen", "Curry", "Tempura"],
    "o_jp": ["寿司", "ラーメン", "カレー", "天ぷら"],
    "o_romaji": ["Sushi", "Rāmen", "Karē", "Tenpura"],
    "o_es": ["Sushi", "Ramen", "Curry", "Tempura"],
    "a": 2
  },
  {
    "q": "Who is a high school student?",
    "q_jp": "誰が高校生ですか？",
    "q_romaji": "Dare ga kōkōsei desu ka?",
    "q_es": "¿Quién es estudiante de secundaria?",
    "o": ["The narrator", "The sister", "The father", "The mother"],
    "o_jp": ["語り手", "妹", "父", "母"],
    "o_romaji": ["Katarite", "Imōto", "Chichi", "Haha"],
    "o_es": ["El narrador", "La hermana", "El padre", "La madre"],
    "a": 1
  },
  {
    "q": "What instrument does the sister practice?",
    "q_jp": "妹は何の楽器を練習していますか？",
    "q_romaji": "Imōto wa nan no gakki o renshū shite imasu ka?",
    "q_es": "¿Qué instrumento practica la hermana?",
    "o": ["Guitar", "Violin", "Piano", "Flute"],
    "o_jp": ["ギター", "バイオリン", "ピアノ", "フルート"],
    "o_romaji": ["Gitā", "Baiorin", "Piano", "Furūto"],
    "o_es": ["Guitarra", "Violín", "Piano", "Flauta"],
    "a": 2
  },
  {
    "q": "Where does the family gather in the evening?",
    "q_jp": "夕方、家族はどこに集まりますか？",
    "q_romaji": "Yūgata, kazoku wa doko ni atsumarimasu ka?",
    "q_es": "¿Dónde se reúne la familia por la tarde?",
    "o": ["Kitchen", "Garden", "Living room", "Dining room"],
    "o_jp": ["台所", "庭", "居間", "食堂"],
    "o_romaji": ["Daidokoro", "Niwa", "Ima", "Shokudō"],
    "o_es": ["Cocina", "Jardín", "Salón", "Comedor"],
    "a": 2
  },
  {
    "q": "What is the most important time for the narrator?",
    "q_jp": "語り手にとって一番大切な時間はいつですか？",
    "q_romaji": "Katarite ni tsuite ichiban taisetsu na jikan wa itsu desu ka?",
    "q_es": "¿Cuál es el tiempo más importante para el narrador?",
    "o": ["Time with friends", "Time alone", "Time with family", "Time at work"],
    "o_jp": ["友達と過ごす時間", "一人で過ごす時間", "家族と過ごす時間", "仕事の時間"],
    "o_romaji": ["Tomodachi to sugosu jikan", "Hitori de sugosu jikan", "Kazoku to sugosu jikan", "Shigoto no jikan"],
    "o_es": ["Tiempo con amigos", "Tiempo a solas", "Tiempo con la familia", "Tiempo en el trabajo"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'My Family';

-- Story 4: At the Convenience Store
UPDATE stories
SET body_jp = '学校の帰りに、近くのコンビニに寄りました。日本のコンビニはとても便利で、何でもあります。
まず、飲み物のコーナーへ行きました。冷たいお茶と、温かいコーヒーがありました。今日は少し寒いので、温かいコーヒーを選びました。
それから、お弁当のコーナーを見ました。おにぎりやサンドイッチがたくさん並んでいます。私は鮭のおにぎりを一つ買いました。
レジへ行くと、店員さんが「いらっしゃいませ」と元気に言いました。お金を払って、「ありがとうございます」と言って店を出ました。
外で温かいコーヒーを飲みながら、おにぎりを食べました。とてもおいしかったです。',
body_en = 'On the way home from school, I stopped by a nearby convenience store. Japanese convenience stores are very convenient and have everything.
First, I went to the beverage section. There were cold tea and hot coffee. Since it''s a little cold today, I chose hot coffee.
Then, I looked at the bento section. Many rice balls and sandwiches were lined up. I bought one salmon rice ball.
When I went to the register, the staff said "Welcome" (Irrashaimase) energetically. I paid the money, said "Thank you", and left the store.
While drinking hot coffee outside, I ate the rice ball. It was very delicious.',
body_es = 'Al volver de la escuela, pasé por una tienda de conveniencia cercana. Las tiendas de conveniencia japonesas son muy convenientes y tienen de todo.
Primero fui a la sección de bebidas. Había té frío y café caliente. Como hoy hace un poco de frío, elegí café caliente.
Luego miré la sección de bentos. Había muchos onigiris y sándwiches alineados. Compré un onigiri de salmón.
Cuando fui a la caja, el empleado dijo "Bienvenido" (Irrashaimase) con energía. Pagué el dinero, dije "Gracias" y salí de la tienda.
Mientras bebía el café caliente afuera, me comí el onigiri. Estaba muy delicioso.',
vocab = '[
  {"jp":"学校","kana":"がっこう","en":"school","es":"escuela"},
  {"jp":"帰り","kana":"かえり","en":"return / way back","es":"regreso / de vuelta"},
  {"jp":"コンビニ","kana":"こんびに","en":"convenience store","es":"tienda de conveniencia"},
  {"jp":"便利","kana":"べんり","en":"convenient","es":"conveniente"},
  {"jp":"飲み物","kana":"のみもの","en":"beverage / drink","es":"bebida"},
  {"jp":"温かい","kana":"あたたかい","en":"warm","es":"caliente / cálido"},
  {"jp":"選びました","kana":"えらびました","en":"chose","es":"elegí"},
  {"jp":"お弁当","kana":"おべんとう","en":"lunch box / bento","es":"fiambrera / bento"},
  {"jp":"おにぎり","kana":"おにぎり","en":"rice ball","es":"bola de arroz"},
  {"jp":"並んでいます","kana":"ならんでいます","en":"to be lined up","es":"estar en fila / alineado"},
  {"jp":"鮭","kana":"さけ","en":"salmon","es":"salmón"},
  {"jp":"レジ","kana":"れじ","en":"cash register / checkout","es":"caja"},
  {"jp":"店員","kana":"てんいん","en":"clerk / staff","es":"empleado"},
  {"jp":"いらっしゃいませ","kana":"いらっしゃいませ","en":"Welcome!","es":"¡Bienvenido!"},
  {"jp":"元気に","kana":"げんきに","en":"energetically","es":"con energía"},
  {"jp":"払って","kana":"はらって","en":"to pay","es":"pagar"},
  {"jp":"店","kana":"みせ","en":"store / shop","es":"tienda"}
]',
quiz = '[
  {
    "q": "Where did the narrator go after school?",
    "q_jp": "放課後、語り手はどこへ行きましたか？",
    "q_romaji": "Hōkago, katarite wa doko e ikimashita ka?",
    "q_es": "¿A dónde fue el narrador después de la escuela?",
    "o": ["Supermarket", "Bakery", "Convenience store", "Library"],
    "o_jp": ["スーパー", "パン屋", "コンビニ", "図書館"],
    "o_romaji": ["Sūpā", "Pan-ya", "Konbini", "Toshokan"],
    "o_es": ["Supermercado", "Panadería", "Tienda de conveniencia", "Biblioteca"],
    "a": 2
  },
  {
    "q": "What is the narrator''s opinion on Japanese convenience stores?",
    "q_jp": "日本のコンビニについて、語り手はどう思っていますか？",
    "q_romaji": "Nihon no konbini ni tsuite, katarite wa dō omotte imasu ka?",
    "q_es": "¿Cuál es la opinión del narrador sobre las tiendas de conveniencia japonesas?",
    "o": ["They are expensive", "They are convenient", "They are small", "They are far"],
    "o_jp": ["高い", "便利", "小さい", "遠い"],
    "o_romaji": ["Takai", "Benri", "Chiisai", "Tooi"],
    "o_es": ["Son caras", "Son convenientes", "Son pequeñas", "Están lejos"],
    "a": 1
  },
  {
    "q": "Why did the narrator choose hot coffee?",
    "q_jp": "なぜ温かいコーヒーを選びましたか？",
    "q_romaji": "Naze atatakai kōhī o erabimashita ka?",
    "q_es": "¿Por qué eligió café caliente el narrador?",
    "o": ["Because it was cheap", "Because it was cold today", "Because they like coffee", "Because there was no tea"],
    "o_jp": ["安いから", "今日は少し寒いから", "コーヒーが好きだから", "お茶がなかったから"],
    "o_romaji": ["Yasui kara", "Kyō wa sukoshi samui kara", "Kōhī ga suki dakara", "Ocha ga nakatta kara"],
    "o_es": ["Porque era barato", "Porque hoy hace un poco de frío", "Porque le gusta el café", "Porque no había té"],
    "a": 1
  },
  {
    "q": "What did the narrator see in the bento section?",
    "q_jp": "お弁当のコーナーに何がありましたか？",
    "q_romaji": "Obentō no kōnā ni nani ga arimashita ka?",
    "q_es": "¿Qué vio el narrador en la sección de bentos?",
    "o": ["Cakes", "Fruit", "Rice balls and sandwiches", "Bread"],
    "o_jp": ["ケーキ", "果物", "おにぎりやサンドイッチ", "パン"],
    "o_romaji": ["Kēki", "Kudamono", "Onigiri ya sandoitchi", "Pan"],
    "o_es": ["Pasteles", "Fruta", "Onigiris y sándwiches", "Pan"],
    "a": 2
  },
  {
    "q": "What kind of onigiri did the narrator buy?",
    "q_jp": "どんなおにぎりを買いましたか？",
    "q_romaji": "Donna onigiri o kaimashita ka?",
    "q_es": "¿Qué tipo de onigiri compró el narrador?",
    "o": ["Tuna", "Plum", "Salmon", "Beef"],
    "o_jp": ["ツナ", "梅", "鮭", "牛肉"],
    "o_romaji": ["Tsuna", "Ume", "Sake", "Gyūniku"],
    "o_es": ["Atún", "Ciruela", "Salmón", "Ternera"],
    "a": 2
  },
  {
    "q": "What did the staff say at the register?",
    "q_jp": "レジで店員さんは何と言いましたか？",
    "q_romaji": "Reji de ten''in-san wa nan to iimashita ka?",
    "q_es": "¿Qué dijo el empleado en la caja?",
    "o": ["Goodbye", "Welcome", "How are you?", "Wait a moment"],
    "o_jp": ["さようなら", "いらっしゃいませ", "お元気ですか？", "ちょっと待ってください"],
    "o_romaji": ["Sayōnara", "Irrashaimase", "O-genki desu ka?", "Chotto matte kudasai"],
    "o_es": ["Adiós", "Bienvenido", "¿Cómo estás?", "Espere un momento"],
    "a": 1
  },
  {
    "q": "What did the narrator say after paying?",
    "q_jp": "お金を払った後、何と言いましたか？",
    "q_romaji": "O-kane o haratta ato, nan to iimashita ka?",
    "q_es": "¿Qué dijo el narrador después de pagar?",
    "o": ["Hello", "Sorry", "Thank you", "Excuse me"],
    "o_jp": ["こんにちは", "すみません", "ありがとうございます", "失礼します"],
    "o_romaji": ["Konnichiwa", "Sumimasen", "Arigatō gozaimasu", "Shitsurei shimasu"],
    "o_es": ["Hola", "Perdón", "Gracias", "Disculpe"],
    "a": 2
  },
  {
    "q": "Where did the narrator eat the onigiri?",
    "q_jp": "どこでおにぎりを食べましたか？",
    "q_romaji": "Doko de onigiri o tabemashita ka?",
    "q_es": "¿Dónde se comió el onigiri el narrador?",
    "o": ["At home", "Inside the store", "Outside", "On the bus"],
    "o_jp": ["家で", "店の中で", "外で", "バスの中で"],
    "o_romaji": ["Ie de", "Mise no naka de", "Soto de", "Basu no naka de"],
    "o_es": ["En casa", "Dentro de la tienda", "Afuera", "En el autobús"],
    "a": 2
  },
  {
    "q": "What was the narrator doing while eating the onigiri?",
    "q_jp": "おにぎりを食べながら何をしていましたか？",
    "q_romaji": "Onigiri o tabenagara nani o shite imashita ka?",
    "q_es": "¿Qué estaba haciendo el narrador mientras comía el onigiri?",
    "o": ["Reading", "Drinking coffee", "Walking", "Talking"],
    "o_jp": ["本を読んでいた", "コーヒーを飲んでいた", "歩いていた", "話していた"],
    "o_romaji": ["Hon o yonde ita", "Kōhī o nonde ita", "Aruite ita", "Hanashite ita"],
    "o_es": ["Leyendo", "Bebiendo café", "Caminando", "Hablando"],
    "a": 1
  },
  {
    "q": "How was the onigiri?",
    "q_jp": "おにぎりはどうでしたか？",
    "q_romaji": "Onigiri wa dō deshita ka?",
    "q_es": "¿Cómo estaba el onigiri?",
    "o": ["Cold", "Bad", "Very delicious", "Too salty"],
    "o_jp": ["冷たい", "まずい", "とてもおいしい", "塩辛すぎる"],
    "o_romaji": ["Tsumetai", "Mazui", "Totemo oishii", "Shiokarasugiru"],
    "o_es": ["Frío", "Malo", "Muy delicioso", "Demasiado salado"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'At the Convenience Store';

-- Story 5: My Hobby
UPDATE stories
SET body_jp = '私の趣味は写真を撮ることです。去年の誕生日に、父から新しいカメラをもらいました。それから毎日写真を撮っています。
週末はよく公園や古い町に行って、きれいな景色や花を撮ります。時々、友達のポートレートも撮ります。
写真を撮っている時は、とてもリラックスできます。嫌なことも忘れて、目の前の景色に集中します。
最近はインターネットで自分の写真を公開しています。色々な国の人からコメントをもらうのがとても嬉しいです。
将来はもっと練習して、プロの写真家になりたいと思っています。',
body_en = 'My hobby is taking pictures. On my birthday last year, I received a new camera from my father. Since then, I have been taking pictures every day.
On weekends, I often go to parks or old towns to take pictures of beautiful scenery and flowers. Sometimes, I also take portraits of my friends.
When I am taking pictures, I can relax very much. I forget bad things and concentrate on the scenery in front of me.
Recently, I have been publishing my photos on the internet. I am very happy to receive comments from people in various countries.
In the future, I want to practice more and become a professional photographer.',
body_es = 'Mi pasatiempo es tomar fotos. El pasado año, por mi cumpleaños, recibí una cámara nueva de mi padre. Desde entonces, tomo fotos todos los días.
Los fines de semana suelo ir a parques o pueblos antiguos para fotografiar paisajes hermosos y flores. A veces también tomo retratos de mis amigos.
Cuando estoy tomando fotos, me relajo mucho. Olvido las cosas malas y me concentro en el paisaje que tengo delante.
Recientemente he estado publicando mis fotos en internet. Me hace muy feliz recibir comentarios de personas de varios países.
En el futuro, quiero practicar más y convertirme en fotógrafo profesional.',
vocab = '[
  {"jp":"趣味","kana":"しゅみ","en":"hobby","es":"pasatiempo"},
  {"jp":"写真を撮る","kana":"しゃしんをとる","en":"to take pictures","es":"tomar fotos"},
  {"jp":"誕生日","kana":"たんじょうび","en":"birthday","es":"cumpleaños"},
  {"jp":"カメラ","kana":"かめら","en":"camera","es":"cámara"},
  {"jp":"景色","kana":"けしき","en":"scenery / view","es":"paisaje"},
  {"jp":"町","kana":"まち","en":"town / city","es":"pueblo / ciudad"},
  {"jp":"ポートレート","kana":"ぽーとれーと","en":"portrait","es":"retrato"},
  {"jp":"リラックス","kana":"りらっくす","en":"relax","es":"relajarse"},
  {"jp":"嫌なこと","kana":"いやなこと","en":"bad things / unpleasant things","es":"cosas malas"},
  {"jp":"忘れて","kana":"わすれて","en":"to forget","es":"olvidar"},
  {"jp":"集中","kana":"しうちゅう","en":"concentration","es":"concentración"},
  {"jp":"最近","kana":"さいきん","en":"recently","es":"recientemente"},
  {"jp":"公開","kana":"こうかい","en":"publishing / making public","es":"publicar"},
  {"jp":"嬉しい","kana":"うれしい","en":"happy / glad","es":"feliz"},
  {"jp":"将来","kana":"しょうらい","en":"future","es":"futuro"},
  {"jp":"プロ","kana":"ぷろ","en":"professional","es":"profesional"},
  {"jp":"写真家","kana":"しゃしんか","en":"photographer","es":"fotógrafo"}
]',
quiz = '[
  {
    "q": "What is the narrator''s hobby?",
    "q_jp": "語り手の趣味は何ですか？",
    "q_romaji": "Katarite no shumi wa nan desu ka?",
    "q_es": "¿Cuál es el pasatiempo del narrador?",
    "o": ["Drawing", "Cooking", "Taking pictures", "Sports"],
    "o_jp": ["絵を描くこと", "料理をすること", "写真を撮ること", "スポーツをすること"],
    "o_romaji": ["E o kaku koto", "Ryōri o suru koto", "Shashin o toru koto", "Supōtsu o suru koto"],
    "o_es": ["Dibujar", "Cocinar", "Tomar fotos", "Hacer deporte"],
    "a": 2
  },
  {
    "q": "When did the narrator get the camera?",
    "q_jp": "語り手はいつカメラをもらいましたか？",
    "q_romaji": "Katarite wa itsu kamera o moraimashita ka?",
    "q_es": "¿Cuándo recibió la cámara el narrador?",
    "o": ["Christmas", "Birthday", "Graduation", "New Year"],
    "o_jp": ["クリスマス", "誕生日", "卒業式", "お正月"],
    "o_romaji": ["Kurisumasu", "Tanjōbi", "Sotsugyōshiki", "O-shōgatsu"],
    "o_es": ["Navidad", "Cumpleaños", "Graduación", "Año Nuevo"],
    "a": 1
  },
  {
    "q": "Who gave the camera to the narrator?",
    "q_jp": "誰がカメラをくれましたか？",
    "q_romaji": "Dare ga kamera o kuremashita ka?",
    "q_es": "¿Quién le dio la cámara al narrador?",
    "o": ["Mother", "Friend", "Teacher", "Father"],
    "o_jp": ["お母さん", "友達", "先生", "お父さん"],
    "o_romaji": ["Okāsan", "Tomodachi", "Sensei", "Otōsan"],
    "o_es": ["Su madre", "Un amigo", "Un profesor", "Su padre"],
    "a": 3
  },
  {
    "q": "Where does the narrator go on weekends?",
    "q_jp": "週末にどこへ行きますか？",
    "q_romaji": "Shūmatsu ni doko e ikimasu ka?",
    "q_es": "¿A dónde va el narrador los fines de semana?",
    "o": ["School", "Parks and old towns", "The beach", "The mountains"],
    "o_jp": ["学校", "公園や古い町", "海", "山"],
    "o_romaji": ["Gakkō", "Kōen ya furui machi", "Umi", "Yama"],
    "o_es": ["A la escuela", "Parques y pueblos antiguos", "A la playa", "A la montaña"],
    "a": 1
  },
  {
    "q": "What kind of pictures does the narrator take?",
    "q_jp": "どんな写真を撮りますか？",
    "q_romaji": "Donna shashin o torimasu ka?",
    "q_es": "¿Qué tipo de fotos toma el narrador?",
    "o": ["Food", "Animals", "Scenery, flowers, and portraits", "Cars"],
    "o_jp": ["料理", "動物", "景色、花、ポートレート", "車"],
    "o_romaji": ["Ryōri", "Dōbutsu", "Keshiki, hana, pōtorēto", "Kuruma"],
    "o_es": ["Comida", "Animales", "Paisajes, flores y retratos", "Coches"],
    "a": 2
  },
  {
    "q": "How does the narrator feel when taking pictures?",
    "q_jp": "写真を撮っている時、どう感じますか？",
    "q_romaji": "Shashin o totte iru toki, dō kanjimasu ka?",
    "q_es": "¿Cómo se siente el narrador cuando toma fotos?",
    "o": ["Tired", "Excited", "Relaxed", "Bored"],
    "o_jp": ["疲れる", "ワクワクする", "リラックスできる", "退屈"],
    "o_romaji": ["Tsukareru", "Wakuwaku suru", "Rirakkusu dekiru", "Taikutsu"],
    "o_es": ["Cansado", "Emocionado", "Relajado", "Aburrido"],
    "a": 2
  },
  {
    "q": "What does the narrator forget when taking pictures?",
    "q_jp": "写真を撮る時、何を忘れますか？",
    "q_romaji": "Shashin o toru toki, nani o wasuremasu ka?",
    "q_es": "¿Qué olvida el narrador cuando toma fotos?",
    "o": ["Their name", "The time", "Bad things", "The way home"],
    "o_jp": ["自分の名前", "時間", "嫌なこと", "帰り道"],
    "o_romaji": ["Jibun no namae", "Jikan", "Iyana koto", "Kaerimichi"],
    "o_es": ["Su nombre", "La hora", "Las cosas malas", "El camino a casa"],
    "a": 2
  },
  {
    "q": "Where does the narrator publish their photos?",
    "q_jp": "どこで写真を公開していますか？",
    "q_romaji": "Doko de shashin o kōkai shite imasu ka?",
    "q_es": "¿Dónde publica sus fotos el narrador?",
    "o": ["In a magazine", "On the internet", "At a gallery", "In a book"],
    "o_jp": ["雑誌", "インターネット", "ギャラリー", "本"],
    "o_romaji": ["Zasshi", "Intānetto", "Gyararī", "Hon"],
    "o_es": ["En una revista", "En internet", "En una galería", "En un libro"],
    "a": 1
  },
  {
    "q": "Why is the narrator happy recently?",
    "q_jp": "最近、なぜ嬉しいですか？",
    "q_romaji": "Saikin, naze ureshii desu ka?",
    "q_es": "¿Por qué está feliz el narrador últimamente?",
    "o": ["Because they bought a new camera", "Because they traveled", "Because they get comments from various countries", "Because they won a prize"],
    "o_jp": ["新しいカメラを買ったから", "旅行したから", "色々な国の人からコメントをもらうから", "賞をもらったから"],
    "o_romaji": ["Atarashii kamera o katta kara", "Ryokō shita kara", "Iroirona kuni no hito kara komento o morau kara", "Shō o moratta kara"],
    "o_es": ["Porque compró una cámara nueva", "Porque viajó", "Porque recibe comentarios de varios países", "Porque ganó un premio"],
    "a": 2
  },
  {
    "q": "What is the narrator''s dream for the future?",
    "q_jp": "将来の夢は何ですか？",
    "q_romaji": "Shōrai no yume wa nan desu ka?",
    "q_es": "¿Cuál es el sueño del narrador para el futuro?",
    "o": ["To be a doctor", "To be a professional photographer", "To be a teacher", "To be an artist"],
    "o_jp": ["医者になること", "プロの写真家になること", "先生になること", "画家になること"],
    "o_romaji": ["Isha ni naru koto", "Puro no shashinka ni naru koto", "Sensei ni naru koto", "Gaka ni naru koto"],
    "o_es": ["Ser médico", "Ser fotógrafo profesional", "Ser profesor", "Ser artista"],
    "a": 1
  }
]'::jsonb
WHERE title_en = 'My Hobby';

-- Story 6: At the Restaurant
UPDATE stories
SET body_jp = '昨日の夜、友達と新しい和食のレストランへ行きました。店の入り口には、きれいなのれんがかかっていました。
店の中は木がたくさん使われていて、とても温かい雰囲気でした。私たちは窓側の席に座りました。
メニューには、寿司、天ぷら、うどんなど、色々な料理がありました。私は天ぷら定食を注文しました。
料理が来ると、私たちは「いただきます」と言って食べ始めました。天ぷらはサクサクしていて、とてもおいしかったです。
最後にお茶を飲んで、ゆっくり話しました。会計の時、「ごちそうさまでした」と言いました。また必ず来たいです。',
body_en = 'Last night, I went to a new Japanese restaurant with a friend. At the entrance of the store, a beautiful noren (curtain) was hanging.
The inside of the store used a lot of wood and had a very warm atmosphere. We sat in a seat by the window.
On the menu, there were various dishes such as sushi, tempura, and udon. I ordered the tempura set meal.
When the food arrived, we said "Itadakimasu" and started eating. The tempura was crispy and very delicious.
Finally, we drank tea and talked slowly. When paying, I said "Gochisousama deshita". I definitely want to come again.',
body_es = 'Anoche fui a un nuevo restaurante japonés con un amigo. En la entrada de la tienda colgaba un hermoso noren (cortina).
El interior de la tienda usaba mucha madera y tenía un ambiente muy cálido. Nos sentamos en un asiento junto a la ventana.
En el menú había varios platos como sushi, tempura y udon. Pedí el menú de tempura.
Cuando llegó la comida, dijimos "Itadakimasu" y empezamos a comer. La tempura estaba crujiente y muy deliciosa.
Finalmente bebimos té y hablamos tranquilamente. Al pagar, dije "Gochisousama deshita". Definitivamente quiero volver.',
vocab = '[
  {"jp":"昨日の夜","kana":"きのうのよる","en":"last night","es":"anoche"},
  {"jp":"和食","kana":"わしょく","en":"Japanese food","es":"comida japonesa"},
  {"jp":"レストラン","kana":"れすとらん","en":"restaurant","es":"restaurante"},
  {"jp":"入り口","kana":"いりぐち","en":"entrance","es":"entrada"},
  {"jp":"雰囲気","kana":"ふんいき","en":"atmosphere","es":"ambiente"},
  {"jp":"窓側の席","kana":"まどがわのせき","en":"window seat","es":"asiento junto a la ventana"},
  {"jp":"メニュー","kana":"めにゅー","en":"menu","es":"menú"},
  {"jp":"寿司","kana":"すし","en":"sushi","es":"sushi"},
  {"jp":"天ぷら","kana":"てんぷら","en":"tempura","es":"tempura"},
  {"jp":"注文","kana":"ちゅうもん","en":"order","es":"pedido"},
  {"jp":"いただきます","kana":"いただきます","en":"Let''s eat! (grace)","es":"¡Buen provecho!"},
  {"jp":"サクサク","kana":"さくさく","en":"crispy","es":"crujiente"},
  {"jp":"おいしい","kana":"おいしい","en":"delicious","es":"delicioso"},
  {"jp":"最後","kana":"さいご","en":"last / end","es":"último / final"},
  {"jp":"お茶","kana":"おちゃ","en":"tea","es":"té"},
  {"jp":"会計","kana":"かいけい","en":"bill / payment","es":"cuenta / pago"},
  {"jp":"ごちそうさまでした","kana":"ごちそうさまでした","en":"Thank you for the meal!","es":"¡Gracias por la comida!"},
  {"jp":"必ず","kana":"かならず","en":"certainly / surely","es":"sin falta / seguro"}
]',
quiz = '[
  {
    "q": "When did the narrator go to the restaurant?",
    "q_jp": "いつレストランへ行きましたか？",
    "q_romaji": "Itsu resutoran e ikimashita ka?",
    "q_es": "¿Cuándo fue al restaurante el narrador?",
    "o": ["Last night", "Two days ago", "This morning", "Last weekend"],
    "o_jp": ["昨日の夜", "二日前", "今朝", "先週末"],
    "o_romaji": ["Kinō no yoru", "Futsuka mae", "Kesa", "Senshūmatsu"],
    "o_es": ["Anoche", "Hace dos días", "Esta mañana", "El fin de semana pasado"],
    "a": 0
  },
  {
    "q": "Who did the narrator go with?",
    "q_jp": "誰と行きましたか？",
    "q_romaji": "Dare to ikimashita ka?",
    "q_es": "¿Con quién fue?",
    "o": ["Family", "Friend", "Teacher", "Alone"],
    "o_jp": ["家族", "友達", "先生", "一人で"],
    "o_romaji": ["Kazoku", "Tomodachi", "Sensei", "Hitori de"],
    "o_es": ["Familia", "Un amigo", "Un profesor", "Solo"],
    "a": 1
  },
  {
    "q": "What was hanging at the entrance of the store?",
    "q_jp": "店の入り口に何がかかっていましたか？",
    "q_romaji": "Mise no iriguchi ni nani ga kakatte imashita ka?",
    "q_es": "¿Qué colgaba en la entrada de la tienda?",
    "o": ["A sign", "A flag", "A noren (curtain)", "A picture"],
    "o_jp": ["看板", "旗", "のれん", "写真"],
    "o_romaji": ["Kanban", "Hata", "Noren", "Shashin"],
    "o_es": ["Un cartel", "Una bandera", "Un noren (cortina)", "Una foto"],
    "a": 2
  },
  {
    "q": "How was the atmosphere inside the store?",
    "q_jp": "店の中の雰囲気はどうでしたか？",
    "q_romaji": "Mise no naka no fun''iki wa dō deshita ka?",
    "q_es": "¿Cómo era el ambiente dentro de la tienda?",
    "o": ["Cold", "Warm", "Dark", "Noisy"],
    "o_jp": ["冷たい", "温かい", "暗い", "うるさい"],
    "o_romaji": ["Tsumetai", "Atatakai", "Kurai", "Urusai"],
    "o_es": ["Frío", "Cálido / Acogedor", "Oscuro", "Ruidoso"],
    "a": 1
  },
  {
    "q": "Where did they sit?",
    "q_jp": "二人はどこに座りましたか？",
    "q_romaji": "Futari wa doko ni suwarimashita ka?",
    "q_es": "¿Dónde se sentaron?",
    "o": ["At the counter", "In the center", "By the window", "Outside"],
    "o_jp": ["カウンター", "中央", "窓側の席", "外"],
    "o_romaji": ["Kauntā", "Chūō", "Madogawa no seki", "Soto"],
    "o_es": ["En la barra", "En el centro", "Junto a la ventana", "Fuera"],
    "a": 2
  },
  {
    "q": "What did the narrator order?",
    "q_jp": "語り手は何を注文しましたか？",
    "q_romaji": "Katarite wa nani o chūmon shimashita ka?",
    "q_es": "¿Qué pidió el narrador?",
    "o": ["Sushi", "Tempura set meal", "Udon", "Ramen"],
    "o_jp": ["寿司", "天ぷら定食", "うどん", "ラーメン"],
    "o_romaji": ["Sushi", "Tenpura teishoku", "Udon", "Rāmen"],
    "o_es": ["Sushi", "Menú de tempura", "Udon", "Ramen"],
    "a": 1
  },
  {
    "q": "What did they say before eating?",
    "q_jp": "食べる前に何と言いましたか？",
    "q_romaji": "Taberu mae ni nan to iimashita ka?",
    "q_es": "¿Qué dijeron antes de comer?",
    "o": ["Itadakimasu", "Gochisousama", "Hello", "Cheers"],
    "o_jp": ["いただきます", "ごちそうさまでした", "こんにちは", "乾杯"],
    "o_romaji": ["Itadakimasu", "Gochisōsamadeshita", "Konnichiwa", "Kanpai"],
    "o_es": ["Itadakimasu", "Gochisousama", "Hola", "Salud"],
    "a": 0
  },
  {
    "q": "How was the tempura?",
    "q_jp": "天ぷらはどうでしたか？",
    "q_romaji": "Tenpura wa dō deshita ka?",
    "q_es": "¿Cómo estaba la tempura?",
    "o": ["Soft", "Crispy", "Cold", "Spicy"],
    "o_jp": ["柔らかい", "サクサク", "冷たい", "辛い"],
    "o_romaji": ["Yawarakai", "Sakusaku", "Tsumetai", "Karai"],
    "o_es": ["Blanda", "Crujiente", "Fría", "Picante"],
    "a": 1
  },
  {
    "q": "What did they do after eating?",
    "q_jp": "食べた後、何をしましたか？",
    "q_romaji": "Tabeta ato, nani o shimashita ka?",
    "q_es": "¿Qué hicieron después de comer?",
    "o": ["Slept", "Left immediately", "Drank tea and talked", "Danced"],
    "o_jp": ["寝た", "すぐに出た", "お茶を飲んで話した", "踊った"],
    "o_romaji": ["Neta", "Sugu ni deta", "Ocha o nonde hanashita", "Odotta"],
    "o_es": ["Durmieron", "Se fueron de inmediato", "Bebieron té y hablaron", "Bailaron"],
    "a": 2
  },
  {
    "q": "What did the narrator say when paying?",
    "q_jp": "会計の時、何と言いましたか？",
    "q_romaji": "Kaikei no toki, nan to iimashita ka?",
    "q_es": "¿Qué dijo el narrador al pagar?",
    "o": ["Itadakimasu", "Arigato", "Gochisousama deshita", "Sayonara"],
    "o_jp": ["いただきます", "ありがとう", "ごちそうさまでした", "さようなら"],
    "o_romaji": ["Itadakimasu", "Arigatō", "Gochisōsamadeshita", "Sayōnara"],
    "o_es": ["Itadakimasu", "Gracias", "Gochisousama deshita", "Adiós"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'At the Restaurant';

-- Story 7: Weekend Plans
UPDATE stories
SET body_jp = '今週の土曜日は友達と映画を見に行きます。新宿の新しい映画館で、SF映画を見る予定です。
映画の後は、近くのデパートへ行って買い物をします。私は新しい靴と鞄が欲しいです。デパートはいつも賑やかで楽しいです。
夕方は、おしゃれなカフェでコーヒーとケーキを食べます。そこのチーズケーキはとても有名で、いつも行列ができています。
日曜日は家でゆっくりします。一週間忙しかったので、掃除をして、音楽を聴きながら読書をします。
来週からまた仕事が始まりますが、週末にリフレッシュして頑張ります。',
body_en = 'This Saturday, I am going to watch a movie with a friend. We plan to watch a sci-fi movie at a new theater in Shinjuku.
After the movie, we will go to a nearby department store to shop. I want new shoes and a bag. Department stores are always lively and fun.
In the evening, we will have coffee and cake at a stylish café. The cheesecake there is very famous and there is always a line.
On Sunday, I will relax at home. I was busy all week, so I will do some cleaning and read while listening to music.
Work starts again next week, but I will refresh myself over the weekend and do my best.',
body_es = 'Este sábado voy a ver una película con un amigo. Planeamos ver una película de ciencia ficción en un cine nuevo en Shinjuku.
Después de la película, iremos a unos grandes almacenes cercanos para ir de compras. Quiero zapatos nuevos y un bolso. Los grandes almacenes siempre están animados y son divertidos.
Por la tarde, tomaremos café y pastel en una cafetería elegante. La tarta de queso de allí es muy famosa y siempre hay cola.
El domingo me relajaré en casa. He estado ocupado toda la semana, así que limpiaré y leeré mientras escucho música.
El trabajo empieza de nuevo la semana que viene, pero me refrescaré durante el fin de semana y me esforzaré al máximo.',
vocab = '[
  {"jp":"今週","kana":"こんしゅう","en":"this week","es":"esta semana"},
  {"jp":"土曜日","kana":"どようび","en":"Saturday","es":"sábado"},
  {"jp":"映画館","kana":"えいがかん","en":"movie theater","es":"cine"},
  {"jp":"予定","kana":"よてい","en":"plan / schedule","es":"plan / programa"},
  {"jp":"デパート","kana":"でぱーと","en":"department store","es":"grandes almacenes"},
  {"jp":"買い物","kana":"かいもの","en":"shopping","es":"compras"},
  {"jp":"靴","kana":"くつ","en":"shoes","es":"zapatos"},
  {"jp":"鞄","kana":"かばん","en":"bag","es":"bolso / maleta"},
  {"jp":"賑やか","kana":"にぎやか","en":"lively / busy","es":"animado / concurrido"},
  {"jp":"おしゃれ","kana":"おしゃれ","en":"stylish / fashionable","es":"elegante / con estilo"},
  {"jp":"有名","kana":"ゆうめい","en":"famous","es":"famoso"},
  {"jp":"行列","kana":"ぎょうれつ","en":"line / queue","es":"cola / fila"},
  {"jp":"日曜日","kana":"にちようび","en":"Sunday","es":"domingo"},
  {"jp":"掃除","kana":"そうじ","en":"cleaning","es":"limpieza"},
  {"jp":"読書","kana":"どくしょ","en":"reading","es":"lectura"},
  {"jp":"来週","kana":"らいしゅう","en":"next week","es":"la semana que viene"},
  {"jp":"仕事","kana":"しごと","en":"work / job","es":"trabajo"},
  {"jp":"リフレッシュ","kana":"りふれっしゅ","en":"refresh","es":"refrescarse / renovarse"}
]',
quiz = '[
  {
    "q": "What day is the narrator going to watch a movie?",
    "q_jp": "語り手は何曜日に映画を見に行きますか？",
    "q_romaji": "Katarite wa nan-yōbi ni eiga o mi ni ikimasu ka?",
    "q_es": "¿Qué día va el narrador a ver una película?",
    "o": ["Friday", "Saturday", "Sunday", "Monday"],
    "o_jp": ["金曜日", "土曜日", "日曜日", "月曜日"],
    "o_romaji": ["Kin-yōbi", "Do-yōbi", "Nichi-yōbi", "Getu-yōbi"],
    "o_es": ["Viernes", "Sábado", "Domingo", "Lunes"],
    "a": 1
  },
  {
    "q": "Where is the movie theater located?",
    "q_jp": "映画館はどこにありますか？",
    "q_romaji": "Eigakan wa doko ni arimasu ka?",
    "q_es": "¿Dónde está el cine?",
    "o": ["Shibuya", "Ginza", "Shinjuku", "Asakusa"],
    "o_jp": ["渋谷", "銀座", "新宿", "浅草"],
    "o_romaji": ["Shibuya", "Ginza", "Shinjuku", "Asakusa"],
    "o_es": ["Shibuya", "Ginza", "Shinjuku", "Asakusa"],
    "a": 2
  },
  {
    "q": "What kind of movie will they watch?",
    "q_jp": "どんな映画を見る予定ですか？",
    "q_romaji": "Donna eiga o miru yotei desu ka?",
    "q_es": "¿Qué tipo de película van a ver?",
    "o": ["Horror", "Comedy", "Sci-fi", "Romance"],
    "o_jp": ["ホラー", "コメディ", "SF", "恋愛"],
    "o_romaji": ["Horā", "Komedi", "Esu-efu", "Ren''ai"],
    "o_es": ["Terror", "Comedia", "Ciencia ficción", "Romance"],
    "a": 2
  },
  {
    "q": "Where will they go after the movie?",
    "q_jp": "映画の後はどこへ行きますか？",
    "q_romaji": "Eiga no ato wa doko e ikimasu ka?",
    "q_es": "¿A dónde irán después de la película?",
    "o": ["Park", "Department store", "Library", "Home"],
    "o_jp": ["公園", "デパート", "図書館", "家"],
    "o_romaji": ["Kōen", "Depāto", "Toshokan", "Ie"],
    "o_es": ["Parque", "Grandes almacenes", "Biblioteca", "Casa"],
    "a": 1
  },
  {
    "q": "What does the narrator want to buy?",
    "q_jp": "語り手は何を買いたいですか？",
    "q_romaji": "Katarite wa nani o kaitai desu ka?",
    "q_es": "¿Qué quiere comprar el narrador?",
    "o": ["Clothes and hat", "Shoes and bag", "Watch and ring", "Book and CD"],
    "o_jp": ["服と帽子", "靴と鞄", "時計と指輪", "本とCD"],
    "o_romaji": ["Fuku to bōshi", "Kutsu to kaban", "Tokei to yubiwara", "Hon to shī-dī"],
    "o_es": ["Ropa y sombrero", "Zapatos y bolso", "Reloj y anillo", "Libro y CD"],
    "a": 1
  },
  {
    "q": "How is the department store usually?",
    "q_jp": "デパートはいつもどうですか？",
    "q_romaji": "Depāto wa itsumo dō desu ka?",
    "q_es": "¿Cómo suelen ser los grandes almacenes?",
    "o": ["Quiet", "Dirty", "Lively and fun", "Small"],
    "o_jp": ["静か", "汚い", "賑やかで楽しい", "小さい"],
    "o_romaji": ["Shizuka", "Kitanai", "Nigiyaka de tanoshii", "Chiisai"],
    "o_es": ["Tranquilos", "Sucios", "Animados y divertidos", "Pequeños"],
    "a": 2
  },
  {
    "q": "What will they eat at the café?",
    "q_jp": "カフェで何を食べますか？",
    "q_romaji": "Kafe de nani o tabemasu ka?",
    "q_es": "¿Qué comerán en la cafetería?",
    "o": ["Sandwich", "Pizza", "Coffee and cake", "Pasta"],
    "o_jp": ["サンドイッチ", "ピザ", "コーヒーとケーキ", "パスタ"],
    "o_romaji": ["Sandoitchi", "Piza", "Kōhī to kēki", "Pasuta"],
    "o_es": ["Sándwich", "Pizza", "Café y pastel", "Pasta"],
    "a": 2
  },
  {
    "q": "Why is there always a line at the café?",
    "q_jp": "なぜカフェにはいつも行列ができていますか？",
    "q_romaji": "Naze kafe ni wa itsumo gyōretsu ga dekite imasu ka?",
    "q_es": "¿Por qué siempre hay cola en la cafetería?",
    "o": ["Because it is slow", "Because it is expensive", "Because the cheesecake is famous", "Because it is new"],
    "o_jp": ["遅いから", "高いから", "チーズケーキが有名だから", "新しいから"],
    "o_romaji": ["Osoi kara", "Takai kara", "Chīzukēki ga yūmei dakara", "Atarashii kara"],
    "o_es": ["Porque es lento", "Porque es caro", "Porque la tarta de queso es famosa", "Porque es nuevo"],
    "a": 2
  },
  {
    "q": "What will the narrator do on Sunday?",
    "q_jp": "日曜日に語り手は何をしますか？",
    "q_romaji": "Nichi-yōbi ni katarite wa nani o shimasu ka?",
    "q_es": "¿Qué hará el narrador el domingo?",
    "o": ["Go to work", "Visit friends", "Relax at home, clean and read", "Go to the sea"],
    "o_jp": ["仕事に行く", "友達に会いに行く", "家でゆっくりして、掃除と読書をする", "海へ行く"],
    "o_romaji": ["Shigoto ni iku", "Tomodachi ni ai ni iku", "Ie de yukkuri shite, sōji to dokusho o suru", "Umi e iku"],
    "o_es": ["Ir a trabajar", "Visitar amigos", "Relajarse en casa, limpiar y leer", "Ir al mar"],
    "a": 2
  },
  {
    "q": "When does work start again?",
    "q_jp": "仕事はいつまた始まりますか？",
    "q_romaji": "Shigoto wa itsu mata hajimarimasu ka?",
    "q_es": "¿Cuándo empieza el trabajo de nuevo?",
    "o": ["Today", "Tomorrow", "Next week", "Next month"],
    "o_jp": ["今日", "明日", "来週", "来月"],
    "o_romaji": ["Kyō", "Ashita", "Raishū", "Raigetsu"],
    "o_es": ["Hoy", "Mañana", "La semana que viene", "El mes que viene"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'Weekend Plans';

-- Story 8: A Day at the Beach
UPDATE stories
SET body_jp = '先週の日曜日、家族と海へ行きました。朝早く家を出て、電車で二時間くらいかかりました。
海はとても広くて、青かったです。波の音が心地よくて、心が落ち着きました。
私たちは砂浜にテントを立てて、一日中泳いだり、日光浴をしたりしました。水は少し冷たかったですが、とても気持ちよかったです。
お昼は海の家で焼きそばとカキ氷を食べました。外で食べるご飯は最高においしかったです。
夕方、空が赤く染まるのを見てから帰りました。とても疲れたけれど、素晴らしい一日でした。また来年も来たいです。',
body_en = 'Last Sunday, I went to the sea with my family. We left home early in the morning and it took about two hours by train.
The sea was very wide and blue. The sound of the waves was pleasant and my mind felt calm.
We set up a tent on the sandy beach and spent the whole day swimming and sunbathing. The water was a little cold, but it felt very good.
For lunch, we ate yakisoba and shaved ice at a beach hut. Eating outside was the best.
In the evening, we watched the sky turn red before going home. I was very tired, but it was a wonderful day. I want to come again next year.',
body_es = 'El domingo pasado fui al mar con mi familia. Salimos de casa temprano por la mañana y tardamos unas dos horas en tren.
El mar era muy amplio y azul. El sonido de las olas era agradable y mi mente se sintió tranquila.
Montamos una tienda en la playa de arena y pasamos todo el día nadando y tomando el sol. El agua estaba un poco fría, pero se sentía muy bien.
Para almorzar, comimos yakisoba y granizado en una caseta de playa. Comer fuera fue lo mejor.
Por la tarde, vimos cómo el cielo se teñía de rojo antes de volver a casa. Estaba muy cansado, pero fue un día maravilloso. Quiero volver el año que viene.',
vocab = '[
  {"jp":"先週","kana":"せんしゅう","en":"last week","es":"la semana pasada"},
  {"jp":"海","kana":"うみ","en":"sea / ocean","es":"mar"},
  {"jp":"朝早く","kana":"あさはやく","en":"early morning","es":"temprano por la mañana"},
  {"jp":"二時間","kana":"にじかん","en":"two hours","es":"dos horas"},
  {"jp":"広い","kana":"ひろい","en":"wide / spacious","es":"amplio / ancho"},
  {"jp":"波","kana":"なみ","en":"wave","es":"ola"},
  {"jp":"心地よい","kana":"ここちよい","en":"pleasant / comfortable","es":"agradable"},
  {"jp":"心が落ち着く","kana":"こころがおちつく","en":"to feel calm / relaxed","es":"tranquilizarse"},
  {"jp":"砂浜","kana":"すなはま","en":"sandy beach","es":"playa de arena"},
  {"jp":"テント","kana":"てんと","en":"tent","es":"tienda / carpa"},
  {"jp":"日光浴","kana":"にっこうよく","en":"sunbathing","es":"tomar el sol"},
  {"jp":"冷たい","kana":"つめたい","en":"cold (to touch)","es":"frío"},
  {"jp":"海の家","kana":"うみのいえ","en":"beach hut","es":"caseta de playa"},
  {"jp":"焼きそば","kana":"やきそば","en":"fried noodles","es":"fideos fritos / yakisoba"},
  {"jp":"カキ氷","kana":"かきごおり","en":"shaved ice","es":"granizado / kakigori"},
  {"jp":"最高","kana":"さいこう","en":"the best","es":"lo mejor"},
  {"jp":"染まる","kana":"そまる","en":"to be dyed / colored","es":"teñirse / colorearse"},
  {"jp":"素晴らしい","kana":"すばらしい","en":"wonderful","es":"maravilloso"}
]',
quiz = '[
  {
    "q": "When did the narrator go to the sea?",
    "q_jp": "いつ海へ行きましたか？",
    "q_romaji": "Itsu umi e ikimashita ka?",
    "q_es": "¿Cuándo fue al mar el narrador?",
    "o": ["Last Saturday", "Last Sunday", "This morning", "Yesterday"],
    "o_jp": ["先週の土曜日", "先週の日曜日", "今朝", "昨日"],
    "o_romaji": ["Senshū no do-yōbi", "Senshū no nichi-yōbi", "Kesa", "Kinō"],
    "o_es": ["El sábado pasado", "El domingo pasado", "Esta mañana", "Ayer"],
    "a": 1
  },
  {
    "q": "How long did it take to get there by train?",
    "q_jp": "電車でどのくらいかかりましたか？",
    "q_romaji": "Densha de dono kurai kakarimasu ka?",
    "q_es": "¿Cuánto tiempo tardó en llegar en tren?",
    "o": ["One hour", "Two hours", "Three hours", "Thirty minutes"],
    "o_jp": ["一時間", "二時間", "三時間", "三十分"],
    "o_romaji": ["Ichi-jikan", "Ni-jikan", "San-jikan", "Sanjū-pun"],
    "o_es": ["Una hora", "Dos horas", "Tres horas", "Treinta minutos"],
    "a": 1
  },
  {
    "q": "How was the sea described?",
    "q_jp": "海はどのように表現されていますか？",
    "q_romaji": "Umi wa dono yōni hyōgen sarete imasu ka?",
    "q_es": "¿Cómo se describe el mar?",
    "o": ["Small and green", "Wide and blue", "Dirty and scary", "Cold and dark"],
    "o_jp": ["狭くて緑", "広くて青い", "汚くて怖い", "寒くて暗い"],
    "o_romaji": ["Semakute midori", "Hirokute aoi", "Kitanakute kowai", "Samukute kurai"],
    "o_es": ["Pequeño y verde", "Amplio y azul", "Sucio y aterrador", "Frío y oscuro"],
    "a": 1
  },
  {
    "q": "What made the narrator feel calm?",
    "q_jp": "何が語り手の心を落ち着かせましたか？",
    "q_romaji": "Nani ga katarite no kokoro o ochitsukasemashita ka?",
    "q_es": "¿Qué hizo que el narrador se sintiera tranquilo?",
    "o": ["The sun", "The sand", "The sound of the waves", "The food"],
    "o_jp": ["太陽", "砂", "波の音", "食べ物"],
    "o_romaji": ["Taiyō", "Suna", "Nami no oto", "Tabemono"],
    "o_es": ["El sol", "La arena", "El sonido de las olas", "La comida"],
    "a": 2
  },
  {
    "q": "What did they do on the sandy beach?",
    "q_jp": "砂浜で何をしましたか？",
    "q_romaji": "Sunahama de nani o shimashita ka?",
    "q_es": "¿Qué hicieron en la playa de arena?",
    "o": ["Played soccer", "Set up a tent, swam and sunbathed", "Read books", "Slept all day"],
    "o_jp": ["サッカーをした", "テントを立てて、泳いだり日光浴をしたりした", "本を読んだ", "一日中寝た"],
    "o_romaji": ["Sakkā o shita", "Tento o tatete, oyoidari nikkōyoku o shitari shita", "Hon o yonda", "Ichinichijū neta"],
    "o_es": ["Jugaron al fútbol", "Montaron una tienda, nadaron y tomaron el sol", "Leyeron libros", "Durmieron todo el día"],
    "a": 1
  },
  {
    "q": "How was the water?",
    "q_jp": "水はどうでしたか？",
    "q_romaji": "Mizu wa dō deshita ka?",
    "q_es": "¿Cómo estaba el agua?",
    "o": ["Very warm", "Hot", "A little cold but felt good", "Dirty"],
    "o_jp": ["とても暖かい", "熱い", "少し冷たかったが、気持ちよかった", "汚い"],
    "o_romaji": ["Totemo atatakai", "Atsui", "Sukoshi tsumetakatta ga, kimochiyokatta", "Kitanai"],
    "o_es": ["Muy cálida", "Caliente", "Un poco fría pero se sentía bien", "Sucia"],
    "a": 2
  },
  {
    "q": "Where did they have lunch?",
    "q_jp": "どこでお昼を食べましたか？",
    "q_romaji": "Doko de o-hiru o tabemashita ka?",
    "q_es": "¿Dónde almorzaron?",
    "o": ["At a restaurant", "At home", "At a beach hut", "In the car"],
    "o_jp": ["レストランで", "家で", "海の家で", "車の中で"],
    "o_romaji": ["Resutoran de", "Ie de", "Umi no ie de", "Kuruma no naka de"],
    "o_es": ["En un restaurante", "En casa", "En una caseta de playa", "En el coche"],
    "a": 2
  },
  {
    "q": "What did they eat for lunch?",
    "q_jp": "お昼に何を食べましたか？",
    "q_romaji": "O-hiru ni nani o tabemashita ka?",
    "q_es": "¿Qué almorzaron?",
    "o": ["Sushi and tea", "Yakisoba and shaved ice", "Hamburger and soda", "Sandwich and juice"],
    "o_jp": ["寿司とお茶", "焼きそばとカキ氷", "ハンバーガーとソーダ", "サンドイッチとジュース"],
    "o_romaji": ["Sushi to ocha", "Yakisoba to kakigōri", "Hanbāgā to sōda", "Sandoitchi to jūsu"],
    "o_es": ["Sushi y té", "Yakisoba y granizado", "Hamburguesa y refresco", "Sándwich y jugo"],
    "a": 1
  },
  {
    "q": "What did they watch in the evening?",
    "q_jp": "夕方に何を見ましたか？",
    "q_romaji": "Yūgata ni nani o mimashita ka?",
    "q_es": "¿Qué vieron por la tarde?",
    "o": ["A movie", "People dancing", "The sky turning red", "The moon"],
    "o_jp": ["映画", "踊っている人たち", "赤く染まる空", "月"],
    "o_romaji": ["Eiga", "Odotte iru hitotachi", "Akaku somaru sora", "Tsuki"],
    "o_es": ["Una película", "Gente bailando", "El cielo teñido de rojo", "La luna"],
    "a": 2
  },
  {
    "q": "How did the narrator feel at the end of the day?",
    "q_jp": "一日の終わりに語り手はどう感じましたか？",
    "q_romaji": "Ichinichi no owari ni katarite wa dō kanjimashita ka?",
    "q_es": "¿Cómo se sintió el narrador al final del día?",
    "o": ["Energetic", "Angry", "Tired but had a wonderful day", "Bored"],
    "o_jp": ["元気", "怒っている", "疲れたが、素晴らしい一日だった", "退屈"],
    "o_romaji": ["Genki", "Okotte iru", "Tsukareta ga, subarashii ichinichi datta", "Taikutsu"],
    "o_es": ["Energético", "Enfadado", "Cansado pero tuvo un día maravilloso", "Aburrido"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'A Day at the Beach';

-- Story 9: Buying a New Book
UPDATE stories
SET body_jp = '読書が大好きなので、昨日は仕事の後に大きな本屋へ行きました。
本屋の中はとても静かで、紙のいい匂いがしました。棚には数え切れないほどの本が並んでいました。
私は日本の歴史や文化に興味があるので、そのコーナーで本を探しました。一時間くらい探して、ようやく一冊の面白い本を見つけました。
それは、昔の江戸時代の生活について書かれた本です。写真や絵がたくさんあって、とても分かりやすそうです。
本を買った後、隣のカフェへ行ってすぐに読み始めました。新しい知識を得るのはとてもワクワクします。',
body_en = 'I love reading, so yesterday after work I went to a large bookstore.
The inside of the bookstore was very quiet and smelled of paper. Countless books were lined up on the shelves.
I am interested in Japanese history and culture, so I looked for a book in that section. After searching for about an hour, I finally found one interesting book.
It is a book about life during the old Edo period. It has many photos and pictures and seems very easy to understand.
After buying the book, I went to the café next door and started reading immediately. Getting new knowledge is very exciting.',
body_es = 'Me encanta leer, así que ayer después del trabajo fui a una gran librería.
El interior de la librería estaba muy tranquilo y olía a papel. Había innumerables libros alineados en las estanterías.
Me interesan la historia y la cultura de Japón, así que busqué un libro en esa sección. Después de buscar durante aproximadamente una hora, finalmente encontré un libro interesante.
Es un libro sobre la vida en el antiguo período Edo. Tiene muchas fotos y dibujos y parece muy fácil de entender.
Después de comprar el libro, fui a la cafetería de al lado y empecé a leer de inmediato. Adquirir nuevos conocimientos es muy emocionante.',
vocab = '[
  {"jp":"読書","kana":"どくしょ","en":"reading","es":"lectura"},
  {"jp":"昨日","kana":"きのう","en":"yesterday","es":"ayer"},
  {"jp":"仕事","kana":"しごと","en":"work","es":"trabajo"},
  {"jp":"本屋","kana":"ほんや","en":"bookstore","es":"librería"},
  {"jp":"静か","kana":"しずか","en":"quiet","es":"tranquilo"},
  {"jp":"紙","kana":"かみ","en":"paper","es":"papel"},
  {"jp":"匂い","kana":"におい","en":"smell / scent","es":"olor"},
  {"jp":"棚","kana":"たな","en":"shelf","es":"estantería"},
  {"jp":"数え切れない","kana":"かぞえきれない","en":"countless","es":"innumerables"},
  {"jp":"歴史","kana":"れきし","en":"history","es":"historia"},
  {"jp":"興味","kana":"きょうみ","en":"interest","es":"interés"},
  {"jp":"探しました","kana":"さがしました","en":"looked for / searched","es":"busqué"},
  {"jp":"面白い","kana":"おもしろい","en":"interesting / funny","es":"interesante"},
  {"jp":"江戸時代","kana":"えどじだい","en":"Edo period","es":"período Edo"},
  {"jp":"生活","kana":"せいかつ","en":"life / lifestyle","es":"vida / estilo de vida"},
  {"jp":"分かりやすい","kana":"わかりやすい","en":"easy to understand","es":"fácil de entender"},
  {"jp":"知識","kana":"ちしき","en":"knowledge","es":"conocimiento"},
  {"jp":"ワクワク","kana":"わくわく","en":"excited / exciting","es":"emocionado / emocionante"}
]',
quiz = '[
  {
    "q": "Why did the narrator go to the bookstore?",
    "q_jp": "なぜ語り手は本屋へ行きましたか？",
    "q_romaji": "Naze katarite wa hon-ya e ikimashita ka?",
    "q_es": "¿Por qué fue el narrador a la librería?",
    "o": ["Because they love reading", "Because they needed a notebook", "Because it was raining", "Because they met a friend"],
    "o_jp": ["読書が大好きだから", "ノートが必要だったから", "雨が降っていたから", "友達に会ったから"],
    "o_romaji": ["Dokusho ga daisuki dakara", "Nōto ga hitsuyō datta kara", "Ame ga futte ita kara", "Tomodachi ni atta kara"],
    "o_es": ["Porque le encanta leer", "Porque necesitaba un cuaderno", "Porque estaba lloviendo", "Porque se encontró con un amigo"],
    "a": 0
  },
  {
    "q": "When did the narrator go to the bookstore?",
    "q_jp": "語り手はいつ本屋へ行きましたか？",
    "q_romaji": "Katarite wa itsu hon-ya e ikimashita ka?",
    "q_es": "¿Cuándo fue el narrador a la librería?",
    "o": ["Yesterday morning", "Yesterday after work", "This morning", "Last week"],
    "o_jp": ["昨日の朝", "昨日の仕事の後", "今朝", "先週"],
    "o_romaji": ["Kinō no asa", "Kinō no shigoto no ato", "Kesa", "Senshū"],
    "o_es": ["Ayer por la mañana", "Ayer después del trabajo", "Esta mañana", "La semana pasada"],
    "a": 1
  },
  {
    "q": "What did the bookstore smell like?",
    "q_jp": "本屋の中はどんな匂いがしましたか？",
    "q_romaji": "Hon-ya no naka wa donna nioi ga shimashita ka?",
    "q_es": "¿A qué olía la librería?",
    "o": ["Coffee", "Flowers", "Paper", "Food"],
    "o_jp": ["コーヒー", "花", "紙", "食べ物"],
    "o_romaji": ["Kōhī", "Hana", "Kami", "Tabemono"],
    "o_es": ["Café", "Flores", "Papel", "Comida"],
    "a": 2
  },
  {
    "q": "How many books were on the shelves?",
    "q_jp": "棚にはどのくらいの本がありましたか？",
    "q_romaji": "Tana ni wa dono kurai no hon ga arimashita ka?",
    "q_es": "¿Cuántos libros había en las estanterías?",
    "o": ["Ten books", "A few", "Countless", "None"],
    "o_jp": ["十冊", "少し", "数え切れないほど", "一つもない"],
    "o_romaji": ["Jussatsu", "Sukoshi", "Kazoekirenai hodo", "Hitotsu mo nai"],
    "o_es": ["Diez libros", "Pocos", "Innumerables", "Ninguno"],
    "a": 2
  },
  {
    "q": "What topics is the narrator interested in?",
    "q_jp": "語り手はどんなことに興味がありますか？",
    "q_romaji": "Katarite wa donna koto ni kyōmi ga arimasu ka?",
    "q_es": "¿En qué temas está interesado el narrador?",
    "o": ["Sports and games", "Cooking", "Japanese history and culture", "Science"],
    "o_jp": ["スポーツとゲーム", "料理", "日本の歴史と文化", "科学"],
    "o_romaji": ["Supōtsu to gēmu", "Ryōri", "Nihon no rekishi to bunka", "Kagaku"],
    "o_es": ["Deportes y juegos", "Cocina", "Historia y cultura de Japón", "Ciencia"],
    "a": 2
  },
  {
    "q": "How long did it take to find the book?",
    "q_jp": "本を見つけるのにどのくらいかかりましたか？",
    "q_romaji": "Hon o mitsukeru no ni dono kurai kakarimashita ka?",
    "q_es": "¿Cuánto tiempo tardó en encontrar el libro?",
    "o": ["10 minutes", "One hour", "All day", "5 minutes"],
    "o_jp": ["十分", "一時間", "一日中", "五分"],
    "o_romaji": ["Juppun", "Ichi-jikan", "Ichinichijū", "Go-fun"],
    "o_es": ["10 minutos", "Una hora", "Todo el día", "5 minutos"],
    "a": 1
  },
  {
    "q": "What is the book about?",
    "q_jp": "その本は何について書かれていますか？",
    "q_romaji": "Sono hon wa nani ni tsuite kakarete imasu ka?",
    "q_es": "¿Sobre qué trata el libro?",
    "o": ["Modern Tokyo", "Cooking recipes", "Life in the Edo period", "Learning English"],
    "o_jp": ["現代の東京", "料理のレシピ", "江戸時代の生活", "英語の勉強"],
    "o_romaji": ["Gendai no Tōkyō", "Ryōri no reshipi", "Edo jidai no seikatsu", "Eigo no benkyō"],
    "o_es": ["El Tokio moderno", "Recetas de cocina", "La vida en el período Edo", "Aprender inglés"],
    "a": 2
  },
  {
    "q": "Why does the book seem easy to understand?",
    "q_jp": "なぜその本は分かりやすそうに思えましたか？",
    "q_romaji": "Naze sono hon wa wakariyasuhō ni omoemashita ka?",
    "q_es": "¿Por qué el libro parece fácil de entender?",
    "o": ["Because it is short", "Because it is for kids", "Because it has many photos and pictures", "Because the letters are big"],
    "o_jp": ["短いから", "子供用だから", "写真や絵がたくさんあるから", "文字が大きいから"],
    "o_romaji": ["Mijikai kara", "Kodomo-yō dakara", "Shashin ya e ga takusan aru kara", "Moji ga ookii kara"],
    "o_es": ["Porque es corto", "Porque es para niños", "Porque tiene muchas fotos y dibujos", "Porque las letras son grandes"],
    "a": 2
  },
  {
    "q": "Where did the narrator go after buying the book?",
    "q_jp": "本を買った後、どこへ行きましたか？",
    "q_romaji": "Hon o katta ato, doko e ikimashita ka?",
    "q_es": "¿A dónde fue el narrador después de comprar el libro?",
    "o": ["Home", "The café next door", "Work", "The park"],
    "o_jp": ["家", "隣のカフェ", "仕事", "公園"],
    "o_romaji": ["Ie", "Tonari no kafe", "Shigoto", "Kōen"],
    "o_es": ["A casa", "A la cafetería de al lado", "Al trabajo", "Al parque"],
    "a": 1
  },
  {
    "q": "How does the narrator feel about getting new knowledge?",
    "q_jp": "新しい知識を得ることについて、どう感じますか？",
    "q_romaji": "Atarashii chishiki o eru koto ni tsuite, dō kanjimasu ka?",
    "q_es": "¿Cómo se siente el narrador al adquirir nuevos conocimientos?",
    "o": ["Bored", "Tired", "Excited", "Scared"],
    "o_jp": ["退屈", "疲れる", "ワクワクする", "怖い"],
    "o_romaji": ["Taikutsu", "Tsukareru", "Wakuwaku suru", "Kowai"],
    "o_es": ["Aburrido", "Cansado", "Emocionado", "Asustado"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'Buying a New Book';

-- Story 10: The First Snow
UPDATE stories
SET body_jp = '今朝、目が覚めて窓の外を見ると、世界が真っ白になっていました。今年初めての雪です。
屋根も道も木も、すべてが白い雪で覆われていて、とても幻想的でした。雪が降る音はとても静かで、心が洗われるようです。
子供の頃、雪が降ると外に飛び出して雪だるまを作ったことを思い出しました。今は少し寒いですが、それでも雪を見ると嬉しくなります。
私は厚いコートを着て、マフラーを巻いて外に出ました。雪の上を歩くと、サクサクという音がして楽しいです。
家に戻ってから、温かいココアを飲みました。冬の訪れを感じる、とても静かな朝でした。',
body_en = 'This morning, when I woke up and looked out the window, the world had turned completely white. It''s the first snow of the year.
The roofs, the roads, and the trees were all covered in white snow, and it was very magical. The sound of falling snow is very quiet, and it feels like my heart is being cleansed.
I remembered how, when I was a child, I used to jump outside to make a snowman whenever it snowed. It''s a little cold now, but seeing snow still makes me happy.
I put on a thick coat, wrapped a scarf around me, and went outside. Walking on the snow makes a crunchy sound and is fun.
After returning home, I drank hot cocoa. It was a very quiet morning that felt like the arrival of winter.',
body_es = 'Esta mañana, al despertarme y mirar por la ventana, el mundo se había vuelto completamente blanco. Es la primera nieve del año.
Los tejados, las carreteras y los árboles estaban todos cubiertos de nieve blanca, y era muy mágico. El sonido de la nieve al caer es muy tranquilo y es como si mi corazón se limpiara.
Recordé cómo, cuando era niño, salía corriendo a hacer un muñeco de nieve cada vez que nevaba. Ahora hace un poco de frío, pero ver la nieve todavía me hace feliz.
Me puse un abrigo grueso, me envolví en una bufanda y salí. Caminar sobre la nieve hace un sonido crujiente y es divertido.
Al volver a casa, bebí cacao caliente. Fue una mañana muy tranquila en la que se sintió la llegada del invierno.',
vocab = '[
  {"jp":"今朝","kana":"けさ","en":"this morning","es":"esta mañana"},
  {"jp":"目覚めて","kana":"めざめて","en":"to wake up","es":"despertarse"},
  {"jp":"真っ白","kana":"まっしろ","en":"pure white","es":"blanco puro"},
  {"jp":"屋根","kana":"やね","en":"roof","es":"tejado"},
  {"jp":"覆われて","kana":"おおわれて","en":"to be covered","es":"estar cubierto"},
  {"jp":"幻想的","kana":"げんそうてき","en":"magical / fantastic","es":"mágico / fantástico"},
  {"jp":"洗われる","kana":"あらわれる","en":"to be washed / cleansed","es":"ser lavado / limpiado"},
  {"jp":"子供の頃","kana":"こどものころ","en":"childhood","es":"cuando era niño"},
  {"jp":"飛び出して","kana":"とびだして","en":"to jump out","es":"salir corriendo / saltar fuera"},
  {"jp":"雪だるま","kana":"ゆきだるま","en":"snowman","es":"muñeco de nieve"},
  {"jp":"厚い","kana":"あつい","en":"thick","es":"grueso"},
  {"jp":"マフラー","kana":"まふらー","en":"scarf","es":"bufanda"},
  {"jp":"巻いて","kana":"まいて","en":"to wrap / roll","es":"envolverse / enrollar"},
  {"jp":"歩くと","kana":"あるくと","en":"when walking","es":"al caminar"},
  {"jp":"サクサク","kana":"さくさく","en":"crunchy sound","es":"sonido crujiente"},
  {"jp":"戻って","kana":"もどって","en":"to return","es":"volver"},
  {"jp":"ココア","kana":"ここあ","en":"cocoa","es":"cacao"},
  {"jp":"訪れ","kana":"おとずれ","en":"arrival / visit","es":"llegada / visita"}
]',
quiz = '[
  {
    "q": "What did the narrator see when they woke up?",
    "q_jp": "目が覚めたとき、語り手は何を見ましたか？",
    "q_romaji": "Me ga sameta toki, katarite wa nani o mimashita ka?",
    "q_es": "¿Qué vio el narrador al despertarse?",
    "o": ["Rain", "A sunny sky", "A white world (snow)", "Fog"],
    "o_jp": ["雨", "晴れた空", "真っ白な世界（雪）", "霧"],
    "o_romaji": ["Ame", "Hareta sora", "Masshiro na sekai (yuki)", "Kiri"],
    "o_es": ["Lluvia", "Un cielo soleado", "Un mundo blanco (nieve)", "Niebla"],
    "a": 2
  },
  {
    "q": "What was covered in snow?",
    "q_jp": "何が雪で覆われていましたか？",
    "q_romaji": "Nani ga yuki de oowarete imashita ka?",
    "q_es": "¿Qué estaba cubierto de nieve?",
    "o": ["Only the roofs", "Only the trees", "Roofs, roads, and trees", "Nothing"],
    "o_jp": ["屋根だけ", "木だけ", "屋根も道も木も", "何も"],
    "o_romaji": ["Yane dake", "Ki dake", "Yane mo michi mo ki mo", "Nanimo"],
    "o_es": ["Solo los tejados", "Solo los árboles", "Tejados, carreteras y árboles", "Nada"],
    "a": 2
  },
  {
    "q": "How was the sound of the falling snow?",
    "q_jp": "雪が降る音はどうでしたか？",
    "q_romaji": "Yuki ga furu oto wa dō deshita ka?",
    "q_es": "¿Cómo era el sonido de la nieve al caer?",
    "o": ["Very noisy", "Very quiet", "Like music", "Scary"],
    "o_jp": ["とてもうるさい", "とても静か", "音楽のよう", "怖い"],
    "o_romaji": ["Totemo urusai", "Totemo shizuka", "Ongaku no yō", "Kowai"],
    "o_es": ["Muy ruidoso", "Muy tranquilo", "Como música", "Aterrador"],
    "a": 1
  },
  {
    "q": "What did the narrator remember from their childhood?",
    "q_jp": "語り手は子供の頃の何を思い出しましたか？",
    "q_romaji": "Katarite wa kodomo no koro no nani o omoidashimashita ka?",
    "q_es": "¿Qué recordó el narrador de su infancia?",
    "o": ["Going to school", "Making a snowman", "Eating ice cream", "Swimming"],
    "o_jp": ["学校に行ったこと", "雪だるまを作ったこと", "アイスを食べたこと", "泳いだこと"],
    "o_romaji": ["Gakkō ni itta koto", "Yukidaruma o tsukutta koto", "Aisu o tabeta koto", "Oyoida koto"],
    "o_es": ["Ir a la escuela", "Hacer un muñeco de nieve", "Comer helado", "Nadar"],
    "a": 1
  },
  {
    "q": "How does the narrator feel when seeing snow now?",
    "q_jp": "今、雪を見るとどう感じますか？",
    "q_romaji": "Ima, yuki o miru to dō kanjimasu ka?",
    "q_es": "¿Cómo se siente ahora al ver la nieve?",
    "o": ["Sad", "Angry", "Happy", "Nothing"],
    "o_jp": ["悲しい", "怒っている", "嬉しくなる", "何も感じない"],
    "o_romaji": ["Kanashii", "Okotte iru", "Ureshiku naru", "Nanimo kanjinai"],
    "o_es": ["Triste", "Enfadado", "Feliz", "Nada"],
    "a": 2
  },
  {
    "q": "What did the narrator wear to go outside?",
    "q_jp": "外に出るために何を着ましたか？",
    "q_romaji": "Soto ni deru tame ni nani o kimashita ka?",
    "q_es": "¿Qué se puso el narrador para salir?",
    "o": ["A T-shirt", "A thick coat and a scarf", "A raincoat", "A hat"],
    "o_jp": ["Tシャツ", "厚いコートとマフラー", "レインコート", "帽子"],
    "o_romaji": ["T-shatsu", "Atsui kōto to mafurā", "Reinkōto", "Bōshi"],
    "o_es": ["Una camiseta", "Un abrigo grueso y una bufanda", "Un impermeable", "Un sombrero"],
    "a": 1
  },
  {
    "q": "What sound did the snow make when walking on it?",
    "q_jp": "雪の上を歩くとき、どんな音がしましたか？",
    "q_romaji": "Yuki no ue o aruku toki, donna oto ga shimashita ka?",
    "q_es": "¿Qué sonido hacía la nieve al caminar sobre ella?",
    "o": ["Pita-pita", "Dandan", "Sakusaku", "Goro-goro"],
    "o_jp": ["ピタピタ", "ダンダン", "サクサク", "ゴロゴロ"],
    "o_romaji": ["Pita-pita", "Dandan", "Sakusaku", "Goro-goro"],
    "o_es": ["Pita-pita", "Dandan", "Sakusaku", "Goro-goro"],
    "a": 2
  },
  {
    "q": "What did the narrator drink after returning home?",
    "q_jp": "家に帰った後、何を飲みましたか？",
    "q_romaji": "Ie ni kaetta ato, nani o nomimasu ka?",
    "q_es": "¿Qué bebió el narrador al volver a casa?",
    "o": ["Cold water", "Hot tea", "Hot cocoa", "Coffee"],
    "o_jp": ["冷たい水", "熱いお茶", "温かいココア", "コーヒー"],
    "o_romaji": ["Tsumetai mizu", "Atsui ocha", "Atatakai kokoa", "Kōhī"],
    "o_es": ["Agua fría", "Té caliente", "Cacao caliente", "Café"],
    "a": 2
  },
  {
    "q": "How was the morning overall?",
    "q_jp": "全体的にどんな朝でしたか？",
    "q_romaji": "Zentaiteki ni donna asa deshita ka?",
    "q_es": "¿Cómo fue la mañana en general?",
    "o": ["Busy", "Quiet and felt like winter''s arrival", "Noisy", "Hot"],
    "o_jp": ["忙しい", "静かで冬の訪れを感じる朝", "うるさい", "暑い"],
    "o_romaji": ["Isogashii", "Shizuka de fuyu no otozure o kanjiru asa", "Urusai", "Atsui"],
    "o_es": ["Ajetreada", "Tranquila y se sintió la llegada del invierno", "Ruidosa", "Calurosa"],
    "a": 1
  },
  {
    "q": "Which part of the world turned white?",
    "q_jp": "世界のどの部分が白くなりましたか？",
    "q_romaji": "Sekai no dono bubun ga shiroku narimashita ka?",
    "q_es": "¿Qué parte del mundo se volvió blanca?",
    "o": ["Only the garden", "Only the park", "Everything outside", "The sky"],
    "o_jp": ["庭だけ", "公園だけ", "外のすべて", "空"],
    "o_romaji": ["Niwa dake", "Kōen dake", "Soto no subete", "Sora"],
    "o_es": ["Solo el jardín", "Solo el parque", "Todo lo de afuera", "El cielo"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'The First Snow';



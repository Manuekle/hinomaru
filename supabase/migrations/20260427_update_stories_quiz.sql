-- Update quiz data for stories to include Japanese and Romaji
-- Created: 2026-04-27
-- This migration updates existing stories with better quiz data.

-- Story 1: My Morning Routine
UPDATE stories
SET quiz = '[
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
    "q": "What does 朝ごはん mean?",
    "q_jp": "「朝ごはん」はどういう意味ですか？",
    "q_romaji": "''Asagohan'' wa dōiu imi desu ka?",
    "q_es": "¿Qué significa 朝ごはん?",
    "o": ["Lunch", "Dinner", "Breakfast", "Snack"],
    "o_jp": ["昼ごはん", "晩ごはん", "朝ごはん", "おやつ"],
    "o_romaji": ["Hirugohan", "Bangohan", "Asagohan", "Oyatsu"],
    "o_es": ["Almuerzo", "Cena", "Desayuno", "Merienda"],
    "a": 2
  },
  {
    "q": "Where does the narrator go after breakfast?",
    "q_jp": "朝ごはんの後、語り手はどこへ行きますか？",
    "q_romaji": "Asagohan no ato, katarite wa doko e ikimasu ka?",
    "q_es": "¿A dónde va el narrador después de desayunar?",
    "o": ["Work", "Park", "School", "Home"],
    "o_jp": ["仕事", "公園", "学校", "家"],
    "o_romaji": ["Shigoto", "Kōen", "Gakkō", "Ie"],
    "o_es": ["Trabajo", "Parque", "Escuela", "Casa"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'My Morning Routine';

-- Story 2: The Weather Today
UPDATE stories
SET quiz = '[
  {
    "q": "What is the weather like today?",
    "q_jp": "今日の天気はどうですか？",
    "q_romaji": "Kyō no tenki wa dō desu ka?",
    "q_es": "¿Cómo está el tiempo hoy?",
    "o": ["Rainy", "Cloudy", "Sunny", "Snowing"],
    "o_jp": ["雨", "曇り", "晴れ", "雪"],
    "o_romaji": ["Ame", "Kumori", "Hare", "Yuki"],
    "o_es": ["Lluvioso", "Nublado", "Soleado", "Nevando"],
    "a": 2
  },
  {
    "q": "What color is the sky?",
    "q_jp": "空は何色ですか？",
    "q_romaji": "Sora wa nani-iro desu ka?",
    "q_es": "¿De qué color es el cielo?",
    "o": ["Red", "Blue", "Green", "White"],
    "o_jp": ["赤", "青", "緑", "白"],
    "o_romaji": ["Aka", "Ao", "Midori", "Shiro"],
    "o_es": ["Rojo", "Azul", "Verde", "Blanco"],
    "a": 1
  },
  {
    "q": "Where does the narrator want to go?",
    "q_jp": "語り手はどこへ行きたいですか？",
    "q_romaji": "Katarite wa doko e ikitai desu ka?",
    "q_es": "¿A dónde quiere ir el narrador?",
    "o": ["School", "Park", "Home", "Store"],
    "o_jp": ["学校", "公園", "家", "店"],
    "o_romaji": ["Gakkō", "Kōen", "Ie", "Mise"],
    "o_es": ["Escuela", "Parque", "Casa", "Tienda"],
    "a": 1
  }
]'::jsonb
WHERE title_en = 'The Weather Today';

-- Story 3: My Family
UPDATE stories
SET quiz = '[
  {
    "q": "How many people are in the narrator''s family?",
    "q_jp": "語り手の家族は何人ですか？",
    "q_romaji": "Katarite no kazoku wa nan-nin desu ka?",
    "q_es": "¿Cuántas personas hay en la familia del narrador?",
    "o": ["Three", "Four", "Five", "Two"],
    "o_jp": ["三人", "四人", "五人", "二人"],
    "o_romaji": ["San-nin", "Yo-nin", "Go-nin", "Futari"],
    "o_es": ["Tres", "Cuatro", "Cinco", "Dos"],
    "a": 1
  },
  {
    "q": "What does 妹 mean?",
    "q_jp": "「妹」はどういう意味ですか？",
    "q_romaji": "''Imōto'' wa dōiu imi desu ka?",
    "q_es": "¿Qué significa 妹?",
    "o": ["Older sister", "Younger sister", "Older brother", "Mother"],
    "o_jp": ["姉", "妹", "兄", "母"],
    "o_romaji": ["Ane", "Imōto", "Ani", "Haha"],
    "o_es": ["Hermana mayor", "Hermana menor", "Hermano mayor", "Madre"],
    "a": 1
  },
  {
    "q": "What do they do together?",
    "q_jp": "みんなで何をしますか？",
    "q_romaji": "Minna de nani o shimasu ka?",
    "q_es": "¿Qué hacen todos juntos?",
    "o": ["Watch TV", "Play games", "Eat dinner", "Go shopping"],
    "o_jp": ["テレビを見る", "ゲームをする", "夕ご飯を食べる", "買い物に行く"],
    "o_romaji": ["Terebi o miru", "Gēmu o suru", "Yūgohan o taberu", "Kaimono ni iku"],
    "o_es": ["Ver televisión", "Jugar juegos", "Cenar", "Ir de compras"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'My Family';

-- Story 4: At the Convenience Store
UPDATE stories
SET quiz = '[
  {
    "q": "What did the narrator buy?",
    "q_jp": "語り手は何を買いましたか？",
    "q_romaji": "Katarite wa nani o kaimashita ka?",
    "q_es": "¿Qué compró el narrador?",
    "o": ["Bread and coffee", "Juice and onigiri", "Rice and fish", "Soda and chips"],
    "o_jp": ["パンとコーヒー", "ジュースとおにぎり", "ご飯と魚", "ソーダとチップス"],
    "o_romaji": ["Pan to kōhī", "Jūsu to onigiri", "Gohan to sakana", "Sōda to chippusu"],
    "o_es": ["Pan y café", "Jugo y onigiri", "Arroz y pescado", "Refresco y papitas"],
    "a": 1
  },
  {
    "q": "What does コンビニ mean?",
    "q_jp": "「コンビニ」はどういう意味ですか？",
    "q_romaji": "''Konbini'' wa dōiu imi desu ka?",
    "q_es": "¿Qué significa コンビニ?",
    "o": ["Supermarket", "Convenience store", "Restaurant", "Bakery"],
    "o_jp": ["スーパー", "コンビニ", "レストラン", "パン屋"],
    "o_romaji": ["Sūpā", "Konbini", "Resutoran", "Pan-ya"],
    "o_es": ["Supermercado", "Tienda de conveniencia", "Restaurante", "Panadería"],
    "a": 1
  },
  {
    "q": "How was the staff?",
    "q_jp": "店員さんはどうでしたか？",
    "q_romaji": "Ten''in-san wa dō deshita ka?",
    "q_es": "¿Cómo fue el empleado?",
    "o": ["Rude", "Busy", "Very kind", "Quiet"],
    "o_jp": ["失礼", "忙しい", "とても親切", "静か"],
    "o_romaji": ["Shitsurei", "Isogashii", "Totemo shinsetsu", "Shizuka"],
    "o_es": ["Grosero", "Ocupado", "Muy amable", "Callado"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'At the Convenience Store';

-- Story 5: My Hobby
UPDATE stories
SET quiz = '[
  {
    "q": "What is the narrator''s hobby?",
    "q_jp": "語り手の趣味は何ですか？",
    "q_romaji": "Katarite no shumi wa nan desu ka?",
    "q_es": "¿Cuál es el pasatiempo del narrador?",
    "o": ["Drawing", "Listening to music", "Playing sports", "Reading books"],
    "o_jp": ["絵を描くこと", "音楽を聴くこと", "スポーツをすること", "本を読むこと"],
    "o_romaji": ["E o kaku koto", "Ongaku o kiku koto", "Supōtsu o suru koto", "Hon o yomu koto"],
    "o_es": ["Dibujar", "Escuchar música", "Hacer deportes", "Leer libros"],
    "a": 1
  },
  {
    "q": "What does 毎日 mean?",
    "q_jp": "「毎日」はどういう意味ですか？",
    "q_romaji": "''Mainichi'' wa dōiu imi desu ka?",
    "q_es": "¿Qué significa 毎日?",
    "o": ["Every week", "Every month", "Every day", "Every year"],
    "o_jp": ["毎週", "毎月", "毎日", "毎年"],
    "o_romaji": ["Maishū", "Maigetsu", "Mainichi", "Mainen"],
    "o_es": ["Cada semana", "Cada mes", "Cada día", "Cada año"],
    "a": 2
  },
  {
    "q": "What does the narrator use to listen?",
    "q_jp": "語り手は何を使って聴きますか？",
    "q_romaji": "Katarite wa nani o tsukatte kikimasu ka?",
    "q_es": "¿Qué usa el narrador para escuchar?",
    "o": ["Speaker", "Radio", "Earphones", "TV"],
    "o_jp": ["スピーカー", "ラジオ", "イヤホン", "テレビ"],
    "o_romaji": ["Supīkā", "Rajio", "Iyahon", "Terebi"],
    "o_es": ["Altavoz", "Radio", "Auriculares", "Televisión"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'My Hobby';

-- Story 6: At the Restaurant
UPDATE stories
SET quiz = '[
  {
    "q": "Where did the narrator eat?",
    "q_jp": "語り手はどこで食べましたか？",
    "q_romaji": "Katarite wa doko de tabemashita ka?",
    "q_es": "¿Dónde comió el narrador?",
    "o": ["At home", "At school", "At a restaurant", "At a friend''s house"],
    "o_jp": ["家で", "学校で", "レストランで", "友達の家で"],
    "o_romaji": ["Ie de", "Gakkō de", "Resutoran de", "Tomodachi no ie de"],
    "o_es": ["En casa", "En la escuela", "En un restaurante", "En casa de un amigo"],
    "a": 2
  },
  {
    "q": "What did the narrator eat?",
    "q_jp": "語り手は何を食べましたか？",
    "q_romaji": "Katarite wa nani o tabemashita ka?",
    "q_es": "¿Qué comió el narrador?",
    "o": ["Ramen", "Sushi", "Tempura", "Udon"],
    "o_jp": ["ラーメン", "寿司", "天ぷら", "うどん"],
    "o_romaji": ["Rāmen", "Sushi", "Tenpura", "Udon"],
    "o_es": ["Ramen", "Sushi", "Tempura", "Udon"],
    "a": 1
  },
  {
    "q": "How was the food?",
    "q_jp": "料理はどうでしたか？",
    "q_romaji": "Ryōri wa dō deshita ka?",
    "q_es": "¿Cómo estuvo la comida?",
    "o": ["Bad", "Okay", "Very delicious", "Too spicy"],
    "o_jp": ["まずい", "普通", "とてもおいしい", "辛すぎる"],
    "o_romaji": ["Mazui", "Futsū", "Totemo oishii", "Karasugiru"],
    "o_es": ["Mala", "Normal", "Muy deliciosa", "Demasiado picante"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'At the Restaurant';

-- Story 7: Weekend Plans
UPDATE stories
SET quiz = '[
  {
    "q": "What will the narrator do on the weekend?",
    "q_jp": "語り手は週末に何をしますか？",
    "q_romaji": "Katarite wa shūmatsu ni nani o shimasu ka?",
    "q_es": "¿Qué hará el narrador el fin de semana?",
    "o": ["Go shopping", "Watch a movie", "Play sports", "Study"],
    "o_jp": ["買い物に行く", "映画を見る", "スポーツをする", "勉強する"],
    "o_romaji": ["Kaimono ni iku", "Eiga o miru", "Supōtsu o suru", "Benkyō suru"],
    "o_es": ["Ir de compras", "Ver una película", "Hacer deportes", "Estudiar"],
    "a": 1
  },
  {
    "q": "Who will the narrator go with?",
    "q_jp": "誰と行きますか？",
    "q_romaji": "Dare to ikimasu ka?",
    "q_es": "¿Con quién irá?",
    "o": ["Family", "Alone", "Friends", "Teacher"],
    "o_jp": ["家族", "一人で", "友達", "先生"],
    "o_romaji": ["Kazoku", "Hitori de", "Tomodachi", "Sensei"],
    "o_es": ["Familia", "Solo", "Amigos", "Profesor"],
    "a": 2
  },
  {
    "q": "Where will they go after the movie?",
    "q_jp": "映画の後、どこへ行きますか？",
    "q_romaji": "Eiga no ato, doko e ikimasu ka?",
    "q_es": "¿A dónde irán después de la película?",
    "o": ["Home", "Park", "Café", "School"],
    "o_jp": ["家", "公園", "カフェ", "学校"],
    "o_romaji": ["Ie", "Kōen", "Kafe", "Gakkō"],
    "o_es": ["Casa", "Parque", "Cafetería", "Escuela"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'Weekend Plans';

-- Story 8: A Day at the Beach
UPDATE stories
SET quiz = '[
  {
    "q": "Where did the narrator go?",
    "q_jp": "語り手はどこへ行きましたか？",
    "q_romaji": "Katarite wa doko e ikimashita ka?",
    "q_es": "¿A dónde fue el narrador?",
    "o": ["Mountain", "River", "Sea", "Park"],
    "o_jp": ["山", "川", "海", "公園"],
    "o_romaji": ["Yama", "Kawa", "Umi", "Kōen"],
    "o_es": ["Montaña", "Río", "Mar", "Parque"],
    "a": 2
  },
  {
    "q": "How was the sea?",
    "q_jp": "海はどうでしたか？",
    "q_romaji": "Umi wa dō deshita ka?",
    "q_es": "¿Cómo estaba el mar?",
    "o": ["Small and green", "Wide and blue", "Cold and dark", "Dirty"],
    "o_jp": ["狭くて緑", "広くて青い", "寒くて暗い", "汚い"],
    "o_romaji": ["Semakute midori", "Hirokute aoi", "Samukute kurai", "Kitanai"],
    "o_es": ["Pequeño y verde", "Amplio y azul", "Frío y oscuro", "Sucio"],
    "a": 1
  }
]'::jsonb
WHERE title_en = 'A Day at the Beach';

-- Story 9: Buying a New Book
UPDATE stories
SET quiz = '[
  {
    "q": "What did the narrator buy?",
    "q_jp": "語り手は何を買いましたか？",
    "q_romaji": "Katarite wa nani o kaimashita ka?",
    "q_es": "¿Qué compró el narrador?",
    "o": ["A magazine", "A book", "A manga", "A newspaper"],
    "o_jp": ["雑誌", "本", "漫画", "新聞"],
    "o_romaji": ["Zasshi", "Hon", "Manga", "Shinbun"],
    "o_es": ["Una revista", "Un libro", "Un manga", "Un periódico"],
    "a": 1
  },
  {
    "q": "What is the book about?",
    "q_jp": "本は何についてですか？",
    "q_romaji": "Hon wa nani ni tsuite desu ka?",
    "q_es": "¿De qué trata el libro?",
    "o": ["Cooking", "Travel", "Japanese culture", "History"],
    "o_jp": ["料理", "旅行", "日本の文化", "歴史"],
    "o_romaji": ["Ryōri", "Ryokō", "Nihon no bunka", "Rekishi"],
    "o_es": ["Cocina", "Viajes", "Cultura japonesa", "Historia"],
    "a": 2
  }
]'::jsonb
WHERE title_en = 'Buying a New Book';

-- Story 10: The First Snow
UPDATE stories
SET quiz = '[
  {
    "q": "What happened today?",
    "q_jp": "今日、何が起きましたか？",
    "q_romaji": "Kyō, nani ga okimashita ka?",
    "q_es": "¿Qué pasó hoy?",
    "o": ["It rained", "It snowed", "It was windy", "It was hot"],
    "o_jp": ["雨が降った", "雪が降った", "風が強かった", "暑かった"],
    "o_romaji": ["Ame ga futta", "Yuki ga futta", "Kaze ga tsuyokatta", "Atsukatta"],
    "o_es": ["Llovió", "Nevó", "Hizo viento", "Hizo calor"],
    "a": 1
  },
  {
    "q": "How is it outside?",
    "q_jp": "外はどうですか？",
    "q_romaji": "Soto wa dō desu ka?",
    "q_es": "¿Cómo está afuera?",
    "o": ["Green and warm", "White and beautiful", "Dark and scary", "Dirty"],
    "o_jp": ["緑で暖かい", "白くてきれい", "暗くて怖い", "汚い"],
    "o_romaji": ["Midori de atatakai", "Shirokute kirei", "Kurakute kowai", "Kitanai"],
    "o_es": ["Verde y cálido", "Blanco y hermoso", "Oscuro y aterrador", "Sucio"],
    "a": 1
  }
]'::jsonb
WHERE title_en = 'The First Snow';

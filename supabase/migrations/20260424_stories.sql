-- ============================================================
-- Stories: tablas + RLS + seed N5
-- ============================================================

-- 1. Tabla de historias
CREATE TABLE IF NOT EXISTS stories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level        text NOT NULL DEFAULT 'N5',
  title_en     text NOT NULL,
  title_es     text NOT NULL,
  body_jp      text NOT NULL,
  body_en      text NOT NULL,
  body_es      text NOT NULL,
  publish_date date NOT NULL,
  vocab        jsonb NOT NULL DEFAULT '[]',
  quiz         jsonb NOT NULL DEFAULT '[]',
  created_at   timestamptz DEFAULT now()
);

-- 2. Tabla de lecturas por usuario
CREATE TABLE IF NOT EXISTS user_story_reads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  story_id    uuid NOT NULL REFERENCES stories ON DELETE CASCADE,
  quiz_score  int,
  read_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- 3. RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_reads ENABLE ROW LEVEL SECURITY;

-- Historias: cualquier usuario autenticado puede leer
CREATE POLICY "stories_select" ON stories
  FOR SELECT TO authenticated USING (true);

-- user_story_reads: solo el propio usuario
CREATE POLICY "reads_select" ON user_story_reads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "reads_insert" ON user_story_reads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reads_update" ON user_story_reads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- SEED — 7 historias N5
-- ============================================================
INSERT INTO stories (level, title_en, title_es, body_jp, body_en, body_es, publish_date, vocab, quiz) VALUES

-- Historia 1
('N5',
 'My Morning Routine',
 'Mi rutina matutina',
 '毎朝、七時に起きます。顔を洗って、朝ごはんを食べます。それから学校に行きます。',
 'Every morning, I wake up at seven. I wash my face and eat breakfast. Then I go to school.',
 'Cada mañana me levanto a las siete. Me lavo la cara y desayuno. Luego voy a la escuela.',
 CURRENT_DATE,
 '[
   {"jp":"毎朝","kana":"まいあさ","en":"every morning","es":"cada mañana"},
   {"jp":"七時","kana":"しちじ","en":"seven o''clock","es":"las siete"},
   {"jp":"起きます","kana":"おきます","en":"to wake up","es":"levantarse"},
   {"jp":"顔","kana":"かお","en":"face","es":"cara"},
   {"jp":"朝ごはん","kana":"あさごはん","en":"breakfast","es":"desayuno"},
   {"jp":"学校","kana":"がっこう","en":"school","es":"escuela"}
 ]',
 '[
   {"q":"What time does the narrator wake up?","o":["Six o''clock","Seven o''clock","Eight o''clock","Nine o''clock"],"a":1},
   {"q":"What does 朝ごはん mean?","o":["Lunch","Dinner","Breakfast","Snack"],"a":2},
   {"q":"Where does the narrator go after breakfast?","o":["Work","Park","School","Home"],"a":2}
 ]'),

-- Historia 2
('N5',
 'The Weather Today',
 'El tiempo hoy',
 '今日は晴れています。空は青くて、とてもきれいです。公園に行きたいです。',
 'Today it is sunny. The sky is blue and very beautiful. I want to go to the park.',
 'Hoy hace sol. El cielo es azul y muy hermoso. Quiero ir al parque.',
 CURRENT_DATE + 1,
 '[
   {"jp":"今日","kana":"きょう","en":"today","es":"hoy"},
   {"jp":"晴れ","kana":"はれ","en":"sunny / clear","es":"despejado / soleado"},
   {"jp":"空","kana":"そら","en":"sky","es":"cielo"},
   {"jp":"青い","kana":"あおい","en":"blue","es":"azul"},
   {"jp":"きれい","kana":"きれい","en":"beautiful","es":"hermoso"},
   {"jp":"公園","kana":"こうえん","en":"park","es":"parque"}
 ]',
 '[
   {"q":"What is the weather like today?","o":["Rainy","Cloudy","Sunny","Snowing"],"a":2},
   {"q":"What color is the sky?","o":["Red","Blue","Green","White"],"a":1},
   {"q":"Where does the narrator want to go?","o":["School","Park","Home","Store"],"a":1}
 ]'),

-- Historia 3
('N5',
 'My Family',
 'Mi familia',
 '私の家族は四人です。父と母と妹がいます。みんなで夕ご飯を食べます。',
 'My family has four people. I have a father, a mother, and a younger sister. We all eat dinner together.',
 'Mi familia tiene cuatro personas. Tengo padre, madre y una hermana menor. Cenamos todos juntos.',
 CURRENT_DATE + 2,
 '[
   {"jp":"家族","kana":"かぞく","en":"family","es":"familia"},
   {"jp":"四人","kana":"よにん","en":"four people","es":"cuatro personas"},
   {"jp":"父","kana":"ちち","en":"father","es":"padre"},
   {"jp":"母","kana":"はは","en":"mother","es":"madre"},
   {"jp":"妹","kana":"いもうと","en":"younger sister","es":"hermana menor"},
   {"jp":"夕ご飯","kana":"ゆうごはん","en":"dinner","es":"cena"}
 ]',
 '[
   {"q":"How many people are in the narrator''s family?","o":["Three","Four","Five","Two"],"a":1},
   {"q":"What does 妹 mean?","o":["Older sister","Younger sister","Older brother","Mother"],"a":1},
   {"q":"What do they do together?","o":["Watch TV","Play games","Eat dinner","Go shopping"],"a":2}
 ]'),

-- Historia 4
('N5',
 'At the Convenience Store',
 'En la tienda de conveniencia',
 'コンビニでジュースとおにぎりを買いました。店員さんはとても親切でした。',
 'I bought juice and an onigiri at the convenience store. The staff was very kind.',
 'Compré jugo y un onigiri en la tienda de conveniencia. El empleado fue muy amable.',
 CURRENT_DATE + 3,
 '[
   {"jp":"コンビニ","kana":"コンビニ","en":"convenience store","es":"tienda de conveniencia"},
   {"jp":"ジュース","kana":"ジュース","en":"juice","es":"jugo"},
   {"jp":"おにぎり","kana":"おにぎり","en":"rice ball","es":"bola de arroz"},
   {"jp":"買いました","kana":"かいました","en":"bought","es":"compré"},
   {"jp":"店員","kana":"てんいん","en":"store staff","es":"empleado"},
   {"jp":"親切","kana":"しんせつ","en":"kind / friendly","es":"amable"}
 ]',
 '[
   {"q":"What did the narrator buy?","o":["Bread and coffee","Juice and onigiri","Rice and fish","Soda and chips"],"a":1},
   {"q":"What does コンビニ mean?","o":["Supermarket","Convenience store","Restaurant","Bakery"],"a":1},
   {"q":"How was the staff?","o":["Rude","Busy","Very kind","Quiet"],"a":2}
 ]'),

-- Historia 5
('N5',
 'My Hobby',
 'Mi pasatiempo',
 '私の趣味は音楽を聞くことです。毎日イヤホンで好きな曲を聴きます。',
 'My hobby is listening to music. Every day I listen to my favorite songs with earphones.',
 'Mi pasatiempo es escuchar música. Todos los días escucho mis canciones favoritas con auriculares.',
 CURRENT_DATE + 4,
 '[
   {"jp":"趣味","kana":"しゅみ","en":"hobby","es":"pasatiempo"},
   {"jp":"音楽","kana":"おんがく","en":"music","es":"música"},
   {"jp":"聞く","kana":"きく","en":"to listen","es":"escuchar"},
   {"jp":"毎日","kana":"まいにち","en":"every day","es":"todos los días"},
   {"jp":"好きな","kana":"すきな","en":"favorite / liked","es":"favorito"},
   {"jp":"曲","kana":"きょく","en":"song / tune","es":"canción"}
 ]',
 '[
   {"q":"What is the narrator''s hobby?","o":["Drawing","Listening to music","Playing sports","Reading books"],"a":1},
   {"q":"What does 毎日 mean?","o":["Every week","Every month","Every day","Every year"],"a":2},
   {"q":"What does the narrator use to listen?","o":["Speaker","Radio","Earphones","TV"],"a":2}
 ]'),

-- Historia 6
('N5',
 'At the Restaurant',
 'En el restaurante',
 'レストランで寿司を食べました。とてもおいしかったです。また来たいです。',
 'I ate sushi at a restaurant. It was very delicious. I want to come again.',
 'Comí sushi en un restaurante. Estaba muy delicioso. Quiero volver.',
 CURRENT_DATE + 5,
 '[
   {"jp":"レストラン","kana":"レストラン","en":"restaurant","es":"restaurante"},
   {"jp":"寿司","kana":"すし","en":"sushi","es":"sushi"},
   {"jp":"食べました","kana":"たべました","en":"ate","es":"comí"},
   {"jp":"おいしい","kana":"おいしい","en":"delicious","es":"delicioso"},
   {"jp":"また","kana":"また","en":"again","es":"otra vez"},
   {"jp":"来たい","kana":"きたい","en":"want to come","es":"quiero volver"}
 ]',
 '[
   {"q":"Where did the narrator eat?","o":["At home","At school","At a restaurant","At a friend''s house"],"a":2},
   {"q":"What did the narrator eat?","o":["Ramen","Sushi","Tempura","Udon"],"a":1},
   {"q":"How was the food?","o":["Bad","Okay","Very delicious","Too spicy"],"a":2}
 ]'),

-- Historia 7
('N5',
 'Weekend Plans',
 'Planes para el fin de semana',
 '週末は友達と映画を見ます。その後、カフェでコーヒーを飲みます。楽しみです。',
 'On the weekend I will watch a movie with friends. After that, I will drink coffee at a café. I''m looking forward to it.',
 'El fin de semana voy a ver una película con amigos. Después tomaré café en una cafetería. ¡Tengo muchas ganas!',
 CURRENT_DATE + 6,
 '[
   {"jp":"週末","kana":"しゅうまつ","en":"weekend","es":"fin de semana"},
   {"jp":"友達","kana":"ともだち","en":"friends","es":"amigos"},
   {"jp":"映画","kana":"えいが","en":"movie","es":"película"},
   {"jp":"その後","kana":"そのあと","en":"after that","es":"después de eso"},
   {"jp":"カフェ","kana":"カフェ","en":"café","es":"cafetería"},
   {"jp":"楽しみ","kana":"たのしみ","en":"looking forward to","es":"con ganas / emocionado"}
 ]',
 '[
   {"q":"What will the narrator do on the weekend?","o":["Go shopping","Watch a movie","Play sports","Study"],"a":1},
   {"q":"Who will the narrator go with?","o":["Family","Alone","Friends","Teacher"],"a":2},
   {"q":"Where will they go after the movie?","o":["Home","Park","Café","School"],"a":2}
 ]');

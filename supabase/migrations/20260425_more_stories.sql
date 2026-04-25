-- Update existing stories to be visible today
UPDATE stories SET publish_date = CURRENT_DATE - interval '1 day' WHERE publish_date > CURRENT_DATE;

-- Add 3 more stories
INSERT INTO stories (level, title_en, title_es, body_jp, body_en, body_es, publish_date, vocab, quiz) VALUES
('N5',
 'A Day at the Beach',
 'Un día en la playa',
 '週末に海へ行きました。海はとても広くて、青かったです。たくさん泳ぎました。',
 'I went to the sea on the weekend. The sea was very wide and blue. I swam a lot.',
 'Fui al mar el fin de semana. El mar era muy amplio y azul. Nadé mucho.',
 CURRENT_DATE,
 '[
   {"jp":"海","kana":"うみ","en":"sea / ocean","es":"mar"},
   {"jp":"広い","kana":"ひろい","en":"wide / spacious","es":"amplio / ancho"},
   {"jp":"泳ぎました","kana":"およぎました","en":"swam","es":"nadé"}
 ]',
 '[
   {"q":"Where did the narrator go?","o":["Mountain","River","Sea","Park"],"a":2},
   {"q":"How was the sea?","o":["Small and green","Wide and blue","Cold and dark","Dirty"],"a":1}
 ]'),

('N5',
 'Buying a New Book',
 'Comprando un libro nuevo',
 '本屋で新しい本を買いました。日本の文化についての本です。読むのが楽しみです。',
 'I bought a new book at the bookstore. It is a book about Japanese culture. I am looking forward to reading it.',
 'Compré un libro nuevo en la librería. Es un libro sobre la cultura japonesa. Tengo ganas de leerlo.',
 CURRENT_DATE,
 '[
   {"jp":"本屋","kana":"ほんや","en":"bookstore","es":"librería"},
   {"jp":"新しい","kana":"あたらしい","en":"new","es":"nuevo"},
   {"jp":"文化","kana":"ぶんか","en":"culture","es":"cultura"}
 ]',
 '[
   {"q":"What did the narrator buy?","o":["A magazine","A book","A manga","A newspaper"],"a":1},
   {"q":"What is the book about?","o":["Cooking","Travel","Japanese culture","History"],"a":2}
 ]'),

('N5',
 'The First Snow',
 'La primera nieve',
 '今日、初めて雪が降りました。外はとても白くて、きれいです。少し寒いです。',
 'Today, it snowed for the first time. Outside is very white and beautiful. It is a little cold.',
 'Hoy nevó por primera vez. Afuera está muy blanco y hermoso. Hace un poco de frío.',
 CURRENT_DATE,
 '[
   {"jp":"初めて","kana":"はじめて","en":"for the first time","es":"por primera vez"},
   {"jp":"雪","kana":"ゆき","en":"snow","es":"nieve"},
   {"jp":"降りました","kana":"ふりました","en":"rained/snowed (fell)","es":"cayó (nieve/lluvia)"},
   {"jp":"寒い","kana":"さむい","en":"cold","es":"frío"}
 ]',
 '[
   {"q":"What happened today?","o":["It rained","It snowed","It was windy","It was hot"],"a":1},
   {"q":"How is it outside?","o":["Green and warm","White and beautiful","Dark and scary","Dirty"],"a":1}
 ]')
ON CONFLICT (title_en) DO NOTHING;

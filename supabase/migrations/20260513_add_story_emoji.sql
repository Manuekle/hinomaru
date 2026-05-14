-- Add emoji column to stories + assign thematic emoji per story
ALTER TABLE stories ADD COLUMN IF NOT EXISTS emoji text;

-- N5
UPDATE stories SET emoji = '📚' WHERE title_en = 'The Library';
UPDATE stories SET emoji = '👟' WHERE title_en = 'My New Shoes';
UPDATE stories SET emoji = '🛒' WHERE title_en = 'The Supermarket';
UPDATE stories SET emoji = '👨‍👩‍👧' WHERE title_en = 'My Family';
UPDATE stories SET emoji = '📅' WHERE title_en = 'My Daily Life';
UPDATE stories SET emoji = '🎂' WHERE title_en = 'Birthday Party';
UPDATE stories SET emoji = '🐈' WHERE title_en = 'A Cute Cat';
UPDATE stories SET emoji = '🈁' WHERE title_en = 'Learning Japanese';
UPDATE stories SET emoji = '🏖️' WHERE title_en = 'Summer Trip';
UPDATE stories SET emoji = '🌳' WHERE title_en = 'At the Park';

-- N4
UPDATE stories SET emoji = '🍁' WHERE title_en = 'Seasons in Japan';
UPDATE stories SET emoji = '🙇' WHERE title_en = 'Japanese Manners';
UPDATE stories SET emoji = '🗻' WHERE title_en = 'Mount Fuji';
UPDATE stories SET emoji = '🍱' WHERE title_en = 'Japanese Food';
UPDATE stories SET emoji = '🤝' WHERE title_en = 'Meeting a Friend';
UPDATE stories SET emoji = '🍛' WHERE title_en = 'Cooking Curry';
UPDATE stories SET emoji = '⛩️' WHERE title_en = 'Kyoto Temples';
UPDATE stories SET emoji = '🚄' WHERE title_en = 'The Shinkansen';
UPDATE stories SET emoji = '🏮' WHERE title_en = 'Traditional Festivals';
UPDATE stories SET emoji = '📦' WHERE title_en = 'Moving House';

-- N3
UPDATE stories SET emoji = '💼' WHERE title_en = 'Working Environment';
UPDATE stories SET emoji = '🍵' WHERE title_en = 'Traditional Tea Ceremony';
UPDATE stories SET emoji = '📱' WHERE title_en = 'Social Media';
UPDATE stories SET emoji = '🎎' WHERE title_en = 'Traditional Crafts';
UPDATE stories SET emoji = '🤲' WHERE title_en = 'Volunteering';
UPDATE stories SET emoji = '🍂' WHERE title_en = 'The Change in Seasons';
UPDATE stories SET emoji = '🥗' WHERE title_en = 'Healthy Lifestyle';
UPDATE stories SET emoji = '📈' WHERE title_en = 'Career Path';
UPDATE stories SET emoji = '🥦' WHERE title_en = 'Health and Diet';
UPDATE stories SET emoji = '🧗' WHERE title_en = 'Mount Fuji Climbing';

-- N2
UPDATE stories SET emoji = '🌐' WHERE title_en = 'Cultural Diversity';
UPDATE stories SET emoji = '🚨' WHERE title_en = 'Disaster Prevention';
UPDATE stories SET emoji = '💹' WHERE title_en = 'Global Economy';
UPDATE stories SET emoji = '🤖' WHERE title_en = 'Artificial Intelligence';
UPDATE stories SET emoji = '♻️' WHERE title_en = 'Renewable Energy';
UPDATE stories SET emoji = '🗣️' WHERE title_en = 'Evolving Language';
UPDATE stories SET emoji = '🏙️' WHERE title_en = 'Urbanization';
UPDATE stories SET emoji = '🌿' WHERE title_en = 'Environmental Preservation';
UPDATE stories SET emoji = '💡' WHERE title_en = 'Technological Innovation';
UPDATE stories SET emoji = '📊' WHERE title_en = 'Economic Trends';

-- N1
UPDATE stories SET emoji = '🎨' WHERE title_en = 'Aesthetic Theory';
UPDATE stories SET emoji = '🏛️' WHERE title_en = 'Societal Paradigm';
UPDATE stories SET emoji = '🖼️' WHERE title_en = 'Artistic Interpretation';
UPDATE stories SET emoji = '⚖️' WHERE title_en = 'Social Inequality';
UPDATE stories SET emoji = '🤔' WHERE title_en = 'Philosophical Inquiry';
UPDATE stories SET emoji = '🌍' WHERE title_en = 'Global Diplomacy';
UPDATE stories SET emoji = '🧬' WHERE title_en = 'Scientific Ethics';
UPDATE stories SET emoji = '🕊️' WHERE title_en = 'Diplomatic Strategies';
UPDATE stories SET emoji = '📜' WHERE title_en = 'Political Philosophy';
UPDATE stories SET emoji = '🧭' WHERE title_en = 'Ethical Dilemmas';

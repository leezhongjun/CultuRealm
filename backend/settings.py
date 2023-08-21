default_user_profile = {
    'race': 'Unspecified',
    # 'religion': 'Unspecified',
    'gender': 'Unspecified',
    'high_score': 0,
    'stories_played': 0,
    'achievements': '',
    'profile_pic': None,
    'image_style': 'Photorealistic',
    'age': 'Unspecified',
    'rating': 1500
}

max_story_index = 2

global_unlocked_rating = 1700

countries = [
  "Random",
  "United States",
  "China",
  "India",
  "Russia",
  "Japan",
  "Brazil",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Canada",
  "South Korea",
  "Australia",
  "Mexico",
  "Spain",
  "Indonesia",
  "Turkey",
  "Saudi Arabia",
  "South Africa",
  "Nigeria",
  "Argentina",
  "Egypt",
  "Pakistan",
  "Iran",
  "Vietnam",
  "Thailand",
  "Poland",
  "Netherlands",
  "Malaysia",
  "Philippines",
  "Colombia",
  "Ukraine",
  "Belgium",
  "Sweden",
  "Switzerland",
  "Austria",
  "Greece",
  "Chile",
  "Norway",
  "Denmark",
  "Finland",
  "Israel",
  "Portugal",
  "Ireland",
  "Singapore",
  "New Zealand",
  "Czech Republic",
  "Romania",
  "Hungary",
  "United Arab Emirates",
  "Peru",
  "Bangladesh",
  "Hong Kong",
  "Iraq",
  "Kuwait",
  "Qatar",
  "Venezuela",
  "Morocco",
  "Puerto Rico",
  "Cuba",
  "Jordan",
  "Oman",
  "Slovakia"
]



achievements = [
    {
        "name": "Helpful User",
        "description": "User offers help to another character",
        "is_achieved": False,
        "emoji": "💁"
    },
    {
        "name": "Compliment Giver",
        "description": "User gives a compliment to another character",
        "is_achieved": False,
        "emoji": "🥰"
    },
    {
        "name": "Cultural Ambassador",
        "description": "User shares their own culture",
        "is_achieved": False,
        "emoji": "🌍"
    },
    {
        "name": "Cultural Explorer",
        "description": "User asks about another character's culture",
        "is_achieved": False,
        "emoji": "🧐"
    },
    {
        "name": "Master of Laughter",
        "description": "User makes another character laugh",
        "is_achieved": False,
        "emoji": "😄"
    },
    {
        "name": "Knowledge Sharer",
        "description": "User teaches another character something new",
        "is_achieved": False,
        "emoji": "🧠"
    }
]

breakpoints = [1, 3, 5, 10, 50]

cultural_events = [{'event': 'Chinese New Year', 'tags': ['Chinese']}, {'event': 'Hari Raya Puasa (Eid al-Fitr)', 'tags': ['Islamic', 'Malay']}, {'event': 'Deepavali (Diwali)', 'tags': ['Hindu', 'Indian']}, {'event': 'Christmas', 'tags': ['Christian']}, {'event': 'Vesak Day', 'tags': ['Buddhist']}, {'event': 'Thaipusam', 'tags': ['Hindu', 'Tamil']}, {'event': 'Hari Raya Haji (Eid al-Adha)', 'tags': ['Islamic', 'Malay']}, {'event': 'Mid-Autumn Festival', 'tags': ['Chinese']}, {'event': 'Chingay Parade (Multi-cultural parade)', 'tags': ['Parade']}, {'event': 'Pongal', 'tags': ['Tamil']}, {'event': 'Good Friday', 'tags': ['Christian']}, {'event': 'Qing Ming Festival (Tomb Sweeping Day)', 'tags': ['Chinese']}, {'event': 'Hungry Ghost Festival', 'tags': ['Chinese']}, {'event': 'Nine Emperor Gods Festival', 'tags': ['Chinese']}, {'event': 'Gawai Dayak (Harvest Festival)', 'tags': ['Dayak', 'Harvest']}, {'event': 'Songkran (Thai New Year)', 'tags': ['Thai']}, {'event': 'Maha Shivaratri', 'tags': ['Hindu']}, {'event': 'Guru Nanak Jayanti', 'tags': ['Sikh']}, {'event': 'Tamil New Year (Puthandu)', 'tags': ['Tamil']}, {'event': "Wesak (Buddha's birthday)", 'tags': ['Buddhist']}, {'event': 'Pohela Boishakh (Bengali New Year)', 'tags': ['Bengali']}, {'event': 'Ching Ming Festival', 'tags': ['Chinese']}, {'event': 'Dumpling Festival (Dragon Boat Festival)', 'tags': ['Chinese']}, {'event': "Eid Milad-un-Nabi (Prophet Muhammad's birthday)", 'tags': ['Islamic']}, {'event': 'Bon Odori (Japanese Buddhist festival)', 'tags': ['Japanese', 'Buddhist']}, {'event': 'Hari Raya Qurban', 'tags': ['Islamic', 'Malay']}, {'event': 'Dragon Boat Festival', 'tags': ['Chinese']}, {'event': 'Lohri', 'tags': ['Punjabi']}, {'event': 'Raksha Bandhan', 'tags': ['Hindu']}, {'event': 'Hari Raya Aidilfitri Open House (post-Ramadan celebrations)', 'tags': ['Islamic', 'Malay']}, {'event': 'Hanukkah (Jewish Festival of Lights)', 'tags': ['Jewish']}, {'event': "Ta'ziyah (Shi'a Muslim mourning ritual)", 'tags': ['Islamic']}, {'event': 'Chinese Hungry Ghost Festival', 'tags': ['Chinese']}, {'event': 'Gudi Padwa (Marathi New Year)', 'tags': ['Marathi']}, {'event': 'Chotrul Duchen (Tibetan Buddhist festival)', 'tags': ['Tibetan', 'Buddhist']}, {'event': 'Baisakhi (Sikh New Year)', 'tags': ['Sikh']}, {'event': 'Makar Sankranti', 'tags': ['Hindu']}, {'event': 'Visakha Bucha (Thai Buddhist holiday)', 'tags': ['Thai', 'Buddhist']}, {'event': 'Chinese Ching Ming Festival', 'tags': ['Chinese']}, {'event': 'Mawlid al-Nabi (Islamic birthday of Prophet Muhammad)', 'tags': ['Islamic']}, {'event': 'Qing Ming Jie (Pure Brightness Festival)', 'tags': ['Chinese']}, {'event': 'Gawai Festival (Iban and Bidayuh Dayak)', 'tags': ['Dayak', 'Harvest']}, {'event': 'Lhabab Duchen (Buddhist festival)', 'tags': ['Buddhist']}, {'event': 'Hari Raya Korban', 'tags': ['Islamic', 'Malay']}, {'event': 'Vesakha Bucha (Thai Theravada Buddhist festival)', 'tags': ['Thai', 'Buddhist']}, {'event': 'Diwali Mela (Indian cultural festival)', 'tags': ['Hindu', 'Indian']}, {'event': 'Naga Panchami (Snake Festival)', 'tags': ['Hindu']}, {'event': 'Hari Raya Haji Open House (Islamic feast)', 'tags': ['Islamic', 'Malay']}, {'event': 'Puthandu Vazthukal (Tamil New Year)', 'tags': ['Tamil']}, {'event': 'Bon Om Touk (Cambodian Water Festival)', 'tags': ['Cambodian']}, {'event': 'Boun Awk Phansa (Laotian festival)', 'tags': ['Laotian']}, {'event': 'Uzhavar Thirunal (Tamil Harvest Festival)', 'tags': ['Tamil', 'Harvest']}, {'event': 'Maundy Thursday', 'tags': ['Christian']}, {'event': 'Nyepi (Balinese New Year)', 'tags': ['Balinese']}, {'event': 'Hari Holika Dahan', 'tags': ['Hindu']}, {'event': 'Raksha Bandhan (Hindu festival)', 'tags': ['Hindu']}, {'event': 'Feast of the Assumption of Mary', 'tags': ['Christian']}, {'event': 'Chuseok (Korean Harvest Festival)', 'tags': ['Korean']}, {'event': "Janmashtami (Krishna's birthday)", 'tags': ['Hindu']}, {'event': 'Panguni Uthiram (Tamil festival)', 'tags': ['Tamil']}, {'event': 'Vesak Full Moon Poya (Sri Lankan Buddhist holiday)', 'tags': ['Sri Lankan', 'Buddhist']}, {'event': 'Theemithi (Hindu fire-walking festival)', 'tags': ['Hindu']}, {'event': 'Bonn Chaul Chnam Thmey (Cambodian New Year)', 'tags': ['Cambodian']}, {'event': 'Mevlid Kandili (Islamic observance)', 'tags': ['Islamic']}, {'event': 'Tihar (Nepali Hindu festival)', 'tags': ['Nepali', 'Hindu']}, {'event': 'Chalica (Unitarian Universalist holiday)', 'tags': ['Unitarian Universalist']}, {'event': 'Rohatsu (Zen Buddhist festival)', 'tags': ['Buddhist']}, {'event': "Guan Yin's Birthday", 'tags': ['Buddhist']}, {'event': 'Simchat Torah (Jewish festival)', 'tags': ['Jewish']}, {'event': 'Losar (Tibetan New Year)', 'tags': ['Tibetan']}, {'event': 'Madhu Purnima (Buddhist festival)', 'tags': ['Buddhist']}, {'event': "Amritanandamayi Jayanti (Amma's birthday)", 'tags': ['Amma']}, {'event': 'Racial Harmony Day (Singaporean observance)', 'tags': ['Conservation']}, {'event': 'Carnival of Saint George', 'tags': ['Christian']}, {'event': 'Holi (Festival of Colors)', 'tags': ['Hindu']}, {'event': 'Ramadan (Islamic month of fasting)', 'tags': ['Islamic']}, {'event': 'Eid ul-Fitr Open House', 'tags': ['Islamic']}, {'event': 'Holi Mela (Indian cultural festival)', 'tags': ['Hindu', 'Indian']}, {'event': 'Hanukkah', 'tags': ['Jewish']}, {'event': 'Chinese Ghost Festival', 'tags': ['Chinese']}, {'event': 'Guru Purnima (Hindu, Buddhist, and Jain festival)', 'tags': ['Hindu', 'Buddhist', 'Jain']}, {'event': 'Khmer New Year', 'tags': ['Khmer']}, {'event': 'Raksha Bandhan (Sikh festival)', 'tags': ['Sikh']}, {'event': 'Maaveerar Naal (Tamil remembrance day)', 'tags': ['Tamil']}, {'event': 'Puthandu (Tamil New Year)', 'tags': ['Tamil']}, {'event': 'Dia de la Raza (Day of the Race)', 'tags': ['Spanish']}, {'event': 'Lantern Festival (Chinese cultural celebration)', 'tags': ['Chinese']}, {'event': 'Loi Krathong (Thai festival)', 'tags': ['Thai']}, {'event': 'Ascension of Jesus Christ', 'tags': ['Christian']}, {'event': 'Hanuman Jayanti (Hindu festival)', 'tags': ['Hindu']}, {'event': 'Durga Puja', 'tags': ['Hindu']}, {'event': 'The Feast of the Epiphany', 'tags': ['Christian']}, {'event': 'Chinese Seventh Month Festival (Hungry Ghost Festival)', 'tags': ['Chinese']}, {'event': 'Fasting of Esther (Jewish observance)', 'tags': ['Jewish']}, {'event': 'Asalha Puja (Theravada Buddhist holiday)', 'tags': ['Buddhist']}, {'event': 'Thaipoosam Cavadee (Tamil Hindu festival)', 'tags': ['Tamil']}, {'event': 'Rosh Hashanah (Jewish New Year)', 'tags': ['Jewish']}, {'event': 'Holi Hai (Hindu spring festival)', 'tags': ['Hindu']}]

historical_events = [
    {
        "event": "Arrival of Stamford Raffles and the establishment of modern Singapore (1819)",
        "tags": ["Historical", "British"]
    },
    {
        "event": "Introduction of the Immigration Restriction Ordinance, leading to a surge of Chinese immigrants (1851)",
        "tags": ["Immigration", "Chinese", "Legislation", "Historical"]
    },
    {
        "event": "Construction of the iconic Raffles Hotel (1887)",
        "tags": ["Architecture", "Historical"]
    },
    {
        "event": "Establishment of the Straits Chinese British Association (1900)",
        "tags": ["British", "Chinese", "Historical"]
    },
    {
        "event": "Japanese Occupation of Singapore during World War II (1942-1945)",
        "tags": ["WWII", "Occupation", "Historical"]
    },
    {
        "event": "Proclamation of Singapore's independence and formation of the Republic of Singapore (1965)",
        "tags": ["Independence", "Historical"]
    },
    {
        "event": "Creation of the Speak Mandarin Campaign to promote Mandarin Chinese (1979)",
        "tags": ["Language", "Historical"]
    },
    {
        "event": "Launch of the Singapore Arts Festival (1977)",
        "tags": ["Arts", "Historical"]
    },
    {
        "event": "Formation of the National Arts Council (1991)",
        "tags": ["Arts", "Historical"]
    },
    {
        "event": "Inauguration of the Esplanade - Theatres on the Bay (2002)",
        "tags": ["Arts", "Historical", "Architecture"]
    },
    {
        "event": "Designation of Singapore Botanic Gardens as a UNESCO World Heritage Site (2015)",
        "tags": ["Conservation", "UNESCO", "Historical"]
    },
    {
        "event": "Opening of the National Gallery Singapore (2015)",
        "tags": ["Arts", "Historical", "Architecture"]
    },
    {
        "event": "Introduction of the Singapore Heritage Festival (2004)",
        "tags": ["Conservation", "Historical"]
    },
    {
        "event": "Establishment of the Peranakan Museum (2008)",
        "tags": ["Conservation", "Historical", "Peranakan"]
    },
    {
        "event": "Inauguration of the National Museum of Singapore (2006)",
        "tags": ["Conservation", "Historical"]
    },
    {
        "event": "Launch of the Singapore Biennale, a contemporary art exhibition (2006)",
        "tags": ["Arts", "Historical"]
    },
    {
        "event": "Formation of the Singapore Symphony Orchestra (1979)",
        "tags": ["Arts", "Historical"]
    },
    {
        "event": "Celebration of Singapore's Bicentennial to commemorate the nation's history (2019)",
        "tags": ["Historical"]
    },
    {
        "event": "Establishment of the Asian Civilisations Museum (1997)",
        "tags": ["Historical", "Conservation"]
    }
]

tags = [{"id": x, "text": x} for x in ['Marathi', 'Conservation', 'Peranakan', 'Bengali', 'Unitarian Universalist', 'Christian', 'Cambodian', 'UNESCO', 'Korean', 'Jewish', 'WWII', 'Tibetan', 'Buddhist', 'Occupation', 'Legislation', 'Historical', 'Khmer', 'Immigration', 'Independence', 'Parade', 'Laotian', 'Indian', 'Nepali', 'Thai', 'Jain', 'British', 'Spanish', 'Language', 'Islamic', 'Hindu', 'Sri Lankan', 'Architecture', 'Harvest', 'Tamil', 'Chinese', 'Japanese', 'Dayak', 'Arts', 'Malay', 'Amma', 'Sikh', 'Punjabi', 'Balinese']]

all_events = cultural_events + historical_events

all_event_names = [event['event'] for event in all_events]

num_mcqs = [0, 1, 3, 5]

len_essay = [0, 100, 300, 600]

time_limits = [0, 30, 90, 150]

epsilon = 5 # ping offset

leeway = 3 # reading time offset
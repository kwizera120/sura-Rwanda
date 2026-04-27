import { createServer } from 'node:http';

const PORT = Number(process.env.PORT || 3001);

const placeSeeds = [
  {
    id: 'volcanoes-national-park',
    name: 'Volcanoes National Park',
    wikiTitle: 'Volcanoes National Park',
    category: 'Parks',
    duration: '1-2 days',
    price: '$$$',
    rating: 5,
    activities: ['Gorilla trekking', 'Golden monkey tracking', 'Volcano hiking', 'Nature walks'],
    description: 'A top wildlife destination in Rwanda known for gorilla trekking and volcanic scenery.',
    image: '/images/attractions/parks/volcanoes-park.jpg',
  },
  {
    id: 'akagera-national-park',
    name: 'Akagera National Park',
    wikiTitle: 'Akagera National Park',
    category: 'Parks',
    duration: '1-2 days',
    price: '$$',
    rating: 4.6,
    activities: ['Game drives', 'Boat safaris', 'Bird watching', 'Big Five safari'],
    description: 'Rwanda’s savannah park with classic safari wildlife and lakeside landscapes.',
    image: '/images/attractions/parks/akagera-park.jpg',
  },
  {
    id: 'nyungwe-forest-national-park',
    name: 'Nyungwe Forest National Park',
    wikiTitle: 'Nyungwe Forest',
    category: 'Parks',
    duration: '2 days',
    price: '$$',
    rating: 4.7,
    activities: ['Canopy walk', 'Chimpanzee tracking', 'Bird watching', 'Forest trails'],
    description: 'An ancient montane rainforest with primates, waterfalls, and a canopy walkway.',
    image: '/images/attractions/parks/nyungwe-forest.jpg',
  },
  {
    id: 'gishwati-mukura-national-park',
    name: 'Gishwati-Mukura National Park',
    wikiTitle: 'Gishwati-Mukura National Park',
    category: 'Parks',
    duration: '1 day',
    price: '$',
    rating: 4.3,
    activities: ['Chimpanzee trekking', 'Bird watching', 'Community tours', 'Nature walks'],
    description: 'A newer protected forest area with biodiversity, primates, and conservation tourism.',
    image: '/images/attractions/parks/gishwati-park.jpg',
  },
  {
    id: 'lake-kivu',
    name: 'Lake Kivu',
    wikiTitle: 'Lake Kivu',
    category: 'Lakes',
    duration: '2-3 days',
    price: '$$',
    rating: 4.8,
    activities: ['Kayaking', 'Boat rides', 'Beach relaxation', 'Sunset cruises'],
    description: 'One of Africa’s Great Lakes, popular for relaxation and lakeside tourism.',
    image: '/images/attractions/lakes/lake-kivu.jpg',
  },
  {
    id: 'lake-muhazi',
    name: 'Lake Muhazi',
    wikiTitle: 'Lake Muhazi',
    category: 'Lakes',
    duration: 'Half-full day',
    price: '$',
    rating: 4.2,
    activities: ['Fishing', 'Boat rides', 'Water sports', 'Picnics'],
    description: 'A long lake east of Kigali suited to local getaways and day trips.',
    image: '/images/attractions/lakes/lake-muhazi.jpg',
  },
  {
    id: 'lake-burera-ruhondo',
    name: 'Lake Burera & Ruhondo',
    wikiTitle: 'Burera and Ruhondo',
    category: 'Lakes',
    duration: '1 day',
    price: '$',
    rating: 4.5,
    activities: ['Boat rides', 'Photography', 'Scenic tours', 'Community visits'],
    description: 'Twin lakes near the Virunga mountains known for dramatic scenery.',
    image: '/images/attractions/lakes/lake-burera.jpg',
  },
  {
    id: 'kigali-city',
    name: 'Kigali City',
    wikiTitle: 'Kigali',
    category: 'Cities',
    duration: '2 days',
    price: '$$',
    rating: 4.9,
    activities: ['City tours', 'Markets', 'Museums', 'Cafe hopping'],
    description: 'Rwanda’s capital city, known for cleanliness, safety, and a growing food and arts scene.',
    image: '/images/attractions/cities/kigali.jpg',
  },
  {
    id: 'gisenyi-rubavu',
    name: 'Gisenyi (Rubavu)',
    wikiTitle: 'Rubavu',
    category: 'Cities',
    duration: '1-2 days',
    price: '$$',
    rating: 4.4,
    activities: ['Beach activities', 'Hot springs', 'Nightlife', 'Lakefront walks'],
    description: 'A resort town on Lake Kivu with beaches, border-town energy, and resort stays.',
    image: '/images/attractions/cities/gisenyi.jpg',
  },
  {
    id: 'huye-butare',
    name: 'Huye (Butare)',
    wikiTitle: 'Huye District',
    category: 'Cities',
    duration: '1 day',
    price: '$',
    rating: 4.3,
    activities: ['Museum visits', 'Cultural tours', 'Campus walks', 'Historical sites'],
    description: 'A cultural and academic center in southern Rwanda.',
    image: '/images/attractions/cities/huye.jpg',
  },
  {
    id: 'mount-karisimbi',
    name: 'Mount Karisimbi',
    wikiTitle: 'Mount Karisimbi',
    category: 'Mountains',
    duration: '2 days',
    price: '$$$',
    rating: 4.6,
    activities: ['Mountain climbing', 'Camping', 'Photography', 'Volcano trekking'],
    description: 'The highest volcano in Rwanda, offering one of the country’s toughest treks.',
    image: '/images/attractions/mountains/mount-karisimbi.jpg',
  },
  {
    id: 'mount-bisoke',
    name: 'Mount Bisoke',
    wikiTitle: 'Mount Bisoke',
    category: 'Mountains',
    duration: '1 day',
    price: '$$',
    rating: 4.5,
    activities: ['Day hike', 'Crater lake views', 'Photography', 'Bird watching'],
    description: 'A volcano hike famous for its crater lake and Virunga views.',
    image: '/images/attractions/mountains/mount-bisoke.jpg',
  },
  {
    id: 'kigali-genocide-memorial',
    name: 'Kigali Genocide Memorial',
    wikiTitle: 'Kigali Genocide Memorial',
    category: 'Culture',
    duration: '2-3 hours',
    price: 'Free',
    rating: 5,
    activities: ['Museum tour', 'Memorial gardens', 'Historical learning', 'Reflection'],
    description: 'A major memorial and educational site documenting the 1994 genocide against the Tutsi.',
    image: '/images/attractions/culture/genocide-memorial.jpg',
  },
  {
    id: 'kings-palace-museum',
    name: "King's Palace Museum (Nyanza)",
    wikiTitle: 'King\'s Palace Museum, Nyanza',
    category: 'Culture',
    duration: '1-2 hours',
    price: '$',
    rating: 4.5,
    activities: ['Palace tours', 'Royal cattle', 'Traditional history', 'Craft shopping'],
    description: 'A reconstruction of Rwanda’s royal heritage with traditional architecture and royal cattle.',
    image: '/images/attractions/culture/king-palace.jpg',
  },
  {
    id: 'ibyiwacu-cultural-village',
    name: "Iby'Iwacu Cultural Village",
    wikiTitle: 'Gorilla Guardians Village',
    category: 'Culture',
    duration: '2-3 hours',
    price: '$$',
    rating: 4.6,
    activities: ['Dance performances', 'Local food', 'Crafts', 'Community experiences'],
    description: 'A cultural tourism experience near Volcanoes National Park.',
    image: '/images/attractions/culture/culture-village.jpg',
  },
  {
    id: 'musanze-caves',
    name: 'Musanze Caves',
    wikiTitle: 'Musanze Caves',
    category: 'Culture',
    duration: 'Half day',
    price: '$',
    rating: 4.3,
    activities: ['Cave tours', 'Geology tours', 'Photography', 'Guided walks'],
    description: 'Volcanic caves with geological and historical interest in northern Rwanda.',
    image: '/images/attractions/culture/musanze-caves.jpg',
  },
  {
    id: 'bisate-lodge',
    name: 'Bisate Lodge',
    wikiTitle: 'Bisate Lodge',
    category: 'Hotels',
    duration: 'Per night',
    price: '$$$$$',
    rating: 5,
    activities: ['Fine dining', 'Spa', 'Luxury stay', 'Gorilla trekking access'],
    description: 'A luxury eco-lodge near Volcanoes National Park.',
    image: '/images/hotels/luxury/bisate-lodge.jpg',
  },
  {
    id: 'one-only-nyungwe-house',
    name: 'One&Only Nyungwe House',
    wikiTitle: 'One&Only Nyungwe House',
    category: 'Hotels',
    duration: 'Per night',
    price: '$$$$',
    rating: 5,
    activities: ['Pool', 'Spa', 'Tea plantation tours', 'Forest access'],
    description: 'A premium tea-estate resort near Nyungwe Forest.',
    image: '/images/hotels/luxury/nyungwe-house.jpg',
  },
  {
    id: 'kigali-marriott-hotel',
    name: 'Kigali Marriott Hotel',
    wikiTitle: 'Kigali Marriott Hotel',
    category: 'Hotels',
    duration: 'Per night',
    price: '$$$',
    rating: 4.5,
    activities: ['Gym', 'Pool', 'Business center', 'Restaurants'],
    description: 'An upscale city hotel in Kigali suited for business and leisure travelers.',
    image: '/images/hotels/mid-range/kigali-marriott.jpg',
  },
  {
    id: 'lake-kivu-serena-hotel',
    name: 'Lake Kivu Serena Hotel',
    wikiTitle: 'Lake Kivu Serena Hotel',
    category: 'Hotels',
    duration: 'Per night',
    price: '$$',
    rating: 4.4,
    activities: ['Beach access', 'Water sports', 'Spa', 'Lakeside dining'],
    description: 'A lakeside resort stay in Rubavu with beach access and water activities.',
    image: '/images/hotels/mid-range/serena-hotel.jpg',
  },
  {
    id: 'budget-guesthouses',
    name: 'Budget Guesthouses',
    wikiTitle: 'Guest house',
    category: 'Hotels',
    duration: 'Per night',
    price: '$',
    rating: 3.5,
    activities: ['Wi-Fi', 'Shared kitchen', 'Tour booking', 'Backpacker stays'],
    description: 'Affordable stays available across Rwanda for budget-conscious travelers.',
    image: '/images/hotels/budget/guesthouse.jpg',
  },
];

const foodSeeds = [
  { id: 'ugali', name: 'Ugali (Ubugali)', wikiTitle: 'Ugali', category: 'Main Dish', price: '$', mustTry: true, ingredients: ['Maize flour', 'Water'], image: '/images/food/ugali.jpg' },
  { id: 'isombe', name: 'Isombe', wikiTitle: 'Isombe', category: 'Main Dish', price: '$', mustTry: true, ingredients: ['Cassava leaves', 'Peanut butter', 'Palm oil'], image: '/images/food/isombe.jpg' },
  { id: 'brochette', name: 'Brochette', wikiTitle: 'Brochette', category: 'Street Food', price: '$$', mustTry: true, ingredients: ['Beef', 'Goat', 'Chicken', 'Spices'], image: '/images/food/brochettes.jpg' },
  { id: 'matoke', name: 'Matoke', wikiTitle: 'Matoke', category: 'Side Dish', price: '$', mustTry: false, ingredients: ['Plantains', 'Salt', 'Water'], image: '/images/food/matoke.jpg' },
  { id: 'isambaza', name: 'Sambaza', wikiTitle: 'Sardine', category: 'Street Food', price: '$', mustTry: true, ingredients: ['Lake fish', 'Oil', 'Salt'], image: '/images/food/sambaza.jpg' },
  { id: 'ibihaza', name: 'Ibihaza', wikiTitle: 'Pumpkin', category: 'Side Dish', price: '$', mustTry: false, ingredients: ['Pumpkin', 'Beans'], image: '/images/food/ibihaza.jpg' },
  { id: 'mandazi', name: 'Mandazi', wikiTitle: 'Mandazi', category: 'Snack', price: '$', mustTry: false, ingredients: ['Flour', 'Sugar', 'Oil'], image: '/images/food/mandazi.jpg' },
  { id: 'akabenz', name: 'Akabenz', wikiTitle: 'Grilled Pork', category: 'Main Dish', price: '$$', mustTry: true, ingredients: ['Pork', 'Onions', 'Chili'], image: '/images/food/akabenz.jpg' },
  { id: 'mizuzu', name: 'Mizuzu', wikiTitle: 'Fried Plantains', category: 'Snack', price: '$', mustTry: true, ingredients: ['Sweet Plantains', 'Oil'], image: '/images/food/mizuzu.jpg' },
  { id: 'urwagwa', name: 'Urwagwa', wikiTitle: 'Banana Beer', category: 'Beverage', price: '$', mustTry: true, ingredients: ['Bananas', 'Sorghum'], image: '/images/food/urwagwa.jpg' },
];

const restaurantSeeds = [
  { id: 'heaven-restaurant', name: 'Heaven Restaurant', location: 'Kigali', specialty: 'International & Local Fusion', price: '$$$', rating: 4.7 },
  { id: 'khana-khazana', name: 'Khana Khazana', location: 'Kigali', specialty: 'Indian Cuisine', price: '$$', rating: 4.6 },
  { id: 'repub-lounge', name: 'Repub Lounge', location: 'Kigali', specialty: 'Fine Dining', price: '$$$', rating: 4.5 },
  { id: 'the-hut', name: 'The Hut', location: 'Kigali', specialty: 'Traditional Rwandan', price: '$$', rating: 4.4 },
  { id: 'inzora-rooftop-cafe', name: 'Inzora Rooftop Cafe', location: 'Kigali', specialty: 'Coffee & Light Meals', price: '$$', rating: 4.4 },
  { id: 'question-coffee', name: 'Question Coffee', location: 'Kigali', specialty: 'Specialty Coffee', price: '$', rating: 4.8 },
];

const phraseDictionary = {
  hello: 'Muraho',
  'thank you': 'Murakoze',
  'good morning': 'Mwaramutse',
  'how are you': 'Amakuru?',
  goodbye: 'Murabeho',
  yes: 'Yego',
  no: 'Oya',
  please: 'Mbabarira',
  water: 'Amazi',
  food: 'Ibiryo',
  help: 'Mfasha',
  'i am fine': 'Ni meza',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

function extractPlainText(html = '') {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SuraRwandaTravelPlatform/1.0 (contact: info@example.com)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWikipediaSummary(title) {
  try {
    return await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  } catch {
    return null;
  }
}

async function fetchCoordinates(query) {
  try {
    const results = await fetchJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`);
    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    return {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon),
    };
  } catch {
    return null;
  }
}

async function fetchPlaceRecord(seed) {
  const wiki = await fetchWikipediaSummary(seed.wikiTitle || seed.name);
  const coordinates =
    wiki?.coordinates
      ? { lat: Number(wiki.coordinates.lat), lng: Number(wiki.coordinates.lon) }
      : await fetchCoordinates(`${seed.name}, Rwanda`);

  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    description: wiki?.extract || seed.description,
    image: seed.image || wiki?.originalimage?.source || wiki?.thumbnail?.source,
    rating: seed.rating,
    duration: seed.duration,
    price: seed.price,
    activities: seed.activities,
    location: coordinates,
    source: {
      summary: wiki ? 'Wikipedia REST API' : 'Fallback seed',
      coordinates: coordinates ? 'OpenStreetMap Nominatim / Wikipedia' : 'Unavailable',
    },
  };
}

async function fetchFoodRecord(seed) {
  const wiki = await fetchWikipediaSummary(seed.wikiTitle || seed.name);
  return {
    id: seed.id,
    name: seed.name,
    description: wiki?.extract || `Popular in Rwanda and East Africa, ${seed.name.toLowerCase()} is worth trying while you travel.`,
    image: seed.image || wiki?.originalimage?.source || wiki?.thumbnail?.source,
    category: seed.category,
    price: seed.price,
    mustTry: seed.mustTry,
    ingredients: seed.ingredients,
    source: wiki ? 'Wikipedia REST API' : 'Fallback seed',
  };
}

async function getWeather(city = 'Kigali') {
  try {
    const geo = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(city)}&country=RW`);
    const hit = geo?.results?.[0];
    if (!hit) {
      throw new Error('No location found');
    }

    const weather = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
    return {
      city: hit.name,
      temperature: Math.round(weather.current.temperature_2m),
      humidity: weather.current.relative_humidity_2m,
      windSpeed: weather.current.wind_speed_10m,
      weatherCode: weather.current.weather_code,
      description: weatherCodeToDescription(weather.current.weather_code),
      source: 'Open-Meteo',
    };
  } catch {
    return {
      city,
      temperature: 22,
      humidity: 65,
      windSpeed: 12,
      weatherCode: null,
      description: 'Partly cloudy',
      source: 'Fallback sample',
    };
  }
}

function weatherCodeToDescription(code) {
  const mapping = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    80: 'Rain showers',
    95: 'Thunderstorm',
  };
  return mapping[code] || 'Current conditions unavailable';
}

async function getExchangeRates() {
  try {
    const data = await fetchJson('https://api.exchangerate-api.com/v4/latest/USD');
    const usdToRwf = Math.round(data.rates.RWF || 1300);
    return {
      usdToRwf,
      eurToRwf: Math.round(usdToRwf / (data.rates.EUR || 0.9)),
      gbpToRwf: Math.round(usdToRwf / (data.rates.GBP || 0.78)),
      lastUpdated: data.date,
      source: 'ExchangeRate-API',
    };
  } catch {
    return {
      usdToRwf: 1300,
      eurToRwf: 1450,
      gbpToRwf: 1650,
      lastUpdated: new Date().toISOString().slice(0, 10),
      source: 'Fallback sample',
    };
  }
}

async function buildTripPlan({ budget, duration, travelers, interests }) {
  const numericBudget = Number(budget);
  const numericDuration = Number(duration);
  const numericTravelers = Number(travelers);
  const dailyBudget = Math.round(numericBudget / Math.max(numericDuration * numericTravelers, 1));

  const places = await Promise.all(placeSeeds.map(fetchPlaceRecord));
  const hotels = places.filter((place) => place.category === 'Hotels');
  const attractions = places.filter((place) => place.category !== 'Hotels');
  const foods = await Promise.all(foodSeeds.map(fetchFoodRecord));
  const weather = await getWeather('Kigali');
  const exchangeRates = await getExchangeRates();

  const affordableHotels = hotels.filter((hotel) => {
    if (dailyBudget > 300) return hotel.price.length >= 3;
    if (dailyBudget > 150) return hotel.price.length >= 2 && hotel.price.length <= 4;
    return hotel.price.length <= 2;
  }).slice(0, 3);

  const recommendedActivities = attractions.filter((place) => {
    if (interests.includes('Wildlife & Safaris')) return ['Parks', 'Mountains'].includes(place.category);
    if (interests.includes('Culture & History')) return place.category === 'Culture' || place.category === 'Cities';
    if (interests.includes('Relaxation')) return place.category === 'Lakes' || place.category === 'Hotels';
    if (interests.includes('Photography')) return ['Lakes', 'Mountains', 'Parks'].includes(place.category);
    return true;
  }).slice(0, 4);

  const suggestedFood = foods
    .filter((food) => interests.includes('Local Cuisine') ? food.mustTry : true)
    .slice(0, 3)
    .map((food) => `${food.name} (${food.category})`);

  return {
    budget: numericBudget,
    duration: numericDuration,
    travelers: numericTravelers,
    dailyBudget,
    accommodation: affordableHotels.map((hotel) => `${hotel.name} - ${hotel.price} - rating ${hotel.rating}/5`),
    activities: recommendedActivities.map((activity) => `${activity.name} - ${activity.activities.slice(0, 2).join(', ')}`),
    food: suggestedFood,
    transport:
      dailyBudget > 300
        ? 'Private driver or tailored tour transfer'
        : dailyBudget > 150
          ? 'Private car hire or mixed transfers'
          : 'Public transport, ride-hailing, and shared taxis',
    totalEstimate: numericBudget,
    liveContext: {
      weather,
      exchangeRates,
    },
  };
}

async function translatePhrase(text) {
  const clean = String(text || '').trim().toLowerCase();
  const direct = Object.entries(phraseDictionary).find(([key]) => clean.includes(key));
  if (direct) {
    return {
      match: direct[0],
      translation: direct[1],
      note: 'Dictionary-backed backend response',
      source: 'Backend language service',
    };
  }

  try {
    const hint = await fetchJson(`https://api.datamuse.com/words?max=5&ml=${encodeURIComponent(clean)}`);
    const inferred = hint.find((item) => phraseDictionary[item.word]);
    if (inferred) {
      return {
        match: inferred.word,
        translation: phraseDictionary[inferred.word],
        note: `Closest supported phrase matched from Datamuse: ${inferred.word}`,
        source: 'Datamuse + backend dictionary',
      };
    }
  } catch {
    // Ignore API failure and fall back to supported phrases.
  }

  return {
    match: null,
    translation: null,
    note: 'Try a simple phrase like hello, thank you, goodbye, water, or please.',
    source: 'Backend language service',
  };
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Missing request URL' });
    return;
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    // Proxy /api/ai/* to the local AI backend (FastAPI)
    if (url.pathname.startsWith('/api/ai')) {
      const aiBackend = process.env.AI_BACKEND || 'http://localhost:8000';
      const aiPath = url.pathname.replace(/^\/api\/ai/, '') || '/';
      const targetUrl = aiBackend.replace(/\/$/, '') + aiPath + (url.search || '');
      console.log('[proxy] forwarding', req.method, url.pathname, '->', targetUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        // Read JSON body (if any)
        let bodyObj = null;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          try {
            bodyObj = await parseBody(req);
          } catch (e) {
            bodyObj = null;
          }
        }

        // Build headers to forward (omit hop-by-hop headers)
        const forwardHeaders = {};
        for (const [k, v] of Object.entries(req.headers || {})) {
          if (['host', 'connection', 'content-length', 'accept-encoding'].includes(k)) continue;
          forwardHeaders[k] = v;
        }

        const fetchOptions = { method: req.method, headers: forwardHeaders, signal: controller.signal };
        if (bodyObj && Object.keys(bodyObj).length > 0) {
          fetchOptions.body = JSON.stringify(bodyObj);
          fetchOptions.headers = { ...fetchOptions.headers, 'content-type': 'application/json' };
        }

        const aiResp = await fetch(targetUrl, fetchOptions);
        const text = await aiResp.text();
        const contentType = aiResp.headers.get('content-type') || 'application/json; charset=utf-8';

        res.writeHead(aiResp.status, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Content-Type': contentType,
        });
        res.end(text);
        return;
      } catch (err) {
        console.error('[proxy] error proxying to AI backend', String(err));
        sendJson(res, 502, { error: 'AI backend unreachable', detail: String(err) });
        return;
      } finally {
        clearTimeout(timeoutId);
      }
    }
    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true, service: 'travel-backend' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/places') {
      const category = url.searchParams.get('category');
      const records = await Promise.all(placeSeeds.map(fetchPlaceRecord));
      const filtered = category && category !== 'All'
        ? records.filter((place) => place.category === category)
        : records;

      const stats = {
        parks: records.filter((place) => place.category === 'Parks').length,
        lakes: records.filter((place) => place.category === 'Lakes').length,
        culture: records.filter((place) => place.category === 'Culture').length,
        hotels: records.filter((place) => place.category === 'Hotels').length,
      };

      sendJson(res, 200, { data: filtered, stats, source: ['Wikipedia REST API', 'OpenStreetMap Nominatim'] });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/foods') {
      const dishes = await Promise.all(foodSeeds.map(fetchFoodRecord));
      sendJson(res, 200, {
        dishes,
        restaurants: restaurantSeeds,
        tips: {
          etiquette: [
            'Wash your hands before eating when dining traditionally.',
            'Wait for elders or hosts to begin the meal.',
            'Sharing food is common and welcoming.',
            'Local markets are great for affordable authentic meals.',
          ],
          streetFood: {
            bestAreas: ['Kimironko Market', 'Nyabugogo area', 'Downtown Kigali evenings', 'Gisenyi lakeside'],
            popularItems: ['Brochettes', 'Roasted corn', 'Sambaza fish', 'Fresh juices'],
            priceRange: ['Brochettes: $1-3', 'Sambaza: $1-2', 'Fresh juice: $0.50-1', 'Snacks: $0.25-1'],
          },
        },
        source: ['Wikipedia REST API', 'Backend curated restaurant index'],
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/trip-plan') {
      const body = await parseBody(req);
      const plan = await buildTripPlan(body);
      sendJson(res, 200, plan);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/language/translate') {
      const body = await parseBody(req);
      const result = await translatePhrase(body.text);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/weather') {
      const city = url.searchParams.get('city') || 'Kigali';
      sendJson(res, 200, await getWeather(city));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/exchange-rates') {
      sendJson(res, 200, await getExchangeRates());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/wiki-summary') {
      const title = url.searchParams.get('title');
      if (!title) {
        sendJson(res, 400, { error: 'title query parameter is required' });
        return;
      }

      const summary = await fetchWikipediaSummary(title);
      if (!summary) {
        sendJson(res, 404, { error: 'Summary not found' });
        return;
      }

      sendJson(res, 200, {
        title: summary.title,
        description: summary.description,
        extract: summary.extract,
        image: summary.originalimage?.source || summary.thumbnail?.source || null,
        html: extractPlainText(summary.extract_html),
      });
      return;
    }

    // ─── Authentication ───────────────────────────────────────
    if (req.method === 'POST' && url.pathname === '/api/auth/signup') {
      const body = await parseBody(req);
      const { name, email, password } = body;
      if (!name || !email || !password) {
        sendJson(res, 400, { error: 'name, email and password are required' });
        return;
      }
      // In-memory store (survives while server runs)
      if (!global.__users) global.__users = [];
      if (global.__users.find(u => u.email === email)) {
        sendJson(res, 409, { error: 'Email already registered' });
        return;
      }
      const user = { id: Date.now().toString(), name, email, password };
      global.__users.push(user);
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
      sendJson(res, 201, { user: { id: user.id, name: user.name, email: user.email }, token });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await parseBody(req);
      const { email, password } = body;
      if (!global.__users) global.__users = [];
      const found = global.__users.find(u => u.email === email && u.password === password);
      if (!found) {
        sendJson(res, 401, { error: 'Invalid email or password' });
        return;
      }
      const token = Buffer.from(`${found.id}:${Date.now()}`).toString('base64');
      sendJson(res, 200, { user: { id: found.id, name: found.name, email: found.email }, token });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        sendJson(res, 401, { error: 'Not authenticated' });
        return;
      }
      const decoded = Buffer.from(auth.slice(7), 'base64').toString();
      const userId = decoded.split(':')[0];
      if (!global.__users) global.__users = [];
      const user = global.__users.find(u => u.id === userId);
      if (!user) {
        sendJson(res, 401, { error: 'User not found' });
        return;
      }
      sendJson(res, 200, { user: { id: user.id, name: user.name, email: user.email } });
      return;
    }

    sendJson(res, 404, { error: 'Route not found' });
  } catch (error) {
    sendJson(res, 500, {
      error: 'Backend request failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(PORT, () => {
  console.log(`Travel backend running on http://localhost:${PORT}`);
});

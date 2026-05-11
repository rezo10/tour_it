/**
 * Returns an iconic photo URL for a given (city, country) pair using the
 * Unsplash Search API.
 *
 * Behaviour
 * - First checks sessionStorage with key `cityimg_{city}_{country}` (lowercased,
 *   spaces replaced with underscores). If present, returns it immediately.
 * - In-memory inflight map deduplicates concurrent requests for the same city
 *   (avoids burning Unsplash quota when many cards mount simultaneously).
 * - Uses a curated query map (CURATED_QUERIES) when available; otherwise builds
 *   a query like "{city} {country} landmark famous iconic".
 * - On any failure (missing key, quota, network, empty results) returns a
 *   single, deterministic fallback URL so the UI never breaks.
 *
 * This module is intended to run in the browser (sessionStorage). When called
 * during SSR it simply skips the cache layer.
 */

export const CITY_IMAGE_FALLBACK_URL =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";

const CURATED_QUERIES: Record<string, string> = {
  istanbul: "Istanbul Hagia Sophia Bosphorus Turkey iconic",
  ankara: "Ankara Atatürk Mausoleum Turkey capital",
  izmir: "Izmir Turkey Aegean coast clock tower",
  antalya: "Antalya Turkey old town harbor Mediterranean",
  bodrum: "Bodrum Turkey castle Aegean marina",
  cappadocia: "Cappadocia Turkey hot air balloons fairy chimneys",
  bursa: "Bursa Turkey Uludag green mosque",
  trabzon: "Trabzon Turkey Sumela monastery Black Sea",
  paris: "Paris Eiffel Tower France landmark",
  lyon: "Lyon France Saone river old town",
  nice: "Nice France French Riviera Promenade des Anglais",
  "rio de janeiro": "Rio de Janeiro Christ Redeemer statue Brazil",
  "new york": "New York Manhattan skyline cityscape",
  tokyo: "Tokyo Shibuya crossing Japan city lights",
  kyoto: "Kyoto Fushimi Inari bamboo grove Japan temple",
  osaka: "Osaka Japan castle Dotonbori neon",
  rome: "Rome Colosseum Italy ancient architecture",
  barcelona: "Barcelona Sagrada Familia Gaudi Spain",
  london: "London Big Ben Tower Bridge Thames",
  edinburgh: "Edinburgh Scotland castle Royal Mile",
  manchester: "Manchester England city skyline",
  dubai: "Dubai Burj Khalifa skyline desert",
  "abu dhabi": "Abu Dhabi Sheikh Zayed Grand Mosque skyline",
  sydney: "Sydney Opera House Harbour Bridge Australia",
  melbourne: "Melbourne Australia laneways skyline",
  brisbane: "Brisbane Australia river skyline",
  perth: "Perth Australia Swan River skyline",
  amsterdam: "Amsterdam canals Netherlands bicycles",
  rotterdam: "Rotterdam Netherlands modern architecture port",
  prague: "Prague Charles Bridge castle Czech Republic",
  lisbon: "Lisbon tram Belem Tower Portugal",
  copenhagen: "Copenhagen Nyhavn canal colorful houses Denmark",
  athens: "Athens Acropolis Parthenon Greece",
  madrid: "Madrid Royal Palace Puerta del Sol Spain",
  vienna: "Vienna Schonbrunn Palace Austria architecture",
  salzburg: "Salzburg Austria old town Mozart birthplace",
  berlin: "Berlin Brandenburg Gate Germany",
  munich: "Munich Bavaria Marienplatz Germany beer garden",
  hamburg: "Hamburg Germany Speicherstadt warehouse harbor",
  frankfurt: "Frankfurt Germany skyline river Main",
  cologne: "Cologne Germany cathedral Rhine river",
  budapest: "Budapest Parliament Danube river Hungary",
  singapore: "Singapore Marina Bay Sands skyline",
  bangkok: "Bangkok Grand Palace Thailand temple",
  bali: "Bali rice terraces temple Indonesia",
  "new delhi": "New Delhi India Gate Taj Mahal",
  delhi: "Delhi India Red Fort Jama Masjid",
  mumbai: "Mumbai India Gateway of India Marine Drive",
  jaipur: "Jaipur Pink City India palaces",
  goa: "Goa India beach palm trees",
  kathmandu: "Kathmandu Nepal Durbar Square Himalayas",
  cairo: "Cairo Pyramids Giza Egypt desert",
  "cape town": "Cape Town Table Mountain South Africa",
  johannesburg: "Johannesburg South Africa skyline",
  "mexico city": "Mexico City Zocalo cathedral colorful",
  cancun: "Cancun Mexico beach turquoise water",
  guadalajara: "Guadalajara Mexico colonial cathedral",
  havana: "Havana Cuba classic cars colorful streets",
  "buenos aires": "Buenos Aires colorful La Boca Argentina",
  "sao paulo": "Sao Paulo Brazil skyline avenida paulista",
  lima: "Lima Peru Plaza Mayor coast Pacific",
  cusco: "Cusco Peru Machu Picchu Andes plaza",
  santiago: "Santiago Chile Andes skyline",
  bogota: "Bogota Colombia La Candelaria mountains",
  cartagena: "Cartagena Colombia colorful old town walls",
  toronto: "Toronto CN Tower Canada skyline",
  vancouver: "Vancouver Canada mountains harbor",
  montreal: "Montreal Canada old port Notre Dame",
  "los angeles": "Los Angeles Hollywood sign California sunset",
  miami: "Miami South Beach Art Deco Florida",
  "san francisco": "San Francisco Golden Gate Bridge California",
  chicago: "Chicago skyline Lake Michigan architecture",
  "las vegas": "Las Vegas Strip neon Nevada skyline",
  seattle: "Seattle Space Needle Washington skyline",
  boston: "Boston Massachusetts skyline harbor",
  washington: "Washington DC Capitol Lincoln Memorial",
  honolulu: "Honolulu Hawaii Waikiki Diamond Head",
  moscow: "Moscow Red Square Kremlin Russia",
  "saint petersburg": "Saint Petersburg Russia Hermitage canals",
  kyiv: "Kyiv Ukraine St Sophia Cathedral",
  beijing: "Beijing Great Wall Forbidden City China",
  shanghai: "Shanghai Bund skyline China modern",
  "hong kong": "Hong Kong skyline Victoria Harbour",
  taipei: "Taipei Taiwan 101 skyline night",
  seoul: "Seoul Gyeongbokgung Palace South Korea",
  busan: "Busan South Korea beach Gamcheon village",
  zurich: "Zurich Switzerland lake Alps",
  geneva: "Geneva Switzerland lake fountain Jet d'Eau",
  brussels: "Brussels Grand Place Belgium architecture",
  stockholm: "Stockholm old town Gamla Stan Sweden waterfront",
  oslo: "Oslo Norway fjord Viking ships",
  helsinki: "Helsinki Finland Cathedral Senate Square",
  warsaw: "Warsaw Old Town Poland colorful",
  krakow: "Krakow Wawel Castle Poland medieval",
  dubrovnik: "Dubrovnik Old City walls Croatia Adriatic",
  santorini: "Santorini white blue domes Greece Aegean",
  mykonos: "Mykonos windmills Greece island white",
  florence: "Florence Duomo Ponte Vecchio Italy Renaissance",
  venice: "Venice canals gondola Italy St Marks",
  milan: "Milan Duomo cathedral Italy fashion",
  naples: "Naples Italy bay Vesuvius coast",
  porto: "Porto Ribeira Dom Luis Bridge Portugal",
  seville: "Seville Alcazar cathedral Flamenco Spain",
  granada: "Granada Alhambra palace Spain Moorish",
  valencia: "Valencia Spain City of Arts and Sciences beach",
  marrakech: "Marrakech medina Djemaa el-Fna Morocco",
  casablanca: "Casablanca Morocco Hassan II Mosque coast",
  nairobi: "Nairobi Kenya Africa savanna wildlife",
  lagos: "Lagos Nigeria skyline Atlantic coast",
  maldives: "Maldives overwater bungalow turquoise lagoon",
  phuket: "Phuket Thailand beach limestone cliffs",
  "chiang mai": "Chiang Mai Thailand temples mountains old city",
  "ho chi minh city": "Ho Chi Minh City Vietnam Notre Dame Saigon",
  hanoi: "Hanoi Vietnam old quarter Hoan Kiem lake",
  manila: "Manila Philippines bay Intramuros",
  jakarta: "Jakarta Indonesia skyline Monas tower",
  "kuala lumpur": "Kuala Lumpur Malaysia Petronas Twin Towers",
  "george town": "George Town Penang Malaysia street art heritage",
  queenstown: "Queenstown New Zealand mountains lake adventure",
  auckland: "Auckland New Zealand Sky Tower harbor",
  wellington: "Wellington New Zealand harbor capital",
  reykjavik: "Reykjavik Iceland Northern Lights aurora",
  doha: "Doha Qatar skyline corniche",
  "tel aviv": "Tel Aviv Israel beach Bauhaus skyline",
  jerusalem: "Jerusalem Israel old city Dome of the Rock",
};

const FALLBACK_QUERY_SUFFIX = "landmark famous iconic";

/** In-memory dedup so concurrent first-mount calls share one request. */
const inflight = new Map<string, Promise<string>>();

function cacheKey(city: string, country: string): string {
  const norm = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  return `cityimg_${norm(city)}_${norm(country)}`;
}

function readCache(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeCache(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Quota exceeded or storage disabled — silently ignore.
  }
}

function buildQuery(cityName: string, countryName: string): string {
  const city = (cityName || "").trim();
  const country = (countryName || "").trim();
  const curated = CURATED_QUERIES[city.toLowerCase()];
  if (curated) return curated;
  return [city, country, FALLBACK_QUERY_SUFFIX].filter(Boolean).join(" ").trim();
}

async function fetchFromUnsplash(query: string): Promise<string> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return CITY_IMAGE_FALLBACK_URL;

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", "1");
  url.searchParams.set("content_filter", "high");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` },
  });

  if (!res.ok) return CITY_IMAGE_FALLBACK_URL;

  const data = (await res.json()) as {
    results?: Array<{ urls?: { regular?: string } }>;
  };
  const photoUrl = data.results?.[0]?.urls?.regular;
  return photoUrl || CITY_IMAGE_FALLBACK_URL;
}

export async function getCityImage(
  cityName: string,
  countryName: string,
): Promise<string> {
  const city = cityName?.trim() || "travel";
  const country = countryName?.trim() || "destination";
  const key = cacheKey(city, country);

  const cached = readCache(key);
  if (cached) return cached;

  const existing = inflight.get(key);
  if (existing) return existing;

  const query = buildQuery(city, country);

  const promise = fetchFromUnsplash(query)
    .then((url) => {
      writeCache(key, url);
      return url;
    })
    .catch(() => {
      writeCache(key, CITY_IMAGE_FALLBACK_URL);
      return CITY_IMAGE_FALLBACK_URL;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

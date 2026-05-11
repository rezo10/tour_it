import { countryNameFromCc } from "@/lib/geo/countryName";

/**
 * Popular cities used by the Planner and Utility modules.
 * Matches OpenWeather's `q=city,cc` lookup format. Sorted alphabetically by
 * country, then by city.
 */

export type PopularCity = {
  city: string;
  /** English country name (used in PlaceCoverImage and display). */
  country: string;
  /** ISO 3166-1 alpha-2 code. */
  cc: string;
};

function sortPlaces(a: PopularCity, b: PopularCity): number {
  const c = a.country.localeCompare(b.country, "en");
  if (c !== 0) return c;
  return a.city.localeCompare(b.city, "en");
}

const RAW: PopularCity[] = [
  // Türkiye / Turkey
  { city: "Istanbul", country: "Turkey", cc: "TR" },
  { city: "Ankara", country: "Turkey", cc: "TR" },
  { city: "Izmir", country: "Turkey", cc: "TR" },
  { city: "Antalya", country: "Turkey", cc: "TR" },
  { city: "Bodrum", country: "Turkey", cc: "TR" },
  { city: "Cappadocia", country: "Turkey", cc: "TR" },
  { city: "Bursa", country: "Turkey", cc: "TR" },
  { city: "Trabzon", country: "Turkey", cc: "TR" },
  // Europe
  { city: "London", country: "United Kingdom", cc: "GB" },
  { city: "Edinburgh", country: "United Kingdom", cc: "GB" },
  { city: "Manchester", country: "United Kingdom", cc: "GB" },
  { city: "Paris", country: "France", cc: "FR" },
  { city: "Lyon", country: "France", cc: "FR" },
  { city: "Nice", country: "France", cc: "FR" },
  { city: "Berlin", country: "Germany", cc: "DE" },
  { city: "Munich", country: "Germany", cc: "DE" },
  { city: "Hamburg", country: "Germany", cc: "DE" },
  { city: "Frankfurt", country: "Germany", cc: "DE" },
  { city: "Cologne", country: "Germany", cc: "DE" },
  { city: "Rome", country: "Italy", cc: "IT" },
  { city: "Milan", country: "Italy", cc: "IT" },
  { city: "Florence", country: "Italy", cc: "IT" },
  { city: "Venice", country: "Italy", cc: "IT" },
  { city: "Naples", country: "Italy", cc: "IT" },
  { city: "Madrid", country: "Spain", cc: "ES" },
  { city: "Barcelona", country: "Spain", cc: "ES" },
  { city: "Seville", country: "Spain", cc: "ES" },
  { city: "Valencia", country: "Spain", cc: "ES" },
  { city: "Lisbon", country: "Portugal", cc: "PT" },
  { city: "Porto", country: "Portugal", cc: "PT" },
  { city: "Amsterdam", country: "Netherlands", cc: "NL" },
  { city: "Rotterdam", country: "Netherlands", cc: "NL" },
  { city: "Brussels", country: "Belgium", cc: "BE" },
  { city: "Zurich", country: "Switzerland", cc: "CH" },
  { city: "Geneva", country: "Switzerland", cc: "CH" },
  { city: "Vienna", country: "Austria", cc: "AT" },
  { city: "Salzburg", country: "Austria", cc: "AT" },
  { city: "Athens", country: "Greece", cc: "GR" },
  { city: "Santorini", country: "Greece", cc: "GR" },
  { city: "Warsaw", country: "Poland", cc: "PL" },
  { city: "Krakow", country: "Poland", cc: "PL" },
  { city: "Prague", country: "Czech Republic", cc: "CZ" },
  { city: "Budapest", country: "Hungary", cc: "HU" },
  { city: "Stockholm", country: "Sweden", cc: "SE" },
  { city: "Oslo", country: "Norway", cc: "NO" },
  { city: "Copenhagen", country: "Denmark", cc: "DK" },
  { city: "Helsinki", country: "Finland", cc: "FI" },
  { city: "Dublin", country: "Ireland", cc: "IE" },
  { city: "Reykjavik", country: "Iceland", cc: "IS" },
  { city: "Moscow", country: "Russia", cc: "RU" },
  { city: "Saint Petersburg", country: "Russia", cc: "RU" },
  { city: "Kyiv", country: "Ukraine", cc: "UA" },
  { city: "Dubrovnik", country: "Croatia", cc: "HR" },
  { city: "Ljubljana", country: "Slovenia", cc: "SI" },
  { city: "Belgrade", country: "Serbia", cc: "RS" },
  { city: "Bucharest", country: "Romania", cc: "RO" },
  { city: "Sofia", country: "Bulgaria", cc: "BG" },
  // North America
  { city: "New York", country: "United States", cc: "US" },
  { city: "Los Angeles", country: "United States", cc: "US" },
  { city: "Chicago", country: "United States", cc: "US" },
  { city: "Miami", country: "United States", cc: "US" },
  { city: "San Francisco", country: "United States", cc: "US" },
  { city: "Las Vegas", country: "United States", cc: "US" },
  { city: "Seattle", country: "United States", cc: "US" },
  { city: "Boston", country: "United States", cc: "US" },
  { city: "Washington", country: "United States", cc: "US" },
  { city: "Honolulu", country: "United States", cc: "US" },
  { city: "Toronto", country: "Canada", cc: "CA" },
  { city: "Vancouver", country: "Canada", cc: "CA" },
  { city: "Montreal", country: "Canada", cc: "CA" },
  { city: "Mexico City", country: "Mexico", cc: "MX" },
  { city: "Cancun", country: "Mexico", cc: "MX" },
  { city: "Guadalajara", country: "Mexico", cc: "MX" },
  { city: "Havana", country: "Cuba", cc: "CU" },
  // Latin America
  { city: "Sao Paulo", country: "Brazil", cc: "BR" },
  { city: "Rio de Janeiro", country: "Brazil", cc: "BR" },
  { city: "Buenos Aires", country: "Argentina", cc: "AR" },
  { city: "Lima", country: "Peru", cc: "PE" },
  { city: "Cusco", country: "Peru", cc: "PE" },
  { city: "Santiago", country: "Chile", cc: "CL" },
  { city: "Bogota", country: "Colombia", cc: "CO" },
  { city: "Cartagena", country: "Colombia", cc: "CO" },
  // Middle East & Africa
  { city: "Dubai", country: "United Arab Emirates", cc: "AE" },
  { city: "Abu Dhabi", country: "United Arab Emirates", cc: "AE" },
  { city: "Doha", country: "Qatar", cc: "QA" },
  { city: "Tel Aviv", country: "Israel", cc: "IL" },
  { city: "Jerusalem", country: "Israel", cc: "IL" },
  { city: "Cairo", country: "Egypt", cc: "EG" },
  { city: "Marrakech", country: "Morocco", cc: "MA" },
  { city: "Casablanca", country: "Morocco", cc: "MA" },
  { city: "Cape Town", country: "South Africa", cc: "ZA" },
  { city: "Johannesburg", country: "South Africa", cc: "ZA" },
  { city: "Nairobi", country: "Kenya", cc: "KE" },
  { city: "Lagos", country: "Nigeria", cc: "NG" },
  // Asia
  { city: "Tokyo", country: "Japan", cc: "JP" },
  { city: "Kyoto", country: "Japan", cc: "JP" },
  { city: "Osaka", country: "Japan", cc: "JP" },
  { city: "Seoul", country: "South Korea", cc: "KR" },
  { city: "Busan", country: "South Korea", cc: "KR" },
  { city: "Beijing", country: "China", cc: "CN" },
  { city: "Shanghai", country: "China", cc: "CN" },
  { city: "Hong Kong", country: "Hong Kong", cc: "HK" },
  { city: "Taipei", country: "Taiwan", cc: "TW" },
  { city: "Singapore", country: "Singapore", cc: "SG" },
  { city: "Bangkok", country: "Thailand", cc: "TH" },
  { city: "Phuket", country: "Thailand", cc: "TH" },
  { city: "Chiang Mai", country: "Thailand", cc: "TH" },
  { city: "Ho Chi Minh City", country: "Vietnam", cc: "VN" },
  { city: "Hanoi", country: "Vietnam", cc: "VN" },
  { city: "Manila", country: "Philippines", cc: "PH" },
  { city: "Jakarta", country: "Indonesia", cc: "ID" },
  { city: "Bali", country: "Indonesia", cc: "ID" },
  { city: "Kuala Lumpur", country: "Malaysia", cc: "MY" },
  { city: "George Town", country: "Malaysia", cc: "MY" },
  { city: "Mumbai", country: "India", cc: "IN" },
  { city: "Delhi", country: "India", cc: "IN" },
  { city: "Jaipur", country: "India", cc: "IN" },
  { city: "Goa", country: "India", cc: "IN" },
  { city: "Kathmandu", country: "Nepal", cc: "NP" },
  // Oceania
  { city: "Sydney", country: "Australia", cc: "AU" },
  { city: "Melbourne", country: "Australia", cc: "AU" },
  { city: "Brisbane", country: "Australia", cc: "AU" },
  { city: "Perth", country: "Australia", cc: "AU" },
  { city: "Auckland", country: "New Zealand", cc: "NZ" },
  { city: "Wellington", country: "New Zealand", cc: "NZ" },
];

export const popularCities: PopularCity[] = [...RAW].sort(sortPlaces);

/** Format: `Istanbul|TR` — uniquely identifies a city. */
export function placeKey(p: PopularCity): string {
  return `${p.city}|${p.cc}`;
}

export function parsePlaceKey(key: string): PopularCity | null {
  const i = key.lastIndexOf("|");
  if (i <= 0) return null;
  const city = key.slice(0, i).trim();
  const cc = key.slice(i + 1).trim().toUpperCase();
  if (!city || cc.length !== 2) return null;
  return (
    popularCities.find((p) => p.city === city && p.cc === cc) ?? {
      city,
      country: countryNameFromCc(cc, "en"),
      cc,
    }
  );
}

/** Group cities by country (useful for select optgroups). */
export function citiesByCountry(): Map<string, PopularCity[]> {
  const m = new Map<string, PopularCity[]>();
  for (const p of popularCities) {
    const list = m.get(p.country) ?? [];
    list.push(p);
    m.set(p.country, list);
  }
  return m;
}

/**
 * Canonical TypeScript shape of a planner itinerary. Mirrors the Zod
 * schema in lib/itinerary/schema.ts and is the contract shared by the
 * Gemini API route, the workspace UI, and the persistence layer.
 */

/** One stop on a single day (ordered, with geo coords for the map). */
export type PlaceActivity = {
  order: number;
  name: string;
  description: string;
  duration: string;
  category: string;
  lat: number;
  lng: number;
};

/** A single day's title + the ordered list of activities. */
export type DayPlan = {
  day: number;
  title: string;
  activities: PlaceActivity[];
};

/** Full trip — destination metadata + day-by-day plan. */
export type ItineraryPlan = {
  title: string;
  country: string;
  city: string;
  tripType: string;
  days: DayPlan[];
};

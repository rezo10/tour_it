/** Structured itinerary shape for UI + future Gemini JSON parsing */

export type PlaceActivity = {
  order: number;
  name: string;
  description: string;
  duration: string;
  category: string;
  lat: number;
  lng: number;
};

export type DayPlan = {
  day: number;
  title: string;
  activities: PlaceActivity[];
};

export type ItineraryPlan = {
  title: string;
  country: string;
  city: string;
  tripType: string;
  days: DayPlan[];
};

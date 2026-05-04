import { z } from "zod";

/** Validates Gemini (and any) JSON against our UI itinerary shape */
export const placeActivitySchema = z.object({
  order: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  duration: z.string(),
  category: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const dayPlanSchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  activities: z.array(placeActivitySchema).min(1),
});

export const itineraryPlanSchema = z.object({
  title: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  tripType: z.string().min(1),
  days: z.array(dayPlanSchema).min(1),
});

export type ParsedItineraryPlan = z.infer<typeof itineraryPlanSchema>;

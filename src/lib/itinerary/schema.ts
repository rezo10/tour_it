/**
 * Zod schema describing the exact shape an itinerary must have before the
 * UI is allowed to render it. Used to validate Gemini's JSON output (and
 * any future generator) so a malformed response never reaches the client.
 */
import { z } from "zod";

// One stop within a day: ordered, named, geo-located.
export const placeActivitySchema = z.object({
  order: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  duration: z.string(),
  category: z.string(),
  lat: z.number(),
  lng: z.number(),
});

// One day = a title plus at least one activity, indexed by day number.
export const dayPlanSchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  activities: z.array(placeActivitySchema).min(1),
});

// Full trip: destination metadata + the ordered list of days.
export const itineraryPlanSchema = z.object({
  title: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  tripType: z.string().min(1),
  days: z.array(dayPlanSchema).min(1),
});

export type ParsedItineraryPlan = z.infer<typeof itineraryPlanSchema>;

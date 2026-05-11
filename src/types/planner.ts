import type { ItineraryPlan } from "@/types/itinerary";

/** Serialisable planner UI state, used to persist drafts in Supabase. */
export type PlannerDraftState = {
  country: string;
  city: string;
  tripType: string;
  days: number;
  walking: number;
  nightlife: number;
  audience: "any" | "family" | "solo";
  environment: "mixed" | "indoor" | "outdoor";
  showResult: boolean;
  /** Present after a generation succeeds. */
  itinerary: ItineraryPlan | null;
};

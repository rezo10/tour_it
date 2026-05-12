/**
 * Shape of the planner workspace UI state that can be serialised and
 * stored as a draft (per-user) in the `planner_drafts` Supabase table.
 */
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

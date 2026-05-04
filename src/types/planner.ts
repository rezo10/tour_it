import type { ItineraryPlan } from "@/types/itinerary";

/** Serializable planner UI state for Supabase `planner_drafts.state` */
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
  /** Present after user runs generate when we have mock/demo data */
  itinerary: ItineraryPlan | null;
};

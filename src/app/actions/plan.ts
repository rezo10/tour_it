"use server";

import { createClient } from "@/lib/supabase/server";
import type { ItineraryPlan } from "@/types/itinerary";

export type PlanPreferences = {
  walking: number;
  nightlife: number;
  audience: string;
  environment: string;
};

export async function savePlanToDatabase(
  plan: ItineraryPlan,
  preferences: PlanPreferences,
  isPublic: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "You need to sign in to save a plan." as const,
    };
  }

  const { data: planRow, error: pe } = await supabase
    .from("plans")
    .insert({
      user_id: user.id,
      title: plan.title,
      country: plan.country,
      city: plan.city,
      trip_type: plan.tripType,
      preferences: {
        ...preferences,
        day_count: plan.days.length,
        source: "planner",
      },
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (pe || !planRow) {
    return {
      error:
        "We couldn't save your plan. Please try again — if the problem persists, refresh the page and re-generate.",
    };
  }

  const planId = planRow.id as string;

  for (const day of plan.days) {
    const { data: dayRow, error: de } = await supabase
      .from("plan_days")
      .insert({
        plan_id: planId,
        day_number: day.day,
        title: day.title,
      })
      .select("id")
      .single();

    if (de || !dayRow) {
      return {
        error: "We couldn't save one of the days. Please try again.",
      };
    }

    const dayId = dayRow.id as string;

    const items = day.activities.map((a) => ({
      plan_day_id: dayId,
      order_index: a.order,
      name: a.name,
      description: a.description,
      duration: a.duration,
      category: a.category,
      lat: a.lat,
      lng: a.lng,
    }));

    const { error: ie } = await supabase.from("plan_items").insert(items);
    if (ie) {
      return {
        error:
          "We couldn't save one of the activities. Please try saving again.",
      };
    }
  }

  return { success: true as const, planId };
}

export async function togglePlanVisibility(planId: string, isPublic: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You need to sign in to change visibility." as const };
  }

  const { error } = await supabase
    .from("plans")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) {
    return {
      error:
        "We couldn't update the visibility right now. Please try again." as const,
    };
  }
  return { success: true as const };
}

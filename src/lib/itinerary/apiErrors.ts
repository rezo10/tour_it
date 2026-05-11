/**
 * Maps internal API responses from /api/itinerary to short, user-facing
 * messages. Technical errors and stack traces are filtered out.
 */

export function friendlyPlanGenerateError(
  status: number,
  payload: { error?: string; code?: string },
): string {
  const raw = typeof payload.error === "string" ? payload.error.trim() : "";
  const looksTechnical =
    raw.length > 280 ||
    /GoogleGenerativeAI|generativelanguage\.googleapis|v1beta|Error fetching|stack|JSON\.parse/i.test(
      raw,
    );

  if (raw && !looksTechnical) {
    return raw;
  }

  if (status === 401) {
    return "You need to sign in before generating an itinerary.";
  }
  if (status === 429 || payload.code === "GEMINI_QUOTA") {
    return "We're getting a lot of requests right now. Please try again in a few minutes.";
  }
  if (status === 400) {
    return "Please pick a country, city and trip type before generating.";
  }
  if (status === 422) {
    return "The itinerary didn't come back correctly. Try regenerating.";
  }
  if (status === 500) {
    return "The AI service is not configured on the server. Please contact the maintainer.";
  }
  if (status === 502 || status === 503) {
    return "The AI service didn't respond. Check your connection and try again.";
  }

  return "Something went wrong. Please refresh and try again.";
}

export function friendlyNetworkError(): string {
  return "No connection to the server. Check your network and try again.";
}

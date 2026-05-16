/** Discrete values for walking / nightlife preference sliders. */
export const PREFERENCE_SLIDER_STEPS = [0, 25, 50, 75, 100] as const;

export function snapPreferenceSlider(value: number): number {
  const v = Math.min(100, Math.max(0, Math.round(value)));
  return PREFERENCE_SLIDER_STEPS.reduce((best, step) =>
    Math.abs(step - v) < Math.abs(best - v) ? step : best,
  );
}

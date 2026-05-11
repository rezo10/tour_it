/** Home hero: month-based "now / next" destination suggestions (static rules). */

export type SeasonPick = {
  city: string;
  country: string;
  /** Short reason shown under the destination */
  why: string;
};

export type SeasonalRails = {
  /** e.g. "May 2026" */
  periodLabel: string;
  leftTitle: string;
  leftSubtitle: string;
  left: [SeasonPick, SeasonPick];
  rightTitle: string;
  rightSubtitle: string;
  right: [SeasonPick, SeasonPick];
};

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Ay indeksi 0–11 için sol = bu ay, sağ = bir sonraki ay ön izleme */
const ROTATION: Array<{
  left: [SeasonPick, SeasonPick];
  right: [SeasonPick, SeasonPick];
}> = [
  {
    left: [
      { city: "Dubai", country: "United Arab Emirates", why: "Mild winter sunshine" },
      { city: "Lisbon", country: "Portugal", why: "Pre-festival calm on the coast" },
    ],
    right: [
      { city: "Bangkok", country: "Thailand", why: "Start of the dry season" },
      { city: "Cusco", country: "Peru", why: "Clear views after the rains" },
    ],
  },
  {
    left: [
      { city: "Bangkok", country: "Thailand", why: "Comfortable temperatures" },
      { city: "Tokyo", country: "Japan", why: "Quiet city before the blossoms" },
    ],
    right: [
      { city: "Lima", country: "Peru", why: "Gastronomy and autumn light" },
      { city: "Rome", country: "Italy", why: "Early spring before the crowds" },
    ],
  },
  {
    left: [
      { city: "Lisbon", country: "Portugal", why: "Early-spring sun and blossoms" },
      { city: "Kyoto", country: "Japan", why: "Just before cherry-blossom peak" },
    ],
    right: [
      { city: "Istanbul", country: "Turkey", why: "Tulip season and terrace cafes" },
      { city: "Amsterdam", country: "Netherlands", why: "Tulip fields at their best" },
    ],
  },
  {
    left: [
      { city: "Istanbul", country: "Turkey", why: "Spring walks along the Bosphorus" },
      { city: "Rome", country: "Italy", why: "Long, mild evenings outdoors" },
    ],
    right: [
      { city: "Lisbon", country: "Portugal", why: "Long days, little wind" },
      { city: "Athens", country: "Greece", why: "Early season before the islands fill up" },
    ],
  },
  {
    left: [
      { city: "Lisbon", country: "Portugal", why: "Pre-summer calm" },
      { city: "Copenhagen", country: "Denmark", why: "Long evenings by the canals" },
    ],
    right: [
      { city: "Barcelona", country: "Spain", why: "Seaside city festivals" },
      { city: "Porto", country: "Portugal", why: "Vineyards waking up" },
    ],
  },
  {
    left: [
      { city: "Copenhagen", country: "Denmark", why: "Long days and cycling" },
      { city: "Kyoto", country: "Japan", why: "Lush greenery between rains" },
    ],
    right: [
      { city: "Florence", country: "Italy", why: "Cool evenings and art" },
      { city: "Lima", country: "Peru", why: "Coastal mist makes for great photos" },
    ],
  },
  {
    left: [
      { city: "Florence", country: "Italy", why: "Open-air concerts" },
      { city: "Porto", country: "Portugal", why: "Sunny Douro valley days" },
    ],
    right: [
      { city: "Cusco", country: "Peru", why: "Dry-season trekking weather" },
      { city: "Kyoto", country: "Japan", why: "Gion summer festival atmosphere" },
    ],
  },
  {
    left: [
      { city: "Kyoto", country: "Japan", why: "Matsuri season and lively evenings" },
      { city: "Lima", country: "Peru", why: "The coastal fog starts lifting" },
    ],
    right: [
      { city: "Lisbon", country: "Portugal", why: "Atlantic breeze keeps it pleasant" },
      { city: "Copenhagen", country: "Denmark", why: "Open-water swimming season" },
    ],
  },
  {
    left: [
      { city: "Lisbon", country: "Portugal", why: "Late-summer evenings" },
      { city: "Rome", country: "Italy", why: "September calm in the city" },
    ],
    right: [
      { city: "Kyoto", country: "Japan", why: "Pre-autumn colour tour" },
      { city: "Tokyo", country: "Japan", why: "Design and tech expos" },
    ],
  },
  {
    left: [
      { city: "Kyoto", country: "Japan", why: "Start of the koyo (autumn) season" },
      { city: "Florence", country: "Italy", why: "Harvest in the surrounding hills" },
    ],
    right: [
      { city: "Lisbon", country: "Portugal", why: "Still warm enough to swim" },
      { city: "Porto", country: "Portugal", why: "Harvest views over the river" },
    ],
  },
  {
    left: [
      { city: "Kyoto", country: "Japan", why: "Temples wrapped in red and orange" },
      { city: "Lisbon", country: "Portugal", why: "Late sun and fado nights" },
    ],
    right: [
      { city: "Rome", country: "Italy", why: "Fewer crowds, pleasant weather" },
      { city: "Copenhagen", country: "Denmark", why: "Hygge and Christmas lights" },
    ],
  },
  {
    left: [
      { city: "Lisbon", country: "Portugal", why: "Christmas lights along the Tagus" },
      { city: "Copenhagen", country: "Denmark", why: "Winter Christmas markets" },
    ],
    right: [
      { city: "Tokyo", country: "Japan", why: "Illumination season citywide" },
      { city: "Dubai", country: "United Arab Emirates", why: "Quick winter sunshine escape" },
    ],
  },
];

export function getSeasonalRails(now: Date): SeasonalRails {
  const m = now.getMonth();
  const y = now.getFullYear();
  const label = `${MONTHS_EN[m]} ${y}`;
  const nextM = (m + 1) % 12;
  const nextY = nextM === 0 ? y + 1 : y;
  const nextLabel = `${MONTHS_EN[nextM]} ${nextY}`;

  const row = ROTATION[m] ?? ROTATION[0];

  return {
    periodLabel: label,
    leftTitle: "In season now",
    leftSubtitle: `Top picks for ${label}`,
    left: row.left,
    rightTitle: "Coming up",
    rightSubtitle: `Early notes for ${nextLabel}`,
    right: row.right,
  };
}

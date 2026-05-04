import type { ItineraryPlan } from "@/types/itinerary";

export const mockItineraryLisbon: ItineraryPlan = {
  title: "Lisbon Cultural Discovery",
  country: "Portugal",
  city: "Lisbon",
  tripType: "Cultural",
  days: [
    {
      day: 1,
      title: "Historic center & viewpoints",
      activities: [
        {
          order: 1,
          name: "Alfama district",
          description:
            "Walk narrow lanes, azulejo facades, and feel the oldest quarter of the city.",
          duration: "2 h",
          category: "Neighborhood",
          lat: 38.7127,
          lng: -9.1303,
        },
        {
          order: 2,
          name: "São Jorge Castle",
          description:
            "Panoramic views over the Tagus and a concise look at Lisbon’s defensive history.",
          duration: "1.5 h",
          category: "Heritage",
          lat: 38.7139,
          lng: -9.1334,
        },
        {
          order: 3,
          name: "Miradouro da Senhora do Monte",
          description:
            "Sunset viewpoint; relaxed pacing after the castle climb.",
          duration: "45 min",
          category: "Viewpoint",
          lat: 38.7192,
          lng: -9.1326,
        },
      ],
    },
    {
      day: 2,
      title: "Belém & riverside",
      activities: [
        {
          order: 1,
          name: "Jerónimos Monastery",
          description:
            "UNESCO site; late Gothic architecture and maritime heritage context.",
          duration: "1.5 h",
          category: "Heritage",
          lat: 38.6979,
          lng: -9.2067,
        },
        {
          order: 2,
          name: "Belém Tower",
          description:
            "Iconic riverside fortification; short exterior-focused visit.",
          duration: "45 min",
          category: "Landmark",
          lat: 38.6916,
          lng: -9.2159,
        },
        {
          order: 3,
          name: "Pastéis de Belém",
          description:
            "Tasting stop at the historic custard tart bakery (no full meal focus).",
          duration: "30 min",
          category: "Local experience",
          lat: 38.6973,
          lng: -9.2035,
        },
      ],
    },
  ],
};

export type ExplorePlanCard = {
  id: string;
  title: string;
  country: string;
  city: string;
  tripType: string;
  days: number;
  description: string;
  creator: string;
  coverGradient: string;
};

export const mockExplorePlans: ExplorePlanCard[] = [
  {
    id: "1",
    title: "Kyoto quiet temples",
    country: "Japan",
    city: "Kyoto",
    tripType: "Relaxing",
    days: 5,
    description: "Temple gardens, tea houses, and slow neighborhood walks.",
    creator: "alex_wanders",
    coverGradient: "from-accent-200 via-coral-100 to-cream-50",
  },
  {
    id: "2",
    title: "Andean highlands loop",
    country: "Peru",
    city: "Cusco",
    tripType: "Adventure",
    days: 7,
    description: "Altitude-aware pacing with cultural stops between hikes.",
    creator: "maria.trails",
    coverGradient: "from-amber-100 via-orange-50 to-coral-100",
  },
  {
    id: "3",
    title: "Copenhagen design week",
    country: "Denmark",
    city: "Copenhagen",
    tripType: "Cultural",
    days: 4,
    description: "Museums, waterfront promenades, and Nordic everyday design.",
    creator: "studio.north",
    coverGradient: "from-cyan-100 via-blue-50 to-slate-100",
  },
];

export type CommunityPost = {
  id: string;
  author: string;
  timeAgo: string;
  excerpt: string;
  likes: number;
  comments: number;
};

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "1",
    author: "sam.fields",
    timeAgo: "2h ago",
    excerpt:
      "Finally tried slow travel in Porto — fewer stops, more time in miradouros. The Plan module’s day order really helped.",
    likes: 24,
    comments: 5,
  },
  {
    id: "2",
    author: "travel_notes",
    timeAgo: "1d ago",
    excerpt:
      "Shared my Lisbon plan publicly. Happy if it helps anyone visiting Belém on a tight afternoon.",
    likes: 51,
    comments: 12,
  },
];

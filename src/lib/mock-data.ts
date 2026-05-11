/**
 * Shared UI types used across the Community and Explore modules.
 * No example/test data is exported from this file — all content shown to
 * users is loaded from Supabase at runtime.
 */

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

export type CommunityPost = {
  id: string;
  author: string;
  timeAgo: string;
  excerpt: string;
  likes: number;
  comments: number;
};

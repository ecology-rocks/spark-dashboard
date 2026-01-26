// src/domains/feed-aggregator/types.ts
import type { Resource } from '@/core/types/domain';

export interface FeedAdapter {
  fetch: (url: string) => Promise<Partial<Resource>[]>;
  validateUrl: (url: string) => boolean;
}

// NEW: The rich definition of a subscription
export interface FeedSubscription {
  url: string;
  name?: string;      // User-defined alias
  isActive: boolean;  // Hide/Show without deleting
  addedAt: Date;
}

export interface PublicFeed {
  id: string;        // Firestore Doc ID
  url: string;
  description: string;
  sharedBy: string;  // Email of user
  sharedAt: any;     // Firestore Timestamp
  likes: number;
}
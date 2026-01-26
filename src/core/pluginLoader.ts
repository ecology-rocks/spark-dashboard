import type { SparkPlugin } from './types/plugin';
import QuickNotesPlugin from '@/domains/quick-notes';
import FeedAggregatorPlugin from '@/domains/feed-aggregator';

export const activePlugins: SparkPlugin[] = [
  QuickNotesPlugin,
  FeedAggregatorPlugin,
];

export function getRoutes() {
  return activePlugins.flatMap(p => p.routes);
}
import type { SparkPlugin } from './types/plugin'
import AreasPlugin from '@/domains/areas-of-interest'
import FeedAggregatorPlugin from '@/domains/feed-aggregator'
import ActionCenterPlugin from '@/domains/action-center'
import WriterPlugin from '@/domains/writer'
import CampaignsPlugin from '@/domains/campaigns'
import SocialPlugin from '@/domains/social-monitor'
import AnalyticsPlugin from '@/domains/analytics'

export const activePlugins: SparkPlugin[] = [
  AreasPlugin,
  FeedAggregatorPlugin,
  SocialPlugin,
  ActionCenterPlugin,
  WriterPlugin,
  CampaignsPlugin,
  AnalyticsPlugin,
]

export function getRoutes() {
  return activePlugins.flatMap((p) => {
    return p.routes.map((route) => ({
      ...route,
      // Ensure the router config always treats these as root-level paths
      path: route.path.startsWith('/') ? route.path : `/${route.path}`,
    }))
  })
}

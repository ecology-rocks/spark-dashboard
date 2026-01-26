import type { SparkPlugin } from '@/core/types/plugin';
import FeedWidget from './components/FeedWidget.vue';
import RssMain from './views/RssMain.vue';

const FeedAggregatorPlugin: SparkPlugin = {
  manifest: {
    id: 'feed-aggregator',
    name: 'News Wire',
    description: 'Multi-source intelligence streams',
    icon: 'rss_feed' // Material icon name
  },
  components: {
    dashboardWidget: FeedWidget,
    mainView: RssMain,
  },
  routes: [
    {
      path: 'feeds',
      name: 'feeds-main',
      component: RssMain,
    },
  ],
};

export default FeedAggregatorPlugin;
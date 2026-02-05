import type { SparkPlugin } from '@/core/types/plugin'
import SearchWidget from './components/SearchWidget.vue'
import AnalyticsMain from './views/AnalyticsMain.vue' // <--- Import the new view

export const AnalyticsPlugin: SparkPlugin = {
  manifest: {
    id: 'analytics',
    name: 'Site Metrics',
    description: 'Google Search Console Data',
    icon: 'analytics', // Material Icon
  },
  components: {
    dashboardWidget: SearchWidget,
    mainView: AnalyticsMain, // <--- Hook it up here
  },
  routes: [
    {
      path: 'analytics',
      name: 'analytics-main',
      component: AnalyticsMain,
    },
  ],
}

export default AnalyticsPlugin

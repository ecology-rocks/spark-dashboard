import type { SparkPlugin } from '@/core/types/plugin'
import ViewAllCampaigns from './views/ViewAllCampaigns.vue'
import ViewSingleCampaign from './views/ViewSingleCampaign.vue'
// We'll create this widget later for the DashboardHome integration
import CampaignsWidget from './components/CampaignsWidget.vue'

const CampaignsPlugin: SparkPlugin = {
  manifest: {
    id: 'campaigns',
    name: 'Campaigns',
    icon: '📣', // or '📣' if using emojis
    description: 'Track project goals, dates, and cross-plugin links',
  },
  components: {
    mainView: ViewAllCampaigns,
    dashboardWidget: CampaignsWidget,
  },
  routes: [
    {
      path: 'campaigns',
      name: 'campaigns-all',
      component: ViewAllCampaigns,
    },
    {
      path: 'campaigns/:id',
      name: 'campaigns-single',
      component: ViewSingleCampaign,
    },
  ],
}

export default CampaignsPlugin

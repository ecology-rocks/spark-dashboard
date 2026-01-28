import type { SparkPlugin } from '@/core/types/plugin'
import ActionDashboard from './views/ActionDashboard.vue'

const ActionCenterPlugin: SparkPlugin = {
  manifest: {
    id: 'action-center',
    name: 'Action Center',
    icon: 'bolt', // Material Icon name
    description: 'Process your knowledge queue.',
  },
  components: {
    mainView: ActionDashboard,
  },
  routes: [
    {
      path: '/actions',
      name: 'action-center',
      component: ActionDashboard,
    },
  ],
}

export default ActionCenterPlugin

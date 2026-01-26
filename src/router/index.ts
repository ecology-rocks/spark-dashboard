import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/core/layouts/MainLayout.vue';
import DashboardHome from '@/core/views/DashboardHome.vue';
import LoginView from '@/core/views/LoginView.vue'; // <--- IMPORT THIS
import { getRoutes } from '@/core/pluginLoader';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',      // <--- ADD THIS BLOCK
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '', 
          name: 'home',
          component: DashboardHome,
        },
        ...getRoutes() 
      ],
    },
  ],
});

export default router;
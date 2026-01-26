import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/core/services/firebase'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/core/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const authStore = useAuthStore();
authStore.init().then(() => {
  app.mount('#app')
});
<script setup lang="ts">
import { activePlugins } from '@/core/pluginLoader';
import { APP_CONFIG } from '@/config';
import { computed } from 'vue';

// Separate the Campaigns plugin from the others to control its layout
const campaignsPlugin = computed(() =>
    activePlugins.find(p => p.manifest.id === 'campaigns')
);

const otherPlugins = computed(() =>
    activePlugins.filter(p => p.manifest.id !== 'campaigns')
);
</script>

<template>
    <div class="dashboard-container">
        <h1>{{ APP_CONFIG.greeting }}</h1>

        <div v-if="campaignsPlugin?.components.dashboardWidget" class="full-width-section">
            <component :is="campaignsPlugin.components.dashboardWidget" />
        </div>

        <div class="widget-grid">
            <div v-for="plugin in otherPlugins" :key="plugin.manifest.id" class="widget-card">
                <component :is="plugin.components.dashboardWidget" v-if="plugin.components.dashboardWidget" />
                <div v-else class="empty-widget">
                    <h3>{{ plugin.manifest.name }}</h3>
                    <router-link :to="{ name: plugin.routes[0]?.name }" class="plugin-link">
                        Go to {{ plugin.manifest.name }} →
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.full-width-section {
    width: 100%;
    margin-bottom: 1.5rem;
    margin-top: 1rem;
}

.widget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.widget-card {
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 8px;
    background: white;
    min-height: 150px;
}
</style>
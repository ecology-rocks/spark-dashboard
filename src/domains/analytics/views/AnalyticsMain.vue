<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAnalyticsStore } from '../store'
import KpiCard from '../components/KpiCard.vue'
import SearchWidget from '../components/SearchWidget.vue'

const store = useAnalyticsStore()

onMounted(() => {
    store.init()
})

const historyClicks = computed(() => store.history.map(h => h.clicks))
const historyImp = computed(() => store.history.map(h => h.impressions))
const historyPos = computed(() => store.history.map(h => h.position))
</script>

<template>
    <div class="analytics-page">

        <header class="page-header">
            <div class="header-content">
                <h1 class="page-title">Search Performance</h1>
                <p class="page-subtitle">Organic traffic visibility for the last 30 days.</p>
            </div>

            <div class="controls">
                <div class="control-group">
                    <label>Property</label>
                    <select v-if="store.sites.length > 0" :value="store.currentSite"
                        @change="(e) => store.switchSite((e.target as HTMLSelectElement).value)">
                        <option v-for="site in store.sites" :key="site" :value="site">
                            {{ site.replace('https://', '').replace(/\/$/, '') }}
                        </option>
                    </select>
                </div>

                <button class="refresh-btn" @click="store.refreshAll()" :disabled="store.isLoading" title="Refresh">
                    <svg class="icon" :class="{ 'spinning': store.isLoading }" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </header>

        <div v-if="store.error" class="error-banner">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ store.error }}
        </div>

        <div class="dashboard-grid">

            <section class="kpi-grid">
                <KpiCard title="Total Clicks" :value="store.totals.clicks.toLocaleString()" :data="historyClicks"
                    color="blue">
                    <template #icon>
                        <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                    </template>
                </KpiCard>

                <KpiCard title="Total Impressions" :value="store.totals.impressions.toLocaleString()" :data="historyImp"
                    color="purple">
                    <template #icon>
                        <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </template>
                </KpiCard>

                <KpiCard title="Avg Position" :value="store.totals.position.toFixed(1)" :data="historyPos"
                    color="orange">
                    <template #icon>
                        <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                    </template>
                </KpiCard>
            </section>

            <section class="content-grid">
                <div class="main-widget">
                    <SearchWidget />
                </div>

                <div class="insights-card">
                    <h3>
                        <svg class="icon icon-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Insights
                    </h3>

                    <div class="insight-item">
                        <span class="insight-label">Top Performer</span>
                        <p class="insight-value">"{{ store.queries[0]?.keys[0] || 'N/A' }}"</p>
                        <p class="insight-sub">
                            Driving {{
                                store.totals.clicks > 0
                                    ? (((store.queries[0]?.clicks ?? 0) / store.totals.clicks) * 100).toFixed(0)
                            : 0
                            }}% of traffic.
                        </p>
                    </div>

                    <div class="divider"></div>

                    <div class="insight-item">
                        <span class="insight-label">Click Through Rate</span>
                        <p class="insight-value">{{ store.totals.ctr.toFixed(1) }}%</p>
                        <p class="insight-sub">Average across all queries</p>
                    </div>
                </div>
            </section>

        </div>
    </div>
</template>

<style scoped>
.analytics-page {
    padding: 1rem;
    max-width: 1400px;
    margin: 0 auto;
    font-family: 'Segoe UI', sans-serif;
}

/* Icons */
.icon {
    width: 20px;
    height: 20px;
}

.kpi-icon {
    width: 24px;
    height: 24px;
}

.icon-yellow {
    color: #facc15;
}

/* Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1rem;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
}

.page-subtitle {
    color: #64748b;
    margin: 0.25rem 0 0 0;
    font-size: 0.9rem;
}

.controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.control-group {
    background: white;
    border: 1px solid #e2e8f0;
    padding: 4px 8px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

.control-group label {
    font-size: 0.65rem;
    text-transform: uppercase;
    font-weight: bold;
    color: #94a3b8;
}

select {
    border: none;
    font-weight: 600;
    color: #334155;
    background: transparent;
    cursor: pointer;
    outline: none;
}

.refresh-btn {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
}

.refresh-btn:hover {
    background: #f8fafc;
    color: #2563eb;
}

/* Animations */
.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}

/* Grid Layouts */
.dashboard-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    align-items: start;
}

@media (max-width: 900px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}

.main-widget {
    height: 500px;
}

/* Insights Card (Dark Theme) */
.insights-card {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    color: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.insights-card h3 {
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
}

.insight-item {
    margin-bottom: 1rem;
}

.insight-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 0.25rem;
}

.insight-value {
    font-size: 1.5rem;
    font-weight: 300;
    margin: 0;
    color: white;
    word-break: break-word;
}

.insight-sub {
    font-size: 0.85rem;
    color: #cbd5e1;
    margin: 0.25rem 0 0 0;
}

.divider {
    height: 1px;
    background: #334155;
    margin: 1.5rem 0;
}

.error-banner {
    background: #fef2f2;
    border: 1px solid #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>
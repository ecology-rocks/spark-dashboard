<script setup lang="ts">
import { computed } from 'vue'
import { useAnalyticsStore } from '../store'

const store = useAnalyticsStore()

const maxClicks = computed(() => {
    if (!store.queries.length) return 1
    return Math.max(...store.queries.map(q => q.clicks))
})
</script>

<template>
    <div class="search-widget">
        <div class="widget-header">
            <div class="header-left">
                <h3 class="widget-title">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Top Keywords
                </h3>
            </div>

            <div class="header-controls">
                <select v-if="store.sites.length > 0" :value="store.currentSite"
                    @change="(e) => store.switchSite((e.target as HTMLSelectElement).value)" class="site-select">
                    <option v-for="site in store.sites" :key="site" :value="site">
                        {{ site.replace('https://', '').replace(/\/$/, '') }}
                    </option>
                </select>

                <button class="refresh-btn" @click="store.refreshAll()" :disabled="store.isLoading" title="Refresh">
                    <svg class="icon-sm" :class="{ 'spinning': store.isLoading }" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="col-query">Query</th>
                        <th class="col-clicks">Clicks</th>
                        <th class="col-ctr">CTR</th>
                        <th class="col-rank">Rank</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, idx) in store.queries.slice(0, 5)" :key="idx">
                        <td class="col-query cell-text" :title="row.keys[0]">
                            <div class="truncate-text">{{ row.keys[0] }}</div>
                        </td>

                        <td class="col-clicks">
                            <div class="bar-wrapper">
                                <span class="bar-label">{{ row.clicks }}</span>
                                <div class="bar-track">
                                    <div class="bar-fill" :style="{ width: `${(row.clicks / maxClicks) * 100}%` }">
                                    </div>
                                </div>
                            </div>
                        </td>

                        <td class="col-ctr cell-number">
                            {{ (row.ctr * 100).toFixed(1) }}%
                        </td>

                        <td class="col-rank">
                            <span class="rank-badge" :class="{
                                'top-3': row.position <= 3,
                                'top-10': row.position > 3 && row.position <= 10
                            }">
                                {{ row.position.toFixed(1) }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="!store.isLoading && store.queries.length === 0">
                        <td colspan="4" class="empty-state">No data available.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.search-widget {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

.widget-header {
    padding: 1rem 1.5rem;
    /* Removed grey background */
    background-color: white;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.widget-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #334155;
    margin: 0;
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.site-select {
    font-size: 0.85rem;
    padding: 4px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    color: #334155;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    max-width: 200px;
}

.site-select:hover {
    border-color: #cbd5e1;
}

.refresh-btn {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px;
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
}

.refresh-btn:hover {
    background: #f1f5f9;
    color: #2563eb;
}

.icon {
    width: 18px;
    height: 18px;
    color: #64748b;
}

.icon-sm {
    width: 16px;
    height: 16px;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}

.table-container {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    /* Key fix for horizontal scroll */
    table-layout: fixed;
}

thead {
    background: white;
    /* Removed grey background */
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 700;
    background: white;
    /* Ensure sticky header stays white */
}

td {
    padding: 0.6rem 1rem;
    border-bottom: 1px solid #f8fafc;
    color: #475569;
    vertical-align: middle;
}

tr:hover td {
    background-color: #f8fafc;
    /* Keep hover effect subtle */
}

/* Column Widths */
.col-query {
    width: 45%;
}

.col-clicks {
    width: 25%;
}

.col-ctr {
    text-align: right;
    width: 15%;
}

.col-rank {
    text-align: right;
    width: 15%;
}

/* Text Truncation Logic */
.truncate-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    display: block;
}

.cell-text {
    font-weight: 500;
    color: #334155;
}

.cell-number {
    font-family: monospace;
}

.bar-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.bar-label {
    font-size: 0.75rem;
    font-weight: bold;
}

.bar-track {
    width: 100%;
    height: 4px;
    background-color: #f1f5f9;
    border-radius: 2px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    background-color: #3b82f6;
    border-radius: 2px;
}

.rank-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    background-color: #f1f5f9;
    color: #64748b;
}

.rank-badge.top-3 {
    background-color: #d1fae5;
    color: #047857;
}

.rank-badge.top-10 {
    background-color: #eff6ff;
    color: #1d4ed8;
}

.empty-state {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-style: italic;
}
</style>
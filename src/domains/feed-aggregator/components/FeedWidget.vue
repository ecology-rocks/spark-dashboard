<script setup lang="ts">
import { computed } from 'vue';
import { useFeedStore } from '../store';

const store = useFeedStore();
const latestNews = computed(() => store.resources.slice(0, 3));
</script>

<template>
    <div class="feed-widget">
        <div class="header">
            <h3>📡 News Wire</h3>
            <span class="badge" v-if="store.resources.length">{{ store.resources.length }}</span>
        </div>

        <div v-if="store.isLoading">Checking feeds...</div>

        <ul v-else class="feed-list">
            <li v-for="item in latestNews" :key="item.id">
                <a :href="item.url" target="_blank">{{ item.title }}</a>
            </li>
            <li v-if="store.resources.length === 0" class="empty">No news fetched.</li>
        </ul>
    </div>
</template>

<style scoped>
.feed-widget {
    padding: 0.5rem;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.badge {
    background: #e74c3c;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
}

.feed-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.feed-list li {
    padding: 0.25rem 0;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.feed-list a {
    text-decoration: none;
    color: #444;
}

.feed-list a:hover {
    color: #3498db;
}

.empty {
    color: #999;
    font-style: italic;
}
</style>
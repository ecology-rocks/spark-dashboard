<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSocialStore } from '../store';

const store = useSocialStore();
const router = useRouter();

// If store is empty on load, fetch a default to make the widget useful immediately
onMounted(() => {
    if (store.posts.length === 0) {
        store.search('bioenergy');
    }
});

const latestPosts = computed(() => {
    return store.posts.slice(0, 4);
});

function openSocial() {
    router.push('/social');
}

function formatTime(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
</script>

<template>
    <div class="social-widget">
        <div class="header">
            <h3>🦋 Social Monitor</h3>
            <button class="link-btn" @click="openSocial">View Feed</button>
        </div>

        <div v-if="store.isLoading && store.posts.length === 0" class="loading">
            Scanning BlueSky...
        </div>

        <ul v-else class="post-list">
            <li v-for="post in latestPosts" :key="post.id" class="post-item" @click="openSocial">
                <img v-if="post.author.avatar" :src="post.author.avatar" class="avatar" />
                <div class="content">
                    <div class="post-meta">
                        <span class="handle">@{{ post.author.handle }}</span>
                        <span class="date">{{ formatTime(post.createdAt) }}</span>
                    </div>
                    <p class="text-snippet">{{ post.content }}</p>
                </div>
                <div v-if="post.image" class="mini-thumb">
                    <img :src="post.image" />
                </div>
            </li>
            <li v-if="store.posts.length === 0 && !store.isLoading" class="empty">
                No recent activity found.
            </li>
        </ul>
    </div>
</template>

<style scoped>
.social-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

h3 {
    margin: 0;
    font-size: 1rem;
    color: #2c3e50;
}

.link-btn {
    background: none;
    border: none;
    color: #0085ff;
    cursor: pointer;
    font-size: 0.85rem;
}

.link-btn:hover {
    text-decoration: underline;
}

.loading {
    padding: 1rem;
    color: #999;
    font-style: italic;
    font-size: 0.9rem;
}

.post-list {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    overflow-y: auto;
}

.post-item {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.1s;
}

.post-item:hover {
    background: #fcfcfc;
}

.post-item:last-child {
    border-bottom: none;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.content {
    flex: 1;
    min-width: 0;
    /* Required for text truncation flex child */
}

.post-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-bottom: 2px;
}

.handle {
    font-weight: 600;
    color: #444;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.date {
    color: #999;
    white-space: nowrap;
}

.text-snippet {
    margin: 0;
    font-size: 0.85rem;
    color: #555;
    line-height: 1.3;

    /* Truncate to 2 lines */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.mini-thumb {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f0f0f0;
}

.mini-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.empty {
    font-style: italic;
    color: #999;
    padding: 1rem;
    text-align: center;
}
</style>
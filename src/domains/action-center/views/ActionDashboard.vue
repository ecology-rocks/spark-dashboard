<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useItemsStore } from '@/core/stores/items'; // <--- UPDATED
import type { SavedItem, ActionStatus } from '@/core/types/items';
import ReaderModal from '@/core/components/ReaderModal.vue';

const store = useItemsStore();

onMounted(() => {
    store.fetchAll(); // <--- This function is now in itemsStore
});

const isViewModalOpen = ref(false);
const itemToView = ref<{ title: string; content: string } | null>(null);

const queues = computed(() => {
    const items = store.items; // <--- Access items from itemsStore
    return {
        analyze: items.filter(i => i.actionStatus === 'to_analyze'),
        write: items.filter(i => i.actionStatus === 'to_write'),
        share: items.filter(i => i.actionStatus === 'to_share'),
    };
});

function move(item: SavedItem, status: ActionStatus) {
    store.updateItemStatus(item.id, status);
}

function openLink(url?: string | null) {
    if (url) window.open(url, '_blank');
}

function openViewModal(item: SavedItem) {
    itemToView.value = {
        title: item.title,
        content: item.content || ''
    };
    isViewModalOpen.value = true;
}
</script>

<template>
    <div class="command-center">
        <header>
            <h1>⚡ Action Command Center</h1>
            <p>Triage and process your active knowledge queue.</p>
        </header>

        <div class="dashboard-grid">
            <section class="queue-col analyze-col">
                <div class="col-header">
                    <h3>🧐 To Analyze ({{ queues.analyze.length }})</h3>
                </div>
                <div class="list-container">
                    <div v-for="item in queues.analyze" :key="item.id" class="task-row">
                        <div class="task-main">
                            <span class="type-dot note"></span>
                            <span class="task-title" @click="openViewModal(item)">{{ item.title }}</span>
                        </div>
                        <div class="task-actions">
                            <button @click="openViewModal(item)">📄 View</button>
                            <button @click="move(item, 'to_write')" title="Promote to Write">➡️ Write</button>
                            <button @click="move(item, 'to_share')" title="Promote to Share">➡️ Share</button>
                            <button @click="move(item, 'reference')" class="done-btn" title="Archive">✅ Done</button>
                        </div>
                    </div>
                    <div v-if="queues.analyze.length === 0" class="empty-state">Nothing to analyze.</div>
                </div>
            </section>

            <section class="queue-col write-col">
                <div class="col-header">
                    <h3>✍️ To Write ({{ queues.write.length }})</h3>
                </div>
                <div class="list-container">
                    <div v-for="item in queues.write" :key="item.id" class="task-row">
                        <div class="task-main">
                            <span class="type-dot write"></span>
                            <span class="task-title" @click="openViewModal(item)">{{ item.title }}</span>
                        </div>
                        <div class="task-actions">
                            <button @click="openViewModal(item)">📄 View</button>
                            <button @click="move(item, 'to_share')" title="Promote to Share">➡️ Share</button>
                            <button @click="move(item, 'reference')" class="done-btn" title="Archive">✅ Done</button>
                        </div>
                    </div>
                    <div v-if="queues.write.length === 0" class="empty-state">Nothing in writing queue.</div>
                </div>
            </section>

            <section class="queue-col share-col">
                <div class="col-header">
                    <h3>📤 To Share ({{ queues.share.length }})</h3>
                </div>
                <div class="list-container">
                    <div v-for="item in queues.share" :key="item.id" class="task-row">
                        <div class="task-main">
                            <span class="type-dot share"></span>
                            <span class="task-title" @click="openViewModal(item)">{{ item.title }}</span>
                        </div>
                        <div class="task-actions">
                            <button @click="openViewModal(item)">📄 View</button>
                            <button @click="move(item, 'reference')" class="done-btn" title="Archive">✅ Sent</button>
                        </div>
                    </div>
                    <div v-if="queues.share.length === 0" class="empty-state">Nothing to share.</div>
                </div>
            </section>
        </div>

        <ReaderModal :is-open="isViewModalOpen" :title="itemToView?.title || ''" :content="itemToView?.content || ''"
            @close="isViewModalOpen = false" />
    </div>
</template>

<style scoped>
/* Reuse existing styles */
.command-center {
    padding: 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
}

header {
    margin-bottom: 2rem;
}

h1 {
    margin: 0;
    color: #2c3e50;
}

p {
    color: #666;
    margin-top: 0.5rem;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
}

.queue-col {
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    border: 1px solid #eee;
}

.col-header {
    padding: 1rem;
    border-bottom: 1px solid #ddd;
    background: white;
    border-radius: 8px 8px 0 0;
}

.col-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
}

.analyze-col .col-header {
    border-top: 4px solid #f1c40f;
}

.write-col .col-header {
    border-top: 4px solid #e67e22;
}

.share-col .col-header {
    border-top: 4px solid #3498db;
}

.list-container {
    padding: 0.5rem;
    overflow-y: auto;
    flex: 1;
}

.task-row {
    background: white;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: transform 0.1s;
}

.task-row:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.task-main {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.task-title {
    font-weight: 500;
    cursor: pointer;
    color: #2c3e50;
}

.task-title:hover {
    text-decoration: underline;
    color: #3498db;
}

.task-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    border-top: 1px solid #f0f0f0;
    padding-top: 0.5rem;
}

button {
    background: white;
    border: 1px solid #ddd;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    color: #555;
}

button:hover {
    background: #eee;
}

.done-btn {
    color: #27ae60;
    border-color: #abebc6;
}

.done-btn:hover {
    background: #eafaf1;
}

.type-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    background: #ccc;
}

.empty-state {
    text-align: center;
    color: #999;
    padding: 2rem;
    font-style: italic;
    font-size: 0.9rem;
}
</style>
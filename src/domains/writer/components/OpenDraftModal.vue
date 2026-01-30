<script setup lang="ts">
import { useWriterStore } from '../store';
const store = useWriterStore();

function select(id: string) {
    store.activeDraftId = id;
    store.isOpenModalVisible = false;
}
</script>

<template>
    <div class="modal-overlay" @click="store.isOpenModalVisible = false">
        <div class="modal-content" @click.stop>
            <h3>Open Draft</h3>
            <div class="draft-grid">
                <div v-for="d in store.drafts" :key="d.id" class="draft-card" @click="select(d.id)">
                    <span class="draft-title">{{ d.title }}</span>
                    <span v-if="d.isPublished" class="pub-tag">Published</span>
                    <span class="draft-date">{{ d.updatedAt?.toDate()?.toLocaleDateString() }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 500px;
    max-height: 70vh;
    overflow-y: auto;
}

.draft-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 1rem;
}

.draft-card {
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.draft-card:hover {
    border-color: #3498db;
    background: #f7fbfe;
}

.pub-tag {
    font-size: 0.7rem;
    background: #eafaf1;
    color: #2ecc71;
    padding: 2px 6px;
    border-radius: 4px;
}

.draft-date {
    font-size: 0.8rem;
    color: #999;
}
</style>
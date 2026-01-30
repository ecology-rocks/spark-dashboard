<script setup lang="ts">
import { ref, watch } from 'vue';
import { useItemsStore } from '@/core/stores/items';
import TagManager from '../TagManager.vue';
import type { SavedItem } from '@/core/types/items';

const props = defineProps<{
    item: SavedItem; // Required prop
}>();

const emit = defineEmits(['close']);
const itemsStore = useItemsStore();

// Initialize local state from the item prop
const localTags = ref([...(props.item?.tags || [])]);

// Sync local state if the item changes while modal is open
watch(() => props.item, (newVal) => {
    // Use optional chaining and fallback to an empty array
    if (newVal) {
        localTags.value = [...(newVal.tags || [])];
    }
}, { deep: true });

async function handleSave() {
    await itemsStore.updateItemTags(props.item.id, localTags.value);
    emit('close');
}
</script>

<template>
    <div class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
            <header class="modal-header">
                <h3>Edit Tags</h3>
                <button class="close-x" @click="emit('close')">×</button>
            </header>

            <div class="modal-body">
                <p class="item-title-preview">{{ item.title }}</p>
                <TagManager v-model="localTags" />
            </div>

            <footer class="modal-actions">
                <button class="secondary-btn" @click="emit('close')">Cancel</button>
                <button class="primary-btn" @click="handleSave">Save Changes</button>
            </footer>
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
    z-index: 2000;
}

.modal-content {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item-title-preview {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 1rem;
    font-style: italic;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
}
</style>
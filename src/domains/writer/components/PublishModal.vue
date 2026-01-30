<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWriterStore } from '../store';

const props = defineProps<{
    draftId: string;
    title: string;
    initialUrl?: string; // New prop for editing
}>();

const emit = defineEmits(['close']);
const store = useWriterStore();
const url = ref(props.initialUrl || ''); // Initialize with existing URL if present
const isSubmitting = ref(false);

async function handlePublish() {
    if (!url.value || isSubmitting.value) return;

    try {
        isSubmitting.value = true;
        await store.publishDraft(props.draftId, url.value);
        emit('close');
    } catch (error) {
        console.error("Failed to update link:", error);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
            <h3>{{ initialUrl ? 'Edit Published Link' : 'Publish Draft' }}</h3>
            <p class="instruction">{{ title }}</p>

            <input v-model="url" type="url" placeholder="https://..." class="url-input" @keyup.enter="handlePublish" />

            <div class="modal-actions">
                <button class="cancel-btn" @click="emit('close')">Cancel</button>
                <button class="confirm-btn" :disabled="!url || isSubmitting" @click="handlePublish">
                    {{ isSubmitting ? 'Saving...' : (initialUrl ? 'Update Link' : 'Mark as Published') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
}

.modal-content {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    width: 450px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.instruction {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
}

.url-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    margin-bottom: 1.5rem;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
}

button {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 600;
}

.cancel-btn {
    background: #eee;
    color: #444;
}

.confirm-btn {
    background: #2ecc71;
    color: white;
}

.confirm-btn:disabled {
    background: #a8e6cf;
    cursor: not-allowed;
}
</style>
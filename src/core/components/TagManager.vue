<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    modelValue: string[]; // Standard Vue 3 v-model prop
    placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);
const newTagInput = ref('');

function addTag() {
    const tag = newTagInput.value.trim().toLowerCase();
    // Prevent duplicates and empty tags
    if (tag && !props.modelValue.includes(tag)) {
        emit('update:modelValue', [...props.modelValue, tag]);
    }
    newTagInput.value = '';
}

function removeTag(tagToRemove: string) {
    emit('update:modelValue', props.modelValue.filter(t => t !== tagToRemove));
}
</script>

<template>
    <div class="tag-manager">
        <div class="tags-list">
            <span v-for="tag in modelValue" :key="tag" class="tag-pill">
                {{ tag }}
                <button class="remove-btn" @click="removeTag(tag)" aria-label="Remove tag">×</button>
            </span>
        </div>
        <div class="input-group">
            <input v-model="newTagInput" type="text" :placeholder="placeholder || 'Add a tag...'"
                @keydown.enter.prevent="addTag" />
            <button type="button" @click="addTag">Add</button>
        </div>
    </div>
</template>

<style scoped>
.tag-manager {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.tag-pill {
    background: #eafaf1;
    color: #27ae60;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 4px;
}

.remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #27ae60;
    font-weight: bold;
}

.input-group {
    display: flex;
    gap: 4px;
}

input {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>
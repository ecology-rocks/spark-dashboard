<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps<{
    isOpen: boolean;
    title: string;
    content: string;
}>();

const emit = defineEmits(['close']);

// Prevent scrolling on the body when modal is open
watch(() => props.isOpen, (val) => {
    if (val) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
});
</script>

<template>
    <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-content">
            <header>
                <h3>📄 {{ title }}</h3>
                <button class="close-btn" @click="emit('close')">×</button>
            </header>

            <div class="reader-body">
                <div class="content-display" v-html="content"></div>
            </div>

            <footer>
                <button class="primary-btn" @click="emit('close')">Close</button>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3000;
}

.modal-content {
    background: white;
    width: 800px;
    max-width: 95vw;
    height: 85vh;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.1rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
}

.reader-body {
    padding: 2rem;
    flex: 1;
    overflow-y: auto;
    background: #fff;
    font-family: 'Georgia', serif;
    line-height: 1.6;
    color: #2c3e50;
}

/* Typography for the content */
.content-display :deep(p) {
    margin-bottom: 1rem;
}

.content-display :deep(img) {
    max-width: 100%;
    border-radius: 4px;
}

.content-display :deep(h1),
.content-display :deep(h2) {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
}

.content-display :deep(a) {
    color: #3498db;
    text-decoration: underline;
}

footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
}

.primary-btn {
    background: #2c3e50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}
</style>
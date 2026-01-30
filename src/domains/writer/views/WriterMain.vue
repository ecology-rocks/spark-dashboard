<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useWriterStore } from '../store';
import RichEditor from '@/core/components/RichEditor.vue';
import SourceSidebar from '../components/SourceSidebar.vue';
import OpenDraftModal from '../components/OpenDraftModal.vue';
import PublishModal from '../components/PublishModal.vue';

const isPublishModalVisible = ref(false);
const store = useWriterStore();
const editorComponentRef = ref<any>(null);
const saveStatus = ref('Saved');
let saveTimer: any = null;

onMounted(() => {
    store.fetchDrafts();
});

// Auto-select most recent draft safely
watch(() => store.drafts, (drafts) => {
    if (drafts.length > 0 && !store.activeDraftId) {
        const first = drafts[0];
        if (first) store.activeDraftId = first.id;
    }
});

const currentDraft = computed(() =>
    store.drafts.find(d => d.id === store.activeDraftId)
);

// --- SAVING LOGIC ---

function setStatus(status: string) {
    saveStatus.value = status;
}

async function handlePublish() {
    if (!currentDraft.value) return;
    const url = prompt("Enter the URL where this was published:");
    if (url) {
        await store.publishDraft(currentDraft.value.id, url);
    }
}

async function saveDraft() {
    if (!currentDraft.value) return;
    setStatus('Saving...');

    // Save current state to Firebase
    await store.updateDraft(currentDraft.value.id, {
        content: currentDraft.value.content,
        title: currentDraft.value.title
    });

    setTimeout(() => setStatus('Saved'), 500);
}

function onContentChange(newContent: string) {
    if (!currentDraft.value) return;

    // FIX: Update local state immediately so saveDraft() sees the new text
    currentDraft.value.content = newContent;

    setStatus('Unsaved changes...');

    // Auto-save debounce
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
        await saveDraft();
    }, 2000);
}

function onTitleChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (currentDraft.value) {
        currentDraft.value.title = val;
        setStatus('Unsaved changes...');
    }
}

async function createNew() {
    await store.createDraft('New Draft');
    setStatus('Saved');
}

// --- DRAG & DROP HANDLER ---
function handleCustomDrop(data: any) {
    if (!editorComponentRef.value) return;

    // 1. Format the citation HTML
    const citationLabel = data.citation || data.title;
    let htmlToInsert = ` (${citationLabel})`;

    if (data.url) {
        htmlToInsert = ` <a href="${data.url}" target="_blank">(${citationLabel})</a>`;
    } else {
        htmlToInsert = ` <strong>(${citationLabel})</strong>`;
    }

    // 2. Insert into Editor
    // This triggers 'onContentChange' automatically via the Editor's emit
    editorComponentRef.value.insertHTML(htmlToInsert);

    // 3. (Optional) Force immediate save for user confidence
    // We wrap in nextTick-like timeout to ensure onContentChange fired first
    setTimeout(() => {
        saveDraft();
    }, 100);
}
</script>

<template>
    <div class="writer-layout">
        <header class="writer-header">
            <div class="left-controls">
                <button class="action-btn" @click="store.isOpenModalVisible = true">📂 Open</button>
                <button class="icon-btn" @click="createNew">➕</button>
            </div>

            <div class="center-controls" v-if="currentDraft">
                <input :value="currentDraft.title" @input="onTitleChange" @blur="saveDraft" class="title-input" />
            </div>

            <div class="right-controls">
                <button v-if="currentDraft && !currentDraft.isPublished" class="pub-btn"
                    @click="isPublishModalVisible = true">
                    🚀 Publish
                </button>
                <div v-else class="published-info">
                    <a :href="currentDraft?.publishedUrl" target="_blank" class="pub-link">
                        Check Live ↗
                    </a>
                    <button class="icon-btn edit-link" @click="isPublishModalVisible = true" title="Edit Link">
                        📝
                    </button>
                </div>

                <span class="save-status">{{ saveStatus }}</span>
                <button class="toggle-btn" @click="store.isSidebarOpen = !store.isSidebarOpen">
                    {{ store.isSidebarOpen ? 'Hide' : 'Sources' }} 📚
                </button>
            </div>
        </header>

        <div class="workspace">
            <main class="editor-pane">
                <div v-if="currentDraft" :key="currentDraft.id" class="editor-container">
                    <RichEditor ref="editorComponentRef" :modelValue="currentDraft.content"
                        @update:modelValue="onContentChange" @drop-custom="handleCustomDrop" />
                </div>
                <div v-else class="empty-state">
                    <p>Select a draft or create a new one.</p>
                    <button class="primary-btn" @click="createNew">Create Draft</button>
                </div>
            </main>

            <SourceSidebar v-if="store.isSidebarOpen" />

        </div>
        <OpenDraftModal v-if="store.isOpenModalVisible" />
        <PublishModal v-if="isPublishModalVisible && currentDraft" :draftId="currentDraft.id"
            :title="currentDraft.title" :initialUrl="currentDraft.publishedUrl"
            @close="isPublishModalVisible = false" />
    </div>
</template>

<style scoped>
.writer-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: white;
}

.published-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.edit-link {
    font-size: 0.9rem;
    padding: 2px;
    opacity: 0.6;
}

.edit-link:hover {
    opacity: 1;
}

.action-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
}

.pub-btn {
    background: #2ecc71;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
}

.pub-link {
    color: #2ecc71;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
}

.writer-header {
    height: 50px;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    background: #fdfdfd;
}

.left-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.draft-select {
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #ddd;
    max-width: 200px;
}

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
}

.center-controls {
    flex: 1;
    text-align: center;
}

.title-input {
    font-size: 1.1rem;
    font-weight: bold;
    text-align: center;
    border: none;
    background: transparent;
    width: 300px;
    padding: 4px;
}

.title-input:focus {
    outline: none;
    border-bottom: 2px solid #3498db;
}

.right-controls {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.save-status {
    font-size: 0.8rem;
    color: #888;
    font-style: italic;
    min-width: 60px;
    text-align: right;
}

.save-btn {
    background: #f0f4f8;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 0.9rem;
}

.save-btn:hover {
    background: #e2e6ea;
}

.divider {
    width: 1px;
    height: 20px;
    background: #ddd;
}

.toggle-btn {
    background: white;
    border: 1px solid #ddd;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}

.toggle-btn.active {
    background: #eafaf1;
    border-color: #2ecc71;
    color: #27ae60;
}

.workspace {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
}

.editor-pane {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    background: #fff;
}

.editor-container {
    width: 100%;
    max-width: 800px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

:deep(.rich-editor-wrapper) {
    height: 100%;
}

:deep(.quill-editor) {
    display: flex;
    flex-direction: column;
    height: 100%;
}

:deep(.ql-container) {
    flex: 1;
    font-size: 1.1rem;
    font-family: 'Georgia', serif;
    line-height: 1.6;
}

.empty-state {
    text-align: center;
    margin-top: 20%;
    color: #999;
}

.primary-btn {
    background: #2c3e50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
}

.slide-enter-active,
.slide-leave-active {
    transition: margin-right 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    margin-right: -320px;
}

/* Matched sidebar width */
</style>
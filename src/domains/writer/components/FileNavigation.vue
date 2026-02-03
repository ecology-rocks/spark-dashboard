<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWriterStore } from '../store';

const store = useWriterStore();
const newFolderName = ref('');
const isCreating = ref(false);

// Group Drafts
const unfiledDrafts = computed(() => store.drafts.filter(d => !d.folderId));
const draftsByFolder = computed(() => {
    const map: Record<string, any[]> = {};
    store.folders.forEach(f => map[f.id] = []);
    store.drafts.forEach(d => {
        if (d.folderId && map[d.folderId]) map[d.folderId].push(d);
    });
    return map;
});

async function handleCreateDraft() {
    // Creates a draft in the "Unfiled" section by default (folderId: null)
    await store.createDraft('Untitled Draft');
}


async function handleDeleteDraft(id: string) {
    await store.deleteDraft(id);
}


function selectDraft(id: string) {
    store.activeDraftId = id;
}

async function handleCreateFolder() {
    if (newFolderName.value.trim()) {
        await store.createFolder(newFolderName.value);
        newFolderName.value = '';
        isCreating.value = false;
    }
}

async function handleDeleteFolder(id: string) {
    await store.deleteFolder(id);
}

// --- DRAG AND DROP LOGIC ---
function onDragStart(e: DragEvent, draftId: string) {
    if (e.dataTransfer) {
        e.dataTransfer.setData('draftId', draftId);
        e.dataTransfer.effectAllowed = 'move';
    }
}

async function onDrop(e: DragEvent, folderId: string | null) {
    const draftId = e.dataTransfer?.getData('draftId');
    if (draftId) {
        await store.moveDraft(draftId, folderId);
    }
}
</script>

<template>
    <div class="file-nav">
        <div class="nav-header">
            <span class="header-title">🗂️ Projects</span>
            <div class="header-actions">
                <button class="mini-btn" @click="handleCreateDraft" title="New Draft">
                    📄+
                </button>
                <button class="mini-btn" @click="isCreating = true" title="New Folder">
                    📂+
                </button>
            </div>
        </div>

        <div v-if="isCreating" class="new-folder-row">
            <input v-model="newFolderName" placeholder="Folder Name" @keyup.enter="handleCreateFolder" autofocus />
            <button @click="isCreating = false">×</button>
        </div>

        <div class="scroll-area">
            <div v-for="folder in store.folders" :key="folder.id" class="folder-group" @dragover.prevent
                @drop="onDrop($event, folder.id)">

                <div class="folder-header">
                    <span class="icon">📂</span>
                    <span class="name">{{ folder.name }}</span>
                    <button class="del-btn" @click.stop="handleDeleteFolder(folder.id)">×</button>
                </div>

                <div class="folder-content">
                    <div v-for="draft in draftsByFolder[folder.id]" :key="draft.id" class="draft-item"
                        :class="{ active: store.activeDraftId === draft.id }" draggable="true"
                        @dragstart="onDragStart($event, draft.id)" @click="selectDraft(draft.id)">
                        <span class="status">{{ draft.isPublished ? '🟢' : '📝' }}</span>
                        <span class="title">{{ draft.title || 'Untitled' }}</span>
                        <button class="del-draft-btn" @click.stop="handleDeleteDraft(draft.id)"
                            title="Delete Draft">×</button>
                    </div>
                    <div v-if="!draftsByFolder[folder.id]?.length" class="empty-folder">
                        Empty
                    </div>
                </div>
            </div>

            <div class="folder-group unfiled" @dragover.prevent @drop="onDrop($event, null)">
                <div class="folder-header">
                    <span class="icon">📄</span>
                    <span class="name">Unfiled Drafts</span>
                </div>
                <div class="folder-content">
                    <div v-for="draft in unfiledDrafts" :key="draft.id" class="draft-item"
                        :class="{ active: store.activeDraftId === draft.id }" draggable="true"
                        @dragstart="onDragStart($event, draft.id)" @click="selectDraft(draft.id)">
                        <span class="status">{{ draft.isPublished ? '🟢' : '📝' }}</span>
                        <span class="title">{{ draft.title || 'Untitled' }}</span>
                        <button class="del-draft-btn" @click.stop="handleDeleteDraft(draft.id)"
                            title="Delete Draft">×</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.file-nav {
    width: 250px;
    background: #f8f9fa;
    border-right: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.nav-header {
    padding: 12px;
    font-weight: bold;
    color: #2c3e50;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.add-btn {
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    padding: 2px 6px;
}

.add-btn:hover {
    background: #e2e6ea;
}

.new-folder-row {
    padding: 8px;
    display: flex;
    gap: 4px;
    border-bottom: 1px solid #eee;
}

.new-folder-row input {
    flex: 1;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

.folder-group {
    margin-bottom: 8px;
}

.folder-header {
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #555;
    /* Allow dropping ON title to move to folder */
}

.folder-header:hover .del-btn {
    opacity: 1;
}

.del-btn {
    margin-left: auto;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    opacity: 0;
    font-size: 1.1rem;
}

.del-btn:hover {
    color: #e74c3c;
}

.folder-content {
    padding-left: 12px;
    /* Indent drafts */
}

.draft-item {
    padding: 6px 12px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    gap: 8px;
    align-items: center;
    border-left: 2px solid transparent;
    color: #444;
}

.draft-item:hover {
    background: #eaeef1;
}

.draft-item.active {
    background: #e3f2fd;
    border-left-color: #3498db;
    color: #1565c0;
    font-weight: 500;
}

.status {
    font-size: 0.7rem;
}

.title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.empty-folder {
    padding: 4px 12px;
    font-size: 0.8rem;
    color: #bbb;
    font-style: italic;
}

.nav-header {
    padding: 12px;
    font-weight: bold;
    color: #2c3e50;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.header-title {
    font-size: 0.95rem;
}

.header-actions {
    display: flex;
    gap: 4px;
}

.mini-btn {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 4px 6px;
    line-height: 1;
    color: #555;
    transition: all 0.1s;
}

.mini-btn:hover {
    background: #e2e6ea;
    color: #333;
    border-color: #ccc;
}

/* Add inside <style scoped> */

.draft-item:hover .del-draft-btn {
    opacity: 1;
}

.del-draft-btn {
    margin-left: auto;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    opacity: 0;
    font-size: 1.1rem;
    padding: 0 4px;
    line-height: 1;
}

.del-draft-btn:hover {
    color: #e74c3c;
}
</style>
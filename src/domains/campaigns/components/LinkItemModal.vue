<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useItemsStore } from '@/core/stores/items';
import { useWriterStore } from '@/domains/writer/store';
import { useAreasStore } from '@/domains/areas-of-interest/store';
import { useZoteroStore } from '@/core/stores/zotero';

const props = defineProps<{ campaignId: string }>();
const emit = defineEmits(['close', 'link']);

const itemsStore = useItemsStore();
const writerStore = useWriterStore();
const areasStore = useAreasStore();
const zoteroStore = useZoteroStore();

const activeTab = ref<'saved' | 'writer' | 'research'>('saved');
const modalSearchQuery = ref('');
const hasSearchedZotero = ref(false);

onMounted(() => {
    itemsStore.fetchAll();
    writerStore.fetchDrafts();
});

let searchTimeout: any = null;

watch([modalSearchQuery, activeTab], ([newQuery, newTab]) => {
    if (newTab === 'research' && newQuery.length > 2) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            hasSearchedZotero.value = true;
            zoteroStore.searchLibrary(newQuery);
        }, 600);
    }
});

// Computed filtering for Research items
const filteredFolders = computed(() => {
    const query = modalSearchQuery.value.toLowerCase();
    return areasStore.areas.filter(a =>
        a.name.toLowerCase().includes(query)
    );
});

const filteredItems = computed(() => {
    const query = modalSearchQuery.value.toLowerCase();
    return itemsStore.items.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.tags?.some(t => t.toLowerCase().includes(query))
    );
});

// Computed filtering for Writer drafts
const filteredDrafts = computed(() => {
    const query = modalSearchQuery.value.toLowerCase();
    return writerStore.drafts.filter(d =>
        d.title.toLowerCase().includes(query)
    );
});

function selectItem(item: any, type: string) {
    const payload: any = {
        pluginId: type,
        itemId: item.id || item.key,
        title: item.title || item.name,
    };

    if (item.url) payload.url = item.url;

    // SIMPLIFIED LOGIC:
    if (type === 'zotero') {
        // The store already formatted this using your service
        payload.citation = item.citation;
    }
    else if (type === 'areas' && item.zotero?.citation) {
        payload.citation = item.zotero.citation;
    }

    emit('link', payload);
}
</script>

<template>
    <div class="modal-overlay" @click.self="emit('close')">
        <div class="modal-content">
            <header class="modal-header">
                <h3>Link Content to Campaign</h3>
                <button class="close-x" @click="emit('close')">×</button>
            </header>

            <div class="modal-search">
                <div class="search-wrapper">
                    <span class="search-icon">🔍</span>
                    <input v-model="modalSearchQuery" type="text"
                        :placeholder="activeTab === 'research' ? 'Search Zotero library...' : 'Search by title or tag...'"
                        autofocus />
                </div>
            </div>

            <div class="tabs">
                <button :class="{ active: activeTab === 'saved' }" @click="activeTab = 'saved'">
                    Saved Items
                </button>
                <button :class="{ active: activeTab === 'writer' }" @click="activeTab = 'writer'">
                    Drafts
                </button>
                <button :class="{ active: activeTab === 'research' }" @click="activeTab = 'research'">
                    Research (Zotero)
                </button>
            </div>

            <div class="list-container">

                <div v-if="activeTab === 'saved'" class="selectable-list">
                    <div v-if="filteredFolders.length === 0 && filteredItems.length === 0" class="empty-list">
                        No saved items match your search.
                    </div>

                    <div v-if="filteredFolders.length > 0" class="section-label">Folders</div>
                    <div v-for="folder in filteredFolders" :key="folder.id" @click="selectItem(folder, 'folder')"
                        class="item-row folder-row">
                        <span class="icon">📂</span>
                        <div class="item-info">
                            <span class="item-title">{{ folder.name }}</span>
                            <span class="item-meta">Folder</span>
                        </div>
                    </div>

                    <div v-if="filteredItems.length > 0" class="section-label">Items</div>
                    <div v-for="i in filteredItems" :key="i.id" @click="selectItem(i, 'areas')" class="item-row">
                        <span class="icon">📄</span>
                        <div class="item-info">
                            <span class="item-title">{{ i.title }}</span>
                            <span class="item-meta">{{ i.tags?.join(', ') }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="activeTab === 'writer'" class="selectable-list">
                    <div v-if="filteredDrafts.length === 0" class="empty-list">No drafts match your search.</div>
                    <div v-for="d in filteredDrafts" :key="d.id" @click="selectItem(d, 'writer')" class="item-row">
                        <span class="icon">📝</span>
                        <div class="item-info">
                            <span class="item-title">{{ d.title }}</span>
                            <span class="item-meta">Draft Content</span>
                        </div>
                    </div>
                </div>

                <div v-if="activeTab === 'research'" class="selectable-list">
                    <div v-if="zoteroStore.isLoading" class="loading-state">Searching Zotero...</div>
                    <div v-else-if="zoteroStore.searchResults.length === 0" class="empty-list">
                        {{ hasSearchedZotero ? 'No results found in library.' : 'Type to search your Zotero library.' }}
                    </div>

                    <div v-else v-for="z in zoteroStore.searchResults" :key="z.key" @click="selectItem(z, 'zotero')"
                        class="item-row zotero-row">
                        <span class="icon">🎓</span>
                        <div class="item-info">
                            <span class="item-title">{{ z.title }}</span>
                            <span class="item-meta">{{ z.citation }}</span>
                        </div>
                    </div>
                </div>

            </div>

            <footer class="modal-actions">
                <button class="cancel-btn" @click="emit('close')">Cancel</button>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 550px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.modal-header {
    padding: 1.25rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-search {
    padding: 1rem 1.25rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    font-size: 0.9rem;
    color: #9ca3af;
}

.search-wrapper input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search-wrapper input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
}

.tabs button {
    flex: 1;
    padding: 0.875rem;
    border: none;
    background: #f3f4f6;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    color: #6b7280;
    transition: all 0.2s;
}

.tabs button.active {
    color: #2563eb;
    background: white;
    box-shadow: inset 0 -2px 0 0 #2563eb;
}

.list-container {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    min-height: 350px;
}

.section-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 8px 12px 4px 12px;
    margin-top: 4px;
}

.item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.item-row:hover {
    background: #eff6ff;
}

.folder-row .icon {
    font-size: 1.2rem;
}

.zotero-row:hover {
    background: #ecfdf5;
    /* Greenish tint for research */
}

.item-info {
    display: flex;
    flex-direction: column;
}

.item-title {
    font-weight: 500;
    color: #111827;
}

.item-meta {
    font-size: 0.75rem;
    color: #6b7280;
}

.empty-list,
.loading-state {
    padding: 4rem 1rem;
    text-align: center;
    color: #9ca3af;
    font-style: italic;
}

.modal-actions {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
}

.cancel-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}

.cancel-btn:hover {
    background: #f9fafb;
}

.close-x {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #9ca3af;
    cursor: pointer;
}
</style>
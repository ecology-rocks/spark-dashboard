<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCampaignStore } from '../store';
import { useAreasStore } from '@/domains/areas-of-interest/store'; // Need this to select folder
import TagManager from '@/core/components/TagManager.vue';
import LinkItemModal from '../components/LinkItemModal.vue';

const route = useRoute();
const router = useRouter();

const store = useCampaignStore();
const areasStore = useAreasStore();
const campaign = computed(() => store.campaigns.find(c => c.id === route.params.id));

const isLinkModalOpen = ref(false);
const newLineItem = ref('');

onMounted(() => {
    store.fetchCampaigns();
});

async function toggleArchive() {
    if (!campaign.value) return;
    const willArchive = !campaign.value.isArchived;

    await store.toggleArchive(campaign.value.id, campaign.value.isArchived);

    // Redirect to list view if we just archived it
    if (willArchive) {
        router.push('/campaigns');
    }
}

// --- PROJECT GOALS HANDLERS ---
function addGoalLine() {
    if (!campaign.value || !newLineItem.value.trim()) return;
    const items = [...campaign.value.goals.lineItems, newLineItem.value.trim()];
    store.updateGoals(campaign.value.id, campaign.value.goals.narrative, items);
    newLineItem.value = '';
}

function removeGoalLine(index: number) {
    if (!campaign.value) return;
    const items = [...campaign.value.goals.lineItems];
    items.splice(index, 1);
    store.updateGoals(campaign.value.id, campaign.value.goals.narrative, items);
}

function onNarrativeChange(val: string) {
    if (!campaign.value) return;
    store.updateGoals(campaign.value.id, val, campaign.value.goals.lineItems);
}

// --- LINKED ITEMS HANDLERS ---
async function handleAddLink(linkPayload: { pluginId: string; itemId: string; title: string; url?: string }) {
    if (!campaign.value) return;

    const exists = campaign.value.linkedItems.some(
        l => l.itemId === linkPayload.itemId && l.pluginId === linkPayload.pluginId
    );

    if (exists) {
        alert("This item is already linked to the campaign.");
        return;
    }

    const updatedLinks = [...campaign.value.linkedItems, linkPayload];
    await store.updateCampaign(campaign.value.id, { linkedItems: updatedLinks });
    isLinkModalOpen.value = false;
}

async function removeLink(itemId: string) {
    if (!campaign.value || !confirm("Unlink this item?")) return;
    const updatedLinks = campaign.value.linkedItems.filter(l => l.itemId !== itemId);
    await store.updateCampaign(campaign.value.id, { linkedItems: updatedLinks });
}

// --- NAVIGATION ---
// --- NAVIGATION ---
function navigateToLink(link: any) {
    if (link.pluginId === 'areas') {
        // Go to Areas main view
        router.push(`/areas`);
    } else if (link.pluginId === 'folder') {
        // Set the store selection so the sidebar updates
        areasStore.selectedAreaId = link.itemId;
        router.push(`/areas`);
    } else if (link.pluginId === 'writer') {
        router.push(`/writer?id=${link.itemId}`);
    } else if (link.pluginId === 'zotero' && link.url) {
        window.open(link.url, '_blank');
    }
}
</script>

<template>
    <div v-if="campaign" class="campaign-detail">
        <div class="top-header">
            <div class="header-title-block">
                <h1>{{ campaign.title }}</h1>
                <button class="archive-text-btn" @click="toggleArchive">
                    {{ campaign.isArchived ? 'Restore Campaign' : 'Archive Campaign' }}
                </button>
            </div>
            <textarea class="narrative-input" :value="campaign.goals.narrative"
                @change="e => onNarrativeChange((e.target as HTMLTextAreaElement).value)"
                placeholder="Campaign narrative..."></textarea>
        </div>
        <div class="sticky-grid-header">
            <div class="grid-card goals-card">
                <h3>Project Goals</h3>
                <div class="goals-editor">
                    <div class="line-items-section">
                        <ol class="goals-list">
                            <li v-for="(item, idx) in campaign.goals.lineItems" :key="idx">
                                <span>{{ item }}</span>
                                <button @click="removeGoalLine(idx)" class="remove-btn">×</button>
                            </li>
                        </ol>
                        <div class="line-input">
                            <input v-model="newLineItem" placeholder="Add specific goal..."
                                @keyup.enter="addGoalLine" />
                            <button class="add-btn-sm" @click="addGoalLine">Add</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid-card tags-card">
                <h3>Campaign Tags</h3>
                <TagManager v-model="campaign.tags"
                    @update:modelValue="tags => store.updateCampaign(campaign!.id, { tags })" />
            </div>

            <div class="grid-card dates-card">
                <div class="card-header">
                    <h3>Important Dates</h3>
                    <button class="add-date-btn" @click="store.addImportantDate(campaign.id, campaign)">+ Add
                        Date</button>
                </div>
                <div class="dates-container">
                    <div v-for="d in campaign.dates" :key="d.id" class="date-entry">
                        <input type="date" v-model="d.date"
                            @change="store.updateImportantDate(campaign.id, campaign, d.id, { date: d.date })" />
                        <input type="text" v-model="d.description" placeholder="Description"
                            @blur="store.updateImportantDate(campaign.id, campaign, d.id, { description: d.description })" />
                        <button class="del-btn"
                            @click="store.removeImportantDate(campaign.id, campaign, d.id)">×</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="linked-content-grid">
            <div v-for="link in campaign.linkedItems" :key="link.itemId" class="grid-card link-card"
                :class="[`link-type-${link.pluginId}`]">
                <div class="link-header">
                    <span class="plugin-tag">{{ link.pluginId === 'areas' ? 'Item' : link.pluginId }}</span>
                    <button class="remove-btn" @click="removeLink(link.itemId)">×</button>
                </div>
                <h4>{{ link.title }}</h4>
                <p v-if="link.citation" class="link-citation">{{ link.citation }}</p>
                <a v-if="link.pluginId === 'zotero' && link.url" :href="link.url" target="_blank" class="view-link">
                    Open Source ↗
                </a>
                <button v-else-if="link.pluginId !== 'zotero'" class="view-link-btn" @click="navigateToLink(link)">
                    {{ link.pluginId === 'folder' ? 'Open Folder 📂' : 'View Content ↗' }}
                </button>
                <span v-else class="no-link-text">No URL available</span>
            </div>

            <div class="grid-card add-link-card" @click="isLinkModalOpen = true">
                <span class="add-btn-icon">+</span>
                <p>Add Linked Item</p>
            </div>
        </div>

        <LinkItemModal v-if="isLinkModalOpen" :campaignId="campaign.id" @close="isLinkModalOpen = false"
            @link="handleAddLink" />
    </div>
</template>

<style scoped>
/* Reuse existing styles, adding specific plugin colors */
.header-title-block {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
}

.archive-text-btn {
    background: none;
    border: none;
    padding: 0;
    color: #9ca3af;
    font-size: 0.85rem;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s;
}

.archive-text-btn:hover {
    color: #ef4444;
}

.campaign-detail {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    background: #f9fafb;
    min-height: 100vh;
}

.sticky-grid-header {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    position: sticky;
    top: -2rem;
    z-index: 100;
    background: #ffffff;
    padding: 1.5rem;
    margin: -2rem -2rem 2rem -2rem;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.grid-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s;
}

/* Base Card */
.link-card {
    border: 1px solid #e5e7eb;
    border-left: 6px solid #9ca3af;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;
}

/* Areas (Items) - Blue */
.link-type-areas {
    border-left-color: #3b82f6;
}

.link-type-areas .plugin-tag {
    background: #eff6ff;
    color: #1e40af;
}

.link-type-areas .view-link-btn {
    color: #2563eb;
}

/* Folders - Yellow/Amber */
.link-type-folder {
    border-left-color: #f59e0b;
}

.link-type-folder .plugin-tag {
    background: #fffbeb;
    color: #b45309;
}

.link-type-folder .view-link-btn {
    color: #d97706;
}

/* Writer (Drafts) - Purple */
.link-type-writer {
    border-left-color: #8b5cf6;
}

.link-type-writer .plugin-tag {
    background: #f5f3ff;
    color: #5b21b6;
}

.link-type-writer .view-link-btn {
    color: #7c3aed;
}

/* Zotero (Research) - Green */
.link-type-zotero {
    border-left-color: #10b981;
}

.link-type-zotero .plugin-tag {
    background: #ecfdf5;
    color: #047857;
}

.link-type-zotero .view-link {
    color: #059669;
}

.link-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #111827;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 2rem;
}

.top-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #111827;
}

.narrative-input {
    flex: 0 0 50%;
    padding: 10px 12px;
    margin-bottom: 24px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.4;
    resize: vertical;
    min-height: 42px;
    max-height: 120px;
    background: #ffffff;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.narrative-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.line-items-section {
    border-top: none;
    padding-top: 0;
}

.goals-card {
    min-height: auto;
    max-height: none;
}

.goals-editor {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
}

.goals-list {
    padding-left: 1.2rem;
    margin-bottom: 1rem;
}

.goals-list li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #374151;
}

.line-input {
    display: flex;
    gap: 8px;
}

.line-input input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.dates-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.date-entry {
    background: #f3f4f6;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    gap: 8px;
    align-items: center;
}

.date-entry input[type="date"] {
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 4px;
    font-family: inherit;
    font-size: 0.85rem;
}

.date-entry input[type="text"] {
    flex: 1;
    background: transparent;
    border: none;
    border-bottom: 1px solid transparent;
    padding: 4px;
    font-size: 0.9rem;
}

.date-entry input[type="text"]:focus {
    outline: none;
    border-bottom-color: #3b82f6;
}

.linked-content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.link-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.plugin-tag {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 6px;
    border-radius: 4px;
}

.view-link,
.view-link-btn {
    display: inline-block;
    margin-top: 1rem;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
}

.view-link:hover,
.view-link-btn:hover {
    text-decoration: underline;
}

.no-link-text {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #9ca3af;
    font-style: italic;
}

.add-link-card {
    border: 2px dashed #d1d5db;
    background: transparent;
    justify-content: center;
    align-items: center;
    color: #6b7280;
    cursor: pointer;
    min-height: 180px;
}

.add-link-card:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #374151;
}

.add-link-card p {
    font-weight: 600;
    margin-top: 0.5rem;
}

.add-btn-sm {
    background: #374151;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.85rem;
}

.add-btn-sm:hover {
    background: #1f2937;
}

.add-date-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
}

.add-date-btn:hover {
    background: #e5e7eb;
}

.remove-btn,
.del-btn {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    padding: 0 4px;
}

.remove-btn:hover,
.del-btn:hover {
    color: #ef4444;
}

.add-btn-icon {
    font-size: 2.5rem;
    line-height: 1;
}
</style>
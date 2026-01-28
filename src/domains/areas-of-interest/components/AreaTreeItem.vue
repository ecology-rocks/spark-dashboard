<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAreasStore } from '../store';
import { useItemsStore } from '@/core/stores/items'; // <--- NEW STORE
import type { Area } from '../types';

const props = defineProps<{
    area: Area;
    depth: number;
}>();

const areasStore = useAreasStore();
const itemsStore = useItemsStore(); // <--- Use this
const isOpen = ref(false);

const hasChildren = computed(() => props.area.children && props.area.children.length > 0);
const isSelected = computed(() => areasStore.selectedAreaId === props.area.id);

function handleClick() {
    // FIX: Fetch via itemsStore, but set selection in areasStore
    itemsStore.fetchByArea(props.area.id);
    areasStore.selectedAreaId = props.area.id;
}

function toggle(e: Event) {
    e.stopPropagation();
    isOpen.value = !isOpen.value;
}
</script>

<template>
    <li :class="{ selected: isSelected }">
        <div class="row" :style="{ paddingLeft: depth * 12 + 'px' }" @click="handleClick">
            <span v-if="hasChildren" class="toggle-btn" :class="{ rotated: isOpen }" @click="toggle">
                ▶
            </span>
            <span v-else class="spacer"></span>

            <span class="folder-icon">{{ isOpen ? '📂' : '📁' }}</span>
            <span class="name">{{ area.name }}</span>
        </div>

        <ul v-if="hasChildren && isOpen" class="children-list">
            <AreaTreeItem v-for="child in area.children" :key="child.id" :area="child" :depth="depth + 1" />
        </ul>
    </li>
</template>

<style scoped>
li {
    list-style: none;
    user-select: none;
}

.row {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s;
    color: #2c3e50;
}

.row:hover {
    background: #e9ecef;
}

.selected .row {
    background: #2c3e50;
    color: white;
}

.toggle-btn {
    font-size: 0.7rem;
    margin-right: 6px;
    cursor: pointer;
    transition: transform 0.2s;
    color: #888;
    width: 12px;
    display: inline-block;
}

.selected .toggle-btn {
    color: #ccc;
}

.toggle-btn.rotated {
    transform: rotate(90deg);
}

.spacer {
    width: 18px;
}

.folder-icon {
    margin-right: 6px;
    font-size: 1rem;
}

.name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.children-list {
    padding: 0;
    margin: 0;
}
</style>
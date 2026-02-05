<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    title: string
    value: string | number
    data: number[]
    color?: 'blue' | 'green' | 'purple' | 'orange'
}>()

const theme = computed(() => {
    const map = {
        blue: { stroke: '#2563eb', class: 'theme-blue' },
        green: { stroke: '#059669', class: 'theme-green' },
        purple: { stroke: '#7c3aed', class: 'theme-purple' },
        orange: { stroke: '#d97706', class: 'theme-orange' },
    }
    return map[props.color || 'blue']
})

const sparklinePath = computed(() => {
    if (!props.data.length) return ''
    const max = Math.max(...props.data) || 1
    const min = Math.min(...props.data) || 0
    const range = max - min || 1

    const width = 100
    const height = 30
    const step = width / (props.data.length - 1)

    const points = props.data.map((val, i) => {
        const x = i * step
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
})
</script>

<template>
    <div class="kpi-card">
        <div class="card-header">
            <div>
                <p class="card-title">{{ title }}</p>
                <h3 class="card-value">{{ value }}</h3>
            </div>
            <div class="icon-wrapper" :class="theme.class">
                <slot name="icon"></slot>
            </div>
        </div>

        <div class="sparkline-container">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                <path :d="sparklinePath" fill="none" :stroke="theme.stroke" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>
        </div>
    </div>
</template>

<style scoped>
.kpi-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 140px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.card-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    color: #94a3b8;
    margin: 0;
}

.card-value {
    font-size: 1.8rem;
    font-weight: 900;
    color: #1e293b;
    margin: 0.25rem 0 0 0;
}

.icon-wrapper {
    padding: 0.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.theme-blue {
    background-color: #eff6ff;
    color: #2563eb;
}

.theme-green {
    background-color: #ecfdf5;
    color: #059669;
}

.theme-purple {
    background-color: #f5f3ff;
    color: #7c3aed;
}

.theme-orange {
    background-color: #fffbeb;
    color: #d97706;
}

.sparkline-container {
    height: 32px;
    width: 100%;
    margin-top: 1rem;
    opacity: 0.8;
}

.sparkline-container svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}
</style>
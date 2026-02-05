import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface GscRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export const useAnalyticsStore = defineStore('analytics', () => {
  const sites = ref<string[]>([])
  const currentSite = ref<string>('')

  const queries = ref<GscRow[]>([]) // Top Keywords
  const history = ref<GscRow[]>([]) // Daily History

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed: Site Totals for the last 30 days
  const totals = computed(() => {
    if (history.value.length === 0) return { clicks: 0, impressions: 0, ctr: 0, position: 0 }

    const sumClicks = history.value.reduce((acc, row) => acc + row.clicks, 0)
    const sumImp = history.value.reduce((acc, row) => acc + row.impressions, 0)

    // Weighted averages
    const avgCtr = sumImp > 0 ? (sumClicks / sumImp) * 100 : 0
    const avgPos = history.value.reduce((acc, row) => acc + row.position, 0) / history.value.length

    return {
      clicks: sumClicks,
      impressions: sumImp,
      ctr: avgCtr,
      position: avgPos,
    }
  })

  async function init() {
    if (sites.value.length > 0) return
    isLoading.value = true
    try {
      // 1. Get Sites
      const res = await fetch('/.netlify/functions/fetch-gsc?mode=sites')
      if (!res.ok) throw new Error('Failed to load sites')

      // FIX 1: Explicitly tell TS this is a string array
      const data = (await res.json()) as string[]
      sites.value = data

      // FIX 2: Use null coalescing (?? '') to guarantee a string
      if (sites.value.length > 0) {
        currentSite.value = sites.value[0] ?? ''
        await refreshAll()
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function refreshAll() {
    if (!currentSite.value) return
    isLoading.value = true
    error.value = null

    try {
      const qParams = new URLSearchParams({ siteUrl: currentSite.value })

      // Parallel Fetch: Get Keywords AND Daily History
      const [kRes, hRes] = await Promise.all([
        fetch(`/.netlify/functions/fetch-gsc?mode=query&${qParams}`),
        fetch(`/.netlify/functions/fetch-gsc?mode=overview&${qParams}`),
      ])

      queries.value = await kRes.json()
      history.value = await hRes.json()
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function switchSite(url: string) {
    currentSite.value = url
    await refreshAll()
  }

  return {
    sites,
    currentSite,
    queries,
    history,
    totals,
    isLoading,
    error,
    init,
    switchSite,
    refreshAll,
  }
})

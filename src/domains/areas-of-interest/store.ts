import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuthStore } from '@/core/stores/auth'
import type { Area } from './types'

export const useAreasStore = defineStore('areas-of-interest', () => {
  const db = getFirestore()
  const auth = useAuthStore()

  const areas = ref<Area[]>([])
  const selectedAreaId = ref<string | null>(null)

  const areaTree = computed(() => {
    type AreaNode = Area & { children: Area[] }
    const map: Record<string, AreaNode> = {}
    const roots: AreaNode[] = []

    areas.value.forEach((a) => {
      map[a.id] = { ...a, children: [] }
    })

    areas.value.forEach((a) => {
      const node = map[a.id]
      if (!node) return
      const pid = a.parentId
      if (pid && map[pid]) {
        map[pid].children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  })

  watch(
    () => auth.user,
    (user) => {
      if (user) {
        const colRef = collection(db, 'users', user.uid, 'areas')
        onSnapshot(colRef, (snap) => {
          areas.value = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as Area)
            .sort((a, b) => a.name.localeCompare(b.name))
        })
      } else {
        areas.value = []
      }
    },
    { immediate: true },
  )

  async function createArea(
    name: string,
    description: string = '',
    parentId: string | null = null,
  ) {
    if (!auth.user || !name.trim()) return
    await addDoc(collection(db, 'users', auth.user.uid, 'areas'), {
      name: name.trim(),
      description: description.trim(),
      parentId,
      createdAt: serverTimestamp(),
    })
  }

  async function updateArea(
    areaId: string,
    name: string,
    description: string = '',
    parentId: string | null = null,
  ) {
    if (!auth.user || !name.trim()) return
    const docRef = doc(db, 'users', auth.user.uid, 'areas', areaId)
    await updateDoc(docRef, {
      name: name.trim(),
      description: description.trim(),
      parentId,
    })
  }

  async function deleteArea(areaId: string) {
    if (!auth.user || !confirm('Delete this folder?')) return
    await deleteDoc(doc(db, 'users', auth.user.uid, 'areas', areaId))
    if (selectedAreaId.value === areaId) selectedAreaId.value = null
  }

  return {
    areas,
    areaTree,
    selectedAreaId,
    createArea,
    updateArea,
    deleteArea,
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { useAuthStore } from '@/core/stores/auth'
import type { SavedItem, ActionStatus } from '@/core/types/items'
import DOMPurify from 'dompurify'

export const useItemsStore = defineStore('items', () => {
  const db = getFirestore()
  const auth = useAuthStore()

  const items = ref<SavedItem[]>([])
  let unsubscribe: Unsubscribe | null = null

  // --- ACTIONS ---

  async function createItem(
    areaId: string,
    item: Omit<SavedItem, 'id' | 'savedAt' | 'areaId'>,
    tags: string[] = [],
  ) {
    if (!auth.user) return

    let cleanContent = item.content
    if (typeof item.content === 'string') {
      cleanContent = DOMPurify.sanitize(item.content)
    }

    await addDoc(collection(db, 'users', auth.user.uid, 'saved_items'), {
      ...item,
      content: cleanContent,
      areaId,
      tags,
      actionStatus: item.actionStatus || 'inbox',
      savedAt: serverTimestamp(),
    })
  }

  async function updateItemContent(itemId: string, newContent: string, newTitle?: string) {
    if (!auth.user) return
    const itemRef = doc(db, 'users', auth.user.uid, 'saved_items', itemId)
    const cleanContent = DOMPurify.sanitize(newContent)
    const updates: any = { content: cleanContent }
    if (newTitle) updates.title = newTitle
    await updateDoc(itemRef, updates)
  }

  async function updateItemStatus(itemId: string, status: ActionStatus) {
    if (!auth.user) return
    const itemRef = doc(db, 'users', auth.user.uid, 'saved_items', itemId)
    await updateDoc(itemRef, { actionStatus: status })
  }

  async function updateItemTags(itemId: string, newTags: string[]) {
    if (!auth.user) return
    const itemRef = doc(db, 'users', auth.user.uid, 'saved_items', itemId)
    await updateDoc(itemRef, { tags: newTags })
  }

  async function moveItem(itemId: string, newAreaId: string) {
    if (!auth.user) return
    const itemRef = doc(db, 'users', auth.user.uid, 'saved_items', itemId)
    await updateDoc(itemRef, { areaId: newAreaId })
  }

  async function deleteItem(itemId: string) {
    if (!auth.user || !confirm('Remove this saved item?')) return
    const itemRef = doc(db, 'users', auth.user.uid, 'saved_items', itemId)
    await deleteDoc(itemRef)
  }

  // --- FETCHING ---

  // For Areas View: Get items in specific folder
  function fetchByArea(areaId: string) {
    if (!auth.user) return
    if (unsubscribe) unsubscribe()

    const q = query(
      collection(db, 'users', auth.user.uid, 'saved_items'),
      where('areaId', '==', areaId),
    )

    unsubscribe = onSnapshot(q, (snap) => {
      items.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as SavedItem)
        .sort((a, b) => (b.savedAt?.seconds || 0) - (a.savedAt?.seconds || 0))
    })
  }

  // For Action Center: Get ALL items
  function fetchAll() {
    if (!auth.user) return
    if (unsubscribe) unsubscribe()

    const q = query(collection(db, 'users', auth.user.uid, 'saved_items'))

    unsubscribe = onSnapshot(q, (snap) => {
      items.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as SavedItem)
        .sort((a, b) => (b.savedAt?.seconds || 0) - (a.savedAt?.seconds || 0))
    })
  }

  return {
    items,
    createItem,
    updateItemContent,
    updateItemStatus,
    updateItemTags,
    moveItem,
    deleteItem,
    fetchByArea,
    fetchAll,
  }
})

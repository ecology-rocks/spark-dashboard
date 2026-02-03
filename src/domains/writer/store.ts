import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { useAuthStore } from '@/core/stores/auth'
import type { Draft, Folder } from './types'

export const useWriterStore = defineStore('writer', () => {
  const db = getFirestore()
  const auth = useAuthStore()

  const folders = ref<Folder[]>([])
  const drafts = ref<Draft[]>([])
  const activeDraftId = ref<string | null>(null)
  const isSidebarOpen = ref(true) // Default to having source material open
  const isOpenModalVisible = ref(false) //

  let unsubscribe: Unsubscribe | null = null

  // --- ACTIONS ---

  async function createFolder(name: string) {
    if (!auth.user) return
    await addDoc(collection(db, 'users', auth.user.uid, 'writer_folders'), {
      name,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteFolder(id: string) {
    if (!auth.user || !confirm('Delete folder? Drafts inside will move to Unfiled.')) return

    // 1. Move drafts to root (null)
    const draftsInFolder = drafts.value.filter((d) => d.folderId === id)
    for (const draft of draftsInFolder) {
      await moveDraft(draft.id, null)
    }

    // 2. Delete folder
    await deleteDoc(doc(db, 'users', auth.user.uid, 'writer_folders', id))
  }

  async function moveDraft(draftId: string, folderId: string | null) {
    if (!auth.user) return
    const ref = doc(db, 'users', auth.user.uid, 'drafts', draftId)
    await updateDoc(ref, { folderId, updatedAt: serverTimestamp() })
  }

  async function renameFolder(id: string, name: string) {
    if (!auth.user) return
    await updateDoc(doc(db, 'users', auth.user.uid, 'writer_folders', id), { name })
  }

  async function createDraft(title: string = 'Untitled Draft') {
    if (!auth.user) return
    const docRef = await addDoc(collection(db, 'users', auth.user.uid, 'drafts'), {
      title,
      content: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    activeDraftId.value = docRef.id
    return docRef.id
  }

  async function publishDraft(id: string, url: string) {
    if (!auth.user) return
    const draftRef = doc(db, 'users', auth.user.uid, 'drafts', id)
    await updateDoc(draftRef, {
      publishedUrl: url,
      isPublished: true, // Remains true even on edits
      updatedAt: serverTimestamp(),
    })
  }

  async function updateDraft(id: string, changes: Partial<Draft>) {
    if (!auth.user) return
    const ref = doc(db, 'users', auth.user.uid, 'drafts', id)
    await updateDoc(ref, {
      ...changes,
      updatedAt: serverTimestamp(),
    })
  }

  async function deleteDraft(id: string) {
    if (!auth.user || !confirm('Delete this draft permanently?')) return
    await deleteDoc(doc(db, 'users', auth.user.uid, 'drafts', id))
    if (activeDraftId.value === id) activeDraftId.value = null
  }

  // --- SUBSCRIPTIONS ---

  function fetchDrafts() {
    if (!auth.user) return
    if (unsubscribe) unsubscribe()

    const colRef = collection(db, 'users', auth.user.uid, 'drafts')
    unsubscribe = onSnapshot(colRef, (snap) => {
      drafts.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Draft)
        .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
    })
  }

  function fetchAll() {
    if (!auth.user) return

    // Fetch Drafts
    const draftCol = collection(db, 'users', auth.user.uid, 'drafts')
    onSnapshot(draftCol, (snap) => {
      drafts.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Draft)
        .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
    })

    // Fetch Folders
    const folderCol = query(
      collection(db, 'users', auth.user.uid, 'writer_folders'),
      orderBy('createdAt', 'asc'),
    )
    onSnapshot(folderCol, (snap) => {
      folders.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Folder)
    })
  }

  return {
    drafts,
    folders, // <--- Export
    activeDraftId,
    isSidebarOpen,
    isOpenModalVisible,
    createDraft,
    updateDraft,
    deleteDraft,
    publishDraft,
    createFolder, // <--- Export
    deleteFolder, // <--- Export
    moveDraft, // <--- Export
    renameFolder, // <--- Export
    fetchAll, // <--- Renamed from fetchDrafts to fetchAll (update usage!)
  }
})

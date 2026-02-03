export interface Folder {
  id: string
  name: string
  createdAt: any
}

export interface Draft {
  id: string
  title: string
  content: string
  folderId?: string | null
  createdAt: any
  updatedAt: any
  publishedUrl?: string //
  isPublished?: boolean //
}

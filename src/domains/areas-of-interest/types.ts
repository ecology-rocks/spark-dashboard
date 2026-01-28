// Re-export core types
export * from '@/core/types/items'

export interface Area {
  id: string
  name: string
  description?: string
  parentId?: string | null
  createdAt: any
  children?: Area[]
}

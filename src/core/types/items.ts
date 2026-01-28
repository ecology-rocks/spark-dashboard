export type ActionStatus = 'inbox' | 'to_analyze' | 'to_write' | 'to_share' | 'reference'

export interface SavedItem {
  id: string
  areaId: string // Link to the folder
  type: 'rss' | 'spark' | 'note' | 'web'
  title: string
  sourceUrl?: string | null
  content?: any
  savedAt: any
  tags?: string[]
  actionStatus?: ActionStatus
}

export interface CampaignDate {
  id: string
  date: string
  description: string
}

export interface LinkedItem {
  // expanded union type for clarity, though string allows extensions
  pluginId: 'areas' | 'writer' | 'folder' | 'zotero' | string
  itemId: string
  title: string
  // Optional: Store external URL (for Zotero) or metadata
  url?: string
  citation?: string
}

export interface Campaign {
  id: string
  title: string
  tags: string[]
  goals: {
    narrative: string
    lineItems: string[]
  }
  dates: CampaignDate[]
  linkedItems: LinkedItem[]
  createdAt: any
  updatedAt: any
  isArchived: boolean
}

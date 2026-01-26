import type { Resource } from '@/core/types/domain';

export interface BucketRule {
  name: string;      // e.g. "Forests"
  keywords: string[]; // e.g. ["tree", "logging", "canopy"]
}

export function applyBuckets(resources: Partial<Resource>[], rules: BucketRule[]) {
  if (!rules.length) return resources;

  return resources.map(res => {
    // Combine title and summary for searching
    const textToCheck = `${res.title} ${res.summary}`.toLowerCase();
    
    // Find matches
    const tags = rules
      .filter(rule => rule.keywords.some(k => textToCheck.includes(k.toLowerCase())))
      .map(rule => rule.name);

    // Return resource with new tags attached (we store them in nativeData for now or a top level tags field)
    if (tags.length > 0) {
      return {
        ...res,
        tags: tags // Assuming you added 'tags' to your Resource interface, otherwise put in nativeData
      };
    }
    return res;
  });
}
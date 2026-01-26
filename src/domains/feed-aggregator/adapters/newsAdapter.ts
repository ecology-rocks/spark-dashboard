import type { FeedAdapter } from '../types';

// Helper to get keys safely
const NYT_KEY = import.meta.env.VITE_NYT_KEY || '';
const GUARDIAN_KEY = import.meta.env.VITE_GUARDIAN_KEY || '';

export const newsAdapter: FeedAdapter = {
  // 1. Validation: Does this URL belong to a supported news API?
  validateUrl: (url: string) => {
    return url.includes('nytimes.com') || url.includes('theguardian.com');
  },

  async fetch(sourceUrl: string) {
    // 2. Strategy Switch: Which API do we hit?
    if (sourceUrl.includes('nytimes.com')) {
      return fetchNYT(sourceUrl);
    } 
    if (sourceUrl.includes('theguardian.com')) {
      return fetchGuardian(sourceUrl);
    }
    return [];
  }
};

// --- Strategy 1: New York Times ---
async function fetchNYT(sourceUrl: string) {
  if (!NYT_KEY) {
    console.warn('Missing NYT API Key');
    return [];
  }

  // Example: Querying their Article Search API
  // You might want to parse "sections" from the sourceUrl if you want to get fancy later
  const apiUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=environment&api-key=${NYT_KEY}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    return data.response.docs.map((doc: any) => ({
      pluginId: 'feed-aggregator',
      externalId: doc._id,
      title: doc.headline.main,
      url: doc.web_url,
      summary: doc.snippet || doc.lead_paragraph,
      publishedAt: new Date(doc.pub_date),
      ingestedAt: new Date(),
      status: 'new',
      nativeData: { source: 'NYT', section: doc.section_name }
    }));
  } catch (err) {
    console.error('NYT Fetch Error:', err);
    return [];
  }
}

// --- Strategy 2: The Guardian ---
async function fetchGuardian(sourceUrl: string) {
  if (!GUARDIAN_KEY) {
    console.warn('Missing Guardian API Key');
    return [];
  }

  const apiUrl = `https://content.guardianapis.com/search?q=environment&api-key=${GUARDIAN_KEY}&show-fields=trailText,thumbnail`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    return data.response.results.map((doc: any) => ({
      pluginId: 'feed-aggregator',
      externalId: doc.id,
      title: doc.webTitle,
      url: doc.webUrl,
      summary: doc.fields?.trailText || '',
      publishedAt: new Date(doc.webPublicationDate),
      ingestedAt: new Date(),
      status: 'new',
      nativeData: { source: 'Guardian', section: doc.sectionName }
    }));
  } catch (err) {
    console.error('Guardian Fetch Error:', err);
    return [];
  }
}
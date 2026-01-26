export const generateArticleId = (link: string | undefined) => {
  if (!link) return 'unknown';
  let hash = 0;
  for (let i = 0; i < link.length; i++) {
    // Bitwise shift to create a unique integer from the string
    hash = ((hash << 5) - hash) + link.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return "doc_" + Math.abs(hash);
};

export function updateUrlWithId(folderId: string) {
  const newUrl = window.location.pathname + '?folderId=' + folderId;
  // Save the ID in the browser's history state too!
  window.history.pushState({ folderId: folderId }, '', newUrl);
}
export function getIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('folderId'); // Returns 'fin-456' or null
}

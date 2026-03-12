import { Folder } from '../models/entity';
import { ROOT_FOLDER_ID } from './_const';

export function updateUrlWithId(folderId: string) {
  const newUrl = window.location.pathname + '?folderId=' + folderId;
  // Save the ID in the browser's history state too!
  window.history.pushState({ folderId: folderId }, '', newUrl);
}
export function getIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('folderId'); // Returns 'fin-456' or null
}
export function getBreadcrumbPath(
  currentFolderId: string, 
  allFolders: Record<string, Folder>
): Folder[] {
  const path: Folder[] = [];
  let currentId: string | null = currentFolderId;

  // We use a Set to prevent infinite loops just in case of bad data
  const visited = new Set<string>();

  while (currentId && allFolders[currentId] && !visited.has(currentId)) {
    visited.add(currentId);
    
    const folder = allFolders[currentId];
    
    // .unshift() adds it to the FRONT of the array, so it reads Root -> Child
    path.unshift(folder); 
    
    currentId = folder.parentId;
  }

  return path;
}
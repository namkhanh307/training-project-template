import { File, Folder } from '../models/entity';
import { ROOT_FOLDER_ID } from './_const';
import { UIManager } from '../services/uiManager';

export function handleFolderClick(
  targetFolderId: string,
  allFolders: Record<string, Folder>,
): string { // 🔴 Change return type to string
  
  const targetFolder = allFolders[targetFolderId];
  
  // Fallback to root if ID is bad
  if (!targetFolder) {
    console.warn('Folder not found, returning to root.');
    updateUrlWithId(ROOT_FOLDER_ID);
    return ROOT_FOLDER_ID; 
  }

  // Clear the new notification dot/sparkle
  targetFolder.isNew = false;

  // Update the browser URL
  updateUrlWithId(targetFolderId);

  // Return just the ID for your class state to consume!
  return targetFolderId;
}
// export function navigateFromBreadcrumb(
//   rootFolder: Folder,
//   targetPath: string,
// ): Folder {
//   if (targetPath === '/') return rootFolder;

//   const segments = targetPath.split('/').filter((s) => s.length > 0);
//   let foundFolder = rootFolder;

//   for (const segment of segments) {
//     const nextFolder = foundFolder.subFolders.find(
//       (f) => f.name === segment,
//     );
//     if (nextFolder) {
//       foundFolder = nextFolder;
//     } else {
//       console.warn(`Folder missing at path: ${targetPath}`);
//       return rootFolder; // Fallback to root if path is broken
//     }
//   }

//   return foundFolder;
// }
export function updateUrlWithId(folderId: string) {
  const newUrl = window.location.pathname + '?folderId=' + folderId;
  // Save the ID in the browser's history state too!
  window.history.pushState({ folderId: folderId }, '', newUrl);
}
export function getIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('folderId'); // Returns 'fin-456' or null
}
// Run this on initial page load, and inside your 'popstate' event listener
export function handleNavigation(
  allFolders: Record<string, Folder>,
  allFiles: Record<string, File>,
) {
  // 1. Look at the URL
  const targetId = getIdFromUrl();

  // 2. Find it in the dictionary (Fallback to 'root' if ID is missing or bad)
  const currentFolder =
    targetId && allFolders[targetId]
      ? allFolders[targetId]
      : allFolders[ROOT_FOLDER_ID];

  // 3. Update UI
  UIManager.refreshUI(currentFolder.id, allFolders, allFiles);
}
export function generateBreadcrumbPath(
  currentFolderId: string,
  allFolders: Record<string, Folder>,
): Folder[] {
  const breadcrumbTrail: Folder[] = [];
  let currentId: string | null = currentFolderId;

  // Keep climbing until we run out of parentIds!
  while (currentId && allFolders[currentId]) {
    const folder = allFolders[currentId];

    // unshift() adds the folder to the FRONT of the array.
    // This ensures our final array looks like: [Root, Finance, 2026]
    breadcrumbTrail.unshift(folder);

    // Set the currentId to the parent, so the loop moves up one level
    currentId = folder.parentId;
  }

  return breadcrumbTrail;
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
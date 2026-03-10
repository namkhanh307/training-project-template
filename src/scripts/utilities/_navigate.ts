import { Folder } from '../models/entity';
import { UIManager } from './uiManager';

export function handleFolderClick(
  navigationHistory: Folder[],
  currentFolder: Folder,
  folderName: string,
) {
  const targetFolder = currentFolder.subFolders.find(
    (f) => f.name === folderName,
  );
  if (!targetFolder) return;

  targetFolder.isNew = false;
  UIManager.saveAndRefresh(currentFolder);

  // Push to history before moving
  navigationHistory.push(currentFolder);
  currentFolder = targetFolder;

  updateUrlPath(currentFolder.path || '/');
  //UIManager.updateBreadcrumbs('folder-path-display', currentFolder);
  UIManager.refreshUI(currentFolder);
}

export function navigateFromBreadcrumb(
  rootFolder: Folder,
  targetPath: string,
): Folder {
  if (targetPath === '/') return rootFolder;

  const segments = targetPath.split('/').filter((s) => s.length > 0);
  let foundFolder = rootFolder;

  for (const segment of segments) {
    const nextFolder = foundFolder.subFolders.find(
      (f) => f.name === segment,
    );
    if (nextFolder) {
      foundFolder = nextFolder;
    } else {
      console.warn(`Folder missing at path: ${targetPath}`);
      return rootFolder; // Fallback to root if path is broken
    }
  }

  return foundFolder;
}
export function updateUrlPath(folderPath: string) {
  const newUrl =
    window.location.pathname +
    '?path=' +
    encodeURIComponent(folderPath);
  window.history.pushState({ path: folderPath }, '', newUrl);
}

// Reads the URL when the page first loads
export function getPathFromUrl(): string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('path') || '/';
}

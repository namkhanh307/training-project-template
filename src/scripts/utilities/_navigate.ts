import { GetPathsRes, NavState } from "../models/model";
import { ROOT_FOLDER } from "./_const";

export function updateUrlWithId(folderId: string) {
  const newUrl = window.location.pathname + '?folderId=' + folderId;
  // Save the ID in the browser's history state too!
  window.history.pushState({ folderId: folderId }, '', newUrl);
}
export function getIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('folderId'); // Returns 'fin-456' or null
}
export async function navigateTo(
  targetFolderId: string | null,
  targetFolderName: string | null,
  state: NavState, // Pass the whole object
  renderCurrentView: (id: string | null, path: GetPathsRes[]) => Promise<void>,
  options = { isPopState: false }
) {
  // 1. Update the Current ID
  state.currentFolderId = targetFolderId;

  // 2. Manage the Breadcrumb Array
  const pathIndex = state.breadcrumbPath.findIndex(p => p.id === targetFolderId);

  if (pathIndex !== -1) {
    // BACKWARD: User clicked a breadcrumb. 
    // .splice(index) modifies the array in place, keeping the reference alive.
    state.breadcrumbPath.splice(pathIndex + 1); 
  } else {
    // FORWARD: User clicked a folder in the grid
    if (targetFolderId === null) {
      state.breadcrumbPath.length = 0; // Clear array
      state.breadcrumbPath.push({ id: null, name: ROOT_FOLDER });
    } else if (targetFolderName) {
      state.breadcrumbPath.push({ id: targetFolderId, name: targetFolderName });
    }
  }

  // 3. Sync the Browser URL
  if (!options.isPopState) {
    updateUrlWithId(targetFolderId || '');
  }

  // 4. Trigger the UI Render
  await renderCurrentView(state.currentFolderId, state.breadcrumbPath);
}
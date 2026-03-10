import renderGrid from "../components/_grid";
import { Row, Folder } from "../models/entity";

const ready = (fn: ()=> void) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};
export default ready;

export const navigateToFolder = (
  folder: Folder,
  isBack: boolean = false,
  currentFolder: Folder | null = null,
  navigationHistory: Folder[] = [],
): void => {
  if (!isBack && currentFolder && currentFolder !== folder) {
    navigationHistory.push(currentFolder);
  }

  currentFolder = folder;

  // --- NEW: Interactive Breadcrumb Generator ---
  const pathDisplay = document.getElementById('folder-path-display');
  if (pathDisplay) {
    // 1. Always start with the Root (Documents)
    let breadcrumbsHTML = `<span class="m-breadcrumb is-clickable" onclick="navigateFromBreadcrumb('/')">Documents</span>`;

    // 2. If we are deep in a folder, split the path and build the links
    if (folder.path !== '/') {
      const segments = folder.path
        .split('/')
        .filter((s: string) => s.length > 0);
      let buildPath = '';

      segments.forEach((segment: string) => {
        buildPath += `/${segment}`; // Reconstruct the path step-by-step (e.g., /CAS, then /CAS/Finance)
        breadcrumbsHTML += ` <span class="m-breadcrumb-separator"><i class="fas fa-chevron-right small"></i></span> `;
        breadcrumbsHTML += `<span class="m-breadcrumb is-clickable" onclick="navigateFromBreadcrumb('${buildPath}')">${segment}</span>`;
      });
    }

    pathDisplay.innerHTML = breadcrumbsHTML;
  }
  // ---------------------------------------------

  const combinedItems: Row[] = [
    ...folder.subFolders,
    ...folder.files,
  ];

  renderGrid(combinedItems);
};
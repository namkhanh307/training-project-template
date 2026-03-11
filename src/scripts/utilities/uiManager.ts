import { Row, File, Folder } from '../models/entity';
import { getFileIconHTML } from './_helper';
import { saveToStorage } from './_storageUtil';
import { getRelativeTime } from './_helper';
import { generateBreadcrumbPath } from './_navigate';
export class UIManager {
  /**
   * RefreshUI
   * @param currentFolderId
   * @param allFolders
   * @param allFiles
   */
  static async refreshUI(
    currentFolderId: string,
    allFolders: Record<string, Folder>,
    allFiles: Record<string, File>,
  ) {
    UIManager.renderLoadingState();
    await new Promise((resolve) => setTimeout(resolve, 400));

    // 1. FILTER: Search the dictionaries for items belonging to this folder
    // Object.values() turns our flat dictionary into an array we can filter
    const currentSubFolders = Object.values(allFolders).filter(
      (folder) => folder.parentId === currentFolderId,
    );

    const currentSubFiles = Object.values(allFiles).filter(
      (file) => file.parentId === currentFolderId,
    );

    // 2. Combine folders and files into one array for the grid
    const allItems = [...currentSubFolders, ...currentSubFiles];

    // 3. Sort the array dynamically
    allItems.sort((a, b) => {
      // Rule A: Group Folders First (Using our new 'type' property!)
      const isFolderA = a.type === 'folder' ? 1 : 0;
      const isFolderB = b.type === 'folder' ? 1 : 0;

      if (isFolderA !== isFolderB) {
        return isFolderB - isFolderA; // Puts folders (1) before files (0)
      }

      // Rule B: Sort by Newest Modified Date
      const dateA = new Date(a.modified).getTime();
      const dateB = new Date(b.modified).getTime();

      // Fallback for old data: treat invalid dates as '0' (oldest possible)
      const validDateA = isNaN(dateA) ? 0 : dateA;
      const validDateB = isNaN(dateB) ? 0 : dateB;

      return validDateB - validDateA; // Descending order (Newest first)
    });

    // 4. Render the newly sorted array
    UIManager.renderGrid(allItems);
  }
  static saveAndRefresh(
    currentFolderId: string,
    allFolders: Record<string, Folder>,
    allFiles: Record<string, File>,
  ) {
    saveToStorage(allFolders, allFiles);
    this.refreshUI(currentFolderId, allFolders, allFiles);
  }
  static renderGrid = (data: Row[]): void => {
    const container = document.getElementById('item-container');
    if (!container) return;
    if (!data || data.length === 0) {
      container.innerHTML =
        '<p class="mt-4 text-center">No items to display</p>';
      return;
    }

    container.innerHTML = data
      .map((item) => {
        const isFolder = 'subFolders' in item;
        const file = item as File;
        const folderItem = item as Folder;

        const nameDisplay = folderItem.isEditing
          ? `<input type="text" id="new-folder-input" class="m-input-rename" value="${folderItem.name}" />`
          : item.name;

        return `
        <div class="m-table-row m-table-row--interactive"
             data-action="${isFolder ? 'open-folder' : 'open-file'}"
             data-id="${item.id}"
             data-name="${item.name}">
          <div>
            ${
              isFolder
                ? `<i class="fas fa-folder m-icon-folder"></i>`
                : getFileIconHTML(file.extension)
            }
          </div>
          <div class="m-text-overlay">
            ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
            ${nameDisplay}
          </div>
          <div class="m-text-secondary">${getRelativeTime(file.modified)}</div>
          <div class="m-text-secondary">${file.modifiedBy}</div>
          <div class="d-flex gap-2 justify-content-center">
            <svg class="m-icon-custom is-clickable" data-action="edit" data-id="${item.id}" data-name="${item.name}" data-type="${isFolder ? 'folder' : 'file'}">
              <use href="src/files/icons.svg#icon-edit"></use>
            </svg>
            <svg class="m-icon-custom is-clickable" data-action="delete" data-id="${item.id}" data-name="${item.name}" data-type="${isFolder ? 'folder' : 'file'}">
              <use href="src/files/icons.svg#icon-delete"></use>
            </svg>
          </div>
        </div>
      `;
      })
      .join('');
  };
  static updateBreadcrumbs(
    containerId: string,
    currentFolderId: string,
    allFolders: Record<string, Folder>,
  ) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Get our perfect array of folders
    const pathArray = generateBreadcrumbPath(
      currentFolderId,
      allFolders,
    );

    // 2. Map them into HTML
    const html = pathArray
      .map((folder, index) => {
        const isLast = index === pathArray.length - 1;

        // If it's the folder we are currently in, just show text (not clickable)
        if (isLast) {
          return `<span class="fw-bold text-dark">${folder.name}</span>`;
        }

        // If it's a parent folder, make it a clickable link with the ID!
        return `
      <span 
        class="text-primary is-clickable" 
        data-action="navigate-breadcrumb" 
        data-id="${folder.id}"
      >
        ${folder.name}
      </span>
      <span class="mx-2 text-muted">/</span>
    `;
      })
      .join('');

    container.innerHTML = html;
  }
  static renderLoadingState = (): void => {
    const container = document.getElementById('item-container');

    const spinnerHTML = `
      <div class="d-flex justify-content-center align-items-center w-100" style="height: 200px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;

    if (container) container.innerHTML = spinnerHTML;
  };
}

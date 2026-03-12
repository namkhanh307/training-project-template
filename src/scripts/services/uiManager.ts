import { Row, File, Folder } from '../models/entity';
import { getFileIconHTML } from '../utilities/_helper';
import { saveToStorage } from '../utilities/_storageUtil';
import { getRelativeTime } from '../utilities/_helper';
import {
  getBreadcrumbPath,
} from '../utilities/_navigate';
import { BREAD_CRUMB, UNIFIED_ROW_CONTAINER } from '../utilities/_const';
import { ROW_TYPE } from '../models/enum';
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
    UIManager.renderBreadcrumbs(
      BREAD_CRUMB,
      currentFolderId,
      allFolders,
    );
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
      const isFolderA = a.type === ROW_TYPE.FOLDER ? 1 : 0;
      const isFolderB = b.type === ROW_TYPE.FOLDER ? 1 : 0;

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
    const container = document.getElementById(
      UNIFIED_ROW_CONTAINER,
    );
    if (!container) return;

    if (!data || data.length === 0) {
      container.innerHTML =
        '<p class="mt-4 text-center">No items to display</p>';
      return;
    }
    container.innerHTML = data
      .map((item) => {
        // 1. THE FIX: Look at the exact 'type' string instead of guessing!
        const isFolder = item.type === ROW_TYPE.FOLDER;

        // 2. We keep these for TypeScript autocomplete, but remember
        // they are just the same 'item' object under the hood!
        const file = item as File;
        const folderItem = item as Folder;

        const nameDisplay = folderItem.isEditing
          ? `<input type="text" id="new-folder-input" class="m-input-rename" value="${folderItem.name}" />`
          : item.name;

        const iconHTML = isFolder
          ? `<i class="fas fa-folder m-icon-folder"></i>`
          : getFileIconHTML(file.extension);
        const sparkleHTML = file.isNew
          ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>`
          : '';

        return `
      <div class="m-list-row m-list-item" data-action="${isFolder ? 'open-folder' : 'open-file'}" data-id="${item.id}">
        
        <div class="m-list-cell">
          <div class="m-mobile-label d-md-none">File Type</div>
          <div class="m-cell-content">${iconHTML}</div>
        </div>

        <div class="m-list-cell">
          <div class="m-mobile-label d-md-none">Name</div>
          <div class="m-cell-content m-text-overlay">
            ${sparkleHTML} ${nameDisplay}
          </div>
        </div>

        <div class="m-list-cell">
          <div class="m-mobile-label d-md-none">Modified</div>
          <div class="m-cell-content m-text-secondary">${getRelativeTime(file.modified)}</div>
        </div>

        <div class="m-list-cell">
          <div class="m-mobile-label d-md-none">Modified By</div>
          <div class="m-cell-content m-text-secondary">${file.modifiedBy}</div>
        </div>

        <div class="m-list-cell">
          <div class="m-mobile-label d-md-none">Actions</div>
          <div class="m-cell-content d-flex gap-2 justify-content-start justify-content-md-center">
            <svg class="m-icon-custom is-clickable" data-action="edit" data-id="${item.id}" data-name="${item.name}" data-type="${isFolder ? ROW_TYPE.FOLDER : ROW_TYPE.FILE}">
              <use href="src/files/icons.svg#icon-edit"></use>
            </svg>
            <svg class="m-icon-custom is-clickable" data-action="delete" data-id="${item.id}" data-name="${item.name}" data-type="${isFolder ? ROW_TYPE.FOLDER : ROW_TYPE.FILE}">
              <use href="src/files/icons.svg#icon-delete"></use>
            </svg>
          </div>
        </div>

        <div class="d-none d-md-block"></div>
      </div>
    `;
      })
      .join('');
  };
  static renderBreadcrumbs(
    containerId: string,
    currentFolderId: string,
    allFolders: Record<string, Folder>,
  ) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const pathArray = getBreadcrumbPath(currentFolderId, allFolders);
    const html = pathArray
      .map((folder, index) => {
        const isLast = index === pathArray.length - 1;
        const isRoot = index === 0 && folder.parentId === null; // Or whatever your root logic is

        // UX Upgrade: The current folder is bold text, NOT a clickable link
        if (isLast) {
          return `
        <span class="d-inline-flex align-items-center" aria-current="page">
          ${folder.name}
        </span>
      `;
        }

        // Previous folders are clickable links!
        return `
      <span 
        class="d-inline-flex align-items-center" aria-current="page"
        style="cursor: pointer;"
        data-action="open-folder" 
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
    const container = document.getElementById(
      UNIFIED_ROW_CONTAINER,
    );

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

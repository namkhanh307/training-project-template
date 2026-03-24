import { getFileIconHTML } from '../utilities/_helper';
import { getRelativeTime } from '../utilities/_helper';
import {
  UNIFIED_ROW_CONTAINER,
} from '../utilities/_const';
import { getItems } from './apiService';
import { ItemType } from '../models/enum';
import { Item } from '../models/entity';
export class UIManager {
  /**
   * RefreshUI
   * @param currentFolderId
   * @param allFolders
   * @param allFiles
   */
  static async refreshUI(folderId: string | null) {
    UIManager.closeMobileMenu();
    UIManager.renderLoadingState();

    try {
      // 1. FETCH: Get ONLY the items for this specific folder from the API
      // Note: Assuming fetchFolderContents is the API call we discussed earlier
      const response = await getItems(folderId);
      const allItems = response.list; // The array from your API payload
      console.log(allItems);
      // 2. SORT: Apply your exact sorting logic dynamically
      allItems.sort((a, b) => {
        // Group Folders First
        const isFolderA = a.type === ItemType.Folder ? 1 : 0;
        const isFolderB = b.type === ItemType.Folder ? 1 : 0;

        if (isFolderA !== isFolderB) {
          return isFolderB - isFolderA;
        }

        // Sort by Newest Modified Date
        const dateA = new Date(a.modified).getTime();
        const dateB = new Date(b.modified).getTime();

        const validDateA = isNaN(dateA) ? 0 : dateA;
        const validDateB = isNaN(dateB) ? 0 : dateB;

        return validDateB - validDateA;
      });

      // 3. RENDER: The grid is now populated with fresh server data
      UIManager.renderGrid(allItems);
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      const container = document.getElementById(
        UNIFIED_ROW_CONTAINER,
      );
      if (container) {
        container.innerHTML =
          '<p class="mt-4 text-center text-danger">Failed to load folder contents.</p>';
      }
    }
  }

  static renderGrid = (data: Item[]): void => {
    const container = document.getElementById(UNIFIED_ROW_CONTAINER);
    if (!container) return;

    if (!data || data.length === 0) {
      container.innerHTML =
        '<p class="mt-4 text-center">No items to display</p>';
      return;
    }
    container.innerHTML = data
      .map((item) => {
        // 1. THE FIX: Look at the exact 'type' string instead of guessing!
        const isFolder = item.type === ItemType.Folder;
        // 2. We keep these for TypeScript autocomplete, but remember
        // they are just the same 'item' object under the hood!

        const fileNameDisplay =
          item.extension === ''
            ? item.name
            : `${item.name}${item.extension}`;
        const nameDisplay = isFolder
          ? `${item.name}`
          : fileNameDisplay;

        const iconHTML = isFolder
          ? `<i class="fas fa-folder m-icon-folder"></i>`
          : getFileIconHTML(item.extension);
        const sparkleHTML = true
          ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>`
          : '';

        return `
      <div class="m-list-row m-list-item" data-action="${isFolder ? 'open-folder' : 'open-file'}" data-id="${item.id}" data-name="${item.name}">
        
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
          <div class="m-cell-content m-text-secondary">${getRelativeTime(item.modified)}</div>
        </div>

        <div class="m-list-cell">
          <div class="m-mobile-label d-md-none">Modified By</div>
          <div class="m-cell-content m-text-secondary">${item.modifiedBy}</div>
        </div>

        <div class="m-list-cell">
          <div class="m-mobile-label d-md-none">Actions</div>
          <div class="m-cell-content d-flex gap-2 justify-content-start justify-content-md-center">
            <svg class="m-icon-custom is-clickable" data-action="edit" data-id="${item.id}" data-name="${item.name}" data-type="${isFolder ? ItemType.Folder : ItemType.File}">
              <use href="src/files/icons.svg#icon-edit"></use>
            </svg>
            <svg class="m-icon-custom is-clickable" data-action="delete" data-id="${item.id}" data-name="${item.name}" data-type="${isFolder ? ItemType.Folder : ItemType.File}">
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
  // Note: pathArray is now passed in directly from your app's state
  static renderBreadcrumbs(
    containerId: string,
    pathArray: { id: string | null; name: string }[],
  ) {
    const container = document.getElementById(containerId);
    if (!container) return;
        //console.log("navigate to root", pathArray[0].id)

    const html = pathArray
      .map((folder, index) => {
        const isLast = index === pathArray.length - 1;
        console.log("navigate to root", folder.id)
        if (isLast) {
          return `
            <span class="d-inline-flex align-items-center fw-bold" aria-current="page">
              ${folder.name}
            </span>
          `;
        }
        return `
          <span 
            class="d-inline-flex align-items-center fw-bold" aria-current="page"" 
            style="cursor: pointer;"
            data-action="open-folder" 
            data-name="${folder.name}"
            data-id="${folder.id || ''}"
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
    const container = document.getElementById(UNIFIED_ROW_CONTAINER);

    const spinnerHTML = `
      <div class="d-flex justify-content-center align-items-center w-100" style="height: 200px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;

    if (container) container.innerHTML = spinnerHTML;
  };
  //Close mobile modal
  static closeMobileMenu() {
    const unifiedMenu = document.getElementById('unifiedMenu');

    // Check if the menu is actually open (Bootstrap adds the 'show' class when it is open)
    if (unifiedMenu && unifiedMenu.classList.contains('show')) {
      // Find the hamburger button that controls this exact menu
      const togglerBtn = document.querySelector(
        '[data-bs-target="#unifiedMenu"]',
      ) as HTMLButtonElement;

      // Programmatically click it to trigger Bootstrap's smooth closing animation!
      if (togglerBtn) {
        togglerBtn.click();
      }
    }
  }
  /**
   * Executes an API call (Create/Update/Delete) and refreshes the current folder view.
   * @param apiAction A promise representing the API call (e.g., deleteItem(id))
   * @param currentFolderId The folder currently being viewed
   */
  static async executeActionAndRefresh(
    apiAction: Promise<any>,
    currentFolderId: string | null,
  ) {
    UIManager.renderLoadingState(); // Show spinner while saving
    try {
      await apiAction; // Wait for the backend to confirm the change
      await this.refreshUI(currentFolderId); // Re-fetch the updated folder contents
    } catch (error) {
      console.error('Action failed:', error);
      alert('Something went wrong. Please try again.');
      await this.refreshUI(currentFolderId); // Reload anyway to ensure UI matches DB
    }
  }
}

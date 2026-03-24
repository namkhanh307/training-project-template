import { CreateFileModal } from '../models/modals/createFileModal';
import { CreateFolderModal } from '../models/modals/createFolderModal';
import { DeleteModal } from '../models/modals/deleteModal';
import { FileViewerModal } from '../models/modals/fileViewerModal';
import { RenameModal } from '../models/modals/renameModal';
import { BREAD_CRUMB } from '../utilities/_const';
import {
  getIdFromUrl,
  updateUrlWithId,
} from '../utilities/_navigate';
import { UIManager } from './uiManager';
import {
  processFileSelection,
  triggerUpload,
} from '../utilities/_helper';
import { ROW_TYPE } from '../models/enum';

export class FileExplorer {
  // 1. STATE DIET: We removed the giant dictionaries!
  private _currentFolderId: string | null = null;

  // 2. NEW STATE: We track the path manually since we don't have all folders in memory.
  private _breadcrumbPath: { id: string | null; name: string }[] = [];

  constructor() {
    // 1. ROUTING: Figure out where we are starting!
    const idFromUrl = getIdFromUrl();

    if (idFromUrl) {
      this._currentFolderId = idFromUrl;
      // DEEP LINK FALLBACK: If a user refreshes the page on a nested folder,
      // we don't know the exact path. We stub it out for now.
      this._breadcrumbPath = [
        { id: null, name: 'Root' },
        { id: idFromUrl, name: 'Current Folder' },
      ];
    } else {
      // Fallback to the Root folder! (null represents root in our new API logic)
      this._currentFolderId = null;
      this._breadcrumbPath = [{ id: null, name: 'Root' }];
      updateUrlWithId(''); // Clear URL for root
    }

    // 2. LISTENERS: Attach your UI click events
    this.setupEventListeners();

    // 3. THE BACK BUTTON: Listen for browser navigation (popstate)
    window.addEventListener('popstate', () => {
      // When the user clicks Back, the URL changes. Read the new ID!
      const poppedId = getIdFromUrl() || null;

      // Trigger our new central navigation method (pass true to indicate it's a browser "back" action)
      this.navigateTo(poppedId, null, true);
    });

    // 4. INITIAL RENDER: Draw the screen for the first time
    this.renderCurrentView();
  }

  /**
   * The new central hub for moving around the app.
   */
  public async navigateTo(
    folderId: string | null,
    folderName: string | null,
    isPopState = false,
  ) {
    this._currentFolderId = folderId;

    if (!isPopState) {
      // FORWARD NAVIGATION: User clicked a folder in the UI
      if (folderId === null) {
        this._breadcrumbPath = [{ id: null, name: 'Root' }];
      } else if (folderName) {
        this._breadcrumbPath.push({ id: folderId, name: folderName });
      }
      // Push the new ID to the browser URL bar
      updateUrlWithId(folderId || '');
    } else {
      // BACKWARD NAVIGATION: User clicked the browser's Back button or a Breadcrumb
      // Slice the breadcrumb array back to the point they navigated to
      const pathIndex = this._breadcrumbPath.findIndex(
        (p) => p.id === folderId,
      );
      if (pathIndex !== -1) {
        this._breadcrumbPath = this._breadcrumbPath.slice(
          0,
          pathIndex + 1,
        );
      } else {
        // Safe fallback if history gets weird
        this._breadcrumbPath = [{ id: null, name: 'Root' }];
      }
    }

    // Redraw the screen!
    await this.renderCurrentView();
  }

  /**
   * Renders the current state to the DOM
   */
  private async renderCurrentView() {
    // 1. Draw the Grid (This is now async and fetches data inside the UIManager!)
    await UIManager.refreshUI(this._currentFolderId);

    // 2. Draw the Breadcrumbs (Passing the history stack directly)
    UIManager.renderBreadcrumbs(BREAD_CRUMB, this._breadcrumbPath);
  }
  private setupEventListeners() {
    this.initToolbarEvents();
    this.initGridEvents();
    //this.initUploadListener();
  }

  private initToolbarEvents() {
    const desktopToolbar = document.querySelector('.l-toolbar');
    const fileInput = document.getElementById(
      'fileInput',
    ) as HTMLInputElement;

    desktopToolbar?.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.action;
      const newMenu = document.getElementById('newOptionsMenu');

      switch (action) {
        case 'upload-file':
          // triggerUpload now needs to handle an API POST
          triggerUpload();
          UIManager.closeMobileMenu();
          break;

        case 'toggle-new-menu':
          if (newMenu) {
            newMenu.style.display =
              newMenu.style.display === 'block' ? 'none' : 'block';
          }
          break;

        case 'trigger-new-folder':
          if (newMenu) newMenu.style.display = 'none';

          // Refactored Modal: Only needs current ID and a callback to refresh the UI
          const newFolderModal = new CreateFolderModal(
            this._currentFolderId,
            () => this.renderCurrentView(),
          );
          newFolderModal.open();
          break;

        case 'trigger-new-file':
          if (newMenu) newMenu.style.display = 'none';

          // Refactored Modal: Only needs current ID and a callback to refresh the UI
          const newFileModal = new CreateFileModal(
            this._currentFolderId,
            () => this.renderCurrentView(),
          );
          newFileModal.open();
          break;
      }
    });

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-action="toggle-new-menu"]')) {
        const menu = document.getElementById('newOptionsMenu');
        if (menu) menu.style.display = 'none';
      }
    });

    fileInput?.addEventListener('change', (event) => {
      // processFileSelection now needs to handle an API POST
      processFileSelection(this._currentFolderId, '112d268e-9c46-485d-b4a2-2ad8e5569d81', event, () =>
        this.renderCurrentView(),
      );
    });
  }
  private initGridEvents() {
    const mainContainer = document.querySelector('.l-main-container');

    mainContainer?.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      event.stopPropagation();

      const action = target.dataset.action;
      const itemId = target.dataset.id || null;
      // Extract the name from the DOM so we can push it to the breadcrumb stack!
      const itemName = target.dataset.name || 'Unknown';
      const isFolder = target.dataset.type === ROW_TYPE.FOLDER;

      switch (action) {
        case 'open-folder':
          if (itemId) {
            // ALL of your old URL/State logic is now handled by this one clean method
            await this.navigateTo(itemId, itemName);
          }
          break;

        case 'open-file':
          if (itemId) {
            // Note: If you have a "remove new shiny dot" requirement,
            // you will need to trigger a PUT/PATCH request to the API here
            // to update the file's 'isNew' status before opening the modal.

            // Refactored Modal: Now fetches the file's data from the API by ID
            const fileViewer = new FileViewerModal(itemId);
            fileViewer.open();
          }
          break;

        case 'delete':
          if (itemId) {
            // We pass the itemName we grabbed from target.dataset.name
            const deleteModal = new DeleteModal(
              itemId,
              itemName,
              isFolder,
              () => this.renderCurrentView(),
            );
            deleteModal.open();
          }
          break;

        case 'edit':
          if (itemId) {
            // RenameModal will also need the current name to pre-fill the input!
            const renameModal = new RenameModal(
              itemId,
              itemName,
              isFolder,
              () => this.renderCurrentView(),
            );
            renameModal.open();
          }
          break;
      }
    });
  }
  // private initUploadListener() {
  //   const fileInput = document.getElementById(
  //     'fileInput',
  //   ) as HTMLInputElement;
  //   if (!fileInput) return;

  //   // Remove any existing listener to prevent doubling up
  //   fileInput.onchange = null;

  //   // Attach the listener
  //   fileInput.onchange = (event: Event) => {
  //     processFileSelection(
  //       this._currentFolderId,
  //       this._allFolders,
  //       this._allFiles,
  //       () =>
  //         UIManager.refreshUI(
  //           this._currentFolderId,
  //           this._allFolders,
  //           this._allFiles,
  //         ),
  //       event,
  //     );
  //   };
  // }
}

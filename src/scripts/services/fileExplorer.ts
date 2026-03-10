import { Folder, File } from '../models/entity';
import { rootFolder } from '../utilities/_initData';
import { closeModal } from '../utilities/_modal';
import {
  getPathFromUrl,
  handleFolderClick,
  navigateFromBreadcrumb,
  updateUrlPath,
} from '../utilities/_navigate';
import {
  loadFromStorage,
  saveToStorage,
} from '../utilities/_storageUtil';
import { UIManager } from '../utilities/uiManager';
import {
  deleteItem,
  downloadFile,
  handleFileClick,
  openMobileOptionsSheet,
  openNewFolderMobile,
  openRenameModal,
  processFileSelection,
  submitNewFolderMobile,
  submitRename,
  triggerUpload,
} from './crud';
import { createNewFolderDesktop, saveFolderName } from './crud';

export class FileExplorer {
  _rootFolder: Folder;
  _currentFolder: Folder;
  _navigationHistory: Folder[] = [];
  //State for modals
  private _editingItemState = { oldName: '', isFolder: false };
  private _mobileActionItem = { name: '', isFolder: false };

  constructor() {
    this._rootFolder = loadFromStorage(rootFolder);
    const initialPath = getPathFromUrl();
    this._currentFolder = navigateFromBreadcrumb(
      this._rootFolder,
      initialPath,
    );
    // Setup event listeners once when the app starts
    this.setupEventListeners();

    // Initial Render
    () => UIManager.refreshUI(this._currentFolder);
    UIManager.updateBreadcrumbs(
      'folder-path-display',
      this._currentFolder,
    );
    window.addEventListener('popstate', () => {
      const path = getPathFromUrl();
      this._currentFolder = navigateFromBreadcrumb(
        this._rootFolder,
        path,
      );
      UIManager.refreshUI(this._currentFolder);
      UIManager.updateBreadcrumbs(
        'folder-path-display',
        this._currentFolder,
      );
    });
  }

  // A handy helper to keep your code DRY (Don't Repeat Yourself)

  private setupEventListeners() {
    this.initToolbarEvents();
    this.initGridEvents();
    this.initModalEvents();
    this.initBreadcrumbEvents();
    this.initMobileMenuEvents();
  }

  private initToolbarEvents() {
    const desktopToolbar = document.querySelector('.l-toolbar');
    const fileInput = document.getElementById(
      'fileInput',
    ) as HTMLInputElement;

    // 1. Router for all Toolbar Clicks
    desktopToolbar?.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.action;

      switch (action) {
        case 'new-folder':
          await createNewFolderDesktop(this._currentFolder, () =>
            UIManager.refreshUI(this._currentFolder),
          );
          break;
        case 'upload-file':
          triggerUpload();
          break;
      }
    });

    // 2. Listener for the Hidden File Input
    fileInput?.addEventListener(
      'change',
      processFileSelection.bind(
        this,
        this._rootFolder,
        this._currentFolder,
        () => UIManager.refreshUI(this._currentFolder),
      ),
    );
  }
  private initGridEvents() {
    // We attach one listener to the main container that holds both grids
    const mainContainer = document.querySelector('.l-main-container');

    mainContainer?.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      event.stopPropagation(); // Prevent clicks from bubbling up to parent rows

      const action = target.dataset.action;
      const itemName = target.dataset.name;
      const isFolder = target.dataset.type === 'folder';

      switch (action) {
        case 'open-folder':
          if (itemName) {
            // Overwrite the class state with the newly returned folder!
            this._currentFolder = handleFolderClick(
              this._navigationHistory,
              this._currentFolder,
              itemName,
            );
          }
          break;
        case 'open-file':
          if (itemName)
            handleFileClick(this._currentFolder, itemName);
          break;
        case 'delete':
          if (itemName)
            deleteItem(this._currentFolder, itemName, isFolder);
          break;
        case 'edit':
          if (itemName)
            openRenameModal(
              this._editingItemState,
              itemName,
              isFolder,
            );
          break;
        case 'mobile-options':
          if (itemName) openMobileOptionsSheet(itemName, isFolder);
          break;
      }
    });

    // Handle pressing Enter to save folder
    mainContainer?.addEventListener(
      'keyup',
      (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          const target = event.target as HTMLElement;
          if (target.id === 'new-folder-input') {
            target.blur(); // Triggers the focusout event below
          }
        }
      },
    );

    // Handle input blur to save folder
    mainContainer?.addEventListener('focusout', (event) => {
      const target = event.target as HTMLElement;
      if (target.id === 'new-folder-input') {
        saveFolderName(
          this._currentFolder,
          target as HTMLInputElement,
        );
      }
    });
  }
  private initModalEvents() {
    // We attach one listener to the body to catch ALL modal clicks
    document.body.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-modal-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.modalAction;

      switch (action) {
        // --- Rename Modal ---
        case 'submit-rename':
          submitRename(this._editingItemState, this._currentFolder);
          break;
        case 'close-rename':
          closeModal('renameModal');
          break;

        // --- Mobile Options Sheet ---
        case 'trigger-mobile-rename':
          closeModal('mobileOptionsModal');
          openRenameModal(
            this._editingItemState,
            this._mobileActionItem.name,
            this._mobileActionItem.isFolder,
          );
          break;
        case 'trigger-mobile-delete':
          closeModal('mobileOptionsModal');
          deleteItem(
            this._currentFolder,
            this._mobileActionItem.name,
            this._mobileActionItem.isFolder,
          );
          break;
        case 'close-mobile-options':
          closeModal('mobileOptionsModal');
          break;

        // --- File Viewer Modal ---
        case 'download-file':
          const fileName =
            document.getElementById('modalFileName')?.innerText;
          if (fileName) downloadFile(this._currentFolder, fileName);
          break;
        case 'close-file-modal':
          closeModal('fileModal');
          break;

        // --- New Folder Modal (Mobile) ---
        case 'submit-new-folder':
          submitNewFolderMobile(this._currentFolder);
          break;
        case 'close-new-folder':
          closeModal('newFolderModal');
          break;
      }
    });

    // Optional: Pressing "Enter" in the Rename or New Folder inputs
    document.body.addEventListener(
      'keypress',
      (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          const target = event.target as HTMLElement;
          if (target.id === 'renameInput') {
            event.preventDefault();
            submitRename(this._editingItemState, this._currentFolder);
          } else if (target.id === 'newFolderNameInput') {
            event.preventDefault();
            submitNewFolderMobile(this._currentFolder); // Assuming you migrated your submitNewFolder logic!
          }
        }
      },
    );
  }
  private initBreadcrumbEvents() {
    const pathDisplay = document.getElementById(
      'folder-path-display',
    );

    pathDisplay?.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-path]',
      ) as HTMLElement;
      if (!target || !target.dataset.path) return;

      // 1. Calculate the new folder
      this._currentFolder = navigateFromBreadcrumb(
        this._rootFolder,
        target.dataset.path,
      );

      // 2. Update the URL visually
      updateUrlPath(this._currentFolder.path || '/');

      // 3. Render BOTH the grid and the breadcrumbs! (Removed arrow function)
      UIManager.refreshUI(this._currentFolder);
      UIManager.updateBreadcrumbs(
        'folder-path-display',
        this._currentFolder,
      );
    });
  }
  private initMobileMenuEvents() {
    const mobileMenuList = document.querySelector('.m-mobile-list');

    mobileMenuList?.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.action;

      switch (action) {
        case 'new-folder':
          openNewFolderMobile();
          break;
        case 'upload-file':
          triggerUpload(); // Reuses the exact same method as desktop!
          break;
        // You can easily wire up sync/export here later
      }
    });
  }
}

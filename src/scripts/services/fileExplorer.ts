import { Folder, File } from '../models/entity';
import { EditingState, MobileActionItem } from '../models/model';
import { ROOT_FOLDER_ID } from '../utilities/_const';
import { initFiles, initFolders } from '../utilities/_initData';
import { closeModal, openNewFileModal } from '../utilities/_modal';
import {
  getIdFromUrl,
  handleFolderClick,
  updateUrlWithId,
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
  submitNewFile,
  submitNewFolderMobile,
  submitRename,
  triggerUpload,
} from './crud';
import { createNewFolderDesktop, saveFolderName } from './crud';

export class FileExplorer {
  private _allFolders: Record<string, Folder> = initFolders;
  private _allFiles: Record<string, File> = initFiles;
  private _currentFolderId: string;
  // _rootFolder: Folder;
  // _currentFolder: Folder;
  // _navigationHistory: Folder[] = [];
  //State for modals
  private _editingItemState: EditingState = {
    id: '',
    oldName: '',
    isFolder: false,
  };
  private _mobileActionItem: MobileActionItem = {
    id: '',
    name: '',
    isFolder: false,
  };

  constructor() {
    // 1. Load the flat hashmaps from the hard drive
    const savedData = loadFromStorage();

    // 2. Assign them to your class properties
    this._allFolders = savedData.folders;
    this._allFiles = savedData.files;

    // 2. ROUTING: Figure out where we are starting!
    const idFromUrl = getIdFromUrl(); // e.g., returns 'fin-456' or null

    // If the URL has an ID AND that folder actually exists in our database...
    if (idFromUrl && this._allFolders[idFromUrl]) {
      this._currentFolderId = idFromUrl;
    } else {
      // Otherwise, fallback to the Root folder!
      // (Make sure 'ROOT_FOLDER_ID' matches the actual ID you gave your Root folder)
      this._currentFolderId = ROOT_FOLDER_ID;
      updateUrlWithId(this._currentFolderId); // Fix the URL bar
    }

    // 3. LISTENERS: Attach your UI click events
    this.setupEventListeners();

    // 4. THE BACK BUTTON: Listen for browser navigation (popstate)
    window.addEventListener('popstate', () => {
      // When the user clicks Back, the URL changes. Read the new ID!
      const poppedId = getIdFromUrl() || ROOT_FOLDER_ID;

      if (this._allFolders[poppedId]) {
        this._currentFolderId = poppedId;
        this.renderCurrentView(); // Redraw everything!
      }
    });

    // 5. INITIAL RENDER: Draw the screen for the first time
    this.renderCurrentView();
  }
  private renderCurrentView() {
    // 1. Draw the Grid
    UIManager.refreshUI(
      this._currentFolderId,
      this._allFolders,
      this._allFiles,
    );

    // // 2. Draw the Breadcrumbs
    // updateBreadcrumbs(
    //   'folder-path-display',
    //   this._currentFolderIdId,
    //   this._allFolders,
    // );
  }
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
      const newMenu = document.getElementById('newOptionsMenu');
      switch (action) {
        case 'upload-file':
          triggerUpload();
          break;
        case 'toggle-new-menu':
          // Toggle the dropdown visibility
          if (newMenu) {
            newMenu.style.display =
              newMenu.style.display === 'block' ? 'none' : 'block';
          }
          break;

        case 'trigger-new-folder':
          // 1. Hide the menu
          if (newMenu) newMenu.style.display = 'none';
          // 2. Call your existing inline folder creation method!
          createNewFolderDesktop(this._currentFolderId,
              this._allFolders,
             () =>
            UIManager.refreshUI(
              this._currentFolderId,
              this._allFolders,
              this._allFiles,
            ),
          );
          break;

        case 'trigger-new-file':
          // 1. Hide the menu
          if (newMenu) newMenu.style.display = 'none';
          // 2. Open the new file modal
          openNewFileModal();
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
    // 2. Listener for the Hidden File Input
    fileInput?.addEventListener('change', (event) => {
      processFileSelection(
        this._currentFolderId,
        this._allFolders,
        this._allFiles,
        () =>
          UIManager.refreshUI(
            this._currentFolderId,
            this._allFolders,
            this._allFiles,
          ),
        event,
      );
    });
  }
  private initGridEvents() {
    const mainContainer = document.querySelector('.l-main-container');

    mainContainer?.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      event.stopPropagation(); // Prevent clicks from bubbling up to parent rows

      const action = target.dataset.action;
      const itemId = target.dataset.id;
      const itemName = target.dataset.name;
      const isFolder = target.dataset.type === 'folder';

      switch (action) {
        case 'open-folder':
          if (itemName) {
            // Overwrite the class state with the newly returned folder!
            this._currentFolderId = handleFolderClick(
              itemId,
              this._allFolders,
            );
          }
          break;
        case 'open-file':
          if (itemId) handleFileClick(this._allFolders, this._allFiles, itemId);
          break;
        case 'delete':
          if (itemId)
            deleteItem(itemId, isFolder, this._allFolders, this._allFiles);
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
          if (itemName)
            openMobileOptionsSheet(
              itemId,
              itemName,
              isFolder,
              this._mobileActionItem,
            );
          break;
      }
    });

    // Handle typing in the input box
    mainContainer?.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        const target = event.target as HTMLInputElement;

        if (target.id === 'new-folder-input') {
          if (event.key === 'Enter') {
            event.preventDefault(); // Stop the enter key from doing anything else
            saveFolderName(this._currentFolderId, target);
          }

          // Bonus UX: Let them hit Escape to cancel!
          if (event.key === 'Escape') {
            // Revert the UI by just refreshing the grid (which wipes out the unsaved input)
            // this._currentFolderId.subFolders =
            //   this._currentFolderId.subFolders.filter(
            //     (f) => !f.isEditing,
            //   );
            UIManager.refreshUI(
              this._currentFolderId.id,
              this._allFolders,
              this._allFiles,
            );
          }
        }
      },
    );
  }
  private initModalEvents() {
    // We attach one listener to the body to catch ALL modal clicks
    document.body.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-modal-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.modalAction;

      switch (action) {
        // --- Rename Modal ---
        case 'submit-rename':
          submitRename(this._editingItemState, this._currentFolderId);
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
            this._currentFolderId,
            this._mobileActionItem.id,
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
          if (fileName) downloadFile(this._currentFolderId, fileName);
          break;
        case 'close-file-modal':
          closeModal('fileModal');
          break;

        // --- New Folder Modal (Mobile) ---
        case 'submit-new-folder':
          submitNewFolderMobile(this._currentFolderId);
          break;
        case 'close-new-folder':
          closeModal('newFolderModal');
          break;
        case 'submit-new-file':
          submitNewFile(this._currentFolderId);
          break;
        case 'close-new-file':
          closeModal('newFileModal');
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
            submitRename(this._editingItemState, this._currentFolderId);
          } else if (target.id === 'newFolderNameInput') {
            event.preventDefault();
            submitNewFolderMobile(this._currentFolderId); // Assuming you migrated your submitNewFolder logic!
          } else if (target.id === 'newFileNameInput') {
            event.preventDefault();
            submitNewFile(this._currentFolderId);
          }
        }
      },
    );
  }
  private initBreadcrumbEvents() {
    const pathDisplay = document.getElementById(
      'folder-path-display',
    );

    // pathDisplay?.addEventListener('click', (event) => {
    //   const target = (event.target as HTMLElement).closest(
    //     '[data-path]',
    //   ) as HTMLElement;
    //   if (!target || !target.dataset.path) return;

    //   // 1. Calculate the new folder
    //   this._currentFolderId = navigateFromBreadcrumb(
    //     this._rootFolder,
    //     target.dataset.path,
    //   );

    //   // 2. Update the URL visually
    //   updateUrlPath(this._currentFolderId.path || '/');

    //   // 3. Render BOTH the grid and the breadcrumbs! (Removed arrow function)
    //   UIManager.refreshUI(
    //     this._currentFolderId.id,
    //     this._allFolders,
    //     this._allFiles,
    //   );
    //   UIManager.updateBreadcrumbs(
    //     'folder-path-display',
    //     this._currentFolderId.id,
    //     this._allFolders,
    //   );
    // });
  }
  private initMobileMenuEvents() {
    const mobileMenuList = document.querySelector('.m-mobile-list');

    mobileMenuList?.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.action;
      const mobileNewMenu = document.getElementById(
        'newOptionsMenuMobile',
      );

      switch (action) {
        // --- NEW DROPDOWN TOGGLE ---
        case 'toggle-new-menu-mobile':
          if (mobileNewMenu) {
            // Check if it's currently showing block, if so, hide it. Otherwise, show it.
            const isShowing =
              window.getComputedStyle(mobileNewMenu).display ===
              'block';
            mobileNewMenu.style.display = isShowing
              ? 'none'
              : 'block';
          }
          break;

        // --- OPTION 1: NEW FOLDER ---
        case 'trigger-new-folder-mobile':
          if (mobileNewMenu) mobileNewMenu.style.display = 'none'; // Hide dropdown
          openNewFolderMobile(); // Trigger your existing function
          break;

        // --- OPTION 2: NEW FILE ---
        case 'trigger-new-file-mobile':
          if (mobileNewMenu) mobileNewMenu.style.display = 'none'; // Hide dropdown

          // 1. Hide the Bootstrap mobile sidebar drawer
          document
            .getElementById('mobileMenu')
            ?.classList.remove('show');

          // 2. Open the file modal (Assuming this is inside FileExplorer.ts)
          openNewFileModal();
          break;

        // --- UPLOAD ---
        case 'upload-file':
          triggerUpload();
          break;
      }
    });
  }
}

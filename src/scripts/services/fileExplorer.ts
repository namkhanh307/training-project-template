import { Folder, File } from '../models/entity';
import { CreateFileModal } from '../models/modals/createFileModal';
import { CreateFolderModal } from '../models/modals/createFolderModal';
import { DeleteModal } from '../models/modals/deleteModal';
import { FileViewerModal } from '../models/modals/fileViewerModal';
import { RenameModal } from '../models/modals/renameModal';
import { EditingState, MobileActionItem } from '../models/model';
import { ROOT_FOLDER_ID } from '../utilities/_const';
import { initFiles, initFolders } from '../utilities/_initData';
import { closeModal, openNewFileModal } from '../utilities/_modal';
import {
  getIdFromUrl,
  handleFolderClick,
  updateUrlWithId,
} from '../utilities/_navigate';
import { loadFromStorage } from '../utilities/_storageUtil';
import { UIManager } from '../utilities/uiManager';
import {
  deleteItem,
  downloadFile,
  handleFileClick,
  openMobileOptionsSheet,
  openRenameModal,
  processFileSelection,
  triggerUpload,
} from './crud';
import { createNewFolderDesktop, submitNewFolder } from './crud';

export class FileExplorer {
  private _allFolders: Record<string, Folder> = initFolders;
  private _allFiles: Record<string, File> = initFiles;
  private _currentFolderId: string;
  private _activeFileId: string | null = null; 
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

        // case 'trigger-new-folder':
        //   // 1. Hide the menu
        //   if (newMenu) newMenu.style.display = 'none';
        //   // 2. Call your existing inline folder creation method!
        //   createNewFolderDesktop(
        //     this._currentFolderId,
        //     this._allFolders,
        //     () =>
        //       UIManager.refreshUI(
        //         this._currentFolderId,
        //         this._allFolders,
        //         this._allFiles,
        //       ),
        //   );
        //   break;

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
            UIManager.refreshUI(
              this._currentFolderId,
              this._allFolders,
              this._allFiles,
            );
          }
          break;
        case 'open-file':
          if (itemId)
            handleFileClick(this._allFolders, this._allFiles, itemId);
          break;
        case 'delete':
          if (itemId) {
            deleteItem(
              itemId,
              isFolder,
              this._allFolders,
              this._allFiles,
            );
            UIManager.saveAndRefresh(
              this._currentFolderId,
              this._allFolders,
              this._allFiles,
            );
          }
          break;
        case 'edit':
          if (itemId && itemName) {
            openRenameModal(
              this._editingItemState,
              itemId,
              itemName,
              isFolder,
            );
            UIManager.saveAndRefresh(
              this._currentFolderId,
              this._allFolders,
              this._allFiles,
            );
          }
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
            submitNewFolder(
              this._currentFolderId,
              this._allFolders,
              target,
              () =>
                UIManager.saveAndRefresh(
                  this._currentFolderId,
                  this._allFolders,
                  this._allFiles,
                ),
            );
          }

          // Bonus UX: Let them hit Escape to cancel!
          if (event.key === 'Escape') {
            // Revert the UI by just refreshing the grid (which wipes out the unsaved input)
            // this._currentFolderId.subFolders =
            //   this._currentFolderId.subFolders.filter(
            //     (f) => !f.isEditing,
            //   );
            UIManager.refreshUI(
              this._currentFolderId,
              this._allFolders,
              this._allFiles,
            );
          }
        }
      },
    );
  }
  private initModalEvents() {
    // 1. The Global Click Listener
    document.body.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-modal-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.modalAction;
      const itemId = target.dataset.id;
      const isFolder = target.dataset.type === 'folder';

      switch (action) {
        // --- Mobile Options Sheet Triggers ---
        case 'trigger-mobile-rename':
          // Close the mobile bottom sheet (Assuming this is still a separate HTML element for mobile UI)
          closeModal('mobileOptionsModal');

          // Boom. Just instantiate and open!
          const renameModal = new RenameModal(
            itemId || this._mobileActionItem.id, // Use dataset ID or fallback to state
            isFolder || this._mobileActionItem.isFolder,
            this._currentFolderId,
            this._allFolders,
            this._allFiles,
            () =>
              UIManager.saveAndRefresh(
                this._currentFolderId,
                this._allFolders,
                this._allFiles,
              ),
          );
          renameModal.open();
          break;

        case 'trigger-mobile-delete':
          closeModal('mobileOptionsModal');

          // Assuming you create a DeleteModal subclass next!
          const deleteModal = new DeleteModal(
            itemId || this._mobileActionItem.id,
            isFolder || this._mobileActionItem.isFolder,
            this._allFolders,
            this._allFiles,
            () =>
              UIManager.saveAndRefresh(
                this._currentFolderId,
                this._allFolders,
                this._allFiles,
              ),
          );
          deleteModal.open();
          break;

        case 'close-mobile-options':
          closeModal('mobileOptionsModal');
          break;

        // --- Desktop Header Triggers (Assuming you have these buttons!) ---
        case 'trigger-new-folder':
          const newFolderModal = new CreateFolderModal(
            this._currentFolderId,
            this._allFolders,
            this._allFiles,
            () =>
              UIManager.saveAndRefresh(
                this._currentFolderId,
                this._allFolders,
                this._allFiles,
              ),
          );
          newFolderModal.open();
          break;

        case 'trigger-new-file':
          // Assuming you create a CreateFileModal subclass!
          const newFileModal = new CreateFileModal(
            this._currentFolderId,
            this._allFolders,
            this._allFiles,
            () =>
              UIManager.saveAndRefresh(
                this._currentFolderId,
                this._allFolders,
                this._allFiles,
              ),
          );
          newFileModal.open();
          break;

        // --- File Viewer Triggers ---
        case 'download-file':
          const targetId = target.dataset.id || this._activeFileId;
          if (targetId) downloadFile(this._allFiles, targetId);
          break;

        case 'open-file-viewer':
          // Assuming you convert your File Details popup into a BaseModal subclass!
          const fileViewer = new FileViewerModal(
            itemId || this._activeFileId,
            this._allFiles,
          );
          fileViewer.open();
          break;
      }
    });
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
}

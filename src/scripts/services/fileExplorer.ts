import { Folder, File } from '../models/entity';
import { CreateFileModal } from '../models/modals/createFileModal';
import { CreateFolderModal } from '../models/modals/createFolderModal';
import { DeleteModal } from '../models/modals/deleteModal';
import { FileViewerModal } from '../models/modals/fileViewerModal';
import { RenameModal } from '../models/modals/renameModal';
import { EditingState, MobileActionItem } from '../models/model';
import { BREAD_CRUMB, ROOT_FOLDER_ID } from '../utilities/_const';
import { initFiles, initFolders } from '../utilities/_initData';
import {
  getIdFromUrl,
  updateUrlWithId,
} from '../utilities/_navigate';
import {
  loadFromStorage,
  saveToStorage,
} from '../utilities/_storageUtil';
import { UIManager } from './uiManager';
import {
  processFileSelection,
  triggerUpload,
} from '../utilities/_helper';
import { ROW_TYPE } from '../models/enum';

export class FileExplorer {
  private _allFolders: Record<string, Folder> = initFolders;
  private _allFiles: Record<string, File> = initFiles;
  private _currentFolderId: string;

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
    UIManager.renderBreadcrumbs(
      BREAD_CRUMB,
      this._currentFolderId,
      this._allFolders,
    );
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
          UIManager.closeMobileMenu();
          break;
        case 'toggle-new-menu':
          // Toggle the dropdown visibility
          if (newMenu) {
            newMenu.style.display =
              newMenu.style.display === 'block' ? 'none' : 'block';
          }
          break;

        case 'trigger-new-folder':
          // 1. Hide the dropdown menu
          if (newMenu) newMenu.style.display = 'none';

          // 2. Instantiate our new OOP Modal and open it!
          const newFolderModal = new CreateFolderModal(
            this._currentFolderId,
            this._allFolders,
            this._allFiles,
            () =>
              UIManager.refreshUI(
                this._currentFolderId,
                this._allFolders,
                this._allFiles,
              ),
          );
          newFolderModal.open();
          break;

        case 'trigger-new-file':
          // 1. Hide the dropdown menu
          if (newMenu) newMenu.style.display = 'none';

          // 2. Instantiate our new OOP Modal and open it!
          const newFileModal = new CreateFileModal(
            this._currentFolderId,
            this._allFolders,
            this._allFiles,
            () =>
              UIManager.refreshUI(
                this._currentFolderId,
                this._allFolders,
                this._allFiles,
              ),
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

    // 2. Listener for the Hidden File Input (Unchanged and perfect!)
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
      const isFolder = target.dataset.type === ROW_TYPE.FOLDER;

      switch (action) {
        case 'open-folder':
          if (itemId) {
            // Overwrite the class state with the newly returned folder!
            const targetFolder = this._allFolders[itemId];

            // Fallback to root if ID is bad
            if (!targetFolder) {
              console.warn('Folder not found, returning to root.');
              updateUrlWithId(ROOT_FOLDER_ID);
              this._currentFolderId = ROOT_FOLDER_ID;
            } else {
              targetFolder.isNew = false;
              // Update the browser URL
              updateUrlWithId(itemId);
              this._currentFolderId = itemId;
            }
            UIManager.refreshUI(
              this._currentFolderId,
              this._allFolders,
              this._allFiles,
            );
          }
          break;
        case 'open-file':
          if (itemId) {
            const file = this._allFiles[itemId];
            if (!file) {
              console.error('File not found!');
              return;
            }
            if (file.isNew) {
              file.isNew = false;

              // Save to local storage and redraw the grid to remove the shiny "new" dot
              saveToStorage(this._allFolders, this._allFiles);
              UIManager.refreshUI(
                this._currentFolderId,
                this._allFolders,
                this._allFiles,
              );
            }

            // 2. Instantiate our new OOP Modal and open it!
            // (Make sure you import FileViewerModal at the top of the file)
            const fileViewer = new FileViewerModal(
              itemId,
              this._allFiles,
            );
            fileViewer.open();
          }
          break;
        case 'delete':
          if (itemId) {
            // 1. Instantiate our new OOP Modal
            // Make sure you have imported { DeleteModal } at the top of the file!
            const deleteModal = new DeleteModal(
              itemId,
              isFolder,
              this._allFolders,
              this._allFiles,
              () =>
                UIManager.refreshUI(
                  this._currentFolderId,
                  this._allFolders,
                  this._allFiles,
                ),
            );

            // 2. Open it! (The class will wait for the user to click Confirm before actually deleting anything)
            deleteModal.open();
          }
          break;
        case 'edit':
          // Boom. Just instantiate and open!
          const renameModal = new RenameModal(
            itemId,
            isFolder,
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
      }
    });
  }
  private initUploadListener() {
    const fileInput = document.getElementById(
      'fileInput',
    ) as HTMLInputElement;
    if (!fileInput) return;

    // Remove any existing listener to prevent doubling up
    fileInput.onchange = null;

    // Attach the listener
    fileInput.onchange = (event: Event) => {
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
    };
  }
}

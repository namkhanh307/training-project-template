import { CreateFolderModal } from '../models/modals/createFolderModal';
import { DeleteModal } from '../models/modals/deleteModal';
import { FileViewerModal } from '../models/modals/fileViewerModal';
import { RenameModal } from '../models/modals/renameModal';
import {
  BASE_FE_URL,
  BREAD_CRUMB,
  ROOT_FOLDER,
} from '../utilities/_const';
import {
  getIdFromUrl,
  navigateTo,
  updateUrlWithId,
} from '../utilities/_navigate';
import { UIManager } from './uiManager';
import {
  processFileSelection,
  triggerUpload,
} from '../utilities/_helper';
import { ItemType } from '../models/enum';
import {
  getItemById,
  getItemPath,
  register,
  signIn,
  signOut,
} from './apiService';
import {
  AccountInfo,
  PublicClientApplication,
} from '@azure/msal-browser';
import { loginRequest, msalConfig } from '../models/authConfig';
import { GetPathsRes, NavState } from '../models/model';
import { setMsalInstance } from './httpClient';

export class FileExplorer {
  private _currentFolderId: string | null = null;
  private _breadcrumbPath: GetPathsRes[] = [];
  private _msalInstance = new PublicClientApplication(msalConfig);
  private _currentAccount: AccountInfo | null = null;
  private _msalReady: Promise<void>;
  private _state: NavState = {
    currentFolderId: null,
    breadcrumbPath: [{ id: null, name: ROOT_FOLDER }],
  };
  constructor() {
    this._msalReady = this.initializeMsal();

    // 1. Attach listeners immediately (Synchronous)
    this.setupEventListeners();

    // 2. THE BACK BUTTON: Listen for browser navigation (popstate)
    window.addEventListener('popstate', async () => {
      const poppedId = getIdFromUrl() || null;
      await navigateTo(
        poppedId,
        null,
        this._state, // Pass the reference
        (id, path) => UIManager.renderCurrentView(id, path),
      );
    });

    this._msalReady.then(() => {
      this.initializeRoute();
    });
  }
  private async initializeMsal() {
    await this._msalInstance.initialize();
    setMsalInstance(this._msalInstance); // ← ADD THIS

    // CRITICAL: always call this on every page load
    // It handles the redirect response when Microsoft sends the user back
    const result = await this._msalInstance.handleRedirectPromise();

    if (result) {
      this._currentAccount = result.account;
      await register();
    } else {
      const accounts = this._msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        this._currentAccount = accounts[0];
      }
    }

    UIManager.updateAuthenUI(this._currentAccount);
  }
  /**
   * Handles the initial URL parsing and data fetching.
   */
  private async initializeRoute() {
    const idFromUrl = getIdFromUrl();
    UIManager.renderLoadingState();

    try {
      if (idFromUrl) {
        this._currentFolderId = idFromUrl;

        // 1. Fetch the current item (you already have this)
        const currentFolder = await getItemById(idFromUrl);
        // 2. NEW: Fetch the entire breadcrumb lineage from the backend.
        // This API should return an array like:
        // [{ id: '123', name: 'Folder A' }, { id: '456', name: 'Folder B' }]
        if (currentFolder.depth >= 2) {
          const ancestors = await getItemPath(idFromUrl);
          // 3. Reconstruct the full path!
          this._breadcrumbPath = [
            { id: null, name: ROOT_FOLDER },
            ...ancestors,
            { id: idFromUrl, name: currentFolder.name },
          ];
        } else {
          this._breadcrumbPath = [
            { id: null, name: ROOT_FOLDER },
            { id: idFromUrl, name: currentFolder.name },
          ];
        }
      } else {
        // Fallback to Root
        this._currentFolderId = null;
        this._breadcrumbPath = [{ id: null, name: ROOT_FOLDER }];
        updateUrlWithId('');
      }
    } catch (error) {
      console.error('Failed to load initial folder.', error);
      this._currentFolderId = null;
      this._breadcrumbPath = [{ id: null, name: ROOT_FOLDER }];
      updateUrlWithId('');
    }

    UIManager.renderCurrentView(
      this._currentFolderId,
      this._breadcrumbPath,
    );
    console.log(this._currentFolderId, this._breadcrumbPath);
  }
  private setupEventListeners() {
    this.initToolbarEvents();
    this.initGridEvents();
    this.initBreadCrumbEvents();
    this.initAuthEvents(); // ← separate, clean
  }
  private initAuthEvents() {
    document
      .getElementById('signInBtn')
      ?.addEventListener('click', (e) =>
        signIn(
          e,
          loginRequest,
          this._currentAccount,
          this._msalInstance,
          this._msalReady,
          () => UIManager.updateAuthenUI(this._currentAccount),
        ),
      );
    document
      .getElementById('signOutBtn')
      ?.addEventListener('click', (e) =>
        signOut(e, this._currentAccount, this._msalInstance),
      );
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
      //const newMenu = document.getElementById('newOptionsMenu');

      switch (action) {
        case 'upload-file':
          triggerUpload();
          UIManager.closeMobileMenu();
          break;

        case 'new-folder':
          // Refactored Modal: Only needs current ID and a callback to refresh the UI
          const newFolderModal = new CreateFolderModal(
            this._currentFolderId,
            () =>
              UIManager.renderCurrentView(
                this._currentFolderId,
                this._breadcrumbPath,
              ),
          );
          newFolderModal.open();
          break;
      }
    });

    fileInput?.addEventListener('change', (event) => {
      processFileSelection(
        this._currentFolderId,
        'd09600d6-acac-480e-84d9-7b68daf22e3c',
        event,
        () => UIManager.renderCurrentView(this._currentFolderId, this._breadcrumbPath),
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
      const isFolder =
        target.dataset.type === ItemType.Folder.toString();

      switch (action) {
        case 'open-folder':
          if (itemId) {
            await navigateTo(
              itemId,
              itemName,
              this._state, 
              (id, path) => UIManager.renderCurrentView(id, path),
            );
          }
          break;

        case 'open-file':
          if (itemId) {
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
              () =>
                UIManager.renderCurrentView(this._currentFolderId),
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
              () =>
                UIManager.renderCurrentView(this._currentFolderId),
            );
            renameModal.open();
          }
          break;
      }
    });
  }
  private initBreadCrumbEvents() {
    // 1. THE FIX: Use '#' to select by ID, or use getElementById!
    const bcContainer = document.querySelector('#breadcrumb');

    bcContainer?.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      event.stopPropagation();

      const action = target.dataset.action;

      // 2. THE FIX: Grab the raw string. If it's empty (""), convert it to null for your API.
      const rawId = target.dataset.id;
      const itemId = rawId === '' ? null : rawId;

      const itemName = target.dataset.name || 'Unknown';

      switch (action) {
        case 'open-folder':
          if (itemId !== undefined) {
            // FIX: Removed 'true'. Let it default to false so the URL updates!
            await navigateTo(
              itemId,
              itemName,
              this._state, // Pass the reference
              (id, path) => UIManager.renderCurrentView(id, path),
            );
          }
          break;
      }
    });
  }
}

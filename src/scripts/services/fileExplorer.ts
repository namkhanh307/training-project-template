import { CreateFolderModal } from '../models/modals/createFolderModal';
import { DeleteModal } from '../models/modals/deleteModal';
import { FileViewerModal } from '../models/modals/fileViewerModal';
import { RenameModal } from '../models/modals/renameModal';
import { BREAD_CRUMB, ROOT_FOLDER } from '../utilities/_const';
import {
  getIdFromUrl,
  updateUrlWithId,
} from '../utilities/_navigate';
import { UIManager } from './uiManager';
import {
  processFileSelection,
  triggerUpload,
} from '../utilities/_helper';
import { ItemType } from '../models/enum';
import { getItemById, getItemPath } from './apiService';
import {
  AccountInfo,
  PublicClientApplication,
} from '@azure/msal-browser';
import { loginRequest, msalConfig } from '../models/authConfig';
import { GetPathsRes } from '../models/model';

export class FileExplorer {
  private _currentFolderId: string | null = null;
  private _breadcrumbPath: GetPathsRes[] = [];
  private _msalInstance = new PublicClientApplication(msalConfig);
  private _currentAccount: AccountInfo | null = null;
  private _msalReady: Promise<void>; // ← ADD THIS

  constructor() {
    console.log('1. RAW URL ON BOOT:', window.location.href);
    this._msalReady = this.initializeMsal();

    // 1. Attach listeners immediately (Synchronous)
    this.setupEventListeners();

    // 2. THE BACK BUTTON: Listen for browser navigation (popstate)
    window.addEventListener('popstate', () => {
      const poppedId = getIdFromUrl() || null;
      this.navigateTo(poppedId, null, true);
    });

    this._msalReady.then(() => {
      this.initializeRoute();
    });
  }
  private async initializeMsal() {
  await this._msalInstance.initialize();

  // CRITICAL: always call this on every page load
  // It handles the redirect response when Microsoft sends the user back
  const result = await this._msalInstance.handleRedirectPromise();

  if (result) {
    // We just came back from Microsoft redirect — grab the account
    console.log('Redirect response received:', result.account.username);
    this._currentAccount = result.account;
  } else {
    // Normal page load — check if already logged in
    const accounts = this._msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      this._currentAccount = accounts[0];
      console.log('Already authenticated:', this._currentAccount.username);
    }
  }

  this.updateUI();
}

private async signIn(e: Event) {
  e.preventDefault();
  await this._msalReady;

  const accounts = this._msalInstance.getAllAccounts();

  if (accounts.length > 0) {
    // Already have account, try silent first
    try {
      const response = await this._msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      this._currentAccount = response.account;
      this.updateUI();
    } catch {
      // Silent failed, redirect to Microsoft
      await this._msalInstance.acquireTokenRedirect({
        ...loginRequest,
        account: accounts[0],
      });
      // Page will redirect — code below won't run
    }
  } else {
    // No account — full login redirect
    await this._msalInstance.loginRedirect({
      ...loginRequest,
    });
    // Page will redirect — code below won't run
  }
}

private async signOut(e: Event) {
  e.preventDefault();
  if (!this._currentAccount) return;
  await this._msalInstance.logoutRedirect({
    postLogoutRedirectUri: 'http://localhost:3000',
  });
  // Page will redirect — code below won't run
}
  private async callApi() {
    if (!this._currentAccount) return;
    try {
      const tokenResponse =
        await this._msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: this._currentAccount,
        });
      const response = await fetch(
        'https://localhost:7029/api/Auth/me',
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
        },
      );
      const data = await response.json();
      const apiResponse = document.getElementById(
        'apiResponse',
      ) as HTMLPreElement;
      apiResponse.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('API Call failed.', error);
    }
  }

  private updateUI() {
    const loginBtn = document.getElementById(
      'loginBtn',
    ) as HTMLButtonElement;
    const logoutBtn = document.getElementById(
      'logoutBtn',
    ) as HTMLButtonElement;
    const apiSection = document.getElementById(
      'api-section',
    ) as HTMLDivElement;
    const apiResponse = document.getElementById(
      'apiResponse',
    ) as HTMLPreElement;

    if (this._currentAccount) {
      loginBtn.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
      apiSection.classList.remove('hidden');
    } else {
      loginBtn.classList.remove('hidden');
      logoutBtn.classList.add('hidden');
      apiSection.classList.add('hidden');
      if (apiResponse)
        apiResponse.textContent = 'API Data will appear here...';
    }
  }
  /**
   * Handles the initial URL parsing and data fetching.
   */
  private async initializeRoute() {
    const idFromUrl = getIdFromUrl();

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

        // Note: If your API returns the current folder inside the 'ancestors' array too,
        // you can just do: this._breadcrumbPath = [{ id: null, name: ROOT_FOLDER }, ...ancestors];
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

    // 1. MANAGE THE BREADCRUMB ARRAY
    // Check if the folder is already in our path
    const pathIndex = this._breadcrumbPath.findIndex(
      (p) => p.id === folderId,
    );

    if (pathIndex !== -1) {
      // BACKWARD NAVIGATION (User clicked a Breadcrumb OR the Browser Back button)
      // Slice the array back to this exact folder
      this._breadcrumbPath = this._breadcrumbPath.slice(
        0,
        pathIndex + 1,
      );
    } else {
      // FORWARD NAVIGATION (User clicked a folder in the main UI)
      if (folderId === null) {
        this._breadcrumbPath = [{ id: null, name: ROOT_FOLDER }];
      } else if (folderName) {
        this._breadcrumbPath.push({ id: folderId, name: folderName });
      }
    }

    // 2. MANAGE THE URL
    if (!isPopState) {
      // We push the new URL for BOTH forward clicks AND breadcrumb clicks!
      // We ONLY skip this if the user clicked the browser's native Back arrow.
      updateUrlWithId(folderId || '');
    }
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
    this.initBreadCrumbEvents();
    this.initAuthEvents(); // ← separate, clean
  }
  private initAuthEvents() {
    document
      .getElementById('loginBtn')
      ?.addEventListener('click', (e) => this.signIn(e));
    document
      .getElementById('logoutBtn')
      ?.addEventListener('click', (e) => this.signOut(e));
    document
      .getElementById('callApiBtn')
      ?.addEventListener('click', () => this.callApi());
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
          // triggerUpload now needs to handle an API POST
          triggerUpload();
          UIManager.closeMobileMenu();
          break;

        case 'new-folder':
          // Refactored Modal: Only needs current ID and a callback to refresh the UI
          const newFolderModal = new CreateFolderModal(
            this._currentFolderId,
            () => this.renderCurrentView(),
          );
          newFolderModal.open();
          break;
      }
    });

    fileInput?.addEventListener('change', (event) => {
      // processFileSelection now needs to handle an API POST
      processFileSelection(
        this._currentFolderId,
        '112d268e-9c46-485d-b4a2-2ad8e5569d81',
        event,
        () => this.renderCurrentView(),
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
            await this.navigateTo(itemId, itemName);
          }
          break;
      }
    });
  }
}

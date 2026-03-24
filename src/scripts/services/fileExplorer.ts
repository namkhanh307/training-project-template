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
import { ItemType } from '../models/enum';
import { getItemById } from './apiService';
import { AccountInfo, PublicClientApplication } from '@azure/msal-browser';
import { loginRequest, msalConfig } from '../models/authConfig';

export class FileExplorer {
  private _currentFolderId: string | null = null;
  private _breadcrumbPath: { id: string | null; name: string }[] = [];

  constructor() {
    // 1. Attach listeners immediately (Synchronous)
    this.setupEventListeners();

    // 2. THE BACK BUTTON: Listen for browser navigation (popstate)
    window.addEventListener('popstate', () => {
      const poppedId = getIdFromUrl() || null;
      this.navigateTo(poppedId, null, true);
    });

    // 3. Kick off the asynchronous routing and rendering
    this.initializeRoute();
  }

  /**
   * Handles the initial URL parsing and data fetching.
   */
  private async initializeRoute() {
    // Optional: Show a loading spinner immediately while we figure out the route
    // UIManager.renderLoadingState();

    const idFromUrl = getIdFromUrl();

    try {
      if (idFromUrl) {
        this._currentFolderId = idFromUrl;

        // Because we are in an async method, we can safely await the API!
        const currentFolder = await getItemById(idFromUrl);

        this._breadcrumbPath = [
          { id: null, name: 'Documents' },
          { id: idFromUrl, name: currentFolder.name }, // Set real name from DB
        ];
      } else {
        // Fallback to Root
        this._currentFolderId = null;
        this._breadcrumbPath = [{ id: null, name: 'Documents' }];
        updateUrlWithId('');
      }
    } catch (error) {
      console.error(
        'Failed to load initial folder. Falling back to Root.',
        error,
      );

      // CRITICAL: If the user bookmarks a folder that later gets deleted,
      // the API will fail. We catch the error and force them back to the safe Root folder.
      this._currentFolderId = null;
      this._breadcrumbPath = [{ id: null, name: 'Documents' }];
      updateUrlWithId('');
    }

    // 4. Finally, draw the screen now that we have the data!
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
        this._breadcrumbPath = [{ id: null, name: 'Documents' }];
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
    console.log('inside renderCurrentView');
    console.log(this._currentFolderId);
    await UIManager.refreshUI(this._currentFolderId);

    // 2. Draw the Breadcrumbs (Passing the history stack directly)
    UIManager.renderBreadcrumbs(BREAD_CRUMB, this._breadcrumbPath);
  }
  private setupEventListeners() {
    this.initToolbarEvents();
    this.initGridEvents();
    this.initBreadCrumbEvents();
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
    const msalInstance = new PublicClientApplication(msalConfig);
    let currentAccount: AccountInfo | null = null;

    // DOM Elements
    const loginBtn = document.getElementById(
      'loginBtn',
    ) as HTMLButtonElement;
    const logoutBtn = document.getElementById(
      'logoutBtn',
    ) as HTMLButtonElement;
    const callApiBtn = document.getElementById(
      'callApiBtn',
    ) as HTMLButtonElement;
    const apiSection = document.getElementById(
      'api-section',
    ) as HTMLDivElement;
    const apiResponse = document.getElementById(
      'apiResponse',
    ) as HTMLPreElement;

    // Initialize MSAL (Required for msal-browser v3+)
    async function initializeAuth() {
      await msalInstance.initialize();

      // Check if user is already logged in from a previous session
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        currentAccount = accounts[0];
        updateUI();
      }
    }

    // Login
    async function signIn() {
      try {
        const response = await msalInstance.loginPopup(loginRequest);
        currentAccount = response.account;
        updateUI();
      } catch (error) {
        console.error('Login failed:', error);
      }
    }

    // Logout
    async function signOut() {
      if (!currentAccount) return;
      try {
        await msalInstance.logoutPopup({
          mainWindowRedirectUri: '/',
        });
        currentAccount = null;
        updateUI();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }

    // Fetch Token & Call API
    async function callApi() {
      if (!currentAccount) return;

      try {
        // 1. Get the token (Silently if possible, popup if needed)
        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: currentAccount,
        });

        // 2. Call your .NET API
        // Make sure this matches your actual .NET running port!
        const response = await fetch(
          'https://localhost:7029/api/AuthTest/me',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.accessToken}`,
            },
          },
        );

        const data = await response.json();
        apiResponse.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        console.error(
          'API Call failed. You might need to login again.',
          error,
        );
        apiResponse.textContent = 'Error calling API. Check console.';
      }
    }

    // Update UI state
    function updateUI() {
      if (currentAccount) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        apiSection.classList.remove('hidden');
      } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        apiSection.classList.add('hidden');
        apiResponse.textContent = 'API Data will appear here...';
      }
    }

    // Event Listeners
    loginBtn.addEventListener('click', signIn);
    logoutBtn.addEventListener('click', signOut);
    callApiBtn.addEventListener('click', callApi);

    // Boot up the app
    initializeAuth();
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
          // 3. THE FIX: Check against undefined so that 'null' (Root) is allowed to pass!
          if (itemId !== undefined) {
            await this.navigateTo(itemId, itemName, true); // Note: You might want to pass true here so navigateTo knows it's a backward breadcrumb click!
          }
          break;
      }
    });
  }
}

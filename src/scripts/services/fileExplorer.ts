import { Folder, File } from '../models/entity';
import { rootFolder } from '../utilities/_initData';
import {
  loadFromStorage,
  saveToStorage,
} from '../utilities/_storageUtil';
import { UIManager } from '../utilities/uiManager';
import { processFileSelection, triggerUpload } from './crudFile';
import { createNewFolderDesktop, saveFolderName } from './crudFolder';

export class FileExplorer {
  _rootFolder: Folder;
  _currentFolder: Folder;

  constructor() {
    this._rootFolder = loadFromStorage(rootFolder);
    this._currentFolder = this._rootFolder;

    // Setup event listeners once when the app starts
    this.setupEventListeners();

    // Initial Render
    this.refreshUI();
  }

  // A handy helper to keep your code DRY (Don't Repeat Yourself)
  private refreshUI() {
    UIManager.renderGrid([
      ...this._currentFolder.subFolders,
      ...this._currentFolder.files,
    ]);
  }

  // --- 1. THE ACTION METHOD ---

  // --- 2. THE EVENT ROUTER ---
  private setupEventListeners() {
    this.initToolbarEvents();
    this.initGridEvents();
  }

  private initToolbarEvents() {
    const desktopToolbar = document.querySelector('.l-toolbar');
    const fileInput = document.getElementById(
      'fileInput',
    ) as HTMLInputElement;

    // 1. Router for all Toolbar Clicks
    desktopToolbar?.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.action;

      switch (action) {
        case 'new-folder-desktop':
          createNewFolderDesktop(this._currentFolder, this.refreshUI.bind(this));
          break;
        case 'upload-file':
          triggerUpload();
          break;
      }
    });

    // 2. Listener for the Hidden File Input
    fileInput?.addEventListener(
      'change',
      processFileSelection.bind(this, this._rootFolder, this._currentFolder, this.refreshUI.bind(this)),
    );
  }

  private initGridEvents() {
    const gridContainer = document.getElementById(
      'desktop-row-container',
    );

    // Listener for the "Enter" key or "Blur" on the new folder input
    gridContainer?.addEventListener('focusout', (event) => {
      const target = event.target as HTMLElement;
      if (target.id === 'new-folder-input') {
        saveFolderName(this._rootFolder, this._currentFolder, this.refreshUI.bind(this), target as HTMLInputElement);
      }
    });
  }
}

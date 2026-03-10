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
  _navigationHistory: Folder[] = [];
  //State for modals
  private _editingItemState = { oldName: '', isFolder: false };
  private _mobileActionItem = { name: '', isFolder: false };

  constructor() {
    this._rootFolder = loadFromStorage(rootFolder);
    this._currentFolder = this._rootFolder;

    // Setup event listeners once when the app starts
    this.setupEventListeners();

    // Initial Render
    this.refreshUI();
    this.updateBreadcrumbs();
  }

  // A handy helper to keep your code DRY (Don't Repeat Yourself)
  private refreshUI() {
    UIManager.renderGrid([
      ...this._currentFolder.subFolders,
      ...this._currentFolder.files,
    ]);
  }
  private saveAndRefresh() {
    saveToStorage(this._rootFolder);
    this.refreshUI();
  }

  // --- 1. THE ACTION METHOD ---

  // --- 2. THE EVENT ROUTER ---
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
    desktopToolbar?.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-action]',
      ) as HTMLElement;
      if (!target) return;

      const action = target.dataset.action;

      switch (action) {
        case 'new-folder-desktop':
          createNewFolderDesktop(
            this._currentFolder,
            this.refreshUI.bind(this),
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
        this.refreshUI.bind(this),
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
          if (itemName) this.handleFolderClick(itemName);
          break;
        case 'open-file':
          if (itemName) this.handleFileClick(itemName);
          break;
        case 'delete':
          if (itemName) this.deleteItem(itemName, isFolder);
          break;
        case 'edit':
          if (itemName) this.openRenameModal(itemName, isFolder);
          break;
        case 'mobile-options':
          if (itemName)
            this.openMobileOptionsSheet(itemName, isFolder);
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
        this.saveFolderName(target as HTMLInputElement);
      }
    });
  }
  private initModalEvents() {
    // A router specifically for clicks inside Modals
    document.body.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest('[data-modal-action]') as HTMLElement;
      if (!target) return;

      switch (target.dataset.modalAction) {
        // Rename Modal
        case 'submit-rename': this.submitRename(); break;
        case 'close-rename': this.closeModal('renameModal'); break;
        
        // Mobile Options Action Sheet
        case 'trigger-mobile-rename': 
            this.closeModal('mobileOptionsModal');
            this.openRenameModal(this._mobileActionItem.name, this._mobileActionItem.isFolder);
            break;
        case 'trigger-mobile-delete': 
            this.closeModal('mobileOptionsModal');
            this.deleteItem(this._mobileActionItem.name, this._mobileActionItem.isFolder);
            break;
        case 'close-mobile-options': this.closeModal('mobileOptionsModal'); break;

        // File Viewer Modal
        case 'download-file': 
            const fileName = document.getElementById('modalFileName')?.innerText;
            if (fileName) this.downloadFile(fileName); 
            break;
        case 'close-file-modal': this.closeModal('fileModal'); break;
      }
    });
  }
  private initBreadcrumbEvents() {
    const pathDisplay = document.getElementById('folder-path-display');
    pathDisplay?.addEventListener('click', (event) => {
       const target = (event.target as HTMLElement).closest('[data-path]') as HTMLElement;
       if (target && target.dataset.path) {
          this.navigateFromBreadcrumb(target.dataset.path);
       }
    });
  }

  // --- ACTIONS: NAVIGATION & BREADCRUMBS ---
  private handleFolderClick(folderName: string) {
    const targetFolder = this._currentFolder.subFolders.find((f) => f.name === folderName);
    if (!targetFolder) return;
    
    targetFolder.isNew = false;
    this.saveAndRefresh();

    // Push to history before moving
    this._navigationHistory.push(this._currentFolder);
    this._currentFolder = targetFolder;
    
    this.updateBreadcrumbs();
    this.refreshUI();
  }

  private navigateFromBreadcrumb(targetPath: string) {
    if (targetPath === '/') {
      this._currentFolder = this._rootFolder;
      this._navigationHistory = []; // Clear history if returning to root
    } else {
      const segments = targetPath.split('/').filter(s => s.length > 0);
      let foundFolder = this._rootFolder;

      for (const segment of segments) {
        const nextFolder = foundFolder.subFolders.find(f => f.name === segment);
        if (nextFolder) foundFolder = nextFolder;
        else return; // Stop if path is invalid
      }
      this._currentFolder = foundFolder;
    }
    
    this.updateBreadcrumbs();
    this.refreshUI();
  }

  private updateBreadcrumbs() {
    const pathDisplay = document.getElementById('folder-path-display');
    if (!pathDisplay) return;

    let breadcrumbsHTML = `<span class="m-breadcrumb is-clickable" data-path="/">Documents</span>`;
    
    if (this._currentFolder.path !== '/') {
      const segments = this._currentFolder.path.split('/').filter(s => s.length > 0);
      let buildPath = '';

      segments.forEach((segment) => {
        buildPath += `/${segment}`;
        breadcrumbsHTML += ` <span class="m-breadcrumb-separator"><i class="fas fa-chevron-right small"></i></span> `;
        breadcrumbsHTML += `<span class="m-breadcrumb is-clickable" data-path="${buildPath}">${segment}</span>`;
      });
    }
    pathDisplay.innerHTML = breadcrumbsHTML;
  }

  // --- ACTIONS: FILES ---
  private handleFileClick(fileName: string) {
    const file = this._currentFolder.files.find((f) => f.name === fileName);
    if (!file) return;

    file.isNew = false;
    this.saveAndRefresh();

    document.getElementById('modalFileName')!.innerText = file.name;
    document.getElementById('modalFileExtension')!.innerText = file.extension;
    document.getElementById('modalFileModified')!.innerText = file.modified;
    document.getElementById('modalFileModifiedBy')!.innerText = file.modifiedBy;

    this.openModal('fileModal');
  }

  private downloadFile(fileName: string) {
    const file = this._currentFolder.files.find((f) => f.name === fileName);
    if (!file || !file.data) return;

    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- ACTIONS: CRUD LOGIC ---
  private deleteItem(name: string, isFolder: boolean) {
    if (!confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`)) return;

    if (isFolder) {
      this._currentFolder.subFolders = this._currentFolder.subFolders.filter((f) => f.name !== name);
    } else {
      this._currentFolder.files = this._currentFolder.files.filter((f) => f.name !== name);
    }
    this.saveAndRefresh();
  }

  private saveFolderName(inputElement: HTMLInputElement) {
    const newName = inputElement.value.trim() || 'New folder';
    const folderBeingEdited = this._currentFolder.subFolders.find((f) => f.isEditing);
    
    if (!folderBeingEdited) return;

    const isDuplicate = this._currentFolder.subFolders.some(
      (f) => f !== folderBeingEdited && f.name.toLowerCase() === newName.toLowerCase(),
    );

    if (isDuplicate) {
      alert(`This destination already contains a folder named '${newName}'.`);
      setTimeout(() => { inputElement.focus(); inputElement.select(); }, 10);
      return; 
    }

    folderBeingEdited.name = newName;
    folderBeingEdited.path = this._currentFolder.path === '/' ? `/${newName}` : `${this._currentFolder.path}/${newName}`;
    delete folderBeingEdited.isEditing;

    this.saveAndRefresh();
  }

  // --- ACTIONS: MODAL HANDLERS ---
  private openRenameModal(oldName: string, isFolder: boolean) {
    this._editingItemState = { oldName, isFolder };
    const input = document.getElementById('renameInput') as HTMLInputElement;
    
    if (input) {
      input.value = oldName;
      this.openModal('renameModal');
      setTimeout(() => {
        input.focus();
        if (!isFolder && oldName.includes('.')) {
          input.setSelectionRange(0, oldName.lastIndexOf('.'));
        } else {
          input.select();
        }
      }, 100);
    }
  }

  private submitRename() {
    const input = document.getElementById('renameInput') as HTMLInputElement;
    const newName = input.value.trim();
    const { oldName, isFolder } = this._editingItemState;

    if (!newName || newName === oldName) {
      this.closeModal('renameModal');
      return;
    }

    const itemArray = isFolder ? this._currentFolder.subFolders : this._currentFolder.files;
    if (itemArray.some(f => f.name.toLowerCase() === newName.toLowerCase())) {
      alert('An item with this name already exists.');
      input.focus();
      return;
    }

    const target = itemArray.find(f => f.name === oldName);
    if (target) {
      target.name = newName;
      if (isFolder) {
        target.path = this._currentFolder.path === '/' ? `/${newName}` : `${this._currentFolder.path}/${newName}`;
      } else {
        const lastDot = newName.lastIndexOf('.');
        (target as File).extension = lastDot > 0 ? newName.substring(lastDot + 1).toLowerCase() : '';
      }
    }

    this.saveAndRefresh();
    this.closeModal('renameModal');
  }

  private openMobileOptionsSheet(name: string, isFolder: boolean) {
    this._mobileActionItem = { name, isFolder };
    const title = document.getElementById('optionsModalTitle');
    if (title) title.innerText = name;
    this.openModal('mobileOptionsModal');
  }

  // --- UTILS ---
  private openModal(id: string) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
  }

  private closeModal(id: string) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
  }
}

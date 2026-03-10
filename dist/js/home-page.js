/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/services/crudFile.ts":
/*!******************************************!*\
  !*** ./src/scripts/services/crudFile.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   processFileSelection: function() { return /* binding */ processFileSelection; },
/* harmony export */   triggerUpload: function() { return /* binding */ triggerUpload; }
/* harmony export */ });
/* harmony import */ var _utilities_storageUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");

function triggerUpload() {
    // Mobile safety check (optional: remove 'show' class if triggered from mobile menu)
    document.getElementById('mobileMenu')?.classList.remove('show');
    const fileInput = document.getElementById('fileInput');
    fileInput?.click();
}
async function processFileSelection(rootFolder, currentFolder, refreshUI, event) {
    const target = event.target;
    const files = target.files;
    if (!files || files.length === 0)
        return;
    const filePromises = Array.from(files).map((selectedFile) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            const lastDotIndex = selectedFile.name.lastIndexOf('.');
            const fileExtension = lastDotIndex > 0
                ? selectedFile.name
                    .substring(lastDotIndex + 1)
                    .toLowerCase()
                : '';
            reader.onload = (e) => {
                resolve({
                    name: selectedFile.name,
                    extension: fileExtension,
                    modified: 'Just now',
                    modifiedBy: 'You',
                    isNew: true,
                    path: "",
                    data: e.target?.result,
                    type: 'file',
                });
            };
            reader.readAsDataURL(selectedFile);
        });
    });
    const processedFiles = await Promise.all(filePromises);
    currentFolder.files.push(...processedFiles);
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_0__.saveToStorage)(rootFolder);
    // Instead of calling global navigateToFolder, just refresh the UI
    // If you need path updates, trigger your UIManager.updatePath(...) here
    refreshUI();
    target.value = ''; // Reset input
}


/***/ }),

/***/ "./src/scripts/services/crudFolder.ts":
/*!********************************************!*\
  !*** ./src/scripts/services/crudFolder.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createNewFolderDesktop: function() { return /* binding */ createNewFolderDesktop; },
/* harmony export */   saveFolderName: function() { return /* binding */ saveFolderName; }
/* harmony export */ });
/* harmony import */ var _utilities_storageUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");

//delete folder
// const deleteFolderDesktop = () => {
//   const container = document.getElementById('desktop-row-container');
//   container?.addEventListener('click', (event) => {
//     // 1. Find the closest element with a 'data-action' attribute.
//     // We use .closest() because the user might click the <use> or <path> INSIDE the <svg>!
//     const target = (event.target as HTMLElement).closest(
//       '[data-action]',
//     ) as HTMLElement;
//     // If they clicked empty space or a row without an action, do nothing.
//     if (!target) return;
//     // 2. Stop propagation so row-clicks don't fire simultaneously
//     event.stopPropagation();
//     // 3. Extract your data from the dataset
//     const action = target.dataset.action; // "delete"
//     const itemName = target.dataset.name; // e.g., "Report.xlsx"
//     const itemType = target.dataset.type; // "folder" or "file"
//     // 4. Route the logic
//     if (action === 'delete' && itemName) {
//       const isFolder = itemType === 'folder';
//       // Call your internal delete function (no window prefix needed!)
//       deleteItem(itemName, isFolder);
//     }
//     // You can easily add more routes later!
//     if (action === 'edit' && itemName) {
//       openRenameModal(itemName, itemType === 'folder');
//     }
//   });
// };
// Look, mom! No (window as any)!
function createNewFolderDesktop(currentFolder, refreshUI) {
    let baseName = 'New folder';
    let folderName = baseName;
    let counter = 1;
    const existingNames = currentFolder.subFolders.map((f) => f.name.toLowerCase());
    while (existingNames.includes(folderName.toLowerCase())) {
        folderName = `${baseName} (${counter})`;
        counter++;
    }
    const newFolder = {
        name: folderName,
        path: '',
        subFolders: [],
        files: [],
        modified: 'Just now',
        modifiedBy: 'You',
        isNew: true,
        isEditing: true,
        type: 'folder',
    };
    currentFolder.subFolders.unshift(newFolder);
    refreshUI();
    const input = document.getElementById('new-folder-input');
    if (input) {
        input.value = folderName;
        input.focus();
        input.select();
    }
}
function saveFolderName(rootFolder, currentFolder, refreshUI, inputElement) {
    const newName = inputElement.value.trim() || 'New folder';
    const folderBeingEdited = currentFolder.subFolders.find((f) => f.isEditing);
    if (!folderBeingEdited)
        return;
    const isDuplicate = currentFolder.subFolders.some((f) => f !== folderBeingEdited &&
        f.name.toLowerCase() === newName.toLowerCase());
    if (isDuplicate) {
        alert(`This destination already contains a folder named '${newName}'.`);
        setTimeout(() => {
            inputElement.focus();
            inputElement.select();
        }, 10);
        return;
    }
    folderBeingEdited.name = newName;
    folderBeingEdited.path =
        currentFolder.path === '/'
            ? `/${newName}`
            : `${currentFolder.path}/${newName}`;
    delete folderBeingEdited.isEditing;
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_0__.saveToStorage)(rootFolder);
    refreshUI();
}


/***/ }),

/***/ "./src/scripts/services/fileExplorer.ts":
/*!**********************************************!*\
  !*** ./src/scripts/services/fileExplorer.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FileExplorer: function() { return /* binding */ FileExplorer; }
/* harmony export */ });
/* harmony import */ var _utilities_initData__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/_initData */ "./src/scripts/utilities/_initData.ts");
/* harmony import */ var _utilities_storageUtil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utilities/_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");
/* harmony import */ var _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utilities/uiManager */ "./src/scripts/utilities/uiManager.ts");
/* harmony import */ var _crudFile__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./crudFile */ "./src/scripts/services/crudFile.ts");
/* harmony import */ var _crudFolder__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./crudFolder */ "./src/scripts/services/crudFolder.ts");





class FileExplorer {
    constructor() {
        this._navigationHistory = [];
        //State for modals
        this._editingItemState = { oldName: '', isFolder: false };
        this._mobileActionItem = { name: '', isFolder: false };
        this._rootFolder = (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_1__.loadFromStorage)(_utilities_initData__WEBPACK_IMPORTED_MODULE_0__.rootFolder);
        this._currentFolder = this._rootFolder;
        // Setup event listeners once when the app starts
        this.setupEventListeners();
        // Initial Render
        this.refreshUI();
        this.updateBreadcrumbs();
    }
    // A handy helper to keep your code DRY (Don't Repeat Yourself)
    refreshUI() {
        _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__.UIManager.renderGrid([
            ...this._currentFolder.subFolders,
            ...this._currentFolder.files,
        ]);
    }
    saveAndRefresh() {
        (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_1__.saveToStorage)(this._rootFolder);
        this.refreshUI();
    }
    // --- 1. THE ACTION METHOD ---
    // --- 2. THE EVENT ROUTER ---
    setupEventListeners() {
        this.initToolbarEvents();
        this.initGridEvents();
        this.initModalEvents();
        this.initBreadcrumbEvents();
    }
    initToolbarEvents() {
        const desktopToolbar = document.querySelector('.l-toolbar');
        const fileInput = document.getElementById('fileInput');
        // 1. Router for all Toolbar Clicks
        desktopToolbar?.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (!target)
                return;
            const action = target.dataset.action;
            switch (action) {
                case 'new-folder-desktop':
                    (0,_crudFolder__WEBPACK_IMPORTED_MODULE_4__.createNewFolderDesktop)(this._currentFolder, this.refreshUI.bind(this));
                    break;
                case 'upload-file':
                    (0,_crudFile__WEBPACK_IMPORTED_MODULE_3__.triggerUpload)();
                    break;
            }
        });
        // 2. Listener for the Hidden File Input
        fileInput?.addEventListener('change', _crudFile__WEBPACK_IMPORTED_MODULE_3__.processFileSelection.bind(this, this._rootFolder, this._currentFolder, this.refreshUI.bind(this)));
    }
    initGridEvents() {
        // We attach one listener to the main container that holds both grids
        const mainContainer = document.querySelector('.l-main-container');
        mainContainer?.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (!target)
                return;
            event.stopPropagation(); // Prevent clicks from bubbling up to parent rows
            const action = target.dataset.action;
            const itemName = target.dataset.name;
            const isFolder = target.dataset.type === 'folder';
            switch (action) {
                case 'open-folder':
                    if (itemName)
                        this.handleFolderClick(itemName);
                    break;
                case 'open-file':
                    if (itemName)
                        this.handleFileClick(itemName);
                    break;
                case 'delete':
                    if (itemName)
                        this.deleteItem(itemName, isFolder);
                    break;
                case 'edit':
                    if (itemName)
                        this.openRenameModal(itemName, isFolder);
                    break;
                case 'mobile-options':
                    if (itemName)
                        this.openMobileOptionsSheet(itemName, isFolder);
                    break;
            }
        });
        // Handle pressing Enter to save folder
        mainContainer?.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                const target = event.target;
                if (target.id === 'new-folder-input') {
                    target.blur(); // Triggers the focusout event below
                }
            }
        });
        // Handle input blur to save folder
        mainContainer?.addEventListener('focusout', (event) => {
            const target = event.target;
            if (target.id === 'new-folder-input') {
                this.saveFolderName(target);
            }
        });
    }
    initModalEvents() {
        // We attach one listener to the body to catch ALL modal clicks
        document.body.addEventListener('click', (event) => {
            const target = event.target.closest('[data-modal-action]');
            if (!target)
                return;
            const action = target.dataset.modalAction;
            switch (action) {
                // --- Rename Modal ---
                case 'submit-rename':
                    this.submitRename();
                    break;
                case 'close-rename':
                    this.closeModal('renameModal');
                    break;
                // --- Mobile Options Sheet ---
                case 'trigger-mobile-rename':
                    this.closeModal('mobileOptionsModal');
                    this.openRenameModal(this._mobileActionItem.name, this._mobileActionItem.isFolder);
                    break;
                case 'trigger-mobile-delete':
                    this.closeModal('mobileOptionsModal');
                    this.deleteItem(this._mobileActionItem.name, this._mobileActionItem.isFolder);
                    break;
                case 'close-mobile-options':
                    this.closeModal('mobileOptionsModal');
                    break;
                // --- File Viewer Modal ---
                case 'download-file':
                    const fileName = document.getElementById('modalFileName')?.innerText;
                    if (fileName)
                        this.downloadFile(fileName);
                    break;
                case 'close-file-modal':
                    this.closeModal('fileModal');
                    break;
                // --- New Folder Modal (Mobile) ---
                case 'submit-new-folder':
                    this.submitNewFolderMobile();
                    break;
                case 'close-new-folder':
                    this.closeModal('newFolderModal');
                    break;
            }
        });
        // Optional: Pressing "Enter" in the Rename or New Folder inputs
        document.body.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const target = event.target;
                if (target.id === 'renameInput') {
                    event.preventDefault();
                    this.submitRename();
                }
                else if (target.id === 'newFolderNameInput') {
                    event.preventDefault();
                    this.submitNewFolderMobile(); // Assuming you migrated your submitNewFolder logic!
                }
            }
        });
    }
    initBreadcrumbEvents() {
        const pathDisplay = document.getElementById('folder-path-display');
        pathDisplay?.addEventListener('click', (event) => {
            const target = event.target.closest('[data-path]');
            if (target && target.dataset.path) {
                this.navigateFromBreadcrumb(target.dataset.path);
            }
        });
    }
    // --- ACTIONS: NAVIGATION & BREADCRUMBS ---
    handleFolderClick(folderName) {
        const targetFolder = this._currentFolder.subFolders.find((f) => f.name === folderName);
        if (!targetFolder)
            return;
        targetFolder.isNew = false;
        this.saveAndRefresh();
        // Push to history before moving
        this._navigationHistory.push(this._currentFolder);
        this._currentFolder = targetFolder;
        this.updateBreadcrumbs();
        this.refreshUI();
    }
    navigateFromBreadcrumb(targetPath) {
        if (targetPath === '/') {
            this._currentFolder = this._rootFolder;
            this._navigationHistory = []; // Clear history if returning to root
        }
        else {
            const segments = targetPath
                .split('/')
                .filter((s) => s.length > 0);
            let foundFolder = this._rootFolder;
            for (const segment of segments) {
                const nextFolder = foundFolder.subFolders.find((f) => f.name === segment);
                if (nextFolder)
                    foundFolder = nextFolder;
                else
                    return; // Stop if path is invalid
            }
            this._currentFolder = foundFolder;
        }
        this.updateBreadcrumbs();
        this.refreshUI();
    }
    updateBreadcrumbs() {
        const pathDisplay = document.getElementById('folder-path-display');
        if (!pathDisplay)
            return;
        let breadcrumbsHTML = `<span class="m-breadcrumb is-clickable" data-path="/">Documents</span>`;
        if (this._currentFolder.path !== '/') {
            const segments = this._currentFolder.path
                .split('/')
                .filter((s) => s.length > 0);
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
    handleFileClick(fileName) {
        const file = this._currentFolder.files.find((f) => f.name === fileName);
        if (!file)
            return;
        file.isNew = false;
        this.saveAndRefresh();
        document.getElementById('modalFileName').innerText = file.name;
        document.getElementById('modalFileExtension').innerText =
            file.extension;
        document.getElementById('modalFileModified').innerText =
            file.modified;
        document.getElementById('modalFileModifiedBy').innerText =
            file.modifiedBy;
        this.openModal('fileModal');
    }
    downloadFile(fileName) {
        const file = this._currentFolder.files.find((f) => f.name === fileName);
        if (!file || !file.data)
            return;
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    // --- ACTIONS: CRUD LOGIC ---
    deleteItem(name, isFolder) {
        if (!confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`))
            return;
        if (isFolder) {
            this._currentFolder.subFolders =
                this._currentFolder.subFolders.filter((f) => f.name !== name);
        }
        else {
            this._currentFolder.files = this._currentFolder.files.filter((f) => f.name !== name);
        }
        this.saveAndRefresh();
    }
    saveFolderName(inputElement) {
        const newName = inputElement.value.trim() || 'New folder';
        const folderBeingEdited = this._currentFolder.subFolders.find((f) => f.isEditing);
        if (!folderBeingEdited)
            return;
        const isDuplicate = this._currentFolder.subFolders.some((f) => f !== folderBeingEdited &&
            f.name.toLowerCase() === newName.toLowerCase());
        if (isDuplicate) {
            alert(`This destination already contains a folder named '${newName}'.`);
            setTimeout(() => {
                inputElement.focus();
                inputElement.select();
            }, 10);
            return;
        }
        folderBeingEdited.name = newName;
        folderBeingEdited.path =
            this._currentFolder.path === '/'
                ? `/${newName}`
                : `${this._currentFolder.path}/${newName}`;
        delete folderBeingEdited.isEditing;
        this.saveAndRefresh();
    }
    // --- ACTIONS: MODAL HANDLERS ---
    openRenameModal(oldName, isFolder) {
        this._editingItemState = { oldName, isFolder };
        const input = document.getElementById('renameInput');
        if (input) {
            input.value = oldName;
            this.openModal('renameModal');
            setTimeout(() => {
                input.focus();
                if (!isFolder && oldName.includes('.')) {
                    input.setSelectionRange(0, oldName.lastIndexOf('.'));
                }
                else {
                    input.select();
                }
            }, 100);
        }
    }
    submitRename() {
        const input = document.getElementById('renameInput');
        const newName = input.value.trim();
        const { oldName, isFolder } = this._editingItemState;
        if (!newName || newName === oldName) {
            this.closeModal('renameModal');
            return;
        }
        const itemArray = isFolder
            ? this._currentFolder.subFolders
            : this._currentFolder.files;
        if (itemArray.some((f) => f.name.toLowerCase() === newName.toLowerCase())) {
            alert('An item with this name already exists.');
            input.focus();
            return;
        }
        const target = itemArray.find((f) => f.name === oldName);
        if (target) {
            target.name = newName;
            if (isFolder) {
                target.path =
                    this._currentFolder.path === '/'
                        ? `/${newName}`
                        : `${this._currentFolder.path}/${newName}`;
            }
            else {
                const lastDot = newName.lastIndexOf('.');
                target.extension =
                    lastDot > 0
                        ? newName.substring(lastDot + 1).toLowerCase()
                        : '';
            }
        }
        this.saveAndRefresh();
        this.closeModal('renameModal');
    }
    openMobileOptionsSheet(name, isFolder) {
        this._mobileActionItem = { name, isFolder };
        const title = document.getElementById('optionsModalTitle');
        if (title)
            title.innerText = name;
        this.openModal('mobileOptionsModal');
    }
    // --- ACTIONS: MOBILE NEW FOLDER ---
    openNewFolderMobile() {
        // 1. Hide the Bootstrap mobile menu (if it's open)
        document.getElementById('mobileMenu')?.classList.remove('show');
        // 2. Clear the input from the last time it was used
        const input = document.getElementById('newFolderNameInput');
        if (input)
            input.value = '';
        // 3. Open the modal
        this.openModal('newFolderModal');
        // 4. Try to focus the input automatically for the user
        setTimeout(() => input?.focus(), 100);
    }
    submitNewFolderMobile() {
        const input = document.getElementById('newFolderNameInput');
        let newName = input.value.trim();
        // If they left it blank, default to "New folder"
        if (!newName) {
            newName = 'New folder';
        }
        // Check if a folder with this name already exists
        const isDuplicate = this._currentFolder.subFolders.some((f) => f.name.toLowerCase() === newName.toLowerCase());
        if (isDuplicate) {
            alert('A folder with this name already exists.');
            input.focus();
            return; // Stop the function early
        }
        // Create the new folder object
        const newFolder = {
            name: newName,
            path: this._currentFolder.path === '/'
                ? `/${newName}`
                : `${this._currentFolder.path}/${newName}`,
            subFolders: [],
            files: [],
            modified: 'Just now',
            modifiedBy: 'Administrator MOD',
            isNew: true,
            type: 'folder',
            // Notice: NO 'isEditing: true' here! Mobile doesn't use the inline grid input.
        };
        // Add it to the top of the list
        this._currentFolder.subFolders.unshift(newFolder);
        // Save state, redraw the grid, and close the modal
        this.saveAndRefresh();
        this.closeModal('newFolderModal');
    }
    // --- UTILS ---
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal)
            modal.style.display = 'flex';
    }
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal)
            modal.style.display = 'none';
    }
}


/***/ }),

/***/ "./src/scripts/utilities/_helper.ts":
/*!******************************************!*\
  !*** ./src/scripts/utilities/_helper.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
const ready = (fn) => {
    if (document.readyState !== 'loading') {
        fn();
    }
    else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};
/* harmony default export */ __webpack_exports__["default"] = (ready);


/***/ }),

/***/ "./src/scripts/utilities/_initData.ts":
/*!********************************************!*\
  !*** ./src/scripts/utilities/_initData.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   rootFolder: function() { return /* binding */ rootFolder; }
/* harmony export */ });
let rootFolder = {
    name: 'Root',
    path: '/',
    subFolders: [
        {
            name: 'CAS',
            path: '/CAS',
            subFolders: [],
            files: [
                {
                    name: 'Internal_Document.xlsx',
                    extension: 'xlsx',
                    modified: 'May 1',
                    modifiedBy: 'Megan Bowen',
                    isNew: false,
                    data: '',
                    type: 'file',
                    path: ""
                },
            ],
            modified: 'A few seconds ago',
            modifiedBy: 'Administrator MOD',
            isNew: false,
            type: 'file',
        },
    ],
    files: [
        {
            name: 'CoasterAndBargeLoading.xlsx',
            extension: 'xlsx',
            modified: 'A few seconds ago',
            modifiedBy: 'Administrator MOD',
            isNew: true,
            data: '',
            type: 'file',
            path: ""
        },
        {
            name: 'RevenueByServices.xlsx',
            extension: 'xlsx',
            modified: 'A few seconds ago',
            modifiedBy: 'Administrator MOD',
            isNew: true,
            data: '',
            type: 'file',
            path: ""
        },
    ],
    modified: 'A few seconds ago',
    modifiedBy: 'Administrator MOD',
    isNew: true,
    type: 'folder',
};


/***/ }),

/***/ "./src/scripts/utilities/_storageUtil.ts":
/*!***********************************************!*\
  !*** ./src/scripts/utilities/_storageUtil.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearStorage: function() { return /* binding */ clearStorage; },
/* harmony export */   deleteFromStorage: function() { return /* binding */ deleteFromStorage; },
/* harmony export */   loadFromStorage: function() { return /* binding */ loadFromStorage; },
/* harmony export */   saveToStorage: function() { return /* binding */ saveToStorage; }
/* harmony export */ });
const STORAGE_KEY = 'my_file_explorer_data';
const saveToStorage = (rootFolder) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rootFolder));
};
const loadFromStorage = (rootFolder) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : rootFolder;
};
const deleteFromStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
};
const clearStorage = () => {
    localStorage.clear();
};


/***/ }),

/***/ "./src/scripts/utilities/uiManager.ts":
/*!********************************************!*\
  !*** ./src/scripts/utilities/uiManager.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UIManager: function() { return /* binding */ UIManager; }
/* harmony export */ });
class UIManager {
    static showModal(modalId) { }
    static updateBreadcrumbs(path) { }
}
UIManager.renderGrid = (data) => {
    const desktopContainer = document.getElementById('desktop-row-container');
    const mobileContainer = document.getElementById('mobile-card-container');
    if (!desktopContainer || !mobileContainer)
        return;
    // 1. Desktop Rendering
    desktopContainer.innerHTML = data
        .map((item) => {
        const isFolder = 'subFolders' in item;
        const file = item;
        const folderItem = item;
        // Notice: Removed inline onblur/onkeyup. We handle this via Event Delegation now!
        const nameDisplay = folderItem.isEditing
            ? `<input type="text" id="new-folder-input" class="m-input-rename" value="${folderItem.name}" />`
            : item.name;
        return `
        <div class="m-table-row m-table-row--interactive" 
             data-action="${isFolder ? 'open-folder' : 'open-file'}" 
             data-name="${item.name}">
             
          <div>
            ${isFolder ? `<i class="fas fa-folder m-icon-folder"></i>` : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-${file.extension}"></use></svg>`}
          </div>
          
          <div class="m-text-overlay">
            ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
            ${nameDisplay}
          </div>
          
          <div class="m-text-secondary">${file.modified}</div>
          <div class="m-text-secondary">${file.modifiedBy}</div>
          
          <div class="d-flex gap-2 justify-content-center">
            <svg class="m-icon-custom is-clickable" data-action="edit" data-name="${item.name}" data-type="${isFolder ? 'folder' : 'file'}">
              <use href="src/files/icons.svg#icon-edit"></use>
            </svg>
            <svg class="m-icon-custom is-clickable" data-action="delete" data-name="${item.name}" data-type="${isFolder ? 'folder' : 'file'}">
              <use href="src/files/icons.svg#icon-delete"></use>
            </svg>
          </div>
        </div>
      `;
    })
        .join('');
    // 2. Mobile Rendering
    mobileContainer.innerHTML = data
        .map((item) => {
        const isFolder = 'subFolders' in item;
        const file = item;
        return `
        <div class="m-card" data-action="${isFolder ? 'open-folder' : 'open-file'}" data-name="${item.name}">
          <div class="m-card__row m-card__row--header">
                <div class="m-card__label">File Type</div>
              <div class="me-2" data-action="mobile-options" data-name="${item.name}" data-type="${isFolder ? 'folder' : 'file'}">
                ${isFolder ? `<i class="fas fa-folder m-icon-folder"></i>` : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-${file.extension}"></use></svg>`}
              </div>
            </div>
            
          </div>
          <div class="m-card__row">
            <div class="m-card__label">Name</div>
            <div class="m-card__value">
              <div class="m-text-overlay">
                ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
                ${item.name}
              </div>
            </div>
          </div>
          <div class="m-card__row"><div class="m-card__label">Modified</div><div class="m-card__value">${file.modified}</div></div>
          <div class="m-card__row"><div class="m-card__label">Modified By</div><div class="m-card__value">${file.modifiedBy}</div></div>
        </div>
      `;
    })
        .join('');
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
!function() {
var __webpack_exports__ = {};
/*!****************************************!*\
  !*** ./src/scripts/pages/home-page.ts ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utilities_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/_helper */ "./src/scripts/utilities/_helper.ts");
/* harmony import */ var _services_fileExplorer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../services/fileExplorer */ "./src/scripts/services/fileExplorer.ts");


(0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
    const app = new _services_fileExplorer__WEBPACK_IMPORTED_MODULE_1__.FileExplorer();
});

}();
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
!function() {
/*!*****************************************!*\
  !*** ./src/styles/pages/home-page.scss ***!
  \*****************************************/
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

}();
/******/ })()
;
//# sourceMappingURL=home-page.js.map
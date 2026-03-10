/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/services/crud.ts":
/*!**************************************!*\
  !*** ./src/scripts/services/crud.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createNewFolderDesktop: function() { return /* binding */ createNewFolderDesktop; },
/* harmony export */   deleteItem: function() { return /* binding */ deleteItem; },
/* harmony export */   downloadFile: function() { return /* binding */ downloadFile; },
/* harmony export */   handleFileClick: function() { return /* binding */ handleFileClick; },
/* harmony export */   openMobileOptionsSheet: function() { return /* binding */ openMobileOptionsSheet; },
/* harmony export */   openNewFolderMobile: function() { return /* binding */ openNewFolderMobile; },
/* harmony export */   openRenameModal: function() { return /* binding */ openRenameModal; },
/* harmony export */   processFileSelection: function() { return /* binding */ processFileSelection; },
/* harmony export */   saveFolderName: function() { return /* binding */ saveFolderName; },
/* harmony export */   submitNewFolderMobile: function() { return /* binding */ submitNewFolderMobile; },
/* harmony export */   submitRename: function() { return /* binding */ submitRename; },
/* harmony export */   triggerUpload: function() { return /* binding */ triggerUpload; }
/* harmony export */ });
/* harmony import */ var _utilities_modal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/_modal */ "./src/scripts/utilities/_modal.ts");
/* harmony import */ var _utilities_storageUtil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utilities/_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");
/* harmony import */ var _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utilities/uiManager */ "./src/scripts/utilities/uiManager.ts");



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
                    path: '',
                    data: e.target?.result,
                    type: 'file',
                });
            };
            reader.readAsDataURL(selectedFile);
        });
    });
    const processedFiles = await Promise.all(filePromises);
    currentFolder.files.push(...processedFiles);
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_1__.saveToStorage)(rootFolder);
    // Instead of calling global navigateToFolder, just refresh the UI
    // If you need path updates, trigger your UIManager.updatePath(...) here
    refreshUI();
    target.value = ''; // Reset input
}
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
// export function saveFolderName(
//   rootFolder: Folder,
//   currentFolder: Folder,
//   refreshUI: () => void,
//   inputElement: HTMLInputElement,
// ) {
//   const newName = inputElement.value.trim() || 'New folder';
//   const folderBeingEdited = currentFolder.subFolders.find(
//     (f) => f.isEditing,
//   );
//   if (!folderBeingEdited) return;
//   const isDuplicate = currentFolder.subFolders.some(
//     (f) =>
//       f !== folderBeingEdited &&
//       f.name.toLowerCase() === newName.toLowerCase(),
//   );
//   if (isDuplicate) {
//     alert(
//       `This destination already contains a folder named '${newName}'.`,
//     );
//     setTimeout(() => {
//       inputElement.focus();
//       inputElement.select();
//     }, 10);
//     return;
//   }
//   folderBeingEdited.name = newName;
//   folderBeingEdited.path =
//     currentFolder.path === '/'
//       ? `/${newName}`
//       : `${currentFolder.path}/${newName}`;
//   delete folderBeingEdited.isEditing;
//   saveToStorage(rootFolder);
//   refreshUI();
// }
function handleFileClick(currentFolder, fileName) {
    const file = currentFolder.files.find((f) => f.name === fileName);
    if (!file)
        return;
    file.isNew = false;
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__.UIManager.saveAndRefresh(currentFolder);
    document.getElementById('modalFileName').innerText = file.name;
    document.getElementById('modalFileExtension').innerText =
        file.extension;
    document.getElementById('modalFileModified').innerText =
        file.modified;
    document.getElementById('modalFileModifiedBy').innerText =
        file.modifiedBy;
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_0__.openModal)('fileModal');
}
function downloadFile(currentFolder, fileName) {
    const file = currentFolder.files.find((f) => f.name === fileName);
    if (!file || !file.data)
        return;
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function deleteItem(currentFolder, name, isFolder) {
    if (!confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`))
        return;
    if (isFolder) {
        currentFolder.subFolders = currentFolder.subFolders.filter((f) => f.name !== name);
    }
    else {
        currentFolder.files = currentFolder.files.filter((f) => f.name !== name);
    }
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__.UIManager.saveAndRefresh(currentFolder);
}
function openRenameModal(stateRef, oldName, isFolder) {
    // CRITICAL FIX: Mutate the properties of the passed object. 
    // Do NOT reassign the whole object (stateRef = {...})!
    stateRef.oldName = oldName;
    stateRef.isFolder = isFolder;
    const input = document.getElementById('renameInput');
    if (input) {
        input.value = oldName;
        (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_0__.openModal)('renameModal');
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
function submitRename(currentFolder) {
    const input = document.getElementById('renameInput');
    const newName = input.value.trim();
    const { oldName, isFolder } = this._editingItemState;
    if (!newName || newName === oldName) {
        (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_0__.closeModal)('renameModal');
        return;
    }
    const itemArray = isFolder
        ? currentFolder.subFolders
        : currentFolder.files;
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
                currentFolder.path === '/'
                    ? `/${newName}`
                    : `${currentFolder.path}/${newName}`;
        }
        else {
            const lastDot = newName.lastIndexOf('.');
            target.extension =
                lastDot > 0
                    ? newName.substring(lastDot + 1).toLowerCase()
                    : '';
        }
    }
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__.UIManager.saveAndRefresh(currentFolder);
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_0__.closeModal)('renameModal');
}
function openMobileOptionsSheet(name, isFolder) {
    this._mobileActionItem = { name, isFolder };
    const title = document.getElementById('optionsModalTitle');
    if (title)
        title.innerText = name;
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_0__.openModal)('mobileOptionsModal');
}
function openNewFolderMobile() {
    // 1. Hide the Bootstrap mobile menu (if it's open)
    document.getElementById('mobileMenu')?.classList.remove('show');
    // 2. Clear the input from the last time it was used
    const input = document.getElementById('newFolderNameInput');
    if (input)
        input.value = '';
    // 3. Open the modal
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_0__.openModal)('newFolderModal');
    // 4. Try to focus the input automatically for the user
    setTimeout(() => input?.focus(), 100);
}
function submitNewFolderMobile(currentFolder) {
    const input = document.getElementById('newFolderNameInput');
    let newName = input.value.trim();
    // If they left it blank, default to "New folder"
    if (!newName) {
        newName = 'New folder';
    }
    // Check if a folder with this name already exists
    const isDuplicate = currentFolder.subFolders.some((f) => f.name.toLowerCase() === newName.toLowerCase());
    if (isDuplicate) {
        alert('A folder with this name already exists.');
        input.focus();
        return; // Stop the function early
    }
    // Create the new folder object
    const newFolder = {
        name: newName,
        path: currentFolder.path === '/'
            ? `/${newName}`
            : `${currentFolder.path}/${newName}`,
        subFolders: [],
        files: [],
        modified: 'Just now',
        modifiedBy: 'You',
        isNew: true,
        type: 'folder',
        // Notice: NO 'isEditing: true' here! Mobile doesn't use the inline grid input.
    };
    // Add it to the top of the list
    currentFolder.subFolders.unshift(newFolder);
    // Save state, redraw the grid, and close the modal
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__.UIManager.saveAndRefresh(currentFolder);
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_0__.closeModal)('newFolderModal');
}
function saveFolderName(currentFolder, inputElement) {
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
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__.UIManager.saveAndRefresh(currentFolder);
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
/* harmony import */ var _utilities_modal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utilities/_modal */ "./src/scripts/utilities/_modal.ts");
/* harmony import */ var _utilities_navigate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utilities/_navigate */ "./src/scripts/utilities/_navigate.ts");
/* harmony import */ var _utilities_storageUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utilities/_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");
/* harmony import */ var _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utilities/uiManager */ "./src/scripts/utilities/uiManager.ts");
/* harmony import */ var _crud__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./crud */ "./src/scripts/services/crud.ts");







class FileExplorer {
    constructor() {
        this._navigationHistory = [];
        //State for modals
        this._editingItemState = { oldName: '', isFolder: false };
        this._mobileActionItem = { name: '', isFolder: false };
        this._rootFolder = (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_3__.loadFromStorage)(_utilities_initData__WEBPACK_IMPORTED_MODULE_0__.rootFolder);
        this._currentFolder = this._rootFolder;
        // Setup event listeners once when the app starts
        this.setupEventListeners();
        // Initial Render
        _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI(this._currentFolder);
        _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.updateBreadcrumbs('folder-path-display', this._currentFolder);
    }
    // A handy helper to keep your code DRY (Don't Repeat Yourself)
    setupEventListeners() {
        this.initToolbarEvents();
        this.initGridEvents();
        this.initModalEvents();
        this.initBreadcrumbEvents();
        this.initMobileMenuEvents();
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
                case 'new-folder':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.createNewFolderDesktop)(this._currentFolder, _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI.bind(this));
                    break;
                case 'upload-file':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.triggerUpload)();
                    break;
            }
        });
        // 2. Listener for the Hidden File Input
        fileInput?.addEventListener('change', _crud__WEBPACK_IMPORTED_MODULE_5__.processFileSelection.bind(this, this._rootFolder, this._currentFolder, _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI.bind(this)));
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
                        (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.handleFolderClick)(this._currentFolder, itemName);
                    break;
                case 'open-file':
                    if (itemName)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.handleFileClick)(this._currentFolder, itemName);
                    break;
                case 'delete':
                    if (itemName)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.deleteItem)(this._currentFolder, itemName, isFolder);
                    break;
                case 'edit':
                    if (itemName)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.openRenameModal)(this._editingItemState, itemName, isFolder);
                    break;
                case 'mobile-options':
                    if (itemName)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.openMobileOptionsSheet)(itemName, isFolder);
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
                (0,_crud__WEBPACK_IMPORTED_MODULE_5__.saveFolderName)(this._currentFolder, target);
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
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitRename)(this._currentFolder);
                    break;
                case 'close-rename':
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('renameModal');
                    break;
                // --- Mobile Options Sheet ---
                case 'trigger-mobile-rename':
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('mobileOptionsModal');
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.openRenameModal)(this._editingItemState, this._mobileActionItem.name, this._mobileActionItem.isFolder);
                    break;
                case 'trigger-mobile-delete':
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('mobileOptionsModal');
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.deleteItem)(this._currentFolder, this._mobileActionItem.name, this._mobileActionItem.isFolder);
                    break;
                case 'close-mobile-options':
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('mobileOptionsModal');
                    break;
                // --- File Viewer Modal ---
                case 'download-file':
                    const fileName = document.getElementById('modalFileName')?.innerText;
                    if (fileName)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.downloadFile)(this._currentFolder, fileName);
                    break;
                case 'close-file-modal':
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('fileModal');
                    break;
                // --- New Folder Modal (Mobile) ---
                case 'submit-new-folder':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitNewFolderMobile)(this._currentFolder);
                    break;
                case 'close-new-folder':
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('newFolderModal');
                    break;
            }
        });
        // Optional: Pressing "Enter" in the Rename or New Folder inputs
        document.body.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const target = event.target;
                if (target.id === 'renameInput') {
                    event.preventDefault();
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitRename)(this._currentFolder);
                }
                else if (target.id === 'newFolderNameInput') {
                    event.preventDefault();
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitNewFolderMobile)(this._currentFolder); // Assuming you migrated your submitNewFolder logic!
                }
            }
        });
    }
    initBreadcrumbEvents() {
        const pathDisplay = document.getElementById('folder-path-display');
        pathDisplay?.addEventListener('click', (event) => {
            const target = event.target.closest('[data-path]');
            if (target && target.dataset.path) {
                (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.navigateFromBreadcrumb)(this._rootFolder, this._currentFolder, _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI.bind(this), target.dataset.path);
            }
        });
    }
    initMobileMenuEvents() {
        const mobileMenuList = document.querySelector('.m-mobile-list');
        mobileMenuList?.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (!target)
                return;
            const action = target.dataset.action;
            switch (action) {
                case 'new-folder':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.openNewFolderMobile)();
                    break;
                case 'upload-file':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.triggerUpload)(); // Reuses the exact same method as desktop!
                    break;
                // You can easily wire up sync/export here later
            }
        });
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

/***/ "./src/scripts/utilities/_modal.ts":
/*!*****************************************!*\
  !*** ./src/scripts/utilities/_modal.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   closeModal: function() { return /* binding */ closeModal; },
/* harmony export */   openModal: function() { return /* binding */ openModal; }
/* harmony export */ });
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal)
        modal.style.display = 'flex';
}
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal)
        modal.style.display = 'none';
}


/***/ }),

/***/ "./src/scripts/utilities/_navigate.ts":
/*!********************************************!*\
  !*** ./src/scripts/utilities/_navigate.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handleFolderClick: function() { return /* binding */ handleFolderClick; },
/* harmony export */   navigateFromBreadcrumb: function() { return /* binding */ navigateFromBreadcrumb; }
/* harmony export */ });
/* harmony import */ var _uiManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./uiManager */ "./src/scripts/utilities/uiManager.ts");

function handleFolderClick(currentFolder, folderName) {
    const targetFolder = currentFolder.subFolders.find((f) => f.name === folderName);
    if (!targetFolder)
        return;
    targetFolder.isNew = false;
    this.saveAndRefresh();
    // Push to history before moving
    this._navigationHistory.push(currentFolder);
    currentFolder = targetFolder;
    _uiManager__WEBPACK_IMPORTED_MODULE_0__.UIManager.updateBreadcrumbs('folder-path-display', currentFolder);
    this.refreshUI();
}
function navigateFromBreadcrumb(rootFolder, currentFolder, refreshUI, targetPath) {
    if (targetPath === '/') {
        currentFolder = rootFolder;
        this._navigationHistory = []; // Clear history if returning to root
    }
    else {
        const segments = targetPath
            .split('/')
            .filter((s) => s.length > 0);
        let foundFolder = rootFolder;
        for (const segment of segments) {
            const nextFolder = foundFolder.subFolders.find((f) => f.name === segment);
            if (nextFolder)
                foundFolder = nextFolder;
            else
                return; // Stop if path is invalid
        }
        currentFolder = foundFolder;
    }
    _uiManager__WEBPACK_IMPORTED_MODULE_0__.UIManager.updateBreadcrumbs('folder-path-display', currentFolder);
    refreshUI();
}


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
/* harmony import */ var _storageUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");

class UIManager {
    static refreshUI(currentFolder) {
        UIManager.renderGrid([
            ...currentFolder.subFolders,
            ...currentFolder.files,
        ]);
    }
    static saveAndRefresh(rootFolder) {
        (0,_storageUtil__WEBPACK_IMPORTED_MODULE_0__.saveToStorage)(rootFolder);
        this.refreshUI(rootFolder);
    }
    static updateBreadcrumbs(modalId, currentFolder) {
        const pathDisplay = document.getElementById(modalId);
        if (!pathDisplay)
            return;
        let breadcrumbsHTML = `<span class="m-breadcrumb is-clickable" data-path="/">Documents</span>`;
        if (currentFolder.path !== '/') {
            const segments = currentFolder.path
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
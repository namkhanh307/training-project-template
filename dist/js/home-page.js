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
/* harmony export */   submitNewFile: function() { return /* binding */ submitNewFile; },
/* harmony export */   submitNewFolderMobile: function() { return /* binding */ submitNewFolderMobile; },
/* harmony export */   submitRename: function() { return /* binding */ submitRename; },
/* harmony export */   triggerUpload: function() { return /* binding */ triggerUpload; }
/* harmony export */ });
/* harmony import */ var _utilities_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/_helper */ "./src/scripts/utilities/_helper.ts");
/* harmony import */ var _utilities_modal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utilities/_modal */ "./src/scripts/utilities/_modal.ts");
/* harmony import */ var _utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utilities/_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");
/* harmony import */ var _utilities_uiManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utilities/uiManager */ "./src/scripts/utilities/uiManager.ts");




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
            const safeUniqueName = (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.generateUniqueFileName)(selectedFile.name, currentFolder.files);
            const lastDotIndex = selectedFile.name.lastIndexOf('.');
            const fileExtension = lastDotIndex > 0
                ? selectedFile.name
                    .substring(lastDotIndex + 1)
                    .toLowerCase()
                : '';
            reader.onload = (e) => {
                resolve({
                    name: safeUniqueName,
                    extension: fileExtension,
                    modified: new Date().toISOString(),
                    modifiedBy: 'You',
                    isNew: true,
                    path: currentFolder.path === '/'
                        ? `/${currentFolder.name}`
                        : `${currentFolder.path}/${currentFolder.name}`,
                    data: e.target?.result,
                    type: 'file',
                    id: (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.generateID)(),
                });
            };
            reader.readAsDataURL(selectedFile);
        });
    });
    const processedFiles = await Promise.all(filePromises);
    currentFolder.files.unshift(...processedFiles);
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.saveToStorage)(rootFolder);
    // Instead of calling global navigateToFolder, just refresh the UI
    // If you need path updates, trigger your UIManager.updatePath(...) here
    refreshUI();
    target.value = ''; // Reset input
}
async function createNewFolderDesktop(currentFolder, refreshUI) {
    const folderName = (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.generateUniqueName)('New folder', currentFolder.subFolders);
    const newFolder = {
        name: folderName,
        path: currentFolder.path === '/'
            ? `/${folderName}`
            : `${currentFolder.path}/${folderName}`,
        subFolders: [],
        files: [],
        modified: new Date().toISOString(),
        modifiedBy: 'You',
        isNew: true,
        isEditing: true,
        type: 'folder',
        id: (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.generateID)(),
    };
    currentFolder.subFolders.unshift(newFolder);
    await refreshUI();
    const input = document.getElementById('new-folder-input');
    if (input) {
        input.value = folderName;
        input.focus();
        input.select();
    }
}
function handleFileClick(currentFolder, fileId) {
    const file = currentFolder.files.find((f) => f.id === fileId);
    if (!file)
        return;
    file.isNew = false;
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_3__.UIManager.saveAndRefresh(currentFolder);
    document.getElementById('modalFileName').innerText = file.name;
    document.getElementById('modalFileExtension').innerText =
        file.extension;
    document.getElementById('modalFileModified').innerText =
        file.modified;
    document.getElementById('modalFileModifiedBy').innerText =
        file.modifiedBy;
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.openModal)('fileModal');
}
function downloadFile(currentFolder, fileName) {
    const file = currentFolder.files.find((f) => f.name === fileName);
    if (!file || !file.data) {
        alert('Sorry, this file cannot be downloaded because it has no data.');
        return;
    }
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function deleteItem(currentFolder, itemId, isFolder) {
    console.log(currentFolder.subFolders.map((f) => f.id));
    console.log(`Attempting to delete ${isFolder ? 'folder' : 'file'} with ID: ${itemId}`);
    if (!confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`))
        return;
    if (isFolder) {
        currentFolder.subFolders = currentFolder.subFolders.filter((f) => f.id !== itemId);
    }
    else {
        currentFolder.files = currentFolder.files.filter((f) => f.id !== itemId);
    }
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_3__.UIManager.saveAndRefresh(currentFolder);
}
function openRenameModal(stateRef, oldName, isFolder) {
    stateRef.oldName = oldName;
    stateRef.isFolder = isFolder;
    const input = document.getElementById('renameInput');
    if (input) {
        input.value = oldName;
        (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.openModal)('renameModal');
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
function submitRename(stateRef, currentFolder) {
    const input = document.getElementById('renameInput');
    const newName = input.value.trim();
    const { id, oldName, isFolder } = stateRef;
    if (!newName || newName === oldName) {
        (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('renameModal');
        return;
    }
    if (!(0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.isValidName)(newName)) {
        alert('A file name cannot contain any of the following characters: \\ / : * ? " < > |');
        input.focus();
        return;
    }
    const itemArray = isFolder
        ? currentFolder.subFolders
        : currentFolder.files;
    const duplicateFound = (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.isNameDuplicate)(newName, itemArray, true, id);
    if (duplicateFound) {
        alert('An item with this name already exists in this location.');
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
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_3__.UIManager.saveAndRefresh(currentFolder);
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('renameModal');
}
function openMobileOptionsSheet(id, name, isFolder, mobileActionItem) {
    mobileActionItem.id = id;
    mobileActionItem.name = name;
    mobileActionItem.isFolder = isFolder;
    const title = document.getElementById('optionsModalTitle');
    if (title)
        title.innerText = name;
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.openModal)('mobileOptionsModal');
}
function openNewFolderMobile() {
    // 1. Hide the Bootstrap mobile menu (if it's open)
    document.getElementById('mobileMenu')?.classList.remove('show');
    // 2. Clear the input from the last time it was used
    const input = document.getElementById('newFolderNameInput');
    if (input)
        input.value = '';
    // 3. Open the modal
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.openModal)('newFolderModal');
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
    if (!(0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.isValidName)(newName)) {
        alert('A folder name cannot contain any of the following characters: \\ / : * ? " < > |');
        input.focus();
        return;
    }
    // Check if a folder with this name already exists
    const duplicateFound = (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.isNameDuplicate)(newName, currentFolder.subFolders, false);
    if (duplicateFound) {
        alert('A folder with this name already exists.');
        input.focus();
        return;
    }
    // Create the new folder object
    const newFolder = {
        name: newName,
        path: currentFolder.path === '/'
            ? `/${newName}`
            : `${currentFolder.path}/${newName}`,
        subFolders: [],
        files: [],
        modified: new Date().toISOString(),
        modifiedBy: 'You',
        isNew: true,
        type: 'folder',
        id: (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.generateID)(),
    };
    // Add it to the top of the list
    currentFolder.subFolders.unshift(newFolder);
    // Save state, redraw the grid, and close the modal
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_3__.UIManager.saveAndRefresh(currentFolder);
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('newFolderModal');
}
function saveFolderName(currentFolder, inputElement) {
    // 1. THE LOCK: Prevent Enter-key mashing
    if (inputElement.dataset.isSaving === 'true')
        return;
    inputElement.dataset.isSaving = 'true';
    const newName = inputElement.value.trim() || 'New folder';
    // Find the temporary folder
    const folderBeingEdited = currentFolder.subFolders.find((f) => f.isEditing);
    if (!folderBeingEdited) {
        inputElement.dataset.isSaving = 'false';
        return;
    }
    // 2. VALIDATION
    const isInvalid = !(0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.isValidName)(newName);
    const isDuplicate = (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.isNameDuplicate)(newName, currentFolder.subFolders, false);
    if (isInvalid || isDuplicate) {
        const errorMsg = isInvalid
            ? 'A folder name cannot contain special characters like / : * ? " < > |'
            : 'A folder with this name already exists.';
        alert(errorMsg); // Safe to use now!
        // Give focus back to the input so they can fix it
        setTimeout(() => {
            inputElement.dataset.isSaving = 'false';
            inputElement.focus();
            inputElement.select();
        }, 10);
        return;
    }
    // 3. SUCCESS
    folderBeingEdited.name = newName;
    folderBeingEdited.path =
        currentFolder.path === '/'
            ? `/${newName}`
            : `${currentFolder.path}/${newName}`;
    delete folderBeingEdited.isEditing;
    // 4. RENDER
    // Make sure your saveAndRefresh actually calls your UI update!
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_3__.UIManager.saveAndRefresh(currentFolder);
}
function submitNewFile(currentFolder) {
    const input = document.getElementById('newFileNameInput');
    let newName = input.value.trim();
    // Default to a blank text file if they don't type anything
    if (!newName) {
        newName = 'New Document.txt';
    }
    const duplicateFound = (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.isNameDuplicate)(newName, currentFolder.files, true);
    if (duplicateFound) {
        alert('A file with this name already exists.');
        input.focus();
        return;
    }
    if (!(0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.isValidName)(newName)) {
        alert('A file name cannot contain any of the following characters: \\ / : * ? " < > |');
        input.focus();
        return;
    }
    // Extract the extension (e.g. from "data.xlsx" get "xlsx")
    const lastDotIndex = newName.lastIndexOf('.');
    const extension = lastDotIndex > 0
        ? newName.substring(lastDotIndex + 1).toLowerCase()
        : '';
    // Create the dummy file object
    const newFile = {
        name: newName,
        extension: extension,
        modified: new Date().toISOString(),
        modifiedBy: 'You',
        isNew: true,
        data: '', // Empty base64 data since it's a blank file
        type: 'file',
        path: currentFolder.path === '/'
            ? `/${currentFolder.name}`
            : `${currentFolder.path}/${newName}`,
        id: (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.generateID)(),
    };
    // Push it to the top of the array
    currentFolder.files.unshift(newFile);
    // Save, Render, and Close!
    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_3__.UIManager.saveAndRefresh(currentFolder); // (Assuming this is your save helper)
    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('newFileModal');
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
        this._editingItemState = {
            id: '',
            oldName: '',
            isFolder: false,
        };
        this._mobileActionItem = {
            id: '',
            name: '',
            isFolder: false,
        };
        this._rootFolder = (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_3__.loadFromStorage)(_utilities_initData__WEBPACK_IMPORTED_MODULE_0__.rootFolder); //load database
        const initialPath = (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.getPathFromUrl)(); //read url
        this._currentFolder = (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.navigateFromBreadcrumb)(this._rootFolder, initialPath); //locate current folder
        this.setupEventListeners(); //attach listeners for the entire app (using delegation inside those methods)
        // Initial Render
        _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI(this._currentFolder);
        _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.updateBreadcrumbs('folder-path-display', this._currentFolder);
        window.addEventListener('popstate', () => {
            const path = (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.getPathFromUrl)();
            this._currentFolder = (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.navigateFromBreadcrumb)(this._rootFolder, path);
            _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI(this._currentFolder);
            _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.updateBreadcrumbs('folder-path-display', this._currentFolder);
        });
    }
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
        desktopToolbar?.addEventListener('click', async (event) => {
            const target = event.target.closest('[data-action]');
            if (!target)
                return;
            const action = target.dataset.action;
            const newMenu = document.getElementById('newOptionsMenu');
            switch (action) {
                case 'upload-file':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.triggerUpload)();
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
                    if (newMenu)
                        newMenu.style.display = 'none';
                    // 2. Call your existing inline folder creation method!
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.createNewFolderDesktop)(this._currentFolder, () => _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI(this._currentFolder));
                    break;
                case 'trigger-new-file':
                    // 1. Hide the menu
                    if (newMenu)
                        newMenu.style.display = 'none';
                    // 2. Open the new file modal
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.openNewFileModal)();
                    break;
            }
            document.addEventListener('click', (event) => {
                const target = event.target;
                if (!target.closest('[data-action="toggle-new-menu"]')) {
                    const menu = document.getElementById('newOptionsMenu');
                    if (menu)
                        menu.style.display = 'none';
                }
            });
        });
        // 2. Listener for the Hidden File Input
        fileInput?.addEventListener('change', (event) => {
            (0,_crud__WEBPACK_IMPORTED_MODULE_5__.processFileSelection)(this._rootFolder, this._currentFolder, () => _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI(this._currentFolder), event);
        });
    }
    initGridEvents() {
        const mainContainer = document.querySelector('.l-main-container');
        mainContainer?.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (!target)
                return;
            event.stopPropagation(); // Prevent clicks from bubbling up to parent rows
            const action = target.dataset.action;
            const itemId = target.dataset.id;
            const itemName = target.dataset.name;
            const isFolder = target.dataset.type === 'folder';
            switch (action) {
                case 'open-folder':
                    if (itemName) {
                        // Overwrite the class state with the newly returned folder!
                        this._currentFolder = (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.handleFolderClick)(this._navigationHistory, this._currentFolder, itemName);
                    }
                    break;
                case 'open-file':
                    if (itemId)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.handleFileClick)(this._currentFolder, itemId);
                    break;
                case 'delete':
                    if (itemId)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.deleteItem)(this._currentFolder, itemId, isFolder);
                    break;
                case 'edit':
                    if (itemName)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.openRenameModal)(this._editingItemState, itemName, isFolder);
                    break;
                case 'mobile-options':
                    if (itemName)
                        (0,_crud__WEBPACK_IMPORTED_MODULE_5__.openMobileOptionsSheet)(itemId, itemName, isFolder, this._mobileActionItem);
                    break;
            }
        });
        // Handle typing in the input box
        mainContainer?.addEventListener('keydown', (event) => {
            const target = event.target;
            if (target.id === 'new-folder-input') {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Stop the enter key from doing anything else
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.saveFolderName)(this._currentFolder, target);
                }
                // Bonus UX: Let them hit Escape to cancel!
                if (event.key === 'Escape') {
                    // Revert the UI by just refreshing the grid (which wipes out the unsaved input)
                    this._currentFolder.subFolders =
                        this._currentFolder.subFolders.filter((f) => !f.isEditing);
                    _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI(this._currentFolder);
                }
            }
        });
    }
    initModalEvents() {
        // We attach one listener to the body to catch ALL modal clicks
        document.body.addEventListener('click', async (event) => {
            const target = event.target.closest('[data-modal-action]');
            if (!target)
                return;
            const action = target.dataset.modalAction;
            switch (action) {
                // --- Rename Modal ---
                case 'submit-rename':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitRename)(this._editingItemState, this._currentFolder);
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
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.deleteItem)(this._currentFolder, this._mobileActionItem.id, this._mobileActionItem.isFolder);
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
                case 'submit-new-file':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitNewFile)(this._currentFolder);
                    break;
                case 'close-new-file':
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.closeModal)('newFileModal');
                    break;
            }
        });
        // Optional: Pressing "Enter" in the Rename or New Folder inputs
        document.body.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const target = event.target;
                if (target.id === 'renameInput') {
                    event.preventDefault();
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitRename)(this._editingItemState, this._currentFolder);
                }
                else if (target.id === 'newFolderNameInput') {
                    event.preventDefault();
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitNewFolderMobile)(this._currentFolder); // Assuming you migrated your submitNewFolder logic!
                }
                else if (target.id === 'newFileNameInput') {
                    event.preventDefault();
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.submitNewFile)(this._currentFolder);
                }
            }
        });
    }
    initBreadcrumbEvents() {
        const pathDisplay = document.getElementById('folder-path-display');
        pathDisplay?.addEventListener('click', (event) => {
            const target = event.target.closest('[data-path]');
            if (!target || !target.dataset.path)
                return;
            // 1. Calculate the new folder
            this._currentFolder = (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.navigateFromBreadcrumb)(this._rootFolder, target.dataset.path);
            // 2. Update the URL visually
            (0,_utilities_navigate__WEBPACK_IMPORTED_MODULE_2__.updateUrlPath)(this._currentFolder.path || '/');
            // 3. Render BOTH the grid and the breadcrumbs! (Removed arrow function)
            _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.refreshUI(this._currentFolder);
            _utilities_uiManager__WEBPACK_IMPORTED_MODULE_4__.UIManager.updateBreadcrumbs('folder-path-display', this._currentFolder);
        });
    }
    initMobileMenuEvents() {
        const mobileMenuList = document.querySelector('.m-mobile-list');
        mobileMenuList?.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (!target)
                return;
            const action = target.dataset.action;
            const mobileNewMenu = document.getElementById('newOptionsMenuMobile');
            switch (action) {
                // --- NEW DROPDOWN TOGGLE ---
                case 'toggle-new-menu-mobile':
                    if (mobileNewMenu) {
                        // Check if it's currently showing block, if so, hide it. Otherwise, show it.
                        const isShowing = window.getComputedStyle(mobileNewMenu).display ===
                            'block';
                        mobileNewMenu.style.display = isShowing
                            ? 'none'
                            : 'block';
                    }
                    break;
                // --- OPTION 1: NEW FOLDER ---
                case 'trigger-new-folder-mobile':
                    if (mobileNewMenu)
                        mobileNewMenu.style.display = 'none'; // Hide dropdown
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.openNewFolderMobile)(); // Trigger your existing function
                    break;
                // --- OPTION 2: NEW FILE ---
                case 'trigger-new-file-mobile':
                    if (mobileNewMenu)
                        mobileNewMenu.style.display = 'none'; // Hide dropdown
                    // 1. Hide the Bootstrap mobile sidebar drawer
                    document
                        .getElementById('mobileMenu')
                        ?.classList.remove('show');
                    // 2. Open the file modal (Assuming this is inside FileExplorer.ts)
                    (0,_utilities_modal__WEBPACK_IMPORTED_MODULE_1__.openNewFileModal)();
                    break;
                // --- UPLOAD ---
                case 'upload-file':
                    (0,_crud__WEBPACK_IMPORTED_MODULE_5__.triggerUpload)();
                    break;
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
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateID: function() { return /* binding */ generateID; },
/* harmony export */   generateUniqueFileName: function() { return /* binding */ generateUniqueFileName; },
/* harmony export */   generateUniqueName: function() { return /* binding */ generateUniqueName; },
/* harmony export */   getFileIconHTML: function() { return /* binding */ getFileIconHTML; },
/* harmony export */   getRelativeTime: function() { return /* binding */ getRelativeTime; },
/* harmony export */   isNameDuplicate: function() { return /* binding */ isNameDuplicate; },
/* harmony export */   isValidName: function() { return /* binding */ isValidName; }
/* harmony export */ });
const ready = (fn) => {
    if (document.readyState !== 'loading') {
        fn();
    }
    else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};
/* harmony default export */ __webpack_exports__["default"] = (ready);
// Icon Helper
const SUPPORTED_ICONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
function getFileIconHTML(extension) {
    const safeExt = extension.toLowerCase();
    // 1. If have the custom SVG
    if (SUPPORTED_ICONS.includes(safeExt)) {
        return `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-${safeExt}"></use></svg>`;
    }
    // 2. Fallback
    return `<i class="fas fa-file-alt text-secondary" style="font-size: 1.25rem;"></i>`;
}
// Time Helper
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime()))
        return dateString;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'A few seconds ago';
    if (diffInSeconds < 3600) {
        const mins = Math.floor(diffInSeconds / 60);
        return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return days === 1 ? 'Yesterday' : `${days} days ago`;
    }
    if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return years === 1 ? '1 year ago' : `${years} years ago`;
}
//ID Helper
function generateID() {
    return window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
}
//Naming Helper
/**
 * Checks if a file or folder name already exists.
 * * @param newName The text the user typed into the input
 * @param items The array to check (either currentFolder.subFolders or currentFolder.files)
 * @param isEdit True if renaming, False if creating new
 * @param currentId The ID of the item being renamed (Only needed if isEdit is true)
 * @returns boolean (true if it's a duplicate, false if it's safe to use)
 */
function isNameDuplicate(newName, items, isEdit, currentId) {
    const formattedNewName = newName.trim().toLowerCase();
    return items.some((item) => {
        // 1. If we are editing, IGNORE the item we are currently renaming!
        // This allows the user to save without changing the name.
        if (isEdit && item.id === currentId) {
            return false;
        }
        // 2. Otherwise, check if the name matches another item
        return item.name.toLowerCase() === formattedNewName;
    });
}
/**
 * Generates a unique name by appending (1), (2), etc., if the base name already exists.
 * @param baseName The default name you want to use (e.g., "New folder")
 * @param existingItems The array of current files or folders to check against
 * @returns A guaranteed unique string
 */
function generateUniqueName(baseName, existingItems) {
    let uniqueName = baseName;
    let counter = 1;
    // Map all existing names to lowercase once for easy comparison
    const existingNames = existingItems.map((item) => item.name.toLowerCase());
    // Keep incrementing the counter until we find a name that isn't in the list
    while (existingNames.includes(uniqueName.toLowerCase())) {
        uniqueName = `${baseName} (${counter})`;
        counter++;
    }
    return uniqueName;
}
/**
 * Checks if a file or folder name contains forbidden special characters.
 * Forbidden characters: < > : " / \ | ? *
 * * @param name The name to check
 * @returns boolean (true if the name is SAFE, false if it contains bad characters)
 */
function isValidName(name) {
    // This Regex looks for any of the standard forbidden file system characters
    const forbiddenChars = /[<>:"/\\|?*]/;
    // If the regex finds a match, it's invalid (returns false). Otherwise, it's safe (returns true).
    return !forbiddenChars.test(name);
}
/**
 * Generates a unique file name, preserving the extension.
 * Example: "Data.csv" -> "Data (1).csv"
 * * @param originalName The full uploaded file name (e.g., "Budget.xlsx")
 * @param existingItems The array of current files to check against
 * @returns A guaranteed unique file string
 */
function generateUniqueFileName(originalName, existingItems) {
    // 1. Separate the base name and the extension]
    console.log('Generating unique name for:', originalName);
    console.log('Existing items:', existingItems.map(i => i.name));
    const lastDotIndex = originalName.lastIndexOf('.');
    let baseName = originalName;
    let extension = '';
    // If there's a dot, and it's not the very first character (like a .gitignore file)
    if (lastDotIndex > 0) {
        baseName = originalName.substring(0, lastDotIndex);
        extension = originalName.substring(lastDotIndex); // This includes the dot, e.g., ".xlsx"
    }
    let uniqueName = originalName;
    let counter = 1;
    // Map existing names to lowercase for safe comparison
    const existingNames = existingItems.map((item) => item.name.toLowerCase());
    // 2. Keep incrementing the counter right BEFORE the extension
    while (existingNames.includes(uniqueName.toLowerCase())) {
        uniqueName = `${baseName} (${counter})${extension}`;
        counter++;
    }
    return uniqueName;
}


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
            files: [],
            modified: '2026-03-10T10:57:54.553Z',
            modifiedBy: 'Administrator MOD',
            isNew: false,
            type: 'file',
            id: "19d500847ecc4b5380717625f022e568"
        },
    ],
    files: [
        {
            name: 'CoasterAndBargeLoading.xlsx',
            extension: 'xlsx',
            modified: '2026-03-10T10:57:54.553Z',
            modifiedBy: 'Administrator MOD',
            isNew: true,
            data: '',
            type: 'file',
            path: "",
            id: "db3d4c7c70664b7ca78ad096e8b6e438"
        },
        {
            name: 'RevenueByServices.xlsx',
            extension: 'xlsx',
            modified: '2026-03-10T10:57:54.553Z',
            modifiedBy: 'Administrator MOD',
            isNew: true,
            data: '',
            type: 'file',
            path: "",
            id: "18b614c9a0d04404a5320e67c632230e"
        },
    ],
    modified: '2026-03-10T10:57:54.553Z',
    modifiedBy: 'Administrator MOD',
    isNew: true,
    type: 'folder',
    id: "ea7e1286db2f4b60b058caffb87f1572"
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
/* harmony export */   openModal: function() { return /* binding */ openModal; },
/* harmony export */   openNewFileModal: function() { return /* binding */ openNewFileModal; }
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
function openNewFileModal() {
    const input = document.getElementById('newFileNameInput');
    if (input)
        input.value = '';
    openModal('newFileModal');
    setTimeout(() => input?.focus(), 100);
}


/***/ }),

/***/ "./src/scripts/utilities/_navigate.ts":
/*!********************************************!*\
  !*** ./src/scripts/utilities/_navigate.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getPathFromUrl: function() { return /* binding */ getPathFromUrl; },
/* harmony export */   handleFolderClick: function() { return /* binding */ handleFolderClick; },
/* harmony export */   navigateFromBreadcrumb: function() { return /* binding */ navigateFromBreadcrumb; },
/* harmony export */   updateUrlPath: function() { return /* binding */ updateUrlPath; }
/* harmony export */ });
/* harmony import */ var _uiManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./uiManager */ "./src/scripts/utilities/uiManager.ts");

function handleFolderClick(navigationHistory, currentFolder, folderName) {
    const targetFolder = currentFolder.subFolders.find((f) => f.name === folderName);
    if (!targetFolder)
        return currentFolder;
    targetFolder.isNew = false;
    navigationHistory.push(currentFolder);
    currentFolder = targetFolder;
    updateUrlPath(currentFolder.path || '/');
    _uiManager__WEBPACK_IMPORTED_MODULE_0__.UIManager.refreshUI(currentFolder);
    _uiManager__WEBPACK_IMPORTED_MODULE_0__.UIManager.updateBreadcrumbs('folder-path-display', currentFolder);
    return currentFolder;
}
function navigateFromBreadcrumb(rootFolder, targetPath) {
    if (targetPath === '/')
        return rootFolder;
    const segments = targetPath.split('/').filter((s) => s.length > 0);
    let foundFolder = rootFolder;
    for (const segment of segments) {
        const nextFolder = foundFolder.subFolders.find((f) => f.name === segment);
        if (nextFolder) {
            foundFolder = nextFolder;
        }
        else {
            console.warn(`Folder missing at path: ${targetPath}`);
            return rootFolder; // Fallback to root if path is broken
        }
    }
    return foundFolder;
}
function updateUrlPath(folderPath) {
    const newUrl = window.location.pathname +
        '?path=' +
        encodeURIComponent(folderPath);
    window.history.pushState({ path: folderPath }, '', newUrl);
}
function getPathFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('path') || '/';
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
/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_helper */ "./src/scripts/utilities/_helper.ts");
/* harmony import */ var _storageUtil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");



class UIManager {
    static async refreshUI(currentFolder) {
        UIManager.renderLoadingState();
        await new Promise((resolve) => setTimeout(resolve, 400));
        // 1. Combine folders and files
        const allItems = [
            ...currentFolder.subFolders,
            ...currentFolder.files,
        ];
        // 2. Sort the array dynamically
        allItems.sort((a, b) => {
            // Rule A: Group Folders First
            const isFolderA = 'subFolders' in a ? 1 : 0;
            const isFolderB = 'subFolders' in b ? 1 : 0;
            if (isFolderA !== isFolderB) {
                return isFolderB - isFolderA; // Puts folders (1) before files (0)
            }
            // Rule B: Sort by Newest Modified Date
            const dateA = new Date(a.modified).getTime();
            const dateB = new Date(b.modified).getTime();
            // Fallback for old data: treat invalid dates as '0' (oldest possible)
            const validDateA = isNaN(dateA) ? 0 : dateA;
            const validDateB = isNaN(dateB) ? 0 : dateB;
            return validDateB - validDateA; // Descending order (Newest first)
        });
        // 3. Render the newly sorted array
        UIManager.renderGrid(allItems);
    }
    static saveAndRefresh(currentFolder) {
        (0,_storageUtil__WEBPACK_IMPORTED_MODULE_1__.saveToStorage)(currentFolder);
        this.refreshUI(currentFolder);
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
    if (!data || data.length === 0) {
        desktopContainer.innerHTML =
            '<p class="mt-4 text-center">No items to display</p>';
        mobileContainer.innerHTML =
            '<p class=" mt-4 text-center">No items to display</p>';
        return;
    }
    // 1. Desktop Rendering
    desktopContainer.innerHTML = data
        .map((item) => {
        const isFolder = 'subFolders' in item;
        const file = item;
        const folderItem = item;
        const nameDisplay = folderItem.isEditing
            ? `<input type="text" id="new-folder-input" class="m-input-rename" value="${folderItem.name}" />`
            : item.name;
        return `
        <div class="m-table-row m-table-row--interactive" 
             data-action="${isFolder ? 'open-folder' : 'open-file'}" 
             data-id="${item.id}"
             data-name="${item.name}">
             
          <div>
            ${isFolder ? `<i class="fas fa-folder m-icon-folder"></i>` : (0,_helper__WEBPACK_IMPORTED_MODULE_0__.getFileIconHTML)(file.extension)}          
          </div>
          
          <div class="m-text-overlay">
            ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
            ${nameDisplay}
          </div>
          
          <div class="m-text-secondary">${(0,_helper__WEBPACK_IMPORTED_MODULE_0__.getRelativeTime)(file.modified)}</div>
          <div class="m-text-secondary">${file.modifiedBy}</div>
          
          <div class="d-flex gap-2 justify-content-center">
            <svg class="m-icon-custom is-clickable" data-action="edit" data-id="${item.id}" data-name="${item.name}" data-type="${isFolder ? 'folder' : 'file'}">
              <use href="src/files/icons.svg#icon-edit"></use>
            </svg>
            <svg class="m-icon-custom is-clickable" data-action="delete" data-id="${item.id}" data-name="${item.name}" data-type="${isFolder ? 'folder' : 'file'}">
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
        <div class="m-card" data-action="${isFolder ? 'open-folder' : 'open-file'}" data-id="${item.id}" data-name="${item.name}">
          <div class="m-card__row m-card__row--header">
                <div class="m-card__label">File Type</div>
              <div class="me-2" 
                  data-action="mobile-options" 
                  data-id="${item.id}" 
                  data-name="${item.name}" 
                  data-type="${isFolder ? 'folder' : 'file'}">
                    ${isFolder ? `<i class="fas fa-folder m-icon-folder"></i>` : (0,_helper__WEBPACK_IMPORTED_MODULE_0__.getFileIconHTML)(file.extension)}
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
          <div class="m-card__row"><div class="m-card__label">Modified</div><div class="m-card__value">${(0,_helper__WEBPACK_IMPORTED_MODULE_0__.getRelativeTime)(file.modified)}</div></div>
          <div class="m-card__row"><div class="m-card__label">Modified By</div><div class="m-card__value">${file.modifiedBy}</div></div>
        </div>
      `;
    })
        .join('');
};
UIManager.renderLoadingState = () => {
    const desktopContainer = document.getElementById('desktop-row-container');
    const mobileContainer = document.getElementById('mobile-card-container');
    const spinnerHTML = `
      <div class="d-flex justify-content-center align-items-center w-100" style="height: 200px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    if (desktopContainer)
        desktopContainer.innerHTML = spinnerHTML;
    if (mobileContainer)
        mobileContainer.innerHTML = spinnerHTML;
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
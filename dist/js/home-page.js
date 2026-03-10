/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/components/_grid.ts":
/*!*****************************************!*\
  !*** ./src/scripts/components/_grid.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
const renderGrid = (data) => {
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
        const nameDisplay = folderItem.isEditing
            ? `<input type="text" 
            id="new-folder-input" 
            class="m-input-rename" 
            value="New folder" 
            onblur="saveFolderName(event)" 
            onkeyup="handleRenameKey(event)" />`
            : item.name;
        return `
      <div class="m-table-row m-table-row--interactive" 
           ${isFolder ? `onclick="handleFolderClick('${item.name}')"` : `onclick="handleFileClick('${item.name}')"`}>
        <div>
          ${isFolder
            ? `<i class="fas fa-folder m-icon-folder"></i>`
            : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-${item.extension}"></use></svg>`}
        </div>
        <div class="m-text-overlay">
          ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
          ${nameDisplay}
        </div>
        <div class="m-text-secondary">${file.modified}</div>
        <div class="m-text-secondary">${file.modifiedBy}</div>
        <div class="d-flex gap-2 justify-content-center">
         <svg class="m-icon-custom" onclick="event.stopPropagation(); handleEdit('${item.name}', ${isFolder})">
            <use href="src/files/icons.svg#icon-edit"></use>
          </svg>
          <svg class="m-icon-custom" onclick="handleDelete('${item.name}', ${isFolder ? `true` : `false`} )">
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
      <div class="m-card" ${isFolder ? `onclick="handleFolderClick('${item.name}')"` : `onclick="handleFileClick('${item.name}')"`}>
        <div class="m-card__row m-card__row--header">
          <div class="m-card__label">File Type</div>
          <div class="me-2" onclick="event.stopPropagation(); handleOptionDropdown('${item.name}', ${isFolder})">
            ${isFolder
            ? `<i class="fas fa-folder m-icon-folder"></i>`
            : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-${item.extension}"></use></svg>`}
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
        <div class="m-card__row">
          <div class="m-card__label">Modified</div>
          <div class="m-card__value">${file.modified}</div>
        </div>
        <div class="m-card__row">
          <div class="m-card__label">Modified By</div>
          <div class="m-card__value">${file.modifiedBy}</div>
        </div>
      </div>
    `;
    })
        .join('');
};
/* harmony default export */ __webpack_exports__["default"] = (renderGrid);


/***/ }),

/***/ "./src/scripts/utilities/_helper.ts":
/*!******************************************!*\
  !*** ./src/scripts/utilities/_helper.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   updateBackButtonVisibility: function() { return /* binding */ updateBackButtonVisibility; }
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
const updateBackButtonVisibility = (navigationHistory) => {
    const backBtn = document.getElementById('back-btn');
    if (!backBtn)
        return;
    if (navigationHistory.length > 0) {
        backBtn.classList.remove('d-none');
    }
    else {
        backBtn.classList.add('d-none');
    }
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
/* harmony import */ var _components_grid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/_grid */ "./src/scripts/components/_grid.ts");
/* harmony import */ var _utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utilities/_storageUtil */ "./src/scripts/utilities/_storageUtil.ts");



// Define your root data structure
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
        },
        {
            name: 'RevenueByServices.xlsx',
            extension: 'xlsx',
            modified: 'A few seconds ago',
            modifiedBy: 'Administrator MOD',
            isNew: true,
            data: '',
            type: 'file',
        },
    ],
    modified: 'A few seconds ago',
    modifiedBy: 'Administrator MOD',
    isNew: true,
    type: 'folder',
};
// Keep track of the folder history (the stack)
let navigationHistory = [];
let currentFolder = rootFolder;
/**
 * Navigates into a folder and saves the previous one to history
 */
const navigateToFolder = (folder, isBack = false) => {
    if (!isBack && currentFolder && currentFolder !== folder) {
        navigationHistory.push(currentFolder);
    }
    currentFolder = folder;
    // --- NEW: Interactive Breadcrumb Generator ---
    const pathDisplay = document.getElementById('folder-path-display');
    if (pathDisplay) {
        // 1. Always start with the Root (Documents)
        let breadcrumbsHTML = `<span class="m-breadcrumb is-clickable" onclick="navigateFromBreadcrumb('/')">Documents</span>`;
        // 2. If we are deep in a folder, split the path and build the links
        if (folder.path !== '/') {
            const segments = folder.path
                .split('/')
                .filter((s) => s.length > 0);
            let buildPath = '';
            segments.forEach((segment) => {
                buildPath += `/${segment}`; // Reconstruct the path step-by-step (e.g., /CAS, then /CAS/Finance)
                breadcrumbsHTML += ` <span class="m-breadcrumb-separator"><i class="fas fa-chevron-right small"></i></span> `;
                breadcrumbsHTML += `<span class="m-breadcrumb is-clickable" onclick="navigateFromBreadcrumb('${buildPath}')">${segment}</span>`;
            });
        }
        pathDisplay.innerHTML = breadcrumbsHTML;
    }
    // ---------------------------------------------
    const combinedItems = [
        ...folder.subFolders,
        ...folder.files,
    ];
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])(combinedItems);
    (0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__.updateBackButtonVisibility)(navigationHistory);
};
/**
 * The "Back -1" Logic
 */
const goBack = () => {
    if (navigationHistory.length > 0) {
        const previousFolder = navigationHistory.pop();
        if (previousFolder) {
            navigateToFolder(previousFolder, true);
        }
    }
};
// Expose to window for the button click
window.goBack = goBack;
/**
 * Global handler for the onclick events generated in your grid
 */
window.navigateFromBreadcrumb = (targetPath) => {
    // If they clicked the root "Documents" link
    if (targetPath === '/') {
        navigateToFolder(rootFolder);
        return;
    }
    // Split the target path into folder names (e.g., ['CAS', 'Finance'])
    const segments = targetPath.split('/').filter((s) => s.length > 0);
    // Start searching from the top of the tree
    let foundFolder = rootFolder;
    // Walk down the tree folder by folder
    for (const segment of segments) {
        const nextFolder = foundFolder.subFolders.find((f) => f.name === segment);
        if (nextFolder) {
            foundFolder = nextFolder;
        }
        else {
            console.error(`Folder ${segment} not found in path ${targetPath}`);
            return; // Stop if something goes wrong
        }
    }
    // Once we've found the final folder, navigate to it!
    navigateToFolder(foundFolder);
};
window.handleFolderClick = (folderName) => {
    const target = currentFolder.subFolders.find((f) => f.name === folderName);
    target.isNew = false; // Mark as read when clicked
    if (target) {
        navigateToFolder(target);
    }
};
window.handleFileClick = (fileName) => {
    const file = currentFolder.files.find((f) => f.name === fileName);
    if (!file)
        return;
    // 1. Mark as read
    file.isNew = false;
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
    // 2. Open Modal & Fill Text
    const modal = document.getElementById('fileModal');
    document.getElementById('modalFileName').innerText = file.name;
    document.getElementById('modalFileExtension').innerText =
        file.extension;
    document.getElementById('modalFileModified').innerText =
        file.modified;
    document.getElementById('modalFileModifiedBy').innerText =
        file.modifiedBy;
    // 3. Program the Download Button
    const downloadBtn = document.getElementById('modalDownloadBtn');
    downloadBtn.onclick = () => {
        window.handleDownloadFile(file.name);
    };
    // 4. Program the Delete Button
    // const deleteBtn = document.getElementById('modalDeleteBtn')!;
    // deleteBtn.onclick = () => {
    //   (window as any).handleDelete(file.name, false); // false because it's a file
    // };
    // 5. Show the modal
    modal.style.display = 'flex';
};
window.closeModal = () => {
    document.getElementById('fileModal').style.display = 'none';
};
window.handleUploadFile = (isMobile) => {
    if (isMobile) {
        document.getElementById('mobileMenu').classList.remove('show');
    }
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
};
window.onFileSelected = (event) => {
    const target = event.target;
    const files = target.files;
    if (files && files.length > 0) {
        const selectedFile = files[0];
        const reader = new FileReader();
        // --- NEW: Extract the extension safely ---
        // lastIndexOf returns -1 if no dot is found.
        // We check > 0 to ignore files that just start with a dot (like .env)
        const lastDotIndex = selectedFile.name.lastIndexOf('.');
        const fileExtension = lastDotIndex > 0
            ? selectedFile.name.substring(lastDotIndex + 1).toLowerCase()
            : '';
        reader.onload = (e) => {
            const base64String = e.target?.result;
            const newFile = {
                name: selectedFile.name,
                extension: fileExtension, // <-- Assign the extracted extension here
                modified: 'Just now',
                modifiedBy: 'You',
                isNew: true,
                data: base64String,
                type: 'file',
            };
            // Add to current folder
            currentFolder.files.push(newFile);
            // Save to localStorage & Refresh UI
            (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.saveToStorage)(rootFolder);
            navigateToFolder(currentFolder, true);
        };
        reader.readAsDataURL(selectedFile);
        target.value = ''; // Reset input
    }
};
window.handleAddFolderDesktop = () => {
    const newFolder = {
        name: '', // Empty initially
        path: '',
        subFolders: [],
        files: [],
        modified: 'Just now',
        modifiedBy: 'Administrator MOD',
        isNew: true,
        isEditing: true,
        type: 'folder',
    };
    // Add to the beginning of the list
    currentFolder.subFolders.unshift(newFolder);
    // Re-render the grid so the input box appears
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
    // Focus the input automatically
    const input = document.getElementById('new-folder-input');
    if (input) {
        input.focus();
        input.select();
    }
};
window.saveFolderName = (event) => {
    const newName = event.target.value.trim() || 'New folder';
    // 1. Find the folder that is currently in "edit mode"
    const folderBeingEdited = currentFolder.subFolders.find((f) => f.isEditing);
    if (!folderBeingEdited)
        return;
    // 2. DUPLICATION CHECK: Check if ANY other folder has this exact name
    const isDuplicate = currentFolder.subFolders.some((f) => f !== folderBeingEdited &&
        f.name.toLowerCase() === newName.toLowerCase());
    // 3. If it's a duplicate, stop the save!
    if (isDuplicate) {
        alert(`This destination already contains a folder named '${newName}'.`);
        // Refocus the input so the user can fix the name
        setTimeout(() => {
            event.target.focus();
            event.target.select();
        }, 10);
        return; // EXITS THE FUNCTION EARLY
    }
    // 4. If it's unique, proceed with saving as normal
    folderBeingEdited.name = newName;
    folderBeingEdited.path =
        currentFolder.path === '/'
            ? `/${newName}`
            : `${currentFolder.path}/${newName}`;
    delete folderBeingEdited.isEditing;
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.saveToStorage)(rootFolder); // ALWAYS save rootFolder!
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
};
window.handleAddFolderMobile = () => {
    // 1. Hide the Bootstrap menu correctly
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.remove('show');
    }
    // 2. Clear the input from the last time it was used
    const input = document.getElementById('newFolderNameInput');
    if (input)
        input.value = '';
    // 3. Show the new modal
    const modal = document.getElementById('newFolderModal');
    if (modal) {
        modal.style.display = 'flex';
    }
    // 4. Try to focus the input automatically for the user
    setTimeout(() => input?.focus(), 100);
};
window.submitNewFolder = () => {
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
        return; // Stop the function
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
        modifiedBy: 'Administrator MOD',
        isNew: true,
        type: 'folder',
    };
    // Add it to the top of the list
    currentFolder.subFolders.unshift(newFolder);
    // Save and Re-render
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.saveToStorage)(rootFolder);
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
    // Close the modal
    window.closeNewFolderModal();
};
document
    .getElementById('newFolderNameInput')
    ?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        window.submitNewFolder();
    }
});
window.closeNewFolderModal = () => {
    document.getElementById('newFolderModal').style.display = 'none';
};
// (window as any).saveFolderName = (event: any) => {
//   const newName = event.target.value.trim() || 'New folder';
//   // Find the folder that was being edited
//   const folder = currentFolder.subFolders.find((f) => f.isEditing);
//   if (folder) {
//     folder.name = newName;
//     folder.path =
//       currentFolder.path === '/'
//         ? `/${newName}`
//         : `${currentFolder.path}/${newName}`;
//     delete folder.isEditing; // Remove editing state
//   }
//   saveToStorage(rootFolder);
//   renderGrid([...currentFolder.subFolders, ...currentFolder.files]);
// };
window.handleRenameKey = (event) => {
    const target = event.target;
    // If they press Enter, force the input to lose focus.
    // This automatically triggers the "onblur" event, which calls saveFolderName!
    if (event.key === 'Enter') {
        target.blur();
    }
    // Optional: If they press Escape, cancel the creation
    if (event.key === 'Escape') {
        // Remove the temporary folder from the array
        currentFolder.subFolders.shift();
        (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
    }
};
window.handleDownloadFile = (fileName) => {
    const file = currentFolder.files.find((f) => f.name === fileName);
    if (!file)
        return;
    file.isNew = false;
    // If the file has Base64 data, download it
    if (file.data) {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    // Re-render to update the "isNew" sparkle
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.saveToStorage)(rootFolder);
};
window.handleDelete = (name, isFolder) => {
    if (confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`)) {
        if (isFolder) {
            currentFolder.subFolders = currentFolder.subFolders.filter((f) => f.name !== name);
        }
        else {
            currentFolder.files = currentFolder.files.filter((f) => f.name !== name);
        }
        // CRITICAL: Save the root, hide modal, then re-render
        (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.saveToStorage)(rootFolder);
        const modal = document.getElementById('fileModal');
        if (modal)
            modal.style.display = 'none';
        (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
    }
};
// 1. Temporary state to remember what we are renaming
let editingItemState = { oldName: '', isFolder: false };
// 2. Open the Modal
window.handleEdit = (oldName, isFolder) => {
    editingItemState = { oldName, isFolder };
    const modal = document.getElementById('renameModal');
    const input = document.getElementById('renameInput');
    if (modal && input) {
        input.value = oldName;
        modal.style.display = 'flex';
        // Pro-Tip UX: Select the text automatically.
        // If it's a file, we only highlight the name, not the extension!
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
    document
        .getElementById('renameInput')
        ?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            window.submitRename();
        }
    });
};
// 3. Save the new name
window.submitRename = () => {
    const input = document.getElementById('renameInput');
    const newName = input.value.trim();
    // If they left it blank or didn't change the name, just close it
    if (!newName || newName === editingItemState.oldName) {
        window.closeRenameModal();
        return;
    }
    // Check for duplicates in the respective array
    let isDuplicate = false;
    if (editingItemState.isFolder) {
        isDuplicate = currentFolder.subFolders.some((f) => f.name.toLowerCase() === newName.toLowerCase());
    }
    else {
        isDuplicate = currentFolder.files.some((f) => f.name.toLowerCase() === newName.toLowerCase());
    }
    if (isDuplicate) {
        alert('An item with this name already exists in this location.');
        input.focus();
        return;
    }
    // Apply the rename
    if (editingItemState.isFolder) {
        const target = currentFolder.subFolders.find((f) => f.name === editingItemState.oldName);
        if (target) {
            target.name = newName;
            target.path =
                currentFolder.path === '/'
                    ? `/${newName}`
                    : `${currentFolder.path}/${newName}`;
        }
    }
    else {
        const target = currentFolder.files.find((f) => f.name === editingItemState.oldName);
        if (target) {
            target.name = newName;
            // Update extension in case they renamed "report.xlsx" to "report.csv"
            const lastDotIndex = newName.lastIndexOf('.');
            target.extension =
                lastDotIndex > 0
                    ? newName.substring(lastDotIndex + 1).toLowerCase()
                    : '';
        }
    }
    // Save & Refresh
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.saveToStorage)(rootFolder);
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
    window.closeRenameModal();
};
// 1. Temporary state for the mobile options menu
let currentMobileActionItem = { name: '', isFolder: false };
// 2. Open the Action Sheet
window.handleOptionDropdown = (name, isFolder) => {
    currentMobileActionItem = { name, isFolder };
    const modal = document.getElementById('mobileOptionsModal');
    const title = document.getElementById('optionsModalTitle');
    if (title)
        title.innerText = name; // Show the file/folder name as the title
    if (modal)
        modal.style.display = 'flex';
};
// 3. Close Helper
window.closeOptionsModal = () => {
    const modal = document.getElementById('mobileOptionsModal');
    if (modal)
        modal.style.display = 'none';
};
// 4. Trigger Rename
window.triggerMobileRename = () => {
    window.closeOptionsModal();
    // Fire the exact same rename modal logic we built for desktop!
    window.handleEdit(currentMobileActionItem.name, currentMobileActionItem.isFolder);
};
// 5. Trigger Delete
window.triggerMobileDelete = () => {
    window.closeOptionsModal();
    // Fire the exact same delete logic we built for desktop!
    window.handleDelete(currentMobileActionItem.name, currentMobileActionItem.isFolder);
};
// 4. Close Modal Helper
window.closeRenameModal = () => {
    const modal = document.getElementById('renameModal');
    if (modal)
        modal.style.display = 'none';
    editingItemState = { oldName: '', isFolder: false }; // clear state
};
(0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
    // 1. Overwrite the default rootFolder with the saved data
    rootFolder = (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.loadFromStorage)(rootFolder);
    // 2. Set currentFolder to point to the exact same memory reference
    currentFolder = rootFolder;
    // 3. Render
    navigateToFolder(currentFolder);
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
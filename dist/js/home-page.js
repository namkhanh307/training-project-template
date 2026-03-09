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
        <div class="m-text-secondary"> ${file.modified}</div>
        <div class="m-text-secondary">${file.modifiedBy}</div>
        <div></div>
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
          <div class="me-2">
            ${isFolder
            ? `<i class="fas fa-folder m-icon-folder"></i>`
            : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-excel-2019"></use></svg>`}
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
    name: 'Documents',
    path: '/Documents',
    subFolders: [
        {
            name: 'CAS',
            path: '/Documents/CAS',
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
    // If we aren't going back, push the current folder to history before moving
    if (!isBack && currentFolder && currentFolder !== folder) {
        navigationHistory.push(currentFolder);
    }
    currentFolder = folder;
    const combinedItems = [
        ...folder.subFolders,
        ...folder.files,
    ];
    // Update the UI
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
    document.getElementById('modalFileExtension').innerText = file.extension;
    document.getElementById('modalFileModified').innerText = file.modified;
    document.getElementById('modalFileModifiedBy').innerText = file.modifiedBy;
    // 3. Program the Download Button
    const downloadBtn = document.getElementById('modalDownloadBtn');
    downloadBtn.onclick = () => {
        window.handleDownloadFile(file.name);
    };
    // 4. Program the Delete Button
    const deleteBtn = document.getElementById('modalDeleteBtn');
    deleteBtn.onclick = () => {
        window.handleDelete(file.name, false); // false because it's a file
    };
    // 5. Show the modal
    modal.style.display = 'flex';
};
window.closeModal = () => {
    document.getElementById('fileModal').style.display = 'none';
};
window.handleUploadFile = () => {
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
    // Find the folder that was being edited
    const folder = currentFolder.subFolders.find((f) => f.isEditing);
    if (folder) {
        folder.name = newName;
        folder.path =
            currentFolder.path === '/'
                ? `/${newName}`
                : `${currentFolder.path}/${newName}`;
        delete folder.isEditing; // Remove editing state
    }
    (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_2__.saveToStorage)(rootFolder);
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])([...currentFolder.subFolders, ...currentFolder.files]);
};
window.handleRenameKey = (event) => {
    if (event.key === 'Enter') {
        event.target.blur(); // Triggers saveFolderName
    }
    if (event.key === 'Escape') {
        // Optional: Remove the folder if they hit Esc
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
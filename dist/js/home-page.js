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
        this._rootFolder = (0,_utilities_storageUtil__WEBPACK_IMPORTED_MODULE_1__.loadFromStorage)(_utilities_initData__WEBPACK_IMPORTED_MODULE_0__.rootFolder);
        this._currentFolder = this._rootFolder;
        // Setup event listeners once when the app starts
        this.setupEventListeners();
        // Initial Render
        this.refreshUI();
    }
    // A handy helper to keep your code DRY (Don't Repeat Yourself)
    refreshUI() {
        _utilities_uiManager__WEBPACK_IMPORTED_MODULE_2__.UIManager.renderGrid([
            ...this._currentFolder.subFolders,
            ...this._currentFolder.files,
        ]);
    }
    // --- 1. THE ACTION METHOD ---
    // --- 2. THE EVENT ROUTER ---
    setupEventListeners() {
        this.initToolbarEvents();
        this.initGridEvents();
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
        const gridContainer = document.getElementById('desktop-row-container');
        // Listener for the "Enter" key or "Blur" on the new folder input
        gridContainer?.addEventListener('focusout', (event) => {
            const target = event.target;
            if (target.id === 'new-folder-input') {
                (0,_crudFolder__WEBPACK_IMPORTED_MODULE_4__.saveFolderName)(this._rootFolder, this._currentFolder, this.refreshUI.bind(this), target);
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
            <svg class="m-icon-custom is-clickable" 
              data-action="delete" 
              data-name="${item.name}" 
              data-type="${isFolder ? 'folder' : 'file'}">
            </svg>
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
// // 1. Overwrite the default rootFolder with the saved data
// let initData = loadFromStorage(rootFolder);
// // 2. Set currentFolder to point to the exact same memory reference
// currentFolder = initData;
// // 3. Render
// navigateToFolder(currentFolder);

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
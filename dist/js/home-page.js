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
    // 1. Generate Desktop HTML
    const desktopHTML = data
        .map((file) => `
    <div class="m-table-row m-table-row--interactive">
      <div>
        ${file.type === 'folder'
        ? `<i class="fas fa-folder m-icon-folder"></i>`
        : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-excel-2019"></use></svg>`}
      </div>
      <div class="m-text-overlay">
        ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
        ${file.name}
      </div>
      <div>${file.modified}</div>
      <div>${file.modifiedBy}</div>
      <div></div>
    </div>
  `)
        .join('');
    // 2. Generate Mobile HTML
    const mobileHTML = data
        .map((file) => `
    <div class="m-card">
      <div class="m-card__row m-card__row--header">
        <div class="m-card__label">File Type</div>
        <div class="m-card__value">
          <i class="fas fa-folder m-icon-folder"></i>
        </div>
      </div>
      <div class="m-card__row">
        <div class="m-card__label">Name</div>
        <div class="m-card__value">
          <div class="m-text-overlay">
            ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
            ${file.name}
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
  `)
        .join('');
    desktopContainer.innerHTML = desktopHTML;
    mobileContainer.innerHTML = mobileHTML;
};
/* harmony default export */ __webpack_exports__["default"] = (renderGrid);


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


(0,_utilities_helper__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
    const myFiles = [
        {
            name: 'Project_Alpha.pdf',
            type: 'folder',
            modified: 'Mar 05',
            modifiedBy: 'Gemini',
            isNew: true,
        },
        {
            name: 'Old_Backup.zip',
            type: 'excel',
            modified: 'Jan 01',
            modifiedBy: 'Admin',
            isNew: false,
        },
    ];
    (0,_components_grid__WEBPACK_IMPORTED_MODULE_1__["default"])(myFiles);
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
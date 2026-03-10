import { Row, File, Folder } from '../models/entity';
import { saveToStorage } from './_storageUtil';

export class UIManager {
  static refreshUI(currentFolder: Folder) {
    UIManager.renderGrid([
      ...currentFolder.subFolders,
      ...currentFolder.files,
    ]);
  }
  static saveAndRefresh(currentFolder: Folder) {
    saveToStorage(currentFolder);
    this.refreshUI(currentFolder);
  }

  static renderGrid = (data: Row[]): void => {
    const desktopContainer = document.getElementById(
      'desktop-row-container',
    );
    const mobileContainer = document.getElementById(
      'mobile-card-container',
    );

    if (!desktopContainer || !mobileContainer) return;

    // 1. Desktop Rendering
    desktopContainer.innerHTML = data
      .map((item) => {
        const isFolder = 'subFolders' in item;
        const file = item as File;
        const folderItem = item as Folder;

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
        const file = item as File;

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
  static updateBreadcrumbs(modalId: string, currentFolder: Folder) {
    const pathDisplay = document.getElementById(modalId);
    if (!pathDisplay) return;

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

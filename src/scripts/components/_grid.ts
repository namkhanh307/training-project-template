// Define the structure of your file data
export interface BaseEntity {
  modified: string;
  modifiedBy: string;
  isNew: boolean;
  type: 'folder' | 'file';
}
export interface File extends BaseEntity {
  name: string;
  extension: string;
  data: string; // Base64 or URL for the file content
}

export interface Folder extends BaseEntity {
  name: string;
  path: string;
  files: File[];
  subFolders: Folder[];
  isEditing?: boolean;
}

export type Row = File | Folder;

const renderGrid = (data: Row[]): void => {
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
          ${
            isFolder
              ? `<i class="fas fa-folder m-icon-folder"></i>`
              : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-excel-2019"></use></svg>`
          }
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
      const file = item as File;

      return `
      <div class="m-card" ${isFolder ? `onclick="handleFolderClick('${item.name}')"` : `onclick="handleFileClick('${item.name}')"`}>
        <div class="m-card__row m-card__row--header">
          <div class="m-card__label">File Type</div>
          <div class="me-2">
            ${
              isFolder
                ? `<i class="fas fa-folder m-icon-folder"></i>`
                : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-excel-2019"></use></svg>`
            }
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

export default renderGrid;

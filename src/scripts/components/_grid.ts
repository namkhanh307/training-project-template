// Define the structure of your file data
export interface FileItem {
  name: string;
  type: 'folder' | 'excel';
  modified: string;
  modifiedBy: string;
  isNew: boolean;
}

const renderGrid = (data: FileItem[]): void => {
  const desktopContainer = document.getElementById('desktop-row-container');
  const mobileContainer = document.getElementById('mobile-card-container');

  if (!desktopContainer || !mobileContainer) return;

  // 1. Desktop HTML
  desktopContainer.innerHTML = data.map(file => `
    <div class="m-table-row m-table-row--interactive">
      <div class="d-flex align-items-center justify-content-center">
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
  `).join('');

  // 2. Mobile HTML
  mobileContainer.innerHTML = data.map(file => `
    <div class="m-card mb-4 rounded shadow-sm">
      <div class="m-card__row m-card__row--header d-flex justify-content-between align-items-center p-2">
        <div class="m-card__label fw-bold">File Type</div>
        <div class="pe-2">
          ${file.type === 'folder' 
            ? `<i class="fas fa-folder m-icon-folder"></i>` 
            : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-excel-2019"></use></svg>`}
        </div>
      </div>
      
      <div class="m-card__row d-flex align-items-center">
        <div class="m-card__label fw-bold">Name</div>
        <div class="m-card__value flex-grow-1">
          <div class="m-text-overlay">
            ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
            ${file.name}
          </div>
        </div>
      </div>

      <div class="m-card__row d-flex align-items-center">
        <div class="m-card__label fw-bold">Modified</div>
        <div class="m-card__value flex-grow-1">${file.modified}</div>
      </div>

      <div class="m-card__row d-flex align-items-center">
        <div class="m-card__label fw-bold border-bottom-0">Modified By</div>
        <div class="m-card__value flex-grow-1">${file.modifiedBy}</div>
      </div>
    </div>
  `).join('');
};

export default renderGrid;

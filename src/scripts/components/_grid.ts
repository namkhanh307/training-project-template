// Define the structure of your file data
export interface FileItem {
  name: string;
  type: 'folder' | 'excel';
  modified: string;
  modifiedBy: string;
  isNew: boolean;
}

const renderGrid = (data: FileItem[]): void => {
  const desktopContainer = document.getElementById(
    'desktop-row-container',
  );
  const mobileContainer = document.getElementById(
    'mobile-card-container',
  );

  if (!desktopContainer || !mobileContainer) return;

  // 1. Generate Desktop HTML
  const desktopHTML = data
    .map(
      (file) => `
    <div class="m-table-row m-table-row--interactive">
      <div>
        ${
          file.type === 'folder'
            ? `<i class="fas fa-folder m-icon-folder"></i>`
            : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-excel-2019"></use></svg>`
        }
      </div>
      <div class="m-text-overlay">
        ${file.isNew ? `<svg class="m-sparkle"><use href="src/files/icons.svg#icon-sparkle"></use></svg>` : ''}
        ${file.name}
      </div>
      <div class="m-text-secondary">${file.modified}</div>
      <div class="m-text-secondary">${file.modifiedBy}</div>
      <div></div>
    </div>
  `,
    )
    .join('');

  // 2. Generate Mobile HTML
  const mobileHTML = data
    .map(
      (file) => `
    <div class="m-card">
      <div class="m-card__row m-card__row--header">
        <div class="m-card__label">File Type</div>
        <div class="me-2">
        ${
          file.type === 'folder'
            ? `<i class="fas fa-folder m-icon-folder"></i>`
            : `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-excel-2019"></use></svg>`
        }        </div>
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
  `,
    )
    .join('');

  desktopContainer.innerHTML = desktopHTML;
  mobileContainer.innerHTML = mobileHTML;
};

export default renderGrid;

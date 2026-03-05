const fileData = [
  {
    name: "CAS",
    type: "Folder",
    modified: "April 30",
    modifiedBy: "Megan Bowen",
    isNew: false
  },
  {
    name: "CoasterAndBargeLoading.xlsx",
    type: "Excel",
    modified: "April 30",
    modifiedBy: "Megan Bowen",
    isNew: true // We'll use this to conditionally show the sparkle
  }
];

const container = document.querySelector('.d-md-none'); // Your mobile container

// Clear existing static content
container.innerHTML = '';

fileData.forEach(file => {
  const cardHTML = `
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
            ${file.isNew ? `
              <svg class="m-sparkle">
                <use href="src/files/icons.svg#icon-sparkle"></use>
              </svg>` : ''}
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
  `;
  
  container.innerHTML += cardHTML;
});
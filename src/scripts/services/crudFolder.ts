import { Folder } from "../models/entity";
import { saveToStorage } from "../utilities/_storageUtil";

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
export function createNewFolderDesktop(currentFolder: Folder, refreshUI: () => void) {
    let baseName = 'New folder';
    let folderName = baseName;
    let counter = 1;
    const existingNames = currentFolder.subFolders.map((f) =>
      f.name.toLowerCase(),
    );

    while (existingNames.includes(folderName.toLowerCase())) {
      folderName = `${baseName} (${counter})`;
      counter++;
    }

    const newFolder: Folder = {
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

    const input = document.getElementById(
      'new-folder-input',
    ) as HTMLInputElement;
    if (input) {
      input.value = folderName;
      input.focus();
      input.select();
    }
  }

  
export function saveFolderName(rootFolder: Folder, currentFolder: Folder, refreshUI: () => void, inputElement: HTMLInputElement) {
    const newName = inputElement.value.trim() || 'New folder';
    const folderBeingEdited = currentFolder.subFolders.find(
      (f) => f.isEditing,
    );

    if (!folderBeingEdited) return;

    const isDuplicate = currentFolder.subFolders.some(
      (f) =>
        f !== folderBeingEdited &&
        f.name.toLowerCase() === newName.toLowerCase(),
    );

    if (isDuplicate) {
      alert(
        `This destination already contains a folder named '${newName}'.`,
      );
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

    saveToStorage(rootFolder);
    refreshUI();
  }
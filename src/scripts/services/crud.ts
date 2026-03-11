import { File, Folder } from '../models/entity';
import { EditingState, MobileActionItem } from '../models/model';
import { generateID } from '../utilities/_helper';
import { closeModal, openModal } from '../utilities/_modal';
import { saveToStorage } from '../utilities/_storageUtil';
import { UIManager } from '../utilities/uiManager';

export function triggerUpload() {
  // Mobile safety check (optional: remove 'show' class if triggered from mobile menu)
  document.getElementById('mobileMenu')?.classList.remove('show');

  const fileInput = document.getElementById(
    'fileInput',
  ) as HTMLInputElement;
  fileInput?.click();
}
export async function processFileSelection(
  rootFolder: Folder,
  currentFolder: Folder,
  refreshUI: () => void,
  event: Event,
) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;

  const filePromises = Array.from(files).map((selectedFile) => {
    return new Promise<File>((resolve) => {
      const reader = new FileReader();
      const lastDotIndex = selectedFile.name.lastIndexOf('.');
      const fileExtension =
        lastDotIndex > 0
          ? selectedFile.name
              .substring(lastDotIndex + 1)
              .toLowerCase()
          : '';

      reader.onload = (e) => {
        resolve({
          name: selectedFile.name,
          extension: fileExtension,
          modified: new Date().toISOString(),
          modifiedBy: 'You',
          isNew: true,
          path:
            currentFolder.path === '/'
              ? `/${currentFolder.name}`
              : `${currentFolder.path}/${currentFolder.name}`,
          data: e.target?.result as string,
          type: 'file',
          id: generateID()
        });
      };
      reader.readAsDataURL(selectedFile);
    });
  });

  const processedFiles = await Promise.all(filePromises);
  currentFolder.files.push(...processedFiles);

  saveToStorage(rootFolder);

  // Instead of calling global navigateToFolder, just refresh the UI
  // If you need path updates, trigger your UIManager.updatePath(...) here
  refreshUI();

  target.value = ''; // Reset input
}
export async function createNewFolderDesktop(
  currentFolder: Folder,
  refreshUI: () => Promise<void>,
) {
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
    path: currentFolder.path === '/'
      ? `/${folderName}`
      : `${currentFolder.path}/${folderName}`,
    subFolders: [],
    files: [],
    modified: new Date().toISOString(),
    modifiedBy: 'You',
    isNew: true,
    isEditing: true,
    type: 'folder',
    id: generateID()
  };

  currentFolder.subFolders.unshift(newFolder);
  await refreshUI();

  const input = document.getElementById(
    'new-folder-input',
  ) as HTMLInputElement;
  if (input) {
    input.value = folderName;
    input.focus();
    input.select();
  }
}
// export function saveFolderName(
//   rootFolder: Folder,
//   currentFolder: Folder,
//   refreshUI: () => void,
//   inputElement: HTMLInputElement,
// ) {
//   const newName = inputElement.value.trim() || 'New folder';
//   const folderBeingEdited = currentFolder.subFolders.find(
//     (f) => f.isEditing,
//   );

//   if (!folderBeingEdited) return;

//   const isDuplicate = currentFolder.subFolders.some(
//     (f) =>
//       f !== folderBeingEdited &&
//       f.name.toLowerCase() === newName.toLowerCase(),
//   );

//   if (isDuplicate) {
//     alert(
//       `This destination already contains a folder named '${newName}'.`,
//     );
//     setTimeout(() => {
//       inputElement.focus();
//       inputElement.select();
//     }, 10);
//     return;
//   }

//   folderBeingEdited.name = newName;
//   folderBeingEdited.path =
//     currentFolder.path === '/'
//       ? `/${newName}`
//       : `${currentFolder.path}/${newName}`;
//   delete folderBeingEdited.isEditing;

//   saveToStorage(rootFolder);
//   refreshUI();
// }
export function handleFileClick(
  currentFolder: Folder,
  fileName: string,
) {
  const file = currentFolder.files.find((f) => f.name === fileName);
  if (!file) return;

  file.isNew = false;
  UIManager.saveAndRefresh(currentFolder);

  document.getElementById('modalFileName')!.innerText = file.name;
  document.getElementById('modalFileExtension')!.innerText =
    file.extension;
  document.getElementById('modalFileModified')!.innerText =
    file.modified;
  document.getElementById('modalFileModifiedBy')!.innerText =
    file.modifiedBy;

  openModal('fileModal');
}
export function downloadFile(
  currentFolder: Folder,
  fileName: string,
) {
  const file = currentFolder.files.find((f) => f.name === fileName);
  if (!file || !file.data) return;

  const link = document.createElement('a');
  link.href = file.data;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
export function deleteItem(
  currentFolder: Folder,
  name: string,
  isFolder: boolean,
) {
  console.log(
    `Attempting to delete ${currentFolder} ${isFolder ? 'folder' : 'file'}: ${name}`,
  );
  if (
    !confirm(
      `Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`,
    )
  )
    return;

  if (isFolder) {
    currentFolder.subFolders = currentFolder.subFolders.filter(
      (f) => f.name !== name,
    );
  } else {
    currentFolder.files = currentFolder.files.filter(
      (f) => f.name !== name,
    );
  }
  UIManager.saveAndRefresh(currentFolder);
}
export function openRenameModal(
  stateRef: EditingState,
  oldName: string,
  isFolder: boolean,
) {
  stateRef.oldName = oldName;
  stateRef.isFolder = isFolder;

  const input = document.getElementById(
    'renameInput',
  ) as HTMLInputElement;

  if (input) {
    input.value = oldName;
    openModal('renameModal');

    setTimeout(() => {
      input.focus();
      if (!isFolder && oldName.includes('.')) {
        input.setSelectionRange(0, oldName.lastIndexOf('.'));
      } else {
        input.select();
      }
    }, 100);
  }
}
export function submitRename(
  stateRef: EditingState,
  currentFolder: Folder,
) {
  const input = document.getElementById(
    'renameInput',
  ) as HTMLInputElement;
  const newName = input.value.trim();
  const { oldName, isFolder } = stateRef;

  if (!newName || newName === oldName) {
    closeModal('renameModal');
    return;
  }

  const itemArray = isFolder
    ? currentFolder.subFolders
    : currentFolder.files;
  if (
    itemArray.some(
      (f) => f.name.toLowerCase() === newName.toLowerCase(),
    )
  ) {
    alert('An item with this name already exists.');
    input.focus();
    return;
  }

  const target = itemArray.find((f) => f.name === oldName);
  if (target) {
    target.name = newName;
    if (isFolder) {
      target.path =
        currentFolder.path === '/'
          ? `/${newName}`
          : `${currentFolder.path}/${newName}`;
    } else {
      const lastDot = newName.lastIndexOf('.');
      (target as File).extension =
        lastDot > 0
          ? newName.substring(lastDot + 1).toLowerCase()
          : '';
    }
  }

  UIManager.saveAndRefresh(currentFolder);
  closeModal('renameModal');
}
export function openMobileOptionsSheet(
  name: string,
  isFolder: boolean,
  mobileActionItem: MobileActionItem,
) {
  mobileActionItem.name = name;
  mobileActionItem.isFolder = isFolder;
  const title = document.getElementById('optionsModalTitle');
  if (title) title.innerText = name;
  openModal('mobileOptionsModal');
}
export function openNewFolderMobile() {
  // 1. Hide the Bootstrap mobile menu (if it's open)
  document.getElementById('mobileMenu')?.classList.remove('show');

  // 2. Clear the input from the last time it was used
  const input = document.getElementById(
    'newFolderNameInput',
  ) as HTMLInputElement;
  if (input) input.value = '';

  // 3. Open the modal
  openModal('newFolderModal');

  // 4. Try to focus the input automatically for the user
  setTimeout(() => input?.focus(), 100);
}
export function submitNewFolderMobile(currentFolder: Folder) {
  const input = document.getElementById(
    'newFolderNameInput',
  ) as HTMLInputElement;
  let newName = input.value.trim();

  // If they left it blank, default to "New folder"
  if (!newName) {
    newName = 'New folder';
  }

  // Check if a folder with this name already exists
  const isDuplicate = currentFolder.subFolders.some(
    (f) => f.name.toLowerCase() === newName.toLowerCase(),
  );

  if (isDuplicate) {
    alert('A folder with this name already exists.');
    input.focus();
    return; // Stop the function early
  }

  // Create the new folder object
  const newFolder: Folder = {
    name: newName,
    path: currentFolder.path === '/'
      ? `/${newName}`
      : `${currentFolder.path}/${newName}`,
    subFolders: [],
    files: [],
    modified: new Date().toISOString(),
    modifiedBy: 'You',
    isNew: true,
    type: 'folder',
    id: generateID()
  };

  // Add it to the top of the list
  currentFolder.subFolders.unshift(newFolder);

  // Save state, redraw the grid, and close the modal
  UIManager.saveAndRefresh(currentFolder);
  closeModal('newFolderModal');
}
export function saveFolderName(
  currentFolder: Folder,
  inputElement: HTMLInputElement,
) {
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
  UIManager.saveAndRefresh(currentFolder);
}
export function submitNewFile(currentFolder: Folder) {
  const input = document.getElementById(
    'newFileNameInput',
  ) as HTMLInputElement;
  let newName = input.value.trim();

  // Default to a blank text file if they don't type anything
  if (!newName) {
    newName = 'New Document.txt';
  }

  // Check for duplicates
  const isDuplicate = currentFolder.files.some(
    (f) => f.name.toLowerCase() === newName.toLowerCase(),
  );
  if (isDuplicate) {
    alert('A file with this name already exists.');
    input.focus();
    return;
  }

  // Extract the extension (e.g. from "data.xlsx" get "xlsx")
  const lastDotIndex = newName.lastIndexOf('.');
  const extension =
    lastDotIndex > 0
      ? newName.substring(lastDotIndex + 1).toLowerCase()
      : 'doc';

  // Create the dummy file object
  const newFile: File = {
    name: newName,
    extension: extension,
    modified: new Date().toISOString(),
    modifiedBy: 'You',
    isNew: true,
    data: '', // Empty base64 data since it's a blank file
    type: 'file',
    path: currentFolder.path === '/'
      ? `/${currentFolder.name}`
      : `${currentFolder.path}/${name}`,
    id: generateID()
  };

  // Push it to the top of the array
  currentFolder.files.unshift(newFile);

  // Save, Render, and Close!
  UIManager.saveAndRefresh(currentFolder); // (Assuming this is your save helper)
  closeModal('newFileModal');
}

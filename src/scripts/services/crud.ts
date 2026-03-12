import { File, Folder } from '../models/entity';
import { EditingState, MobileActionItem } from '../models/model';
import {
  generateID,
  generateUniqueFileName,
  generateUniqueName,
  isNameDuplicate,
  isValidName,
} from '../utilities/_helper';
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
  currentFolderId: string,
  allFolders: Record<string, Folder>,
  allFiles: Record<string, File>,
  refreshUI: () => void,
  event: Event,
) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) return;

  // 1. Gather siblings to prevent duplicate names (e.g., "Budget (1).xlsx")
  const siblingFiles = Object.values(allFiles).filter(
    (file) => file.parentId === currentFolderId,
  );

  // 2. Map the files into an array of Promises
  const filePromises = Array.from(files).map((selectedFile) => {
    return new Promise<File>((resolve) => {
      const reader = new FileReader();

      // Ensure the name is unique among files in THIS folder
      const safeUniqueName = generateUniqueFileName(
        selectedFile.name,
        siblingFiles,
      );

      // Safely extract the extension from the newly generated name
      const lastDotIndex = safeUniqueName.lastIndexOf('.');
      const fileExtension =
        lastDotIndex > 0
          ? safeUniqueName.substring(lastDotIndex + 1).toLowerCase()
          : '';

      reader.onload = (e) => {
        const newId = generateID();

        resolve({
          id: newId,
          parentId: currentFolderId,
          name: safeUniqueName,
          extension: fileExtension,
          modified: new Date().toISOString(),
          modifiedBy: 'You',
          isNew: true,
          type: 'file',
          data: e.target?.result as string,
        });
      };

      reader.readAsDataURL(selectedFile);
    });
  });

  // 3. Wait for the hard drive to finish reading all files
  const processedFiles = await Promise.all(filePromises);

  // 4. INSTANT INSERT: Add them directly to the global dictionary
  for (const newFile of processedFiles) {
    allFiles[newFile.id] = newFile;
  }

  // 5. Save and Refresh
  // Note: Update your save function to save your new flat dictionaries!
  saveToStorage(allFolders, allFiles);
  refreshUI();

  target.value = ''; // Reset the input field
}
export async function createNewFolderDesktop(
  currentFolderId: string, // 🔴 Pass the ID instead of the whole nested object
  allFolders: Record<string, Folder>, // 🔴 Pass the global dictionary
  refreshUI: () => Promise<void>,
) {
  // 1. Gather siblings to check for duplicate names
  // We grab all folders and only keep the ones inside the current folder
  const siblingFolders = Object.values(allFolders).filter(
    (folder) => folder.parentId === currentFolderId,
  );

  // 2. Generate a safe name using the siblings
  const folderName = generateUniqueName('New folder', siblingFolders);
  const newId = generateID();

  // 3. Create the perfect flat object
  const newFolder: Folder = {
    id: newId,
    parentId: currentFolderId, // 🔴 The magic link to where it lives!
    name: folderName,
    modified: new Date().toISOString(),
    modifiedBy: 'You',
    isNew: true,
    isEditing: true,
    type: 'folder',
    maxSize: 0,
  };

  // 4. INSTANT INSERT: Add it straight to the dictionary
  allFolders[newId] = newFolder;

  // 5. Redraw the screen
  await refreshUI();

  // 6. Handle the inline input focus
  const input = document.getElementById(
    'new-folder-input',
  ) as HTMLInputElement;
  if (input) {
    input.value = folderName;
    input.focus();
    input.select();
  }
}
export function handleFileClick(
  allFolders: Record<string, Folder>,
  allFiles: Record<string, File>,
  fileId: string,
) {
  const file = allFiles[fileId];
  if (!file) return;

  file.isNew = false;
  UIManager.saveAndRefresh(file.parentId, allFolders, allFiles);

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
  allFiles: Record<string, File>,
  fileId: string,
) {
  const file = allFiles[fileId];
  console.log('Attempting to download file:', file);
  if (!file || !file.data) {
    alert(
      'Sorry, this file cannot be downloaded because it has no data.',
    );
    return;
  }

  const link = document.createElement('a');
  link.href = file.data;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
export function deleteItem(
  itemId: string,
  isFolder: boolean,
  allFolders: Record<string, Folder>,
  allFiles: Record<string, File>,
) {
  if (isFolder) {
    // 1. Find and delete all files that live inside this folder
    for (const file of Object.values(allFiles)) {
      if (file.parentId === itemId) {
        delete allFiles[file.id]; // Instantly destroys the record
      }
    }

    // 2. Find and delete all sub-folders that live inside this folder
    for (const folder of Object.values(allFolders)) {
      if (folder.parentId === itemId) {
        // Recursive call: Dig deeper and delete the sub-folder's contents too!
        deleteItem(folder.id, true, allFolders, allFiles);
      }
    }

    // 3. Finally, delete the actual target folder
    delete allFolders[itemId];
  } else {
    // If it's just a file, delete it directly
    delete allFiles[itemId];
  }
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
  const { id, oldName, isFolder } = stateRef;

  if (!newName || newName === oldName) {
    closeModal('renameModal');
    return;
  }
  if (!isValidName(newName)) {
    alert(
      'A file name cannot contain any of the following characters: \\ / : * ? " < > |',
    );
    input.focus();
    return;
  }

  const itemArray = isFolder
    ? currentFolder.subFolders
    : currentFolder.files;
  const duplicateFound = isNameDuplicate(
    newName,
    itemArray,
    true,
    id,
  );

  if (duplicateFound) {
    alert('An item with this name already exists in this location.');
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
  id: string,
  name: string,
  isFolder: boolean,
  mobileActionItem: MobileActionItem,
) {
  mobileActionItem.id = id;
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
  if (!isValidName(newName)) {
    alert(
      'A folder name cannot contain any of the following characters: \\ / : * ? " < > |',
    );
    input.focus();
    return;
  }
  // Check if a folder with this name already exists
  const duplicateFound = isNameDuplicate(
    newName,
    currentFolder.subFolders,
    false,
  );

  if (duplicateFound) {
    alert('A folder with this name already exists.');
    input.focus();
    return;
  }

  // Create the new folder object
  const newFolder: Folder = {
    name: newName,
    path:
      currentFolder.path === '/'
        ? `/${newName}`
        : `${currentFolder.path}/${newName}`,
    subFolders: [],
    files: [],
    modified: new Date().toISOString(),
    modifiedBy: 'You',
    isNew: true,
    type: 'folder',
    id: generateID(),
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
  // 1. THE LOCK: Prevent Enter-key mashing
  if (inputElement.dataset.isSaving === 'true') return;
  inputElement.dataset.isSaving = 'true';

  const newName = inputElement.value.trim() || 'New folder';

  // Find the temporary folder
  const folderBeingEdited = currentFolder.subFolders.find(
    (f) => f.isEditing,
  );
  if (!folderBeingEdited) {
    inputElement.dataset.isSaving = 'false';
    return;
  }

  // 2. VALIDATION
  const isInvalid = !isValidName(newName);
  const isDuplicate = isNameDuplicate(
    newName,
    currentFolder.subFolders,
    false,
  );

  if (isInvalid || isDuplicate) {
    const errorMsg = isInvalid
      ? 'A folder name cannot contain special characters like / : * ? " < > |'
      : 'A folder with this name already exists.';

    alert(errorMsg); // Safe to use now!

    // Give focus back to the input so they can fix it
    setTimeout(() => {
      inputElement.dataset.isSaving = 'false';
      inputElement.focus();
      inputElement.select();
    }, 10);

    return;
  }

  // 3. SUCCESS
  folderBeingEdited.name = newName;
  folderBeingEdited.path =
    currentFolder.path === '/'
      ? `/${newName}`
      : `${currentFolder.path}/${newName}`;

  delete folderBeingEdited.isEditing;

  // 4. RENDER
  // Make sure your saveAndRefresh actually calls your UI update!
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

  const duplicateFound = isNameDuplicate(
    newName,
    currentFolder.files,
    true,
  );

  if (duplicateFound) {
    alert('A file with this name already exists.');
    input.focus();
    return;
  }
  if (!isValidName(newName)) {
    alert(
      'A file name cannot contain any of the following characters: \\ / : * ? " < > |',
    );
    input.focus();
    return;
  }
  // Extract the extension (e.g. from "data.xlsx" get "xlsx")
  const lastDotIndex = newName.lastIndexOf('.');
  const extension =
    lastDotIndex > 0
      ? newName.substring(lastDotIndex + 1).toLowerCase()
      : '';

  // Create the dummy file object
  const newFile: File = {
    name: newName,
    extension: extension,
    modified: new Date().toISOString(),
    modifiedBy: 'You',
    isNew: true,
    data: '', // Empty base64 data since it's a blank file
    type: 'file',
    path:
      currentFolder.path === '/'
        ? `/${currentFolder.name}`
        : `${currentFolder.path}/${newName}`,
    id: generateID(),
  };

  // Push it to the top of the array
  currentFolder.files.unshift(newFile);

  // Save, Render, and Close!
  UIManager.saveAndRefresh(currentFolder); // (Assuming this is your save helper)
  closeModal('newFileModal');
}

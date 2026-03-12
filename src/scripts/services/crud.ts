import { File, Folder } from '../models/entity';
import {
  EditingState,
  MobileActionItem,
  UniqueNameModel,
} from '../models/model';
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
      const itemsDictionary = siblingFiles.reduce(
        (dict, folder) => {
          dict[folder.id] = folder;
          return dict;
        },
        {} as Record<string, UniqueNameModel>,
      );
      // Ensure the name is unique among files in THIS folder
      const safeUniqueName = generateUniqueFileName(
        selectedFile.name,
        currentFolderId,
        itemsDictionary,
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
  currentFolderId: string,
  allFolders: Record<string, Folder>,
  refreshUI: () => Promise<void>,
) {
  // 1. Gather siblings to check for duplicate names
  // We grab all folders and only keep the ones inside the current folder
  const siblingFolders = Object.values(allFolders).filter(
    (folder) => folder.parentId === currentFolderId,
  );
  const itemsDictionary = siblingFolders.reduce(
    (dict, folder) => {
      dict[folder.id] = folder;
      return dict;
    },
    {} as Record<string, UniqueNameModel>,
  );
  // 2. Generate a safe name using the siblings
  const folderName = generateUniqueName(
    'New folder',
    currentFolderId,
    itemsDictionary,
  );
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
  const downloadBtn = document.querySelector(
    '[data-modal-action="download-file"]',
  ) as HTMLButtonElement;
  if (downloadBtn) {
    downloadBtn.dataset.id = file.id;
  }
  openModal('fileModal');
}
export function downloadFile(
  allFiles: Record<string, File>,
  fileId: string,
) {
  const file = allFiles[fileId];
  console.log('Attempting to download file with ID:', fileId);
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
  itemId: string,
  oldName: string,
  isFolder: boolean,
) {
  // Save all three pieces of data to your class memory!
  stateRef.id = itemId; 
  stateRef.oldName = oldName;
  stateRef.isFolder = isFolder;

  const input = document.getElementById('renameInput') as HTMLInputElement;

  if (input) {
    input.value = oldName;
    openModal('renameModal'); // (Make sure you have this helper imported)

    setTimeout(() => {
      input.focus();
      // Highlight only the name, not the extension!
      if (!isFolder && oldName.includes('.')) {
        input.setSelectionRange(0, oldName.lastIndexOf('.'));
      } else {
        input.select();
      }
    }, 100);
  }
}
export function submitRename(
  stateRef: EditingState, // { id, oldName, isFolder }
  currentFolderId: string, // 🔴 Pass the ID
  allFolders: Record<string, Folder>, // 🔴 Pass the flat folders
  allFiles: Record<string, File>, // 🔴 Pass the flat files
  saveAndRefreshUI: () => void, // Callback to save and redraw
  closeModal: (modalId: string) => void,
) {
  const input = document.getElementById(
    'renameInput',
  ) as HTMLInputElement;
  const newName = input.value.trim();
  const { id, oldName, isFolder } = stateRef;

  // 1. Bail out if nothing changed
  if (!newName || newName === oldName) {
    closeModal('renameModal');
    return;
  }

  // 2. VALIDATION
  if (!isValidName(newName)) {
    alert(
      'A name cannot contain any of the following characters: \\ / : * ? " < > |',
    );
    input.focus();
    return;
  }

  // Pick the right dictionary to check based on what we are renaming
  const activeDictionary = isFolder ? allFolders : allFiles;

  // 3. Duplicate check using our refactored helper
  const duplicateFound = isNameDuplicate(
    newName,
    currentFolderId,
    activeDictionary,
    id, // Pass the ID so it doesn't flag itself as a duplicate!
  );

  if (duplicateFound) {
    alert('An item with this name already exists in this location.');
    input.focus();
    return;
  }

  // 4. INSTANT LOOKUP: No more .find() loops!
  const target = activeDictionary[id];

  if (target) {
    // Just change the name
    target.name = newName;

    // 🔴 NOTICE: We completely deleted the `target.path` calculation!

    // If it's a file, we still want to update the extension just in case
    // they renamed "data.csv" to "data.txt"
    if (!isFolder) {
      const lastDot = newName.lastIndexOf('.');
      (target as File).extension =
        lastDot > 0
          ? newName.substring(lastDot + 1).toLowerCase()
          : '';
    }
  }

  // 5. Save, Render, and Close!
  saveAndRefreshUI();
  closeModal('renameModal');

  // Clean up
  input.value = '';
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
export function submitNewFolderMobile(
  currentFolderId: string, // 🔴 Pass the ID
  allFolders: Record<string, Folder>, // 🔴 Pass the flat dictionary
  saveAndRefreshUI: () => void, // 🔴 Pass your UI updater
  closeModal: (modalId: string) => void, // 🔴 Pass your modal closer
) {
  const input = document.getElementById(
    'newFolderNameInput',
  ) as HTMLInputElement;
  let newName = input.value.trim();

  // 1. Default fallback
  if (!newName) {
    newName = 'New folder';
  }

  // 2. VALIDATION
  if (!isValidName(newName)) {
    alert(
      'A folder name cannot contain any of the following characters: \\ / : * ? " < > |',
    );
    input.focus();
    return;
  }

  // Use our newly refactored dictionary-aware duplicate checker!
  const duplicateFound = isNameDuplicate(
    newName,
    currentFolderId,
    allFolders,
  );

  if (duplicateFound) {
    alert('A folder with this name already exists.');
    input.focus();
    return;
  }

  const newId = generateID();

  // 3. Create the perfect flat object
  const newFolder: Folder = {
    id: newId,
    parentId: currentFolderId, // 🔴 The magic link!
    name: newName,
    modified: new Date().toISOString(),
    modifiedBy: 'You',
    isNew: true,
    type: 'folder',
    maxSize: 0,
  };

  // 4. INSTANT INSERT: Add it straight to the dictionary
  allFolders[newId] = newFolder;

  // 5. Save state, redraw the grid, and close the modal
  saveAndRefreshUI();
  closeModal('newFolderModal');

  // Clean up the input box for the next time the modal opens
  input.value = '';
}
export function submitNewFolder(
  currentFolderId: string,
  allFolders: Record<string, Folder>,
  inputElement: HTMLInputElement,
  saveAndRefreshUI: () => void, // Pass your refresh callback
) {
  // 1. THE LOCK: Prevent Enter-key mashing
  if (inputElement.dataset.isSaving === 'true') return;
  inputElement.dataset.isSaving = 'true';

  const newName = inputElement.value.trim() || 'New folder';

  // 2. Find the temporary folder in the flat dictionary
  const folderBeingEdited = Object.values(allFolders).find(
    (f) => f.parentId === currentFolderId && f.isEditing,
  );

  if (!folderBeingEdited) {
    inputElement.dataset.isSaving = 'false';
    return;
  }

  // 3. VALIDATION
  const isInvalid = !isValidName(newName);
  const isDuplicate = isNameDuplicate(
    newName,
    currentFolderId,
    allFolders,
    folderBeingEdited.id, // Pass the ID so it doesn't flag itself as a duplicate
  );

  if (isInvalid || isDuplicate) {
    const errorMsg = isInvalid
      ? 'A folder name cannot contain special characters like / : * ? " < > |'
      : 'A folder with this name already exists.';

    alert(errorMsg);

    // Give focus back to the input so they can fix it
    setTimeout(() => {
      inputElement.dataset.isSaving = 'false';
      inputElement.focus();
      inputElement.select();
    }, 10);

    return;
  }

  // 4. SUCCESS: Just update the name and remove the flag!
  // (Notice: We completely deleted the 'path' calculation!)
  folderBeingEdited.name = newName;
  delete folderBeingEdited.isEditing;

  // 5. RENDER & SAVE
  // Because we mutated the object inside the dictionary, we just save and refresh!
  saveAndRefreshUI();
}
export function submitNewFile(
  currentFolderId: string,
  allFiles: Record<string, File>,
  saveAndRefreshUI: () => void,
  closeModal: (modalId: string) => void,
) {
  const input = document.getElementById(
    'newFileNameInput',
  ) as HTMLInputElement;
  let newName = input.value.trim();

  // Default to a blank text file if they don't type anything
  if (!newName) {
    newName = 'New Document.txt';
  }

  // 1. VALIDATION
  if (!isValidName(newName)) {
    alert(
      'A file name cannot contain any of the following characters: \\ / : * ? " < > |',
    );
    input.focus();
    return;
  }

  const duplicateFound = isNameDuplicate(
    newName,
    currentFolderId,
    allFiles,
  );

  if (duplicateFound) {
    alert('A file with this name already exists.');
    input.focus();
    return;
  }

  // 2. Extract the extension (e.g. from "data.xlsx" get "xlsx")
  const lastDotIndex = newName.lastIndexOf('.');
  const extension =
    lastDotIndex > 0
      ? newName.substring(lastDotIndex + 1).toLowerCase()
      : '';

  const newFileId = generateID();

  // 3. Create the flat file object
  const newFile: File = {
    id: newFileId,
    parentId: currentFolderId, // 🔴 The magic link!
    name: newName,
    extension: extension,
    modified: new Date().toISOString(),
    modifiedBy: 'You',
    isNew: true,
    data: '', // Empty base64 data since it's a blank file
    type: 'file',
    // 🔴 Notice: No 'path' property!
  };

  // 4. INSTANT INSERT: Add to dictionary
  allFiles[newFileId] = newFile;

  // 5. Save, Render, and Close!
  saveAndRefreshUI();
  closeModal('newFileModal');

  // Clean up input for next time
  input.value = '';
}

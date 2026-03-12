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
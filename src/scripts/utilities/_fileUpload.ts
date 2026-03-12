import { File, Folder } from '../models/entity';
import { ROW_TYPE } from '../models/enum';
import {
  UniqueNameModel,
} from '../models/model';
import {
  generateID,
  generateUniqueFileName,
} from '../utilities/_helper';
import { saveToStorage } from '../utilities/_storageUtil';

export function triggerUpload() {
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
          type: ROW_TYPE.FILE,
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
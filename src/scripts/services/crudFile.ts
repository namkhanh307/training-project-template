  import { File, Folder } from "../models/entity";
import { saveToStorage } from "../utilities/_storageUtil";
  export function triggerUpload() {
    // Mobile safety check (optional: remove 'show' class if triggered from mobile menu)
    document.getElementById('mobileMenu')?.classList.remove('show');

    const fileInput = document.getElementById(
      'fileInput',
    ) as HTMLInputElement;
    fileInput?.click();
  }
  
export async function  processFileSelection(rootFolder: Folder, currentFolder: Folder, refreshUI: () => void, event: Event) {
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
            modified: 'Just now',
            modifiedBy: 'You',
            isNew: true,
            path:"",
            data: e.target?.result as string,
            type: 'file',
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
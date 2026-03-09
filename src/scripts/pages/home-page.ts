import ready, {
  updateBackButtonVisibility,
} from '../utilities/_helper';
import renderGrid, { File, Folder, Row } from '../components/_grid';
import {
  loadFromStorage,
  saveToStorage,
} from '../utilities/_storageUtil';

// Define your root data structure
let rootFolder: Folder = {
  name: 'Root',
  path: '/',
  subFolders: [
    {
      name: 'CAS',
      path: '/CAS',
      subFolders: [],
      files: [
        {
          name: 'Internal_Document.xlsx',
          extension: 'xlsx',
          modified: 'May 1',
          modifiedBy: 'Megan Bowen',
          isNew: false,
          data: '',
          type: 'file',
        },
      ],
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: false,
      type: 'file',
    },
  ],
  files: [
    {
      name: 'CoasterAndBargeLoading.xlsx',
      extension: 'xlsx',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: true,
      data: '',
      type: 'file',
    },
    {
      name: 'RevenueByServices.xlsx',
      extension: 'xlsx',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
      isNew: true,
      data: '',
      type: 'file',
    },
  ],
  modified: 'A few seconds ago',
  modifiedBy: 'Administrator MOD',
  isNew: true,
  type: 'folder',
};

// Keep track of the folder history (the stack)
let navigationHistory: Folder[] = [];
let currentFolder: Folder = rootFolder;

/**
 * Navigates into a folder and saves the previous one to history
 */
const navigateToFolder = (
  folder: Folder,
  isBack: boolean = false,
): void => {
  // If we aren't going back, push the current folder to history before moving
  if (!isBack && currentFolder && currentFolder !== folder) {
    navigationHistory.push(currentFolder);
  }

  currentFolder = folder;
  const combinedItems: Row[] = [
    ...folder.subFolders,
    ...folder.files,
  ];

  // Update the UI
  renderGrid(combinedItems);
  updateBackButtonVisibility(navigationHistory);
};

/**
 * The "Back -1" Logic
 */
const goBack = (): void => {
  if (navigationHistory.length > 0) {
    const previousFolder = navigationHistory.pop();
    if (previousFolder) {
      navigateToFolder(previousFolder, true);
    }
  }
};

// Expose to window for the button click
(window as any).goBack = goBack;

/**
 * Global handler for the onclick events generated in your grid
 */
(window as any).handleFolderClick = (folderName: string) => {
  const target = currentFolder.subFolders.find(
    (f) => f.name === folderName,
  );
  target.isNew = false; // Mark as read when clicked
  if (target) {
    navigateToFolder(target);
  }
};
(window as any).handleFileClick = (fileName: string) => {
  const file = currentFolder.files.find((f) => f.name === fileName);
  if (!file) return;

  // 1. Mark as read
  file.isNew = false;
  renderGrid([...currentFolder.subFolders, ...currentFolder.files]);

  // 2. Open Modal & Fill Text
  const modal = document.getElementById('fileModal')!;
  document.getElementById('modalFileName')!.innerText = file.name;
  // ... (fill other fields like modifiedBy) ...

  // 3. Program the Download Button
  const downloadBtn = document.getElementById('modalDownloadBtn')!;
  downloadBtn.onclick = () => {
    (window as any).handleDownloadFile(file.name);
  };

  // 4. Program the Delete Button
  const deleteBtn = document.getElementById('modalDeleteBtn')!;
  deleteBtn.onclick = () => {
    (window as any).handleDelete(file.name, false); // false because it's a file
  };

  // 5. Show the modal
  modal.style.display = 'flex';
};
(window as any).closeModal = () => {
  document.getElementById('fileModal')!.style.display = 'none';
};
(window as any).handleUploadFile = () => {
  const fileInput = document.getElementById(
    'fileInput',
  ) as HTMLInputElement;
  fileInput.click();
};
(window as any).onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    const selectedFile = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64String = e.target?.result as string;

      const newFile: File = {
        name: selectedFile.name,
        extension: 'xlsx',
        modified: 'Just now',
        modifiedBy: 'You',
        isNew: true,
        data: base64String,
        type: 'file',
      };

      // Add to current folder
      currentFolder.files.push(newFile);

      // Save to localStorage & Refresh UI
      saveToStorage(rootFolder); 
      navigateToFolder(currentFolder, true);
    };

    reader.readAsDataURL(selectedFile);
    target.value = ''; // Reset input
  }
};
(window as any).handleAddFolderDesktop = () => {
  const newFolder: Folder = {
    name: '', // Empty initially
    path: '',
    subFolders: [],
    files: [],
    modified: 'Just now',
    modifiedBy: 'Administrator MOD',
    isNew: true,
    isEditing: true,
    type: 'folder',
  };

  // Add to the beginning of the list
  currentFolder.subFolders.unshift(newFolder);

  // Re-render the grid so the input box appears
  renderGrid([...currentFolder.subFolders, ...currentFolder.files]);

  // Focus the input automatically
  const input = document.getElementById(
    'new-folder-input',
  ) as HTMLInputElement;
  if (input) {
    input.focus();
    input.select();
  }
};
(window as any).saveFolderName = (event: any) => {
  const newName = event.target.value.trim() || 'New folder';

  // Find the folder that was being edited
  const folder = currentFolder.subFolders.find((f) => f.isEditing);

  if (folder) {
    folder.name = newName;
    folder.path =
      currentFolder.path === '/'
        ? `/${newName}`
        : `${currentFolder.path}/${newName}`;
    delete folder.isEditing; // Remove editing state
  }

  saveToStorage(rootFolder);
  renderGrid([...currentFolder.subFolders, ...currentFolder.files]);
};
(window as any).handleRenameKey = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    (event.target as HTMLInputElement).blur(); // Triggers saveFolderName
  }
  if (event.key === 'Escape') {
    // Optional: Remove the folder if they hit Esc
    currentFolder.subFolders.shift();
    renderGrid([...currentFolder.subFolders, ...currentFolder.files]);
  }
};
(window as any).handleDownloadFile = (fileName: string) => {
  const file = currentFolder.files.find((f) => f.name === fileName);
  if (!file) return;

  file.isNew = false;

  // If the file has Base64 data, download it
  if (file.data) {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Re-render to update the "isNew" sparkle
  renderGrid([...currentFolder.subFolders, ...currentFolder.files]);
  saveToStorage(rootFolder);
};
(window as any).handleDelete = (name: string, isFolder: boolean) => {
  if (
    confirm(
      `Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`,
    )
  ) {
    if (isFolder) {
      currentFolder.subFolders = currentFolder.subFolders.filter(
        (f) => f.name !== name,
      );
    } else {
      currentFolder.files = currentFolder.files.filter(
        (f) => f.name !== name,
      );
    }

    // CRITICAL: Save the root, hide modal, then re-render
    saveToStorage(rootFolder);

    const modal = document.getElementById('fileModal');
    if (modal) modal.style.display = 'none';

    renderGrid([...currentFolder.subFolders, ...currentFolder.files]);
  }
};
ready(() => {
  // 1. Overwrite the default rootFolder with the saved data
  rootFolder = loadFromStorage(rootFolder);

  // 2. Set currentFolder to point to the exact same memory reference
  currentFolder = rootFolder;

  // 3. Render
  navigateToFolder(currentFolder);
});

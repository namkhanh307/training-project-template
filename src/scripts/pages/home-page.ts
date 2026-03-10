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
  if (!isBack && currentFolder && currentFolder !== folder) {
    navigationHistory.push(currentFolder);
  }

  currentFolder = folder;

  // --- NEW: Interactive Breadcrumb Generator ---
  const pathDisplay = document.getElementById('folder-path-display');
  if (pathDisplay) {
    // 1. Always start with the Root (Documents)
    let breadcrumbsHTML = `<span class="m-breadcrumb is-clickable" onclick="navigateFromBreadcrumb('/')">Documents</span>`;

    // 2. If we are deep in a folder, split the path and build the links
    if (folder.path !== '/') {
      const segments = folder.path
        .split('/')
        .filter((s) => s.length > 0);
      let buildPath = '';

      segments.forEach((segment) => {
        buildPath += `/${segment}`; // Reconstruct the path step-by-step (e.g., /CAS, then /CAS/Finance)
        breadcrumbsHTML += ` <span class="m-breadcrumb-separator"><i class="fas fa-chevron-right small"></i></span> `;
        breadcrumbsHTML += `<span class="m-breadcrumb is-clickable" onclick="navigateFromBreadcrumb('${buildPath}')">${segment}</span>`;
      });
    }

    pathDisplay.innerHTML = breadcrumbsHTML;
  }
  // ---------------------------------------------

  const combinedItems: Row[] = [
    ...folder.subFolders,
    ...folder.files,
  ];

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
(window as any).navigateFromBreadcrumb = (targetPath: string) => {
  // If they clicked the root "Documents" link
  if (targetPath === '/') {
    navigateToFolder(rootFolder);
    return;
  }

  // Split the target path into folder names (e.g., ['CAS', 'Finance'])
  const segments = targetPath.split('/').filter((s) => s.length > 0);

  // Start searching from the top of the tree
  let foundFolder = rootFolder;

  // Walk down the tree folder by folder
  for (const segment of segments) {
    const nextFolder = foundFolder.subFolders.find(
      (f) => f.name === segment,
    );
    if (nextFolder) {
      foundFolder = nextFolder;
    } else {
      console.error(
        `Folder ${segment} not found in path ${targetPath}`,
      );
      return; // Stop if something goes wrong
    }
  }

  // Once we've found the final folder, navigate to it!
  navigateToFolder(foundFolder);
};
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
  document.getElementById('modalFileExtension')!.innerText =
    file.extension;
  document.getElementById('modalFileModified')!.innerText =
    file.modified;
  document.getElementById('modalFileModifiedBy')!.innerText =
    file.modifiedBy;

  // 3. Program the Download Button
  const downloadBtn = document.getElementById('modalDownloadBtn')!;
  downloadBtn.onclick = () => {
    (window as any).handleDownloadFile(file.name);
  };

  // 4. Program the Delete Button
  // const deleteBtn = document.getElementById('modalDeleteBtn')!;
  // deleteBtn.onclick = () => {
  //   (window as any).handleDelete(file.name, false); // false because it's a file
  // };

  // 5. Show the modal
  modal.style.display = 'flex';
};
(window as any).closeModal = () => {
  document.getElementById('fileModal')!.style.display = 'none';
};
(window as any).handleUploadFile = (isMobile: boolean) => {
  if (isMobile) {
    document.getElementById('mobileMenu')!.classList.remove('show');
  }
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

    // --- NEW: Extract the extension safely ---
    // lastIndexOf returns -1 if no dot is found.
    // We check > 0 to ignore files that just start with a dot (like .env)
    const lastDotIndex = selectedFile.name.lastIndexOf('.');
    const fileExtension =
      lastDotIndex > 0
        ? selectedFile.name.substring(lastDotIndex + 1).toLowerCase()
        : '';

    reader.onload = (e) => {
      const base64String = e.target?.result as string;

      const newFile: File = {
        name: selectedFile.name,
        extension: fileExtension, // <-- Assign the extracted extension here
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

  // 1. Find the folder that is currently in "edit mode"
  const folderBeingEdited = currentFolder.subFolders.find(
    (f) => f.isEditing,
  );
  if (!folderBeingEdited) return;

  // 2. DUPLICATION CHECK: Check if ANY other folder has this exact name
  const isDuplicate = currentFolder.subFolders.some(
    (f) =>
      f !== folderBeingEdited &&
      f.name.toLowerCase() === newName.toLowerCase(),
  );

  // 3. If it's a duplicate, stop the save!
  if (isDuplicate) {
    alert(
      `This destination already contains a folder named '${newName}'.`,
    );

    // Refocus the input so the user can fix the name
    setTimeout(() => {
      event.target.focus();
      event.target.select();
    }, 10);

    return; // EXITS THE FUNCTION EARLY
  }

  // 4. If it's unique, proceed with saving as normal
  folderBeingEdited.name = newName;
  folderBeingEdited.path =
    currentFolder.path === '/'
      ? `/${newName}`
      : `${currentFolder.path}/${newName}`;

  delete folderBeingEdited.isEditing;

  saveToStorage(rootFolder); // ALWAYS save rootFolder!
  renderGrid([...currentFolder.subFolders, ...currentFolder.files]);
};
(window as any).handleAddFolderMobile = () => {
  // 1. Hide the Bootstrap menu correctly
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    mobileMenu.classList.remove('show');
  }

  // 2. Clear the input from the last time it was used
  const input = document.getElementById(
    'newFolderNameInput',
  ) as HTMLInputElement;
  if (input) input.value = '';

  // 3. Show the new modal
  const modal = document.getElementById('newFolderModal');
  if (modal) {
    modal.style.display = 'flex';
  }

  // 4. Try to focus the input automatically for the user
  setTimeout(() => input?.focus(), 100);
};
(window as any).submitNewFolder = () => {
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
    return; // Stop the function
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
    modified: 'Just now',
    modifiedBy: 'Administrator MOD',
    isNew: true,
    type: 'folder',
  };

  // Add it to the top of the list
  currentFolder.subFolders.unshift(newFolder);

  // Save and Re-render
  saveToStorage(rootFolder);
  renderGrid([...currentFolder.subFolders, ...currentFolder.files]);

  // Close the modal
  (window as any).closeNewFolderModal();
};
document
  .getElementById('newFolderNameInput')
  ?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (window as any).submitNewFolder();
    }
  });
(window as any).closeNewFolderModal = () => {
  document.getElementById('newFolderModal')!.style.display = 'none';
};
// (window as any).saveFolderName = (event: any) => {
//   const newName = event.target.value.trim() || 'New folder';

//   // Find the folder that was being edited
//   const folder = currentFolder.subFolders.find((f) => f.isEditing);

//   if (folder) {
//     folder.name = newName;
//     folder.path =
//       currentFolder.path === '/'
//         ? `/${newName}`
//         : `${currentFolder.path}/${newName}`;
//     delete folder.isEditing; // Remove editing state
//   }

//   saveToStorage(rootFolder);
//   renderGrid([...currentFolder.subFolders, ...currentFolder.files]);
// };
(window as any).handleRenameKey = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement;

  // If they press Enter, force the input to lose focus.
  // This automatically triggers the "onblur" event, which calls saveFolderName!
  if (event.key === 'Enter') {
    target.blur();
  }

  // Optional: If they press Escape, cancel the creation
  if (event.key === 'Escape') {
    // Remove the temporary folder from the array
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
// 1. Temporary state to remember what we are renaming
let editingItemState = { oldName: '', isFolder: false };

// 2. Open the Modal
(window as any).handleEdit = (oldName: string, isFolder: boolean) => {
  editingItemState = { oldName, isFolder };

  const modal = document.getElementById('renameModal');
  const input = document.getElementById(
    'renameInput',
  ) as HTMLInputElement;

  if (modal && input) {
    input.value = oldName;
    modal.style.display = 'flex';

    // Pro-Tip UX: Select the text automatically.
    // If it's a file, we only highlight the name, not the extension!
    setTimeout(() => {
      input.focus();
      if (!isFolder && oldName.includes('.')) {
        input.setSelectionRange(0, oldName.lastIndexOf('.'));
      } else {
        input.select();
      }
    }, 100);
  }
  document
    .getElementById('renameInput')
    ?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        (window as any).submitRename();
      }
    });
};

// 3. Save the new name
(window as any).submitRename = () => {
  const input = document.getElementById(
    'renameInput',
  ) as HTMLInputElement;
  const newName = input.value.trim();

  // If they left it blank or didn't change the name, just close it
  if (!newName || newName === editingItemState.oldName) {
    (window as any).closeRenameModal();
    return;
  }

  // Check for duplicates in the respective array
  let isDuplicate = false;
  if (editingItemState.isFolder) {
    isDuplicate = currentFolder.subFolders.some(
      (f) => f.name.toLowerCase() === newName.toLowerCase(),
    );
  } else {
    isDuplicate = currentFolder.files.some(
      (f) => f.name.toLowerCase() === newName.toLowerCase(),
    );
  }

  if (isDuplicate) {
    alert('An item with this name already exists in this location.');
    input.focus();
    return;
  }

  // Apply the rename
  if (editingItemState.isFolder) {
    const target = currentFolder.subFolders.find(
      (f) => f.name === editingItemState.oldName,
    );
    if (target) {
      target.name = newName;
      target.path =
        currentFolder.path === '/'
          ? `/${newName}`
          : `${currentFolder.path}/${newName}`;
    }
  } else {
    const target = currentFolder.files.find(
      (f) => f.name === editingItemState.oldName,
    );
    if (target) {
      target.name = newName;
      // Update extension in case they renamed "report.xlsx" to "report.csv"
      const lastDotIndex = newName.lastIndexOf('.');
      target.extension =
        lastDotIndex > 0
          ? newName.substring(lastDotIndex + 1).toLowerCase()
          : '';
    }
  }

  // Save & Refresh
  saveToStorage(rootFolder);
  renderGrid([...currentFolder.subFolders, ...currentFolder.files]);
  (window as any).closeRenameModal();
};
// 1. Temporary state for the mobile options menu
let currentMobileActionItem = { name: '', isFolder: false };

// 2. Open the Action Sheet
(window as any).handleOptionDropdown = (name: string, isFolder: boolean) => {
  currentMobileActionItem = { name, isFolder };
  
  const modal = document.getElementById('mobileOptionsModal');
  const title = document.getElementById('optionsModalTitle');
  
  if (title) title.innerText = name; // Show the file/folder name as the title
  if (modal) modal.style.display = 'flex';
};

// 3. Close Helper
(window as any).closeOptionsModal = () => {
  const modal = document.getElementById('mobileOptionsModal');
  if (modal) modal.style.display = 'none';
};

// 4. Trigger Rename
(window as any).triggerMobileRename = () => {
  (window as any).closeOptionsModal();
  // Fire the exact same rename modal logic we built for desktop!
  (window as any).handleEdit(currentMobileActionItem.name, currentMobileActionItem.isFolder);
};

// 5. Trigger Delete
(window as any).triggerMobileDelete = () => {
  (window as any).closeOptionsModal();
  // Fire the exact same delete logic we built for desktop!
  (window as any).handleDelete(currentMobileActionItem.name, currentMobileActionItem.isFolder);
};
// 4. Close Modal Helper
(window as any).closeRenameModal = () => {
  const modal = document.getElementById('renameModal');
  if (modal) modal.style.display = 'none';
  editingItemState = { oldName: '', isFolder: false }; // clear state
};
ready(() => {
  // 1. Overwrite the default rootFolder with the saved data
  rootFolder = loadFromStorage(rootFolder);

  // 2. Set currentFolder to point to the exact same memory reference
  currentFolder = rootFolder;

  // 3. Render
  navigateToFolder(currentFolder);
});

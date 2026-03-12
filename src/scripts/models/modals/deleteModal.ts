import { saveToStorage } from "../../utilities/_storageUtil";
import { File, Folder } from "../entity";
import { BaseModal } from "./baseModal";

export class DeleteModal extends BaseModal {
  private itemId: string;
  private isFolder: boolean;
  private allFolders: Record<string, Folder>;
  private allFiles: Record<string, File>;
  private refreshUI: () => void;

  constructor(
    itemId: string,
    isFolder: boolean,
    allFolders: Record<string, Folder>,
    allFiles: Record<string, File>,
    refreshUI: () => void
  ) {
    super("Confirm Deletion"); 
    this.itemId = itemId;
    this.isFolder = isFolder;
    this.allFolders = allFolders;
    this.allFiles = allFiles;
    this.refreshUI = refreshUI;
  }

  // 1. Beautiful, context-aware HTML
  renderContent(): string {
    const activeDict = this.isFolder ? this.allFolders : this.allFiles;
    const itemToDelete = activeDict[this.itemId];
    const itemName = itemToDelete ? itemToDelete.name : 'this item';
    const typeName = this.isFolder ? 'folder' : 'file';

    return `
      <div class="alert alert-danger mb-0">
        <p class="mb-2">Are you sure you want to delete the ${typeName} <strong>"${itemName}"</strong>?</p>
        ${
          this.isFolder 
            ? '<p class="mb-0 small"><i class="fas fa-exclamation-triangle me-1"></i> This will also permanently delete all files and sub-folders inside it!</p>' 
            : '<p class="mb-0 small">This action cannot be undone.</p>'
        }
      </div>
    `;
  }

  // 2. The Cascade Delete logic (safely isolated from the rest of the app!)
  private deleteFolderRecursive(folderId: string) {
    // A. Delete all files that belong to this folder
    for (const file of Object.values(this.allFiles)) {
      if (file.parentId === folderId) {
        delete this.allFiles[file.id];
      }
    }

    // B. Find all sub-folders and recursively delete them
    for (const folder of Object.values(this.allFolders)) {
      if (folder.parentId === folderId) {
        this.deleteFolderRecursive(folder.id);
      }
    }

    // C. Delete the folder itself
    delete this.allFolders[folderId];
  }

  // 3. The Execution
  handleConfirm(): void {
    if (this.isFolder) {
      this.deleteFolderRecursive(this.itemId);
    } else {
      delete this.allFiles[this.itemId]; // Deleting a file is a single O(1) command!
    }

    // Save the newly cleaned dictionaries to localStorage
    // (Make sure saveToStorage is imported at the top of the file)
    saveToStorage(this.allFolders, this.allFiles);
    
    // Redraw the screen and close the modal
    this.refreshUI();
    this.close();
  }
}
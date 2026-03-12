import { isNameDuplicate } from "../../utilities/_helper";
import { saveToStorage } from "../../utilities/_storageUtil";
import { File, Folder } from "../entity";
import { BaseModal } from "./baseModal";

export class RenameModal extends BaseModal {
  private itemId: string;
  private isFolder: boolean;
  private currentFolderId: string;
  private allFolders: Record<string, Folder>;
  private allFiles: Record<string, File>;
  private refreshUI: () => void;

  constructor(
    itemId: string,
    isFolder: boolean,
    currentFolderId: string,
    allFolders: Record<string, Folder>,
    allFiles: Record<string, File>,
    refreshUI: () => void
  ) {
    super("Rename Item");
    this.itemId = itemId;
    this.isFolder = isFolder;
    this.currentFolderId = currentFolderId;
    this.allFolders = allFolders;
    this.allFiles = allFiles;
    this.refreshUI = refreshUI;
  }

  renderContent(): string {
    // Look up the current name to populate the input
    const activeDict = this.isFolder ? this.allFolders : this.allFiles;
    const currentName = activeDict[this.itemId]?.name || '';

    return `
      <div class="form-group">
        <label>New Name</label>
        <input type="text" id="rename-input" class="form-control" value="${currentName}" />
      </div>
    `;
  }

  handleConfirm(): void {
    const input = document.getElementById('rename-input') as HTMLInputElement;
    const newName = input.value.trim();
    const activeDict = this.isFolder ? this.allFolders : this.allFiles;
    const targetItem = activeDict[this.itemId];

    if (!newName || newName === targetItem.name) {
      this.close();
      return; // Nothing changed
    }

    if (isNameDuplicate(newName, this.currentFolderId, activeDict, this.itemId)) {
      alert('Name already exists.');
      return;
    }

    // Update the dictionary
    targetItem.name = newName;
    
    // Refresh and close
    saveToStorage(this.allFolders, this.allFiles);
    this.refreshUI();
    this.close();
  }
}
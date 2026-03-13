import {
  isNameDuplicate,
  isValidName,
} from '../../utilities/_helper';
import { saveToStorage } from '../../utilities/_storageUtil';
import { File, Folder } from '../entity';
import { BaseModal } from './baseModal';

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
    refreshUI: () => void,
  ) {
    super('Rename Item');
    this.itemId = itemId;
    this.isFolder = isFolder;
    this.currentFolderId = currentFolderId;
    this.allFolders = allFolders;
    this.allFiles = allFiles;
    this.refreshUI = refreshUI;
  }

  renderContent(): string {
    const activeDict = this.isFolder
      ? this.allFolders
      : this.allFiles;
    const target = activeDict[this.itemId];

    // 1. Stitch it together for the input box
    const currentName =
      !this.isFolder && (target as File).extension
        ? `${target.name}.${(target as File).extension}`
        : target.name;

    return `
      <div class="form-group">
        <label>New Name</label>
        <input type="text" id="rename-input" class="form-control" value="${currentName}" />
      </div>
    `;
  }

  handleConfirm(): void {
    const input = document.getElementById(
      'rename-input',
    ) as HTMLInputElement;
    const inputName = input.value.trim();
    const activeDict = this.isFolder
      ? this.allFolders
      : this.allFiles;
    const targetItem = activeDict[this.itemId];

    if (!inputName) {
      this.close();
      return;
    }
    // 1. Validation (Using our refactored helper!)
    if (!isValidName(inputName)) {
      alert('Invalid characters in name.');
      return;
    }
    if (
      isNameDuplicate(
        inputName,
        this.currentFolderId,
        this.allFolders,
      )
    ) {
      alert('A folder with this name already exists.');
      return;
    }
    // 2. If it's a file, split the newly typed string!
    if (!this.isFolder) {
      const lastDotIndex = inputName.lastIndexOf('.');

      if (lastDotIndex > 0) {
        // They typed a dot (e.g., "Report.pdf")
        targetItem.name = inputName.substring(0, lastDotIndex);
        (targetItem as File).extension = inputName
          .substring(lastDotIndex + 1)
          .toLowerCase();
      } else {
        // They deleted the dot entirely (e.g., "Report")
        targetItem.name = inputName;
        (targetItem as File).extension = ''; // Wipe out the old extension!
      }
    } else {
      // It's a folder, just save the name
      targetItem.name = inputName;
    }

    saveToStorage(this.allFolders, this.allFiles);
    this.refreshUI();
    this.close();
  }
  // Automatically focus the input when the modal opens
  protected onOpen(): void {
    const input = document.getElementById(
      'rename-input',
    ) as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }
}

import {
  generateID,
  getEmptyBase64Data,
  isNameDuplicate,
  isValidName,
} from '../../utilities/_helper';
import { saveToStorage } from '../../utilities/_storageUtil';
import { File, Folder } from '../entity';
import { ROW_TYPE } from '../enum';
import { BaseModal } from './baseModal';

export class CreateFileModal extends BaseModal {
  private currentFolderId: string;
  private allFolders: Record<string, Folder>;
  private allFiles: Record<string, File>;
  private refreshUI: () => void;

  constructor(
    currentFolderId: string,
    allFolders: Record<string, Folder>,
    allFiles: Record<string, File>,
    refreshUI: () => void,
  ) {
    super('Create New File');
    this.currentFolderId = currentFolderId;
    this.allFolders = allFolders;
    this.allFiles = allFiles;
    this.refreshUI = refreshUI;
  }

  renderContent(): string {
    return `
      <div class="form-group">
        <label>File Name</label>
        <input type="text" id="new-file-input" class="form-control" placeholder="New Document.txt" />
      </div>
    `;
  }

  protected onOpen(): void {
    const input = document.getElementById(
      'new-file-input',
    ) as HTMLInputElement;
    if (input) input.focus();
  }

  handleConfirm(): void {
    const input = document.getElementById(
      'new-file-input',
    ) as HTMLInputElement;
    console.log(input);
    let newName = input.value.trim();

    // Default fallback
    if (!newName) {
      newName = 'New Document.txt';
    }

    // 1. Validation
    if (!isValidName(newName)) {
      alert('Invalid characters in name.');
      return;
    }

    // Check against siblings in the same folder
    if (
      isNameDuplicate(newName, this.currentFolderId, this.allFiles)
    ) {
      alert('A file with this name already exists.');
      return;
    }

    // 2. Extract Extension
    const lastDotIndex = newName.lastIndexOf('.');
    const extension =
      lastDotIndex > 0
        ? newName.substring(lastDotIndex + 1).toLowerCase()
        : '';
    const emptyBase64 = getEmptyBase64Data(extension);
    // 3. Create the flat object
    const newId = generateID();
    const newFile: File = {
      id: newId,
      parentId: this.currentFolderId, 
      name: newName,
      extension: extension,
      modified: new Date().toISOString(),
      modifiedBy: 'You',
      isNew: true,
      data: emptyBase64, 
      type: ROW_TYPE.FILE,
    };

    // 4. Save, refresh, and close
    this.allFiles[newId] = newFile;
    // Assuming saveToStorage grabs both dictionaries from your main class
    saveToStorage(this.allFolders, this.allFiles);
    this.refreshUI();

    this.close();
  }
}

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
    let inputName = input.value.trim() || 'New Document.txt';

    // 1. Split the name and the extension
    let baseName = inputName;
    let extension = '';
    const lastDotIndex = inputName.lastIndexOf('.');

    if (lastDotIndex > 0) {
      baseName = inputName.substring(0, lastDotIndex);
      extension = inputName.substring(lastDotIndex + 1).toLowerCase();
    }

    // 2. Create the flat object with separated data!
    const newId = generateID();
    const emptyBase64 = getEmptyBase64Data(extension); // From our previous helper

    const newFile: File = {
      id: newId,
      parentId: this.currentFolderId,
      name: baseName, // 🔴 Only stores "Budget"
      extension: extension, // 🔴 Only stores "xlsx"
      modified: new Date().toISOString(),
      modifiedBy: 'You',
      isNew: true,
      data: emptyBase64,
      type: ROW_TYPE.FILE,
    };

    this.allFiles[newId] = newFile;
    saveToStorage(this.allFolders, this.allFiles);
    this.refreshUI();
    this.close();
  }
}

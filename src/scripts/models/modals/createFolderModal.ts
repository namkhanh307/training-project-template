import {
  generateID,
  isNameDuplicate,
  isValidName,
} from '../../utilities/_helper';
import { saveToStorage } from '../../utilities/_storageUtil';
import { File, Folder } from '../entity';
import { ROW_TYPE } from '../enum';
import { BaseModal } from './baseModal';

export class CreateFolderModal extends BaseModal {
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
    super('Create New Folder'); // Pass title to BaseModal
    this.currentFolderId = currentFolderId;
    this.allFolders = allFolders;
    this.allFiles = allFiles;
    this.refreshUI = refreshUI;
  }

  // Provide the HTML input field
  renderContent(): string {
    return `
      <div class="form-group">
        <label>Folder Name</label>
        <input type="text" id="new-folder-input" class="form-control" placeholder="New folder" />
        <label>Maximun size</label>
        <input type="text" id="new-folder-maxSize" class="form-control" placeholder="Max sise" />
      </div>
    `;
  }

  // Automatically focus the input when the modal opens
  protected onOpen(): void {
    const input = document.getElementById(
      'new-folder-input',
    ) as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  handleConfirm(): void {
    const input = document.getElementById(
      'new-folder-input',
    ) as HTMLInputElement;
    let newName = input.value.trim() || 'New folder';

    // 1. Validation (Using our refactored helper!)
    if (!isValidName(newName)) {
      alert('Invalid characters in name.');
      return;
    }
    if (
      isNameDuplicate(newName, this.currentFolderId, this.allFolders)
    ) {
      alert('A folder with this name already exists.');
      return;
    }

    // 2. Create the flat object
    const newId = generateID();
    const newFolder: Folder = {
      id: newId,
      parentId: this.currentFolderId,
      name: newName,
      type: ROW_TYPE.FOLDER,
      modified: new Date().toISOString(),
      modifiedBy: 'You',
      isNew: true,
      maxSize: 500,
    };

    // 3. Save to state, refresh, and close!
    this.allFolders[newId] = newFolder;
    saveToStorage(this.allFolders, this.allFiles);
    this.refreshUI();

    this.close();
  }
}

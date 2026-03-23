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
  private currentFolderId: string | null;
  private refreshUI: () => void;

  constructor(
    currentFolderId: string | null,
    refreshUI: () => void,
  ) {
    super('Create New Folder'); // Pass title to BaseModal
    this.currentFolderId = currentFolderId;
    this.refreshUI = refreshUI;
  }

  // Provide the HTML input field
  renderContent(): string {
    return `
      <div class="form-group">
        <label>Folder Name</label>
        <input type="text" id="new-folder-input" class="form-control" placeholder="New folder" />
        
        <label class="mt-2">Maximum size (MB)</label>
        <input type="number" id="new-folder-maxSize" class="form-control" placeholder="500" />
      </div>
      <div id="create-folder-error" class="text-danger mt-2" style="display: none;"></div>
    `;
  }

  // Automatically focus the input when the modal opens
  protected onOpen(): void {
    const input = document.getElementById('new-folder-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  async handleConfirm(): Promise<void> {
    const nameInput = document.getElementById('new-folder-input') as HTMLInputElement;
    const sizeInput = document.getElementById('new-folder-maxSize') as HTMLInputElement;
    const errorDiv = document.getElementById('create-folder-error') as HTMLElement;

    let newName = nameInput.value.trim() || 'New folder';
    // Parse the size, fallback to 500 if empty or invalid
    let maxSize = parseInt(sizeInput.value, 10);
    if (isNaN(maxSize)) maxSize = 500; 

    // 1. Basic Frontend Validation (Syntax only, not duplication!)
    // Assuming isValidName just checks for bad characters like / \ : * ? " < > |
    if (!isValidName(newName)) {
      if (errorDiv) {
        errorDiv.textContent = 'Invalid characters in folder name.';
        errorDiv.style.display = 'block';
      }
      return;
    }

    // 2. Build the API Payload
    const payload = {
      name: newName,
      parentId: this.currentFolderId, // null represents Root
      type: 1, // 1 = Folder based on your earlier JSON
      maxSize: maxSize // Add this so your API can store the limit!
      // extenstion and dataPath are omitted or can be explicitly sent as null
    };

    try {
      // Disable inputs while waiting for the network
      if (nameInput) nameInput.disabled = true;
      if (sizeInput) sizeInput.disabled = true;
      if (errorDiv) errorDiv.style.display = 'none';

      // 3. Send the POST request to the server
      const response = await fetch('{{baseUrl}}api/Items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // If the backend says the name is a duplicate, it should return a 400 or 409 status code
        throw new Error(`Server rejected request: ${response.statusText}`);
      }

      // 4. Success! Tell the main grid to fetch the new view, then close.
      this.refreshUI();
      this.close();

    } catch (error) {
      console.error('Failed to create folder:', error);
      if (errorDiv) {
        // We catch the error here and show it instead of using alert()
        errorDiv.textContent = 'Failed to create folder. The name might already exist or the server is busy.';
        errorDiv.style.display = 'block';
      }
    } finally {
      // Re-enable inputs so the user can fix the name and try again
      if (nameInput) nameInput.disabled = false;
      if (sizeInput) sizeInput.disabled = false;
    }
  }
}
import {
  isNameDuplicate,
  isValidName,
} from '../../utilities/_helper';
import { saveToStorage } from '../../utilities/_storageUtil';
import { File, Folder } from '../entity';
import { BaseModal } from './baseModal';

export class RenameModal extends BaseModal {
  private itemId: string;
  private currentName: string;
  private isFolder: boolean;
  private refreshUI: () => void;

  constructor(
    itemId: string,
    currentName: string, // Passed in from the grid click event!
    isFolder: boolean,
    refreshUI: () => void,
  ) {
    super('Rename Item');
    this.itemId = itemId;
    this.currentName = currentName;
    this.isFolder = isFolder;
    this.refreshUI = refreshUI;
  }

  renderContent(): string {
    return `
      <div class="form-group">
        <label>New Name</label>
        <input type="text" id="rename-input" class="form-control" value="${this.currentName}" />
      </div>
      <div id="rename-error" class="text-danger mt-2" style="display: none;"></div>
    `;
  }

  // Automatically focus and select the text when the modal opens
  protected onOpen(): void {
    const input = document.getElementById('rename-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }

  async handleConfirm(): Promise<void> {
    const input = document.getElementById('rename-input') as HTMLInputElement;
    const errorDiv = document.getElementById('rename-error') as HTMLElement;
    const inputName = input.value.trim();

    // 1. Basic Frontend Validation
    if (!inputName || inputName === this.currentName) {
      this.close(); // Nothing changed, just close it
      return;
    }
    
    // isValidName stays, but isNameDuplicate is removed (the backend handles duplicates now!)
    if (!isValidName(inputName)) {
      if (errorDiv) {
        errorDiv.textContent = 'Invalid characters in name.';
        errorDiv.style.display = 'block';
      }
      return;
    }

    // 2. Parse the name and extension just like your original logic
    let newBaseName = inputName;
    let newExtension = '';

    if (!this.isFolder) {
      const lastDotIndex = inputName.lastIndexOf('.');

      if (lastDotIndex > 0) {
        // They typed a dot (e.g., "Report.pdf")
        newBaseName = inputName.substring(0, lastDotIndex);
        // Note: Check if your API expects the dot. Your earlier JSON had ".pdf".
        // If it needs the dot, change this to inputName.substring(lastDotIndex)
        newExtension = inputName.substring(lastDotIndex + 1).toLowerCase(); 
      }
    }

    // 3. Build the payload for the API
    const payload: any = {
      id: this.itemId,
      name: newBaseName,
      type: this.isFolder ? 1 : 0, 
    };

    // Only attach the extension field if it's a file
    if (!this.isFolder) {
      payload.extenstion = newExtension; // Note: using the 'extenstion' typo from your API
    }

    try {
      // Disable input while saving
      if (input) input.disabled = true;
      if (errorDiv) errorDiv.style.display = 'none';

      // 4. Send the PUT request to the server
      const response = await fetch(`{{baseUrl}}api/Items/${this.itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Server rejected request. The name might be taken.');
      }

      // 5. Success! Redraw the screen and close the modal
      this.refreshUI();
      this.close();

    } catch (error) {
      console.error('Failed to rename item:', error);
      if (errorDiv) {
        errorDiv.textContent = 'Failed to rename. A file or folder with this name might already exist.';
        errorDiv.style.display = 'block';
      }
    } finally {
      // Re-enable input so they can try again if it failed
      if (input) input.disabled = false;
    }
  }
}

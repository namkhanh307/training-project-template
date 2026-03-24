import {
  getEmptyBase64Data,
} from '../../utilities/_helper';
import { File, Folder } from '../entity';
import { BaseModal } from './baseModal';

export class CreateFileModal extends BaseModal {
  private currentFolderId: string | null;
  private refreshUI: () => void;

  constructor(
    currentFolderId: string | null, // null represents the Root folder
    refreshUI: () => void,
  ) {
    super('Create New File');
    this.currentFolderId = currentFolderId;
    this.refreshUI = refreshUI;
  }

  renderContent(): string {
    return `
      <div class="form-group">
        <label>File Name</label>
        <input type="text" id="new-file-input" class="form-control" placeholder="New Document.txt" />
      </div>
      <div id="create-file-error" class="text-danger mt-2" style="display: none;"></div>
    `;
  }

  protected onOpen(): void {
    const input = document.getElementById('new-file-input') as HTMLInputElement;
    if (input) input.focus();
  }

  // Changed to async to handle the API call
  async handleConfirm(): Promise<void> {
    const input = document.getElementById('new-file-input') as HTMLInputElement;
    const errorDiv = document.getElementById('create-file-error') as HTMLElement;
    
    let inputName = input.value.trim() || 'New Document.txt';

    // 1. Split the name and the extension (Frontend still handles parsing user input)
    let baseName = inputName;
    let extension = '';
    const lastDotIndex = inputName.lastIndexOf('.');

    if (lastDotIndex > 0) {
      baseName = inputName.substring(0, lastDotIndex);
      // Keep the dot for the API based on your previous JSON payload (e.g., ".pdf")
      extension = inputName.substring(lastDotIndex).toLowerCase(); 
    }

    // 2. Build the API Payload
    const emptyBase64 = getEmptyBase64Data(extension.replace('.', '')); // Assuming your helper expects "txt", not ".txt"

    const payload = {
      name: baseName,
      parentId: this.currentFolderId,
      extenstion: extension, // Note: using your API's exact typo "extenstion"
      type: 0, // 0 = File
      dataPath: emptyBase64
      // We DO NOT send id, modified, modifiedBy, or isNew. 
      // The database generates those!
    };

    try {
      // Optional UX improvement: Disable input while saving
      if (input) input.disabled = true;
      if (errorDiv) errorDiv.style.display = 'none';

      // 3. Send the data to the server
      const response = await fetch('{{baseUrl}}api/Items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 4. Success! Tell the main grid to fetch the new data, then close the modal.
      this.refreshUI();
      this.close();

    } catch (error) {
      console.error('Failed to create file:', error);
      // Show error message to user instead of closing the modal
      if (errorDiv) {
        errorDiv.textContent = 'Failed to create file. Please try again.';
        errorDiv.style.display = 'block';
      }
    } finally {
      // Re-enable input in case the user needs to try again
      if (input) input.disabled = false;
    }
  }
}

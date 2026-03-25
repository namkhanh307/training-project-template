import { renameItem } from '../../services/apiService';
import { isValidName } from '../../utilities/_helper';
import { ItemType } from '../enum';
import { RenameItemReq } from '../model';
import { BaseModal } from './baseModal';

export class RenameModal extends BaseModal {
  private itemId: string;
  private currentName: string;
  private isFolder: boolean;
  private refreshUI: () => void;
  protected confirmText = 'Rename';   

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
    const input = document.getElementById(
      'rename-input',
    ) as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }

  async handleConfirm(): Promise<void> {
    const input = document.getElementById(
      'rename-input',
    ) as HTMLInputElement;
    const errorDiv = document.getElementById(
      'rename-error',
    ) as HTMLElement;
    const inputName = input.value.trim();

    // 1. Basic Frontend Validation
    if (!inputName || inputName === this.currentName) {
      this.close(); // Nothing changed, just close it
      return;
    }

    if (!isValidName(inputName)) {
      if (errorDiv) {
        errorDiv.textContent = 'Invalid characters in name.';
        errorDiv.style.display = 'block';
      }
      return;
    }

    // 3. Build the payload for the API
    const payload: RenameItemReq = {
      id: this.itemId,
      newName: inputName,
      type: this.isFolder ? ItemType.Folder : ItemType.File
    };

    try {
      // Disable input while saving
      if (input) input.disabled = true;
      if (errorDiv) errorDiv.style.display = 'none';

      // 4. Send the PUT request to the server
      const response = await renameItem(payload);

      if (!response.ok) {
        const errorData = await response.json();
        // Throw the parsed object directly to the catch block
        throw errorData;
      }

      // 5. Success! Redraw the screen and close the modal
      this.refreshUI();
      this.close();
    } catch (error) {
      console.error('Failed to rename item:', error);
      if (errorDiv) {
        // 2. Extract the 'detail' property from the C# ProblemDetails object
        // If it doesn't exist, fall back to a generic message
        const displayMessage =
          error.detail || error.message || 'Failed to create folder.';

        errorDiv.textContent = displayMessage; // Shows: "This name is already existed..."
        errorDiv.style.display = 'block';
      }
    } finally {
      // Re-enable input so they can try again if it failed
      if (input) input.disabled = false;
    }
  }
}

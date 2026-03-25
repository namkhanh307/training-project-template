import { postFolder } from '../../services/apiService';
import { isValidName } from '../../utilities/_helper';
import { PostFolderReq } from '../model';
import { BaseModal } from './baseModal';

export class CreateFolderModal extends BaseModal {
  private currentFolderId: string | null;
  private refreshUI: () => void;

  constructor(currentFolderId: string | null, refreshUI: () => void) {
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
      </div>
      <div id="create-folder-error" class="text-danger mt-2" style="display: none;"></div>
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

  async handleConfirm(): Promise<void> {
    const nameInput = document.getElementById(
      'new-folder-input',
    ) as HTMLInputElement;
    const errorDiv = document.getElementById(
      'create-folder-error',
    ) as HTMLElement;

    let newName = nameInput.value.trim() || 'New folder';

    if (!isValidName(newName)) {
      if (errorDiv) {
        errorDiv.textContent = 'Invalid characters in folder name.';
        errorDiv.style.display = 'block';
      }
      return;
    }

    const payload: PostFolderReq = {
      name: newName,
      parentId: this.currentFolderId,
      organizationId: '112d268e-9c46-485d-b4a2-2ad8e5569d81',
    };

    try {
      if (nameInput) nameInput.disabled = true;
      if (errorDiv) errorDiv.style.display = 'none';

      const response = await postFolder(payload);

      // Handle non-200 responses
      if (!response.ok) {
        // Parse the ASP.NET ProblemDetails JSON
        const errorData = await response.json();
        // Throw the parsed object directly to the catch block
        throw errorData;
      }

      // Success!
      this.refreshUI();
      this.close();
    } catch (error: any) {
      // 1. We removed the console.error() here to stop double-logging in the console

      if (errorDiv) {
        // 2. Extract the 'detail' property from the C# ProblemDetails object
        // If it doesn't exist, fall back to a generic message
        const displayMessage =
          error.detail || error.message || 'Failed to create folder.';

        errorDiv.textContent = displayMessage; // Shows: "This name is already existed..."
        errorDiv.style.display = 'block';
      }
    } finally {
      if (nameInput) {
        nameInput.disabled = false;
        nameInput.focus();
      }
    }
  }
}

import { BASE_URL, END_POINT } from "../../utilities/_const";
import { ItemType } from "../enum";
import { BaseModal } from "./baseModal";

export class DeleteModal extends BaseModal {
  private itemId: string;
  private itemName: string;
  private isFolder: boolean;
  private refreshUI: () => void;

  constructor(
    itemId: string,
    itemName: string, // We pass the name directly now!
    isFolder: boolean,
    refreshUI: () => void
  ) {
    super("Confirm Deletion"); 
    this.itemId = itemId;
    this.itemName = itemName;
    this.isFolder = isFolder;
    this.refreshUI = refreshUI;
  }

  // 1. Context-aware HTML using our direct properties
  renderContent(): string {
    const typeName = this.isFolder ? ItemType.Folder : ItemType.File;

    return `
      <div class="alert alert-danger mb-0">
        <p class="mb-2">Are you sure you want to delete the ${typeName.toString().toLowerCase()} <strong>"${this.itemName}"</strong>?</p>
        ${
          this.isFolder 
            ? '<p class="mb-0 small"><i class="fas fa-exclamation-triangle me-1"></i> This will also permanently delete all files and sub-folders inside it!</p>' 
            : '<p class="mb-0 small">This action cannot be undone.</p>'
        }
      </div>
      <div id="delete-error" class="text-danger mt-3" style="display: none;"></div>
    `;
  }

  // 2. The Execution (Now fully async and offloaded to the server!)
  async handleConfirm(): Promise<void> {
    const errorDiv = document.getElementById('delete-error') as HTMLElement;
    
    // Grab the confirm button to disable it during the network request
    // Assuming BaseModal creates a button with this ID, or you can adjust to match your HTML
    const confirmBtn = document.getElementById('modal-confirm-btn') as HTMLButtonElement; 

    try {
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = 'Deleting...';
      }
      if (errorDiv) errorDiv.style.display = 'none';

      // 1. Send the DELETE request to the server
      // Note: We append the itemId directly to the URL based on standard REST conventions
      const response = await fetch(`${BASE_URL}${END_POINT.ITEMS}/${this.itemId}`, {
        method: 'DELETE',
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(`Server rejected request: ${response.statusText}`);
      }

      // 2. Success! Redraw the screen and close the modal
      this.refreshUI();
      this.close();

    } catch (error) {
      console.error('Failed to delete item:', error);
      if (errorDiv) {
        errorDiv.textContent = 'Failed to delete. Make sure you have permission, or check your connection.';
        errorDiv.style.display = 'block';
      }
      
      // Reset the button so the user can try again
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerText = 'Confirm';
      }
    }
  }
}
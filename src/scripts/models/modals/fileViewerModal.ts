
import { File } from "../entity";
import { BaseModal } from "./baseModal";
export class FileViewerModal extends BaseModal {
  private fileId: string;
  private fileDetails: any = null; // Store the fetched metadata here

  constructor(fileId: string) {
    super("File Details");
    this.fileId = fileId;
  }

  // 1. Initial Render: Show a beautiful loading state
  renderContent(): string {
    return `
      <div id="file-viewer-content" class="text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Loading file details...</p>
      </div>
    `;
  }

  // 2. Fetch data when the modal opens and swap the HTML
  protected async onOpen(): Promise<void> {
    const container = document.getElementById('file-viewer-content');
    if (!container) return;

    try {
      // Fetch the file's metadata from the API
      // (Assuming your API supports GET /api/Items/{id})
      const response = await fetch(`{{baseUrl}}api/Items/${this.fileId}`);
      if (!response.ok) throw new Error('Failed to fetch file details');
      
      this.fileDetails = await response.json();
      const file = this.fileDetails;
      
      const formattedDate = new Date(file.modified).toLocaleDateString();
      // Handle the API typo 'extenstion' if it still exists
      const extension = file.extenstion || file.extension || 'None';

      // Inject the real data!
      container.innerHTML = `
        <div class="file-details-container text-start">
          <h4 class="mb-3 text-primary"><i class="fas fa-file me-2"></i>${file.name}</h4>
          <table class="table table-sm table-borderless">
            <tbody>
              <tr>
                <th scope="row" class="text-muted" style="width: 120px;">Extension:</th>
                <td><span class="badge bg-secondary">${extension}</span></td>
              </tr>
              <tr>
                <th scope="row" class="text-muted">Modified:</th>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <th scope="row" class="text-muted">Modified By:</th>
                <td>${file.modifiedBy || 'System'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Fetch error:', error);
      container.innerHTML = `
        <div class="text-center p-4">
          <p class="text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Error: Could not load file details.</p>
        </div>
      `;
    }
  }

  // 3. The Download Action
  async handleConfirm(): Promise<void> {
    if (!this.fileDetails) {
      alert('File details are not fully loaded yet.');
      return;
    }

    // Assuming BaseModal creates a button with this ID (adjust if needed)
    const confirmBtn = document.getElementById('modal-confirm-btn') as HTMLButtonElement;
    
    try {
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = 'Downloading...';
      }

      // 1. Fetch the actual file binary from the server
      // (Assuming your API has a download endpoint)
      const response = await fetch(`{{baseUrl}}api/Items/${this.fileId}/download`);
      if (!response.ok) throw new Error('Download failed');

      // 2. Convert the response to a Blob (Binary file data)
      const blob = await response.blob();
      
      // 3. Create a temporary local URL for the Blob
      const url = window.URL.createObjectURL(blob);
      
      // 4. Trigger the browser's native download behavior
      const link = document.createElement('a');
      link.href = url;
      
      const extension = this.fileDetails.extenstion || '';
      link.download = `${this.fileDetails.name}${extension}`;
      
      document.body.appendChild(link);
      link.click();
      
      // 5. Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Free up browser memory
      
      this.close();
        
    } catch(error) {
      console.error('Download error:', error);
      alert('Failed to download the file. The file might be empty or unavailable.');
      
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerText = 'Confirm'; 
      }
    }
  }
}
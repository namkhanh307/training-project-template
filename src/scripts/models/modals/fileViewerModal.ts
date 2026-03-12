
import { File } from "../entity";
import { BaseModal } from "./baseModal";
export class FileViewerModal extends BaseModal {
  private fileId: string;
  private allFiles: Record<string, File>;

  constructor(fileId: string, allFiles: Record<string, File>) {
    super("File Details");
    this.fileId = fileId;
    this.allFiles = allFiles;
  }

  renderContent(): string {
    const file = this.allFiles[this.fileId];
    
    // Safety check just in case
    if (!file) return `<p class="text-danger">Error: File not found.</p>`;

    const formattedDate = new Date(file.modified).toLocaleDateString();

    return `
      <div class="file-details-container">
        <h4 class="mb-3 text-primary"><i class="fas fa-file me-2"></i>${file.name}</h4>
        <table class="table table-sm table-borderless">
          <tbody>
            <tr>
              <th scope="row" class="text-muted" style="width: 120px;">Extension:</th>
              <td><span class="badge bg-secondary">${file.extension || 'None'}</span></td>
            </tr>
            <tr>
              <th scope="row" class="text-muted">Modified:</th>
              <td>${formattedDate}</td>
            </tr>
            <tr>
              <th scope="row" class="text-muted">Modified By:</th>
              <td>${file.modifiedBy}</td>
            </tr>
          </tbody>
        </table>
        ${!file.data ? '<p class="text-warning small mt-2"><i class="fas fa-exclamation-circle me-1"></i> This is an empty file and cannot be downloaded.</p>' : ''}
      </div>
    `;
  }

  // Override the BaseModal's confirm action to be a Download action!
  handleConfirm(): void {
    const file = this.allFiles[this.fileId];
    
    if (!file || !file.data) {
      alert('Sorry, this file cannot be downloaded because it has no data.');
      return;
    }

    // Trigger the actual download
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Close the modal after they click download
    this.close();
  }
}
import { getItemById } from '../../services/apiService';
import { BASE_IMAGE_URL } from '../../utilities/_const';
import { GetItemsRes } from '../model';
import { BaseModal } from './baseModal';
export class FileViewerModal extends BaseModal {
  private fileId: string;
  private fileDetails: GetItemsRes = null;
  protected confirmText = 'Download';
  protected secondaryText = 'View';
  constructor(fileId: string) {
    super('File Details');
    this.fileId = fileId;
  }
  protected handleSecondary(): void {
    if (!this.fileDetails) return;

    const fileUrl = `${BASE_IMAGE_URL}${this.fileDetails.dataPath}`;

    window.open(fileUrl, '_blank');
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
      this.fileDetails = await getItemById(this.fileId);
      const file = this.fileDetails;

      const formattedDate = new Date(
        file.modified,
      ).toLocaleDateString();
      const extension = file.extension || file.extension || 'None';
      const footer =
        this.modalElement?.querySelector('.m-modal-footer');

      const isPreviewable = ['pdf', 'png', 'jpg'].includes(
        this.fileDetails.extension?.toLowerCase(),
      );

      if (footer && isPreviewable) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-primary';
        btn.innerText = 'View';

        btn.addEventListener('click', () => {
          const fileUrl = `${BASE_IMAGE_URL}${this.fileDetails.dataPath}`;
          window.open(fileUrl, '_blank');
        });
        footer.insertBefore(
          btn,
          footer.querySelector('#modal-confirm-btn'),
        );
      }

      // Inject the real data!
      container.innerHTML = `
        <div class="file-details-container text-start">
            <h4 class="mb-3 text-primary text-truncate-filename">
              <i class="fas fa-file me-2"></i>${file.name}
            </h4>          <table class="table table-sm table-borderless">
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
    const confirmBtn = document.getElementById(
      'modal-confirm-btn',
    ) as HTMLButtonElement;

    try {
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = 'Downloading...';
      }

      const file = this.fileDetails;
      const fileUrl = `${BASE_IMAGE_URL}${file.dataPath}`;
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      this.close();
    } catch (error) {
      console.error('Download error:', error);

      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerText = 'Confirm';
      }
    }
  }
}

import {File} from "../models/entity"
export function openModal(id: string) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'flex';
}

export function closeModal(id: string) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}
export function openNewFileModal() {
  const input = document.getElementById(
    'newFileNameInput',
  ) as HTMLInputElement;
  if (input) input.value = ''; 
  openModal('newFileModal');
  setTimeout(() => input?.focus(), 100);
}
export function openFileModal(fileId: string, allFiles: Record<string, File>) {
  // 1. Find the file in our dictionary
  const file = allFiles[fileId];
  if (!file) return;

  // 2. Fill in the text on the screen
  document.getElementById('modalFileName')!.innerText = file.name;
  document.getElementById('modalFileExtension')!.innerText = file.extension || 'None';
  document.getElementById('modalFileModified')!.innerText = new Date(file.modified).toLocaleDateString();
  document.getElementById('modalFileModifiedBy')!.innerText = file.modifiedBy;

  // 3. THE MAGIC TRICK: Attach the specific file's ID to the download button!
  const downloadBtn = document.querySelector('[data-modal-action="download-file"]') as HTMLButtonElement;
  if (downloadBtn) {
    downloadBtn.dataset.id = file.id; // Inject the ID right here!
  }

  // 4. Finally, make the modal visible
  const modal = document.getElementById('fileModal');
  if (modal) modal.style.display = 'block'; // Or 'flex', depending on your CSS
}
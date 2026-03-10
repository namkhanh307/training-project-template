import { File, Folder, Folder } from '../models/entity';
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
  if (input) input.value = ''; // Reset input

  openModal('newFileModal');

  // Auto-focus the input
  setTimeout(() => input?.focus(), 100);
}

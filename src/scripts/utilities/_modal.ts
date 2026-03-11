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

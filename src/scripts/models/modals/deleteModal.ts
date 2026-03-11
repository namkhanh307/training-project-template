class DeleteModal extends BaseModal {
  private itemIdToDelete: string;

  constructor(itemId: string) {
    super("Confirm Deletion"); // Passes the title to the BaseModal
    this.itemIdToDelete = itemId;
  }

  // Implementing the required abstract methods
  renderContent(): string {
    return `Are you sure you want to delete item ${this.itemIdToDelete}? This cannot be undone.`;
  }

  async handleConfirm(): Promise<void> {
    console.log(`Deleting item ${this.itemIdToDelete}...`);
    // Add your API call here: await api.delete(this.itemIdToDelete);
    this.close();
  }
}
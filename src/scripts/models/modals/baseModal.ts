export abstract class BaseModal {
  public isOpen: boolean = false;
  public title: string;
  protected modalElement: HTMLElement | null;

  constructor(title: string) {
    this.title = title;
    // Assume you have a single <div id="dynamic-modal"> in your HTML
    this.modalElement = document.getElementById('dynamic-modal');
  }

  public open(): void {
    this.isOpen = true;
    this.render(); // Inject the HTML
    this.bindEvents(); // Attach button listeners

    if (this.modalElement) {
      this.modalElement.style.display = 'block';
    }
    this.onOpen();
  }

  public close(): void {
    this.isOpen = false;
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
      // Clean up the DOM so old data doesn't flash next time it opens
      this.modalElement.innerHTML = '';
    }
    this.onClose();
  }

  private render(): void {
    if (!this.modalElement) return;

    // We build the standard shell every modal shares
    this.modalElement.innerHTML = `
      <div class="m-modal-content">
        <div class="m-modal-header">
          <h3>${this.title}</h3>
          <button class="btn-close" id="modal-cancel-x"><i class="fa-solid fa-x"></i></button>
        </div>
        <div class="m-modal-body">
          ${this.renderContent()} </div>
        <div class="m-modal-footer d-flex gap-2 justify-content-end mt-3">
          <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button class="btn btn-primary" id="modal-confirm-btn">Confirm</button>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const cancelX = document.getElementById('modal-cancel-x');

    // Bind the subclass's specific confirm logic!
    confirmBtn?.addEventListener('click', () => this.handleConfirm());

    cancelBtn?.addEventListener('click', () => this.close());
    cancelX?.addEventListener('click', () => this.close());
    // Automatically listen for Enter key inside the modal!
    this.modalElement?.addEventListener(
      'keypress',
      (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.handleConfirm(); // Triggers the specific subclass logic!
        }
      },
    );
  }

  protected onOpen(): void {}
  protected onClose(): void {}

  abstract renderContent(): string;
  abstract handleConfirm(): Promise<void> | void;
}

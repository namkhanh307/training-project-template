export abstract class BaseModal {
  public isOpen: boolean = false;
  public title: string;
  protected modalElement: HTMLElement | null;
  // 🔴 1. Create stable references for our events so we can delete them later
  private boundHandleConfirm: (e: Event) => void;
  private boundClose: (e: Event) => void;
  private boundKeyPress: (e: KeyboardEvent) => void;
  constructor(title: string) {
    this.title = title;
    // Assume you have a single <div id="dynamic-modal"> in your HTML
    this.modalElement = document.getElementById('dynamic-modal');
    // 🔴 2. Bind the functions in the constructor
    this.boundHandleConfirm = (e: Event) => {
      e.preventDefault();
      this.handleConfirm(); // Triggers the subclass logic
    };

    this.boundClose = (e: Event) => {
      e.preventDefault();
      this.close();
    };

    this.boundKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleConfirm();
      }
    };
  }

  public open(): void {
    this.isOpen = true;
    this.render(); // Inject the HTML
    this.bindEvents(); // Attach button listeners

    if (this.modalElement) {
      this.modalElement.style.display = 'flex';
    }
    this.onOpen();
  }

  public close(): void {
    this.isOpen = false;
    this.unbindEvents();
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

    // Attach using our stable references
    confirmBtn?.addEventListener('click', this.boundHandleConfirm);
    cancelBtn?.addEventListener('click', this.boundClose);
    cancelX?.addEventListener('click', this.boundClose);

    // Attach keyboard listener to the modal wrapper
    this.modalElement?.addEventListener(
      'keypress',
      this.boundKeyPress as EventListener,
    );
  }
  // 🔴 4. The Teardown Function
  private unbindEvents(): void {
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const cancelX = document.getElementById('modal-cancel-x');

    // Destroy the button clicks
    confirmBtn?.removeEventListener('click', this.boundHandleConfirm);
    cancelBtn?.removeEventListener('click', this.boundClose);
    cancelX?.removeEventListener('click', this.boundClose);

    // Destroy the keyboard listener
    this.modalElement?.removeEventListener(
      'keypress',
      this.boundKeyPress as EventListener,
    );
  }
  protected onOpen(): void {}
  protected onClose(): void {}

  abstract renderContent(): string;
  abstract handleConfirm(): Promise<void> | void;
}

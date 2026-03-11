abstract class BaseModal {
  public isOpen: boolean = false;
  public title: string;

  constructor(title: string) {
    this.title = title;
  }

  // Common functionality shared by all modals
  public open(): void {
    this.isOpen = true;
    this.onOpen(); // Optional hook
  }

  public close(): void {
    this.isOpen = false;
    this.onClose(); // Optional hook
  }

  // Optional lifecycle hooks subclasses can override
  protected onOpen(): void {}
  protected onClose(): void {}

  // Abstract methods that subclasses MUST implement
  abstract renderContent(): string; // Or JSX.Element, HTMLElement, etc.
  abstract handleConfirm(): Promise<void> | void;
}// 2. Extend for DeleteModal



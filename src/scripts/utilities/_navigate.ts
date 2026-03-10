import { Folder } from "../models/entity";
import { UIManager } from "./uiManager";

  export function handleFolderClick(currentFolder: Folder, folderName: string) {
    const targetFolder = currentFolder.subFolders.find(
      (f) => f.name === folderName,
    );
    if (!targetFolder) return;

    targetFolder.isNew = false;
    this.saveAndRefresh();

    // Push to history before moving
    this._navigationHistory.push(currentFolder);
    currentFolder = targetFolder;

    UIManager.updateBreadcrumbs('folder-path-display', currentFolder);
    this.refreshUI();
  }

    export function navigateFromBreadcrumb(rootFolder: Folder, currentFolder: Folder, refreshUI : () => void, targetPath: string) {
    if (targetPath === '/') {
      currentFolder = rootFolder;
      this._navigationHistory = []; // Clear history if returning to root
    } else {
      const segments = targetPath
        .split('/')
        .filter((s) => s.length > 0);
      let foundFolder = rootFolder;

      for (const segment of segments) {
        const nextFolder = foundFolder.subFolders.find(
          (f) => f.name === segment,
        );
        if (nextFolder) foundFolder = nextFolder;
        else return; // Stop if path is invalid
      }
      currentFolder = foundFolder;
    }

    UIManager.updateBreadcrumbs('folder-path-display', currentFolder);
    refreshUI();
  }

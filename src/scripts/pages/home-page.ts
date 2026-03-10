import ready from '../utilities/_helper';
import { FileExplorer } from '../services/fileExplorer';


ready(() => {
  const app = new FileExplorer();
});
// // 1. Overwrite the default rootFolder with the saved data
// let initData = loadFromStorage(rootFolder);

// // 2. Set currentFolder to point to the exact same memory reference
// currentFolder = initData;

// // 3. Render
// navigateToFolder(currentFolder);

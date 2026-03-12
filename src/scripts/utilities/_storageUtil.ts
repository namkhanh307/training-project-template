import { File,  Folder } from "../models/entity";
import { StorageState } from "../models/model";
import { initFiles, initFolders } from "./_initData";

const STORAGE_KEY = 'my_file_explorer_data';

/**
 * Init the default state with bundled data. This ensures that even if localStorage is empty, users will have some folders and files to interact with.
 */
const DEFAULT_STATE: StorageState = {
  folders: initFolders,
  files: initFiles
};
/**
 * Saves the provided folders and files to local storage.
 * @param folders 
 * @param files 
 */
export const saveToStorage = (
  folders: Record<string, Folder>, 
  files: Record<string, File>
) => {
  const dataToSave: StorageState = { folders, files };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
};

/**
 * Loads the saved state from local storage.
 * @returns Returns the bundled dictionaries (or the default state if empty)
 */
export const loadFromStorage = (): StorageState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  
  if (saved) {
    return JSON.parse(saved) as StorageState;
  }
  
  // If nothing is in localStorage, give them the default Root folder
  return DEFAULT_STATE; 
};

/**
 * Removes the saved state from local storage.
 */
export const deleteFromStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Clears all data from local storage.
 */
export const clearStorage = () => {
    localStorage.clear();
};    
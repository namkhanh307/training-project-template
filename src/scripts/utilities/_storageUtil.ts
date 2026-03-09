import { Folder } from "../components/_grid";

const STORAGE_KEY = 'my_file_explorer_data';

export const saveToStorage = (rootFolder: Folder) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rootFolder));
};

export const loadFromStorage = (rootFolder: Folder): Folder => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : rootFolder;
};
export const deleteFromStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const clearStorage = () => {
    localStorage.clear();
};
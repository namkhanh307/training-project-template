import { RenameModel, UniqueNameModel } from "../models/model";
import { SUPPORTED_ICONS } from "./_const";

const ready = (fn: ()=> void) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};
export default ready;

export function getFileIconHTML(extension: string): string {
  const safeExt = extension.toLowerCase();

  // 1. If have the custom SVG
  if (SUPPORTED_ICONS.includes(safeExt)) {
    return `<svg class="m-icon-custom"><use href="src/files/icons.svg#icon-${safeExt}"></use></svg>`;
  }

  // 2. Fallback
  return `<i class="fas fa-file-alt text-secondary" style="font-size: 1.25rem;"></i>`;
}

// Time Helper
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return dateString; 

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'A few seconds ago';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  
  const years = Math.floor(diffInSeconds / 31536000);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

//ID Helper
export function generateID(): string {
  return window.crypto && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Date.now().toString(36) + Math.random().toString(36).substring(2);
}

//Naming Helper
/**
 * Checks if a file or folder name already exists.
 * * @param newName The text the user typed into the input
 * @param currentFolderId The ID of the folder to check
 * @param isEdit True if renaming, False if creating new
 * @param currentId The ID of the item being renamed (Only needed if isEdit is true)
 * @returns boolean (true if it's a duplicate, false if it's safe to use)
 */
// Note: We use a generic Record so you can pass EITHER allFolders OR allFiles into this!
export function isNameDuplicate(
  newName: string,
  currentFolderId: string,
  itemsDictionary: Record<string, RenameModel>,
  currentId?: string
): boolean {
  const formattedNewName = newName.trim().toLowerCase();

  // 1. Turn the dictionary into an array so we can loop over it
  return Object.values(itemsDictionary).some((item) => {
    
    // 2. THE SIBLING CHECK: Ignore items in other folders!
    if (item.parentId !== currentFolderId) {
      return false;
    }

    // 3. THE SELF CHECK: If editing, ignore the item we are renaming
    if (currentId && item.id === currentId) {
      return false; 
    }

    // 4. THE MATCH: Do the names collide?
    return item.name.toLowerCase() === formattedNewName;
  });
}
/**
 * Checks if a file or folder name contains forbidden special characters.
 * Forbidden characters: < > : " / \ | ? *
 * * @param name The name to check
 * @returns boolean (true if the name is SAFE, false if it contains bad characters)
 */
export function isValidName(name: string): boolean {
  // This Regex looks for any of the standard forbidden file system characters
  const forbiddenChars = /[<>:"/\\|?*]/;
  
  // If the regex finds a match, it's invalid (returns false). Otherwise, it's safe (returns true).
  return !forbiddenChars.test(name);
}
/**
 * Generates a unique file name when upload a duplicate file name, preserving the extension.
 * Example: "Data.csv" -> "Data (1).csv"
 * * @param originalName The full uploaded file name (e.g., "Budget.xlsx")
 * @param existingItems The array of current files to check against
 * @returns A guaranteed unique file string
 */
/**
 * Generates a unique name by appending (1), (2), etc., if the base name already exists.
 * @param baseName The default name you want to use (e.g., "New folder")
 * @param parentId The ID of the folder where this new item will live
 * @param itemsDictionary The global dictionary of all folders (or files)
 * @returns A guaranteed unique string
 */
export function generateUniqueName(
  baseName: string,
  parentId: string,
  itemsDictionary: Record<string, UniqueNameModel>
): string {
  let uniqueName = baseName;
  let counter = 1;
  
  // 1. FILTER & MAP: Get ONLY the names of items that live in the same parent folder
  const siblingNames = Object.values(itemsDictionary)
    .filter((item) => item.parentId === parentId)
    .map((item) => item.name.toLowerCase());

  // 2. Keep incrementing the counter until we find a name that isn't in the list
  while (siblingNames.includes(uniqueName.toLowerCase())) {
    uniqueName = `${baseName} (${counter})`;
    counter++;
  }

  return uniqueName;
}/**
 * Generates a unique file name when uploading a duplicate file, preserving the extension.
 * Example: "Data.csv" -> "Data (1).csv"
 * @param originalName The full uploaded file name (e.g., "Budget.xlsx")
 * @param parentId The ID of the folder where this file is being uploaded
 * @param itemsDictionary The global dictionary of all files
 * @returns A guaranteed unique file string
 */
export function generateUniqueFileName(
  originalName: string,
  parentId: string,
  itemsDictionary: Record<string,UniqueNameModel>
): string {
  // 1. Separate the base name and the extension
  const lastDotIndex = originalName.lastIndexOf('.');
  let baseName = originalName;
  let extension = '';

  if (lastDotIndex > 0) {
    baseName = originalName.substring(0, lastDotIndex);
    extension = originalName.substring(lastDotIndex); // Includes the dot
  }

  let uniqueName = originalName;
  let counter = 1;
  
  // 2. FILTER & MAP: Get ONLY the names of sibling files
  const siblingNames = Object.values(itemsDictionary)
    .filter((item) => item.parentId === parentId)
    .map((item) => item.name.toLowerCase());

  // 3. Keep incrementing the counter right BEFORE the extension
  while (siblingNames.includes(uniqueName.toLowerCase())) {
    uniqueName = `${baseName} (${counter})${extension}`;
    counter++;
  }

  return uniqueName;
}
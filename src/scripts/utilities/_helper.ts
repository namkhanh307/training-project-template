const ready = (fn: ()=> void) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};
export default ready;

// Icon Helper
const SUPPORTED_ICONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

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
 * @param items The array to check (either currentFolder.subFolders or currentFolder.files)
 * @param isEdit True if renaming, False if creating new
 * @param currentId The ID of the item being renamed (Only needed if isEdit is true)
 * @returns boolean (true if it's a duplicate, false if it's safe to use)
 */
export function isNameDuplicate(
  newName: string, 
  items: { id: string; name: string }[], 
  isEdit: boolean, 
  currentId?: string
): boolean {
  const formattedNewName = newName.trim().toLowerCase();

  return items.some((item) => {
    // 1. If we are editing, IGNORE the item we are currently renaming!
    // This allows the user to save without changing the name.
    if (isEdit && item.id === currentId) {
      return false; 
    }

    // 2. Otherwise, check if the name matches another item
    return item.name.toLowerCase() === formattedNewName;
  });
}
/**
 * Generates a unique name by appending (1), (2), etc., if the base name already exists.
 * @param baseName The default name you want to use (e.g., "New folder")
 * @param existingItems The array of current files or folders to check against
 * @returns A guaranteed unique string
 */
export function generateUniqueName(
  baseName: string,
  existingItems: { name: string }[]
): string {
  let uniqueName = baseName;
  let counter = 1;
  
  // Map all existing names to lowercase once for easy comparison
  const existingNames = existingItems.map((item) => item.name.toLowerCase());

  // Keep incrementing the counter until we find a name that isn't in the list
  while (existingNames.includes(uniqueName.toLowerCase())) {
    uniqueName = `${baseName} (${counter})`;
    counter++;
  }

  return uniqueName;
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
export function generateUniqueFileName(
  originalName: string,
  existingItems: { name: string }[]
): string {
  // 1. Separate the base name and the extension]
  const lastDotIndex = originalName.lastIndexOf('.');
  let baseName = originalName;
  let extension = '';

  // If there's a dot, and it's not the very first character (like a .gitignore file)
  if (lastDotIndex > 0) {
    baseName = originalName.substring(0, lastDotIndex);
    extension = originalName.substring(lastDotIndex); // This includes the dot, e.g., ".xlsx"
  }

  let uniqueName = originalName;
  let counter = 1;
  
  // Map existing names to lowercase for safe comparison
  const existingNames = existingItems.map((item) => item.name.toLowerCase());

  // 2. Keep incrementing the counter right BEFORE the extension
  while (existingNames.includes(uniqueName.toLowerCase())) {
    uniqueName = `${baseName} (${counter})${extension}`;
    counter++;
  }

  return uniqueName;
}
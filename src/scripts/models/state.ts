import { File, Folder } from "./entity";

// state.ts
export interface ViewState {
  currentParentId: string | null; // null means Root folder
  folders: Record<string, Folder>; // Only the folders in the CURRENT view
  files: Record<string, File>;     // Only the files in the CURRENT view
  isLoading: boolean;
}

export const appState: ViewState = {
  currentParentId: null,
  folders: {},
  files: {},
  isLoading: false
};
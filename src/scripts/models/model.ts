import { File, Folder } from "./entity";

export interface EditingState {
  id: string;
  oldName: string;
  isFolder: boolean;
}
export interface MobileActionItem {
  id: string;
  name: string;
  isFolder: boolean;
}
export interface StorageState {
  folders: Record<string, Folder>;
  files: Record<string, File>;
}
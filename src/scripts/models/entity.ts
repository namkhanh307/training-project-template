// Define the structure of your file data
export interface BaseEntity {
  modified: string;
  modifiedBy: string;
  isNew: boolean;
  type: 'folder' | 'file';
}
export interface File extends BaseEntity {
  name: string;
  extension: string;
  data: string; // Base64 or URL for the file content
}

export interface Folder extends BaseEntity {
  name: string;
  path: string;
  files: File[];
  subFolders: Folder[];
  isEditing?: boolean;
}

export type Row = File | Folder;
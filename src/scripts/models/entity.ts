export interface BaseEntity {
  id: string;
  modified: string;
  modifiedBy: string;
  isNew: boolean;
  type: 'folder' | 'file';
  path: string;
}
export interface File extends BaseEntity {
  name: string;
  extension: string;
  data: string; // Base64 
}

export interface Folder extends BaseEntity {
  name: string;
  files: File[];
  subFolders: Folder[];
  isEditing?: boolean;
}

export type Row = File | Folder;

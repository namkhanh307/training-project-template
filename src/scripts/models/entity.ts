import { ROW_TYPE } from "./enum";

export interface BaseEntity {
  id: string;
  name: string;
  parentId: string | null;
  modified: string;
  modifiedBy: string;
  isNew: boolean;
  type: ROW_TYPE
  isEditing?: boolean;
}
export interface File extends BaseEntity {
  extension: string;
  data: string; // Base64
}

export interface Folder extends BaseEntity {
  maxSize: number;
}

export type Row = File | Folder;

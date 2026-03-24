import { ItemType } from './enum';

export interface BaseEntity {
  id: string;
  modified: string | null;
  modifiedBy: string | null;
  deleted: string | null;
  deletedBy: string | null;
}
export interface Item extends BaseEntity {
  name: string;
  parentId: string | null;
  extension: string;
  organizationId: string;
  path: string;
  depth: number;
  inheritPermission: boolean;
  type: ItemType;
  dataPath: string | null;
}


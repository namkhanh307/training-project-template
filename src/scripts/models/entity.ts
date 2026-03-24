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

export interface PagingRes<T> {
  list: T[];
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

export interface BaseGetRes {
  id: string;
  modified: string | null;
  modifiedBy: string | null;
  deleted: string | null;
  deletedBy: string | null;
}

export interface GetItemsRes extends BaseGetRes {
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

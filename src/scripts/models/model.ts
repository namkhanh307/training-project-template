import { ItemType } from "./enum";


export interface RenameModel{
  id: string; 
  name: string; 
  parentId: string | null 
}
export interface UniqueNameModel{
  name: string;
  parentId: string | null;
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

export interface PostFolderReq{
  name: string;
  parentId: string | null;
  organizationId: string;
}

export interface RenameItemReq{
  id: string;
  newName: string;
  type: ItemType
}
export type LinkedListNode<T> = T & {
    prev: LinkedListNode<T> | null;
    next: LinkedListNode<T> | null;
};

export interface GetPathsRes{
  id: string | null;
  name: string;
}
export interface MinimalItem {
  id: string;
  name: string;
}

export interface ErrorResponse {
  title: string;
  status: number;
  detail: string;
  instance: string;
}
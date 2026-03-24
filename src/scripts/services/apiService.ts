import {
  GetItemsRes,
  PagingRes,
  PostFolderReq,
  RenameItemReq,
} from '../models/model';
import { BASE_URL, END_POINT } from '../utilities/_const';

// api.ts
// Assuming your interfaces are imported at the top of the file:
// import { PagingRes, GetItemsRes, ItemType } from './types';

export const getItems = async (
  parentId: string | null,
  pageNumber: number = 1,
  pageSize: number = 50,
): Promise<PagingRes<GetItemsRes>> => {
  const queryId = parentId ? parentId : '';

  const response = await fetch(
    `${BASE_URL}${END_POINT.ITEMS}?parentId=${queryId}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }
  const data = await response.json();
  return data as PagingRes<GetItemsRes>;
};

export const getItemById = async (
  id: string,
): Promise<GetItemsRes> => {
  const response = await fetch(`${BASE_URL}${END_POINT.ITEMS}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch file details');
  const data = await response.json();
  return data as GetItemsRes;
};

export const postFolder = async (payload: PostFolderReq) => {
  const response = await fetch(`${BASE_URL}${END_POINT.ITEMS}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response;
};
export const deleteItem = async (id: string) => {
  const response = await fetch(
    `${BASE_URL}${END_POINT.ITEMS}/${id}`,
    {
      method: 'DELETE',
    },
  );
  return response;
};

export const renameItem = async (payload: RenameItemReq) => {
  const response = await fetch(`${BASE_URL}${END_POINT.ITEMS}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response;
};

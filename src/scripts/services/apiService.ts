import {
  ErrorResponse,
  GetItemsRes,
  GetPathsRes,
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

export const getItemPath = async (id: string): Promise<GetPathsRes[]> => {
  const response = await fetch(`${BASE_URL}${END_POINT.ITEMS}/path/${id}`);
  if(!response.ok) throw new Error('Failed to fecth path details');
  return await response.json() as GetPathsRes[];
}

export const postFolder = async (payload: PostFolderReq) => {
  const response = await fetch(`${BASE_URL}${END_POINT.ITEMS}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // 1. Check if the backend returned an error (4xx or 5xx)
  if (!response.ok) {
    let errorData: ErrorResponse;
    try {
      // 2. Try to parse the clean JSON error your middleware generated
      errorData = await response.json();
    } catch {
      // Fallback if the server crashes and doesn't return JSON
      errorData = { 
        statusCode: response.status, 
        message: 'An unexpected server error occurred.', 
        details: null 
      };
    }
    // 3. Throw the parsed object to be caught by the UI
    throw errorData;
  }

  // If successful, return the data
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

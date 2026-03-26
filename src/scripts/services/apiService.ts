import {
  GetItemsRes,
  GetPathsRes,
  PagingRes,
  PostFolderReq,
  RenameItemReq,
} from '../models/model';
import { BASE_URL, END_POINT } from '../utilities/_const';
import { httpClient } from './httpClient';

export const getItems = async (
  parentId: string | null,
  pageNumber: number = 1,
  pageSize: number = 50,
): Promise<PagingRes<GetItemsRes>> => {
  const queryId = parentId ?? '';
  return httpClient.get(
    `${BASE_URL}${END_POINT.ITEMS}?parentId=${queryId}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
  );
};

export const getItemById = async (
  id: string,
): Promise<GetItemsRes> => {
  return httpClient.get(`${BASE_URL}${END_POINT.ITEMS}/${id}`);
};

export const getItemPath = async (
  id: string,
): Promise<GetPathsRes[]> => {
  return httpClient.get(`${BASE_URL}${END_POINT.ITEMS}/path/${id}`);
};

export const postFolder = async (payload: PostFolderReq) => {
  return httpClient.post(`${BASE_URL}${END_POINT.ITEMS}`, payload);
};

export const renameItem = async (payload: RenameItemReq) => {
  return httpClient.patch(`${BASE_URL}${END_POINT.ITEMS}`, payload);
};
export const deleteItem = async (id: string) => {
  return httpClient.delete(`${BASE_URL}${END_POINT.ITEMS}/${id}`);
};
export const uploadFiles = async (
  organizationId: string,
  currentFolderId: string | null,
  files: File[],
  onFileError?: (fileName: string) => void,
): Promise<void> => {
  const formData = new FormData();
  formData.append('OrganizationId', organizationId);
  if (currentFolderId) formData.append('ParentId', currentFolderId);
  files.forEach((file) => formData.append('Files', file));

  try {
    await httpClient.postFormData(
      `${BASE_URL}${END_POINT.ITEMS}/uploadFile`,
      formData,
    );
  } catch (error) {
    console.error('Failed to upload files:', error);
    onFileError?.('upload');
  }
};

export const register = async () => {
  console.log(
    'call register',
    `${BASE_URL}${END_POINT.AUTH}/register`,
  );
  return httpClient.post(`${BASE_URL}${END_POINT.AUTH}/register`, {});
};

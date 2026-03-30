import {
  GetItemsRes,
  GetPathsRes,
  PagingRes,
  PostFolderReq,
  RenameItemReq,
} from '../models/model';
import { BASE_FE_URL, BASE_URL, END_POINT } from '../utilities/_const';
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
export async function signIn(e: Event, loginRequest: any, currentAccount: any, msalInstance: any, msalReady: Promise<void>, updateUI: () => void) {
    e.preventDefault();
    await msalReady;

    const accounts = msalInstance.getAllAccounts();

    if (accounts.length > 0) {
      // Already have account, try silent first
      try {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });
        currentAccount = response.account;
        updateUI();
      } catch {
        // Silent failed, redirect to Microsoft
        await msalInstance.acquireTokenRedirect({
          ...loginRequest,
          account: accounts[0],
        });
        // Page will redirect — code below won't run
      }
    } else {
      // No account — full login redirect
      await msalInstance.loginRedirect({
        ...loginRequest,
      });
      // Page will redirect — code below won't run
    }
  }

  export async function signOut(e: Event, currentAccount: any, msalInstance: any) {
    e.preventDefault();
    if (!currentAccount) return;
    await msalInstance.logoutRedirect({
      postLogoutRedirectUri: BASE_FE_URL,
    });
  }
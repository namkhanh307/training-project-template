import { GetItemsRes, PagingRes } from "../models/entity";
import { BASE_URL, END_POINT } from "../utilities/_const";

// api.ts
// Assuming your interfaces are imported at the top of the file:
// import { PagingRes, GetItemsRes, ItemType } from './types'; 

export const getItems = async (
  parentId: string | null,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<PagingRes<GetItemsRes>> => {
  // Convert null to empty string for the API query parameter
  const queryId = parentId ? parentId : ''; 
  
  const response = await fetch(
    `${BASE_URL}${END_POINT.ITEMS}?parentId=${queryId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }
  
  // Parse the JSON and cast it to your strict interface
  const data = await response.json();
  return data as PagingRes<GetItemsRes>;
};
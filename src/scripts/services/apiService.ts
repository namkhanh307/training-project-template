import { BASE_URL, END_POINT } from "../utilities/_const";

// api.ts
export const fetchFolderContents = async (parentId: string | null) => {
  // Convert null to empty string for the API query parameter
  const queryId = parentId ? parentId : ''; 
  const response = await fetch(`${BASE_URL}${END_POINT.ITEMS}?parentId=${queryId}&pageNumber=1&pageSize=50`);
  
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};
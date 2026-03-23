import { appState } from "../models/state";
import { BASE_URL } from "../utilities/_const";
import { normalizeArrayToRecord } from "../utilities/_helper";

// api.ts
export const fetchFolderContents = async (parentId: string | null) => {
  // Convert null to empty string for the API query parameter
  const queryId = parentId ? parentId : ''; 
  const response = await fetch(`${BASE_URL}Items?parentId=${queryId}&pageNumber=1&pageSize=50`);
  
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};
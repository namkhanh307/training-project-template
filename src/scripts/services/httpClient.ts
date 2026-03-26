import { PublicClientApplication } from '@azure/msal-browser';
import { loginRequest, msalConfig } from '../models/authConfig';
import { ErrorResponse } from '../models/model';

// Singleton MSAL instance shared across the app
// Will be set by FileExplorer after initialize()
let _msalInstance: PublicClientApplication | null = null;

export const setMsalInstance = (
  instance: PublicClientApplication,
) => {
  _msalInstance = instance;
};
const getAccessToken = async (): Promise<string | null> => {
  const accounts = _msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  try {
    const result = await _msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return result.accessToken;
  } catch {
    // Silent failed — redirect to login
    await _msalInstance.acquireTokenRedirect({
      ...loginRequest,
      account: accounts[0],
    });
    return null;
  }
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: ErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        title: 'Error',
        status: response.status,
        detail: getHttpErrorMessage(response.status),
        instance: '',
      };
    }
    throw errorData;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) return null as T;
  return response.json() as Promise<T>;
};

const getHttpErrorMessage = (status: number): string => {
  switch (status) {
    case 400: return 'Bad request.';
    case 401: return 'Unauthorized. Please sign in again.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'Resource not found.';
    case 409: return 'Conflict. Resource already exists.';
    case 500: return 'Internal server error.';
    default:  return 'An unexpected error occurred.';
  }
};

// The interceptor — injects token and handles errors
const request = async <T>(
  url: string,
  options: RequestInit = {},
  isFormData = false, // ← add this flag
): Promise<T> => {
  const token = await getAccessToken();

  // For FormData, let the browser set Content-Type automatically
  // For JSON, set it manually
  const headers: HeadersInit = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });
  return handleResponse<T>(response);
};

export const httpClient = {
  get: <T>(url: string) => request<T>(url),

  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),

  postFormData: <T>(url: string, body: FormData) =>
    request<T>(url, { method: 'POST', body }, true),
};

import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    // App 2: The Frontend SPA Client ID
    clientId: 'fd2809ee-0a9c-409e-b510-36b5beceb707',
    authority:
      'https://login.microsoftonline.com/d09600d6-acac-480e-84d9-7b68daf22e3c',
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

// App 1: The Backend API Scope
export const loginRequest: PopupRequest = {
  scopes: [
    'api://487d47a9-8277-4d88-8890-bb3b8ca224cf/access_as_user',
  ],
};

// home-page.ts
import ready from '../utilities/_helper';
import { FileExplorer } from '../services/fileExplorer';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../models/authConfig';

ready(() => {
 // GUARD: if this is the MSAL popup, just close it immediately
  // The main window is polling this popup's URL — once it reads the auth code, 
  // it will close the popup itself. But if we're here, we just need to stop.
  if (window.opener && window.name.startsWith('msal')) {
    // Do NOT call handleRedirectPromise
    // Do NOT instantiate FileExplorer
    // Just stop execution completely
    return;
  }
  const app = new FileExplorer();
});


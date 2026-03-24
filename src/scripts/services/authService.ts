import { PublicClientApplication, AuthenticationResult } from "@azure/msal-browser";
import { loginRequest, msalConfig } from "../models/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

export async function login() {
    try {
        // This triggers the popup!
        const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
        return response.account;
    } catch (error) {
        console.error("Login failed", error);
    }
}

export async function getToken() {
    const account = msalInstance.getAllAccounts()[0];
    if (!account) return null;

    const request = { ...loginRequest, account };
    
    try {
        // Try to get token from cache first
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        // Fallback to popup if silent refresh fails
        const response = await msalInstance.acquireTokenPopup(request);
        return response.accessToken;
    }
}
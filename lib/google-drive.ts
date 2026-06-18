"use client";
// ─────────────────────────────────────────────────────────────────────────────
// Google Drive upload utility
//
// REQUIRED ENV VARS (set in Vercel dashboard + .env.local):
//   NEXT_PUBLIC_GOOGLE_CLIENT_ID      — from Google Cloud Console OAuth 2.0
//   NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID — from Drive folder URL (last segment)
//
// SCOPE: drive.file  →  only accesses files created by this app. Safe.
// ─────────────────────────────────────────────────────────────────────────────

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID ?? "";

// Cached access token (expires after 1 hour)
let _token: string | null = null;
let _tokenTimer: ReturnType<typeof setTimeout> | null = null;

// Google Identity Services type stubs
interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}
interface TokenResponse {
  access_token?: string;
  error?: string;
}
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (r: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
}

function getToken(): Promise<string> {
  if (_token) return Promise.resolve(_token);
  if (!CLIENT_ID) return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set"));

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (r: TokenResponse) => {
        if (r.error || !r.access_token) {
          reject(new Error(r.error ?? "Auth failed"));
          return;
        }
        _token = r.access_token;
        if (_tokenTimer) clearTimeout(_tokenTimer);
        _tokenTimer = setTimeout(() => { _token = null; }, 3500 * 1000);
        resolve(r.access_token);
      },
    });
    client.requestAccessToken({ prompt: "" });
  });
}

/**
 * Upload a Blob to the configured Google Drive folder.
 * Returns the webViewLink of the created file.
 */
export async function uploadToDrive(filename: string, blob: Blob): Promise<string> {
  if (!FOLDER_ID) throw new Error("NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID is not set");

  await loadGIS();
  const token = await getToken();

  const meta = JSON.stringify({ name: filename, parents: [FOLDER_ID] });
  const form = new FormData();
  form.append("metadata", new Blob([meta], { type: "application/json" }));
  form.append("file", blob);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // Token may have expired server-side; clear cache and let user retry
    _token = null;
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Drive upload failed (${res.status})`);
  }

  const file = await res.json() as { webViewLink: string };
  return file.webViewLink;
}

export function driveConfigured(): boolean {
  return Boolean(CLIENT_ID && FOLDER_ID);
}

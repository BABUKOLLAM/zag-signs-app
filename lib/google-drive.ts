"use client";
// ─────────────────────────────────────────────────────────────────────────────
// Google Drive upload utility (browser-side, OAuth via Google Identity Services)
//
// CONFIG: the Drive Client ID + Folder ID are resolved at RUNTIME from
//   GET /api/drive-config  (which reads them from server env on each request).
// This means changes to the Vercel env vars take effect WITHOUT a rebuild — unlike
// NEXT_PUBLIC_* values, which are frozen into the client bundle at build time and
// were the reason the Drive button never appeared after the vars were added.
//
// Set EITHER pair of env vars in Vercel (server-side names preferred):
//   GOOGLE_CLIENT_ID / GOOGLE_DRIVE_FOLDER_ID   (read at runtime — recommended)
//   NEXT_PUBLIC_GOOGLE_CLIENT_ID / NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID  (also supported)
//
// Google Cloud Console must also have, under the OAuth 2.0 Client:
//   • Authorized JavaScript origins → https://bprozagcrm.xyz (+ any preview domains)
//   • OAuth consent screen published, or each user added as a Test user
// SCOPE: drive.file → only files this app creates. Not a "sensitive" scope.
// ─────────────────────────────────────────────────────────────────────────────

// Build-time values (present only if the bundle was built with NEXT_PUBLIC_* set).
const BUILD_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const BUILD_FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID ?? "";

interface DriveConfig { clientId: string; folderId: string; configured: boolean; }
let _config: DriveConfig | null = null;
let _configPromise: Promise<DriveConfig> | null = null;

/** Resolve Drive config — build-time vars if present, else fetched at runtime. */
export function loadDriveConfig(): Promise<DriveConfig> {
  if (_config) return Promise.resolve(_config);
  if (_configPromise) return _configPromise;

  if (BUILD_CLIENT_ID && BUILD_FOLDER_ID) {
    _config = { clientId: BUILD_CLIENT_ID, folderId: BUILD_FOLDER_ID, configured: true };
    return Promise.resolve(_config);
  }

  _configPromise = fetch("/api/drive-config", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { data: null }))
    .then((j: { data?: Partial<DriveConfig> | null }) => {
      const d = j?.data ?? {};
      _config = {
        clientId: d.clientId ?? "",
        folderId: d.folderId ?? "",
        configured: Boolean(d.clientId && d.folderId),
      };
      return _config;
    })
    .catch(() => {
      _config = { clientId: "", folderId: "", configured: false };
      return _config;
    });
  return _configPromise;
}

/** Async configured check (works on the live site even without a rebuild). */
export async function isDriveConfigured(): Promise<boolean> {
  return (await loadDriveConfig()).configured;
}

/** Synchronous best-effort (build-time only) — kept for backward compatibility. */
export function driveConfigured(): boolean {
  if (_config) return _config.configured;
  return Boolean(BUILD_CLIENT_ID && BUILD_FOLDER_ID);
}

// Cached access token (expires after ~1 hour)
let _token: string | null = null;
let _tokenTimer: ReturnType<typeof setTimeout> | null = null;

interface TokenClient { requestAccessToken: (opts?: { prompt?: string }) => void; }
interface TokenResponse { access_token?: string; error?: string; }
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
    s.onerror = () => reject(new Error("Failed to load Google Identity Services (check your internet connection)."));
    document.head.appendChild(s);
  });
}

function friendlyAuthError(e?: string): string {
  switch (e) {
    case "access_denied":
      return "Google Drive access was denied. You must approve the Drive permission to upload.";
    case "popup_closed":
    case "popup_failed_to_open":
      return "The Google sign-in popup was blocked or closed. Allow pop-ups for this site and try again.";
    default:
      return e ? `Google authentication failed (${e}).` : "Google authentication failed.";
  }
}

function getToken(clientId: string): Promise<string> {
  if (_token) return Promise.resolve(_token);
  if (!clientId) return Promise.reject(new Error("Google Drive is not configured (missing Client ID). Ask your IT Admin."));

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (r: TokenResponse) => {
        if (r.error || !r.access_token) {
          reject(new Error(friendlyAuthError(r.error)));
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
  const cfg = await loadDriveConfig();
  if (!cfg.configured) {
    throw new Error("Google Drive is not configured. Ask your IT Admin to set the Drive Client ID and Folder ID.");
  }

  await loadGIS();
  const token = await getToken(cfg.clientId);

  const meta = JSON.stringify({ name: filename, parents: [cfg.folderId] });
  const form = new FormData();
  form.append("metadata", new Blob([meta], { type: "application/json" }));
  form.append("file", blob);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    _token = null; // token may be stale; force re-auth on retry
    const apiMsg = (body as { error?: { message?: string } }).error?.message ?? `Drive upload failed (${res.status})`;
    const hint = res.status === 403
      ? " — check the OAuth 'Authorized JavaScript origins' include this site, and that you're an approved user."
      : "";
    throw new Error(apiMsg + hint);
  }

  const file = await res.json() as { webViewLink: string };
  return file.webViewLink;
}

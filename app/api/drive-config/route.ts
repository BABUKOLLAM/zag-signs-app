import { ok, err, requireSession } from "@/lib/api-helpers";

// Returns the Google Drive client config at RUNTIME (read from server env on each
// request) so newly-set Vercel env vars take effect without a rebuild. This avoids
// the NEXT_PUBLIC_* pitfall where values are frozen into the client bundle at build
// time — the cause of "Drive button never appears / nothing uploads".
//
// Reads server-side names first, then falls back to the existing NEXT_PUBLIC_* names
// (which are also readable in server runtime), so no Vercel reconfiguration is needed.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "";
  const folderId =
    process.env.GOOGLE_DRIVE_FOLDER_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID ||
    "";

  return ok({ clientId, folderId, configured: Boolean(clientId && folderId) });
}

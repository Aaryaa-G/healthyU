import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getAdminEmails, verifyFirebaseRequest } from "@/lib/firebase/auth-server";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return Response.json({ ok: false, isAdmin: false, firebaseConfigured: false, adminEmails: getAdminEmails() });
  }

  const result = await verifyFirebaseRequest(request);
  return Response.json({
    ok: result.ok,
    email: result.email,
    isAdmin: result.isAdmin,
    firebaseConfigured: true,
  });
}

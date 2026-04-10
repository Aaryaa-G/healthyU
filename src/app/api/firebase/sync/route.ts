import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { verifyFirebaseRequest } from "@/lib/firebase/auth-server";
import { syncLocalDatasetToFirebase } from "@/lib/health-data";

export async function GET() {
  return Response.json({
    firebaseConfigured: isFirebaseAdminConfigured(),
    syncRouteReady: true,
    requiresFirebaseAuth: true,
    message: "Use POST with an authenticated Firebase admin user's ID token to push the local CSV into Firestore and Cloud Storage.",
  });
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return Response.json({ error: "Firebase Admin credentials are missing." }, { status: 400 });
  }

  const authCheck = await verifyFirebaseRequest(request);
  if (!authCheck.ok || !authCheck.isAdmin) {
    return Response.json({ error: "Unauthorized. Sign in with an allowlisted Firebase admin email first." }, { status: 401 });
  }

  try {
    const result = await syncLocalDatasetToFirebase();
    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Firebase sync failed." },
      { status: 500 },
    );
  }
}

import "server-only";

import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

const ADMIN_EMAILS = (process.env.FIREBASE_ADMIN_EMAILS || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export type AuthCheckResult = {
  ok: boolean;
  email: string | null;
  isAdmin: boolean;
  error?: string;
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7);
  }
  return null;
}

export async function verifyFirebaseRequest(request: Request): Promise<AuthCheckResult> {
  const token = getBearerToken(request);

  if (!token) {
    return { ok: false, email: null, isAdmin: false, error: "Missing Firebase ID token." };
  }

  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
    const email = decoded.email?.toLowerCase() ?? null;
    const isAdmin = Boolean(email && ADMIN_EMAILS.includes(email));

    return { ok: true, email, isAdmin };
  } catch {
    return { ok: false, email: null, isAdmin: false, error: "Invalid Firebase ID token." };
  }
}

export function getAdminEmails() {
  return ADMIN_EMAILS;
}

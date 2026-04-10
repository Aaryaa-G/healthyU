"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, ShieldX } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";
import { firebaseGoogleProvider, useAuth } from "@/components/auth/AuthProvider";

export default function AuthPage() {
  const router = useRouter();
  const { user, isAdmin, loading, firebaseConfigured, refreshAdminStatus } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useMemo(() => (firebaseConfigured ? firebaseAuth() : null), [firebaseConfigured]);

  async function handleEmailLogin() {
    if (!auth) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await refreshAdminStatus();
      router.push("/reports");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    if (!auth) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithPopup(auth, firebaseGoogleProvider);
      await refreshAdminStatus();
      router.push("/reports");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground text-sm font-display uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight">Access Node</h1>
          <p className="text-foreground/50 text-sm font-display tracking-widest uppercase">Firebase Admin Authentication</p>
        </div>

        {!firebaseConfigured ? (
          <div className="border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-foreground/70">
            Firebase client config is not filled in yet. Add the `NEXT_PUBLIC_FIREBASE_*` values to `.env.local` first.
          </div>
        ) : null}

        {user ? (
          <div className="border border-foreground/10 bg-foreground/[0.02] p-5 space-y-3">
            <p className="text-sm text-foreground/70">Signed in as {user.email}</p>
            <div className="flex items-center gap-2 text-sm">
              {isAdmin ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <ShieldX className="w-4 h-4 text-red-500" />}
              <span>{isAdmin ? "This account is allowlisted for admin sync/export actions." : "This account is signed in but not allowlisted as an admin."}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/reports")}
              className="w-full bg-foreground text-background py-4 font-display font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors"
            >
              Go To Reports
            </button>
          </div>
        ) : (
          <form
            className="space-y-6 pt-8"
            onSubmit={(event) => {
              event.preventDefault();
              void handleEmailLogin();
            }}
          >
            <div className="space-y-4">
              <input
                type="email"
                placeholder="IDENTIFIER (EMAIL)"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 px-4 py-4 focus:outline-none focus:border-accent font-display uppercase tracking-widest text-sm transition-colors"
                required
              />
              <input
                type="password"
                placeholder="SECURITY KEY (PASSWORD)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 px-4 py-4 focus:outline-none focus:border-accent font-display uppercase tracking-widest text-sm transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loading || !firebaseConfigured}
              className="w-full bg-foreground text-background py-4 font-display font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors disabled:opacity-40"
            >
              Initialize Session
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-foreground/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase font-display tracking-widest"><span className="bg-background px-4 text-foreground/40">Or</span></div>
            </div>

            <button
              type="button"
              disabled={submitting || loading || !firebaseConfigured}
              onClick={() => void handleGoogleLogin()}
              className="w-full border border-foreground/20 text-foreground py-4 font-display font-bold uppercase tracking-widest hover:border-foreground transition-colors disabled:opacity-40"
            >
              SSO OAuth Logon
            </button>
          </form>
        )}

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>
    </main>
  );
}

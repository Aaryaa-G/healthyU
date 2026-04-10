"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LoaderCircle, RefreshCcw } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";

type ExportActionButtonProps = {
  endpoint: string;
  label: string;
  icon?: "download" | "sync";
  variant?: "filled" | "outline";
  requireAdmin?: boolean;
  size?: "default" | "compact";
};

export function ExportActionButton({
  endpoint,
  label,
  icon = "download",
  variant = "outline",
  requireAdmin = true,
  size = "default",
}: ExportActionButtonProps) {
  const { user, isAdmin, loading, getIdToken } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = loading || submitting || !user || (requireAdmin && !isAdmin);

  async function handleClick() {
    if (!user) {
      router.push("/auth");
      return;
    }

    if (requireAdmin && !isAdmin) {
      setError("Your account is signed in, but it is not allowlisted as an admin.");
      return;
    }

    const token = await getIdToken();
    if (!token) {
      setError("Could not get Firebase ID token.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Download failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const contentDisposition = response.headers.get("content-disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);
      const filename = filenameMatch?.[1] || "download";
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Download failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const Icon = submitting ? LoaderCircle : icon === "sync" ? RefreshCcw : Download;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={
          variant === "filled"
            ? `inline-flex items-center gap-2 bg-foreground text-background font-display uppercase hover:bg-accent transition-colors disabled:opacity-40 ${size === "compact" ? "px-3 py-2 text-[11px] tracking-[0.2em]" : "px-4 py-3 text-xs tracking-[0.24em]"}`
            : `inline-flex items-center gap-2 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/5 transition-colors font-display uppercase disabled:opacity-40 ${size === "compact" ? "px-3 py-2 text-[11px] tracking-[0.2em]" : "px-4 py-3 text-xs tracking-[0.24em]"}`
        }
      >
        <Icon className={`w-4 h-4 ${submitting ? "animate-spin" : "text-accent"}`} />
        {label}
      </button>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

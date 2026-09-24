import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RetroButton } from "@/components/ui/RetroButton";
import { validateOAuthRedirect } from "@/lib/security";

type AuthorizationDetails = {
  client?: { name?: string; client_id?: string; redirect_uri?: string } | null;
  scope?: string | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthNamespace = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauth(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the auth session lives in localStorage, absent during SSR.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id:
      typeof s["authorization_id"] === "string" ? (s["authorization_id"] as string) : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search["authorization_id"]) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/login", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = validateOAuthRedirect(
      data?.redirect_url ?? data?.redirect_to,
      data?.client?.redirect_uri,
    );
    if (immediate && !data?.client) throw redirect({ href: immediate });
    const { data: userData } = await supabase.auth.getUser();
    return { details: data, email: userData.user?.email ?? null };
  },
  head: () => ({
    meta: [
      { title: "Authorize access — TEJAS_OS" },
      {
        name: "description",
        content: "Approve or deny an AI assistant's request to connect to TEJAS_OS.",
      },
      { property: "og:title", content: "Authorize access — TEJAS_OS" },
      {
        property: "og:description",
        content: "Approve or deny an AI assistant's request to connect to TEJAS_OS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="glass-panel pixel-corners max-w-md rounded-lg p-7 text-center">
        <h1 className="font-sans text-xl font-semibold text-foreground">
          Could not load this authorization request
        </h1>
        <p className="mt-3 font-mono text-xs leading-6 text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function scopeLabel(scope: string): string {
  if (scope === "openid") return "Confirm your identity";
  if (scope === "email") return "Share your email address";
  if (scope === "profile") return "Share your basic profile";
  return `Additional permission requested: ${scope}`;
}

function Consent() {
  const { details, email } = Route.useLoaderData();
  const authorizationId = Route.useSearch()["authorization_id"];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "an app";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = validateOAuthRedirect(
      data?.redirect_url ?? data?.redirect_to,
      details?.client?.redirect_uri,
    );
    if (!target) {
      setBusy(false);
      setError("The authorization server returned an invalid redirect.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="glass-panel pixel-corners w-full max-w-md rounded-lg p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan">TEJAS_OS</p>
        <h1 className="mt-3 font-sans text-2xl font-bold text-foreground">
          Connect {clientName} to TEJAS_OS
        </h1>
        {email && (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">Signed in as {email}</p>
        )}
        <p className="mt-4 text-sm leading-6 text-foreground/85">
          This lets {clientName} use this app as you — it will be able to call this app's enabled
          tools while you are signed in.
        </p>

        {details?.client?.redirect_uri && (
          <p className="mt-3 break-all font-mono text-[11px] text-muted-foreground">
            Redirects to {details.client.redirect_uri}
          </p>
        )}

        {scopes.length > 0 && (
          <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-foreground/80">
            {scopes.map((s) => (
              <li key={s}>• {scopeLabel(s)}</li>
            ))}
          </ul>
        )}

        <p className="mt-4 font-mono text-[11px] leading-5 text-muted-foreground">
          This does not bypass this app's permissions or backend policies.
        </p>

        {error && (
          <p role="alert" className="mt-4 font-mono text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <RetroButton variant="primary" disabled={busy} onClick={() => decide(true)}>
            Approve
          </RetroButton>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/90 hover:border-cyan/70 hover:text-cyan"
          >
            Cancel connection
          </button>
        </div>
      </div>
    </main>
  );
}

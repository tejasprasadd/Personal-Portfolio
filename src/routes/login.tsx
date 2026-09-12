import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { RetroButton } from "@/components/ui/RetroButton";

const DESCRIPTION =
  "Sign in to TEJAS_OS to authorize connected AI assistants and agent integrations.";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s["next"] === "string" ? (s["next"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — TEJAS_OS | B R Tejas Prasad" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Sign in — TEJAS_OS" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

/** Only same-origin relative paths may be used as a post-auth return target. */
function safeNext(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function LoginPage() {
  const next = Route.useSearch()["next"];
  const navigate = useNavigate();
  const target = safeNext(next);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      window.location.href = target;
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${target}` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setNotice("Check your email to confirm your account, then sign in.");
  }

  async function onGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${target}`,
    });
    if (result.error) {
      setBusy(false);
      setError(result.error.message ?? "Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: target as string });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="glass-panel pixel-corners w-full max-w-md rounded-lg p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan">TEJAS_OS</p>
        <h1 className="mt-3 font-sans text-2xl font-bold text-foreground">
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{DESCRIPTION}</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-border bg-background/60 px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-cyan/70"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-border bg-background/60 px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-cyan/70"
          />
          {error && (
            <p role="alert" className="font-mono text-xs text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="font-mono text-xs text-cyan">{notice}</p>}
          <RetroButton variant="primary" type="submit" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </RetroButton>
        </form>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="mt-3 w-full rounded-md border border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/90 hover:border-cyan/70 hover:text-cyan"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-cyan"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already registered? Sign in"}
        </button>
      </div>
    </main>
  );
}

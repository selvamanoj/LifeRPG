"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authSchema } from "@/lib/validations";

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setInfo(null);
    setPending(true);
    const parsed = authSchema.safeParse({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      display_name: String(formData.get("display_name") ?? "") || undefined,
    });
    if (!parsed.success) {
      setPending(false);
      setError(parsed.error.issues[0]?.message ?? "Invalid inscription");
      return;
    }

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const { data, error: signError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              display_name: parsed.data.display_name ?? parsed.data.email.split("@")[0],
              timezone,
            },
          },
        });
        if (signError) throw signError;
        if (data.session) {
          if (timezone) {
            await supabase.rpc("update_hero_identity", {
              p_display_name:
                parsed.data.display_name ?? parsed.data.email.split("@")[0],
              p_timezone: timezone,
            });
          }
          router.replace("/home");
          router.refresh();
          return;
        }
        setInfo("Check your email to confirm the gate, then log in.");
      } else {
        const { error: signError } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (signError) throw signError;
        router.replace("/home");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The gate refused you");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="panel rune-frame space-y-4 p-6 md:p-8">
      <h1 className="font-display text-3xl text-ember">
        {mode === "signup" ? "Inscribe your name" : "Open the gate"}
      </h1>
      <p className="text-sm text-parchment/70">
        {mode === "signup"
          ? "A real account. Your hero lives in Postgres, not in this browser."
          : "Return to the keep. Progress follows the account, not the device."}
      </p>
      {mode === "signup" ? (
        <label className="block text-sm">
          <span className="mb-1 block text-parchment/70">Hero name</span>
          <input
            name="display_name"
            autoComplete="nickname"
            maxLength={40}
            className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
          />
        </label>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1 block text-parchment/70">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-parchment/70">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
        />
      </label>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="text-sm text-moss" role="status">
          {info}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ember py-2.5 font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Working…" : mode === "signup" ? "Awaken" : "Enter"}
      </button>
      <p className="text-center text-sm text-parchment/60">
        {mode === "signup" ? (
          <>
            Already inscribed?{" "}
            <Link className="text-ember underline" href="/login">
              Open the gate
            </Link>
          </>
        ) : (
          <>
            New hero?{" "}
            <Link className="text-ember underline" href="/signup">
              Inscribe your name
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

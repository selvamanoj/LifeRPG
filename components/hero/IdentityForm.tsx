"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TIMEZONES } from "@/lib/game";
import { identitySchema } from "@/lib/validations";
import type { Profile } from "@/lib/types";

export function IdentityForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setOk(false);
    const parsed = identitySchema.safeParse({
      display_name: String(formData.get("display_name") ?? ""),
      timezone: String(formData.get("timezone") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid identity");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("update_hero_identity", {
        p_display_name: parsed.data.display_name,
        p_timezone: parsed.data.timezone,
      });
      if (rpcError) throw rpcError;
      setOk(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rewrite the nameplate");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="panel space-y-4 p-6">
      <h2 className="font-display text-2xl text-ember">Nameplate</h2>
      <label className="block text-sm">
        <span className="mb-1 block text-parchment/70">Display name</span>
        <input
          name="display_name"
          required
          maxLength={40}
          defaultValue={profile.display_name}
          className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-parchment/70">Keep timezone (streaks)</span>
        <select
          name="timezone"
          defaultValue={
            TIMEZONES.includes(profile.timezone) ? profile.timezone : "UTC"
          }
          className="w-full rounded-xl border border-[rgb(var(--line)/0.22)] bg-ink/60 px-3 py-2"
        >
          {!TIMEZONES.includes(profile.timezone) ? (
            <option value={profile.timezone}>{profile.timezone}</option>
          ) : null}
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="text-sm text-moss" role="status">
          Nameplate updated.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ember px-4 py-2 font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

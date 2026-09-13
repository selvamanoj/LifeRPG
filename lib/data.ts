import { createClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/env";
import type { User } from "@supabase/supabase-js";
import type { Attributes, Profile } from "@/lib/types";

export async function getSessionUser(): Promise<User | null> {
  if (!getSupabasePublicEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getHeroBundle() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { user: null, profile: null, attributes: null, error: userError?.message ?? "Unauthenticated" };
  }

  const [{ data: profile, error: profileError }, { data: attributes, error: attrError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("attributes").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

  return {
    user,
    profile: (profile as Profile | null) ?? null,
    attributes: (attributes as Attributes | null) ?? null,
    error: profileError?.message ?? attrError?.message ?? null,
  };
}

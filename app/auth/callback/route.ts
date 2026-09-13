import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/env";

export async function GET(request: Request) {
  if (!getSupabasePublicEnv()) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, origin));
}

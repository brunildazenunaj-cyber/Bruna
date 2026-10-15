import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Error("Database not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function authClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) =>
          items.forEach(({ name, value, options }) =>
            jar.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            }),
          ),
      },
    },
  );
}
export async function requireAdmin() {
  const auth = await authClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) throw Error("Unauthorized");
  const { data, error } = await database()
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) throw Error("Unauthorized");
  return user;
}
export function sameOrigin(req: Request) {
  try {
    const origin = new URL(req.headers.get("origin") || "");
    if (process.env.APP_URL)
      return origin.origin === new URL(process.env.APP_URL).origin;
    const protocol =
      req.headers.get("x-forwarded-proto") ||
      new URL(req.url).protocol.replace(":", "");
    return (
      origin.host === req.headers.get("host") &&
      origin.protocol === `${protocol}:`
    );
  } catch {
    return false;
  }
}

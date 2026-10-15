import { NextResponse } from "next/server";
import { authClient, sameOrigin, requireAdmin } from "@/lib/server";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: true }, { status: 403 });
  try {
    const { email, password } = await req.json();
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 254 ||
      password.length > 200
    )
      return NextResponse.json({ error: true }, { status: 400 });
    const auth = await authClient();
    const { error } = await auth.auth.signInWithPassword({ email, password });
    if (error) throw error;
    try {
      await requireAdmin();
    } catch {
      await auth.auth.signOut();
      throw Error("Unauthorized");
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: true }, { status: 401 });
  }
}

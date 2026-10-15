import { NextResponse } from "next/server";
import { authClient, sameOrigin } from "@/lib/server";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  try {
    await (await authClient()).auth.signOut();
  } catch {}
  return NextResponse.json({ ok: true });
}

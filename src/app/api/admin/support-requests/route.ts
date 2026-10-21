import { NextResponse } from "next/server";
import { z } from "zod";
import { database, requireAdmin, sameOrigin } from "@/lib/server";

import { notifySupportRequest } from "@/lib/support-email";
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: true }, { status: 403 });
  }
  try {
    const { data, error } = await database()
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return NextResponse.json(
      { requests: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: true }, { status: 503 });
  }
}
export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return new Response(null, { status: 403 });
  }
  try {
    const a = z
      .object({ id: z.uuid(), action: z.enum(["resolve", "reopen", "delete"]) })
      .strict()
      .parse(await req.json());
    const { error } = await database().rpc("manage_support_request", {
      actor_id: user.id,
      request_id: a.id,
      requested_action: a.action,
    });
    if (error) return NextResponse.json({ error: true }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: true }, { status: 400 });
  }
}
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return new Response(null, { status: 403 });
  }
  try {
    const { id } = z
      .object({ id: z.uuid() })
      .strict()
      .parse(await req.json());
    await notifySupportRequest(id);
    const { error } = await database().from("audit_logs").insert({
      actor: user.id,
      action: "support_request.notification_retried",
      record_id: id,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: true }, { status: 503 });
  }
}

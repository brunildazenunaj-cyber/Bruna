import { NextResponse } from "next/server";
import { z } from "zod";
import { database, requireAdmin, sameOrigin } from "@/lib/server";
import { goldActionSchema } from "@/lib/gold";
import { notifyGoldRequest } from "@/lib/gold-email";
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: true }, { status: 403 });
  }
  try {
    const { data, error } = await database()
      .from("gold_requests")
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
    const a = goldActionSchema.parse(await req.json());
    const { error } = await database().rpc("review_gold_request", {
      actor_id: user.id,
      request_id: a.id,
      requested_action: a.action,
      manually_verified: a.verified === true,
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
    await notifyGoldRequest(id);
    const { error } = await database().from("audit_logs").insert({
      actor: user.id,
      action: "gold_request.notification_retried",
      record_id: id,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: true }, { status: 503 });
  }
}

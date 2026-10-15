import { NextResponse } from "next/server";
import { database, requireAdmin, sameOrigin } from "@/lib/server";
import { adminUpdateSchema } from "@/lib/validation";
import { deliverApplication } from "@/lib/email";
import { z } from "zod";
export async function GET() {
  try {
    await requireAdmin();
    const { data, error } = await database()
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return NextResponse.json(
      { applications: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: true }, { status: 403 });
  }
}
export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  try {
    const user = await requireAdmin();
    const a = adminUpdateSchema.parse(await req.json());
    const db = database();
    const { error } = await db.rpc("update_academy_application", {
      actor_id: user.id,
      application_id: a.id,
      new_status: a.status,
      new_notes: a.notes,
      withdraw_marketing: a.withdrawMarketing || false,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: true }, { status: 400 });
  }
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  try {
    const user = await requireAdmin();
    const id = z.uuid().parse(new URL(req.url).searchParams.get("id"));
    const db = database();
    const { error } = await db.rpc("delete_academy_application", {
      actor_id: user.id,
      application_id: id,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: true }, { status: 400 });
  }
}
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  try {
    const user = await requireAdmin();
    const { id } = z.object({ id: z.uuid() }).parse(await req.json());
    await deliverApplication(id);
    await database().from("audit_logs").insert({
      actor: user.id,
      action: "application.email_retried",
      record_id: id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: true }, { status: 503 });
  }
}

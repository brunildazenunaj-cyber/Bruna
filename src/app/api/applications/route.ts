import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { applicationSchema } from "@/lib/validation";
import { database, sameOrigin } from "@/lib/server";
import { deliverApplication } from "@/lib/email";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "origin" }, { status: 403 });
  if (Number(req.headers.get("content-length") || 0) > 12000)
    return NextResponse.json({ error: "size" }, { status: 413 });
  try {
    const raw = await req.text();
    if (raw.length > 12000)
      return NextResponse.json({ error: "size" }, { status: 413 });
    const parsed = applicationSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return NextResponse.json({ error: "validation" }, { status: 400 });
    const a = parsed.data;
    const db = database();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = createHash("sha256")
      .update(`${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
      .digest("hex");
    const { data: allowed, error: limitError } = await db.rpc(
      "consume_rate_limit",
      { bucket_key: key, max_requests: 5, window_seconds: 3600 },
    );
    if (limitError) throw limitError;
    if (!allowed) return NextResponse.json({ error: "rate" }, { status: 429 });
    const { website, privacy, marketing, ...fields } = a;
    void website;
    void privacy;
    const { data, error } = await db
      .from("applications")
      .insert({
        ...fields,
        marketing_consent: marketing,
        marketing_consented_at: marketing ? new Date().toISOString() : null,
        privacy_version: "2026-10",
        privacy_acknowledged_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505")
        return NextResponse.json({ error: "duplicate" }, { status: 409 });
      throw error;
    }
    try {
      await deliverApplication(data.id);
    } catch {
      console.error("Application saved; email delivery pending", data.id);
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

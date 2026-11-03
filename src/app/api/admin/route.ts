import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server";
export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: true }, { status: 403 });
  }
}

import "server-only";
import { Resend } from "resend";
import { database } from "./server";
export async function notifyGoldRequest(id: string) {
  const db = database();
  const { data, error } = await db
    .from("gold_requests")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) throw Error("Request missing");
  if (data.admin_email_sent) return;
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
    throw Error("Email not configured");
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send(
    {
      from: process.env.EMAIL_FROM,
      to: "brunildazenunaj@gmail.com",
      subject: "BMM Gold Group — manual verification required",
      text: `A Gold Group access request is awaiting manual review.\nName: ${data.name}\nEmail: ${data.email}\nTradeQuo Broker ID: ${data.broker_id}\n\nVerify registration and the required deposit in the official TradeQuo dashboard. Approve in the private BMM dashboard, personally send the invitation, then mark it as sent. No invitation has been sent automatically.`,
    },
    { idempotencyKey: `gold-request/${id}/admin` },
  );
  if (result.error) throw Error(result.error.message);
  const { error: updateError } = await db
    .from("gold_requests")
    .update({ admin_email_sent: true })
    .eq("id", id);
  if (updateError) throw updateError;
}

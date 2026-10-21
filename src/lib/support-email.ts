import "server-only";
import { Resend } from "resend";
import { database } from "./server";
export async function notifySupportRequest(id: string) {
  const db = database();
  const { data, error } = await db
    .from("support_requests")
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
      subject: "BMM — new help request",
      replyTo: data.email,
      text: `A visitor needs help.\nName: ${data.name}\nEmail: ${data.email}\nWhatsApp: ${data.phone}\n\nIssue:\n${data.message}\n\nReview in the private dashboard's Help Requests tab.`,
    },
    { idempotencyKey: `support-request/${id}/admin` },
  );
  if (result.error) throw Error(result.error.message);
  const { error: updateError } = await db
    .from("support_requests")
    .update({ admin_email_sent: true })
    .eq("id", id);
  if (updateError) throw updateError;
}

import "server-only";
import { Resend } from "resend";
export async function deliverApplication(id: string) {
  const db = (await import("./server")).database();
  const { data: a, error } = await db
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !a) throw Error("Application missing");
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
    throw Error("Email not configured");
  const resend = new Resend(process.env.RESEND_API_KEY);
  for (const kind of ["admin", "applicant"] as const) {
    if (a[`${kind}_email_sent`]) continue;
    const r = await resend.emails.send(
      {
        from: process.env.EMAIL_FROM,
        to:
          kind === "admin"
            ? process.env.ADMIN_EMAIL || "brunildazenunaj@gmail.com"
            : a.email,
        subject:
          kind === "admin"
            ? `New Academy application: ${a.name}`
            : a.language === "sq"
              ? "Aplikimi juaj në BMM Academy"
              : "Your BMM Academy application",
        text:
          kind === "admin"
            ? `Name: ${a.name}\nEmail: ${a.email}\nWhatsApp: ${a.phone}\nCountry: ${a.country}\nExperience: ${a.experience}\nDuration: ${a.duration}\nReason: ${a.reason}`
            : a.language === "sq"
              ? "Faleminderit për aplikimin. E kemi marrë kërkesën tuaj dhe do t’ju kontaktojmë personalisht. Nuk kërkohet pagesë në këtë fazë."
              : "Thank you for applying. We have received your application and will contact you personally. No payment is required at this stage.",
      },
      { idempotencyKey: `application/${id}/${kind}` },
    );
    if (r.error) throw Error(r.error.message);
    await db
      .from("applications")
      .update({ [`${kind}_email_sent`]: true })
      .eq("id", id);
  }
}

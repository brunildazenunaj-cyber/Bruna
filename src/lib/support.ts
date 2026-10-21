import { z } from "zod";
import { goldSchema } from "./gold";
export const supportSchema = goldSchema
  .pick({
    name: true,
    email: true,
    phone: true,
    privacy: true,
    language: true,
    website: true,
  })
  .extend({ message: z.string().trim().min(10).max(2000) })
  .strict();
export const supportCopy = {
  en: {
    title: "Stuck or need help?",
    intro:
      "You can ask for help at any stage, even before registration. Leave your details and explain the issue so we can contact you by email or WhatsApp. No Broker ID is needed.",
    validation:
      "Check your contact details and describe the issue in 10–2,000 characters. Include the international country code in your WhatsApp number.",
    open: "I need help",
    message: "What do you need help with?",
    warning:
      "Do not include passwords, trading credentials or payment details.",
    submit: "Send help request",
    success:
      "Your help request has been saved. We will contact you using the details you provided.",
    error:
      "We could not save your help request. Please try again or email us directly below.",
    duplicate:
      "We already received this message. You can email us below if you need to add anything.",
    email: "Email Brunilda directly",
    tab: "Help Requests",
    empty: "No help requests yet.",
    resolve: "Mark resolved",
    reopen: "Reopen",
    remove: "Delete",
    confirmDelete: "Permanently delete this help request?",
    statuses: ["New", "Resolved"],
    retry: "Retry notification email",
    pending: "Email notification pending",
    sent: "Email notification sent",
    refresh: "Refresh",
    loading: "Loading…",
    failed: "Unable to complete this action. Please try again.",
    limit: "Latest 1,000 requests.",
    search: "Search help requests",
  },
  sq: {
    title: "Ke ngecur apo ke nevojë për ndihmë?",
    intro:
      "Mund të kërkosh ndihmë në çdo hap, edhe para regjistrimit. Lër të dhënat dhe përshkruaj problemin që të të kontaktojmë me email ose WhatsApp. Nuk nevojitet Broker ID.",
    validation:
      "Kontrollo të dhënat e kontaktit dhe përshkruaj problemin me 10–2 000 karaktere. Përfshi prefiksin ndërkombëtar në numrin WhatsApp.",
    open: "Kam nevojë për ndihmë",
    message: "Për çfarë ke nevojë për ndihmë?",
    warning:
      "Mos përfshi fjalëkalime, kredenciale tregtimi apo të dhëna pagese.",
    submit: "Dërgo kërkesën për ndihmë",
    success:
      "Kërkesa jote për ndihmë u ruajt. Do të të kontaktojmë përmes të dhënave që na dërgove.",
    error:
      "Kërkesa nuk u ruajt. Provo përsëri ose na shkruaj drejtpërdrejt në email më poshtë.",
    duplicate:
      "E kemi marrë tashmë këtë mesazh. Nëse dëshiron të shtosh diçka, na shkruaj në email më poshtë.",
    email: "Shkruaji Brunildës në email",
    tab: "Kërkesa për ndihmë",
    empty: "Ende nuk ka kërkesa për ndihmë.",
    resolve: "Shëno si të zgjidhur",
    reopen: "Rihap",
    remove: "Fshi",
    confirmDelete: "Ta fshijmë përgjithmonë këtë kërkesë për ndihmë?",
    statuses: ["E re", "E zgjidhur"],
    retry: "Ridërgo emailin e njoftimit",
    pending: "Njoftimi me email në pritje",
    sent: "Njoftimi me email u dërgua",
    refresh: "Rifresko",
    loading: "Duke ngarkuar…",
    failed: "Veprimi nuk u krye. Provo përsëri.",
    limit: "1 000 kërkesat më të fundit.",
    search: "Kërko kërkesat për ndihmë",
  },
};

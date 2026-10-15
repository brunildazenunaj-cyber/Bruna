import { z } from "zod";
export const goldStatuses = [
  "Pending Verification",
  "Approved",
  "Invitation Sent",
  "Rejected",
] as const;
export const goldSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    broker_id: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[A-Za-z0-9_-]+$/),
    privacy: z.literal(true),
    language: z.enum(["sq", "en"]),
    website: z.string().max(0),
  })
  .strict();
export const goldActionSchema = z
  .object({
    id: z.uuid(),
    action: z.enum(["approve", "reject", "reopen", "invitation_sent"]),
    verified: z.boolean().optional(),
  })
  .strict()
  .refine((a) => a.action !== "approve" || a.verified === true);
export const goldCopy = {
  en: {
    title: "BMM Gold Group",
    intro:
      "Free group membership, subject to manual verification of your TradeQuo registration and required deposit. Broker funding and trading costs are separate from group membership.",
    steps: [
      "Register and activate your TradeQuo account using the referral link below. This is a referral link; BMM may receive compensation under the provider’s terms.",
      "Open My ProTrader, select “Start Free”, choose TradeQuo if supported, and follow the provider’s official account and MT5 connection instructions. Never share your MT5 password here.",
      "Complete the required account funding and use the provider’s “Send a Request” support option for activation. Confirm eligibility, restrictions and current deposit terms directly with TradeQuo.",
    ],
    deposit:
      "Indicative broker funding: USD $200 for Albania, Kosovo, North Macedonia and other Balkan countries; USD $300 elsewhere, subject to confirmation of provider terms. This is money deposited with the broker, not a BMM fee. Trading can result in loss of capital. Activation timing is subject to provider confirmation.",
    broker: "Register with TradeQuo",
    provider: "Open My ProTrader",
    formTitle: "Request Telegram access",
    explain:
      "After completing registration, submit your details. We will manually check registration and the required deposit in TradeQuo. If approved, the administrator will personally send your invitation. Submitting this form does not confirm eligibility.",
    fields: ["Full name", "Email address", "TradeQuo Broker ID"],
    privacy:
      "I have read the Privacy Policy and understand how my request will be handled.",
    submit: "Submit access request",
    sending: "Submitting…",
    success:
      "Your request has been saved as Pending Verification. We will review your TradeQuo registration and deposit manually. No invitation has been sent.",
    error:
      "We could not confirm your request. Check your details and try again later.",
    duplicate:
      "A request already exists for this email or Broker ID. Contact us if you need to update it.",
    rate: "Too many attempts. Please try again in one hour.",
    tab: "Gold Group Requests",
    statuses: [
      "Pending Verification",
      "Approved",
      "Invitation Sent",
      "Rejected",
    ],
    manual:
      "Verify registration and the required deposit in the official TradeQuo dashboard before approving. Send the invitation personally, then mark it as sent.",
    confirm:
      "I have manually verified registration and the required deposit in TradeQuo.",
    approve: "Approve request",
    reject: "Reject",
    reopen: "Return to pending",
    mark: "Mark invitation as sent",
    markConfirm:
      "Have you personally sent the Telegram invitation? This records the time; it does not send a message.",
    retry: "Retry notification email",
    search: "Search name, email or Broker ID",
    all: "All statuses",
    empty: "No Gold Group requests found.",
    select: "Select a request to review.",
    loading: "Loading…",
    failed: "The action could not be completed. Refresh and try again.",
    saved: "Saved.",
    sentAt: "Invitation sent at",
    approvedAt: "Approved at",
    submitted: "Submitted",
    notification: "Admin notification",
    sent: "Sent",
    pending: "Pending",
    refresh: "Refresh",
    limit: "Latest 1,000 requests.",
  },
  sq: {
    title: "BMM Gold Group",
    intro:
      "Anëtarësim falas në grup, pas verifikimit manual të regjistrimit në TradeQuo dhe depozitës së kërkuar. Financimi i llogarisë dhe kostot e tregtimit janë të ndara nga anëtarësimi.",
    steps: [
      "Regjistrohu dhe aktivizo llogarinë TradeQuo përmes lidhjes së referimit më poshtë. BMM mund të marrë kompensim sipas kushteve të ofruesit.",
      "Hap My ProTrader, zgjidh “Start Free”, zgjidh TradeQuo nëse mbështetet dhe ndiq udhëzimet zyrtare për llogarinë dhe lidhjen MT5. Mos dërgo kurrë këtu fjalëkalimin MT5.",
      "Plotëso financimin e kërkuar dhe përdor opsionin “Send a Request” të ofruesit për aktivizim. Konfirmo drejtpërdrejt me TradeQuo përshtatshmërinë, kufizimet dhe kushtet aktuale të depozitës.",
    ],
    deposit:
      "Financimi orientues: USD $200 për Shqipërinë, Kosovën, Maqedoninë e Veriut dhe vendet e tjera të Ballkanit; USD $300 për vendet e tjera, sipas konfirmimit të ofruesit. Kjo është depozitë te brokeri, jo tarifë BMM. Tregtimi mund të sjellë humbje të kapitalit. Afati i aktivizimit varet nga konfirmimi i ofruesit.",
    broker: "Regjistrohu në TradeQuo",
    provider: "Hap My ProTrader",
    formTitle: "Kërko akses në Telegram",
    explain:
      "Pas regjistrimit, dërgo të dhënat. Do të kontrollojmë manualisht regjistrimin dhe depozitën në TradeQuo. Nëse miratohesh, administratori do ta dërgojë personalisht ftesën. Formulari nuk konfirmon përshtatshmërinë.",
    fields: ["Emri dhe mbiemri", "Adresa e emailit", "ID e brokerit TradeQuo"],
    privacy:
      "Kam lexuar Politikën e Privatësisë dhe kuptoj si do të trajtohet kërkesa ime.",
    submit: "Dërgo kërkesën për akses",
    sending: "Duke dërguar…",
    success:
      "Kërkesa u ruajt në pritje të verifikimit. Regjistrimi dhe depozita në TradeQuo do të kontrollohen manualisht. Nuk është dërguar ftesë.",
    error:
      "Kërkesa nuk u konfirmua. Kontrollo të dhënat dhe provo përsëri më vonë.",
    duplicate:
      "Ekziston një kërkesë me këtë email ose ID brokeri. Na kontakto për përditësime.",
    rate: "Shumë përpjekje. Provo përsëri pas një ore.",
    tab: "Kërkesat Gold Group",
    statuses: [
      "Në pritje të verifikimit",
      "Miratuar",
      "Ftesa u dërgua",
      "Refuzuar",
    ],
    manual:
      "Verifiko regjistrimin dhe depozitën në panelin zyrtar TradeQuo para miratimit. Dërgoje ftesën personalisht, pastaj shënoje si të dërguar.",
    confirm:
      "Kam verifikuar manualisht regjistrimin dhe depozitën e kërkuar në TradeQuo.",
    approve: "Mirato kërkesën",
    reject: "Refuzo",
    reopen: "Kthe në pritje",
    mark: "Shëno ftesën si të dërguar",
    markConfirm:
      "E ke dërguar personalisht ftesën Telegram? Ky veprim regjistron kohën; nuk dërgon mesazh.",
    retry: "Ridërgo njoftimin me email",
    search: "Kërko emrin, emailin ose ID e brokerit",
    all: "Të gjitha statuset",
    empty: "Nuk u gjetën kërkesa Gold Group.",
    select: "Zgjidh një kërkesë për shqyrtim.",
    loading: "Duke ngarkuar…",
    failed: "Veprimi nuk u krye. Rifresko dhe provo përsëri.",
    saved: "U ruajt.",
    sentAt: "Ftesa u dërgua më",
    approvedAt: "Miratuar më",
    submitted: "Dërguar më",
    notification: "Njoftimi i administratorit",
    sent: "Dërguar",
    pending: "Në pritje",
    refresh: "Rifresko",
    limit: "1 000 kërkesat më të fundit.",
  },
};

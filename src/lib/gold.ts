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
      "Free access to Gold trading signals and information about the Cypher AI Scanner, subject to registration and eligibility requirements.",
    steps: [
      "Register and activate your TradeQuo account using the link below.",
      "Complete setup on the official My ProTrader platform.",
      "Complete the required deposit, then contact official provider support using “Send a Request” and provide your Broker User ID. Activation is approximately 24 hours, subject to provider confirmation.",
    ],
    deposit:
      "Broker funding requirements, subject to provider confirmation: Balkans — $200 USD; other eligible regions — $300 USD. These funds are deposited into your broker account, not paid as a BMM membership fee. Trading capital is at risk; no profit is guaranteed.",
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
    stepTitles: [
      "Broker registration",
      "My ProTrader / Cypher Scanner",
      "Final activation",
    ],
    scannerSteps: [
      "Click START FREE.",
      "Select a supported broker (TradeQuo or PuPrime, where available).",
      "Create your My ProTrader account.",
      "Enter the required Broker ID and email.",
      "Follow official provider instructions to connect MT5.",
    ],
    credentials:
      "Never submit your MT5 password or trading credentials to BMM.",
    eligibility:
      "Availability depends on your country and the broker’s restrictions. Confirm your eligibility and current terms directly with the provider before registering or funding an account. This BMM access form accepts TradeQuo Broker IDs; another broker’s availability on My ProTrader does not establish BMM eligibility.",
    referral:
      "Referral disclosure: this TradeQuo link is a referral link. BMM may receive compensation under the provider’s terms.",
    requestLabel: "AFTER REGISTRATION",
    privacyLink: "Privacy Policy",
  },
  sq: {
    title: "BMM Gold Group",
    intro:
      "Akses falas në sinjale tregtimi për arin dhe informacion rreth Cypher AI Scanner, sipas kushteve të regjistrimit dhe përshtatshmërisë.",
    steps: [
      "Regjistrohu dhe aktivizo llogarinë TradeQuo përmes lidhjes më poshtë.",
      "Përfundo konfigurimin në platformën zyrtare My ProTrader.",
      "Plotëso depozitën e kërkuar, pastaj kontakto mbështetjen zyrtare përmes “Send a Request” dhe jep Broker User ID. Aktivizimi zgjat rreth 24 orë, sipas konfirmimit të ofruesit.",
    ],
    deposit:
      "Financimi i kërkuar, sipas konfirmimit të ofruesit: Ballkani — $200 USD; rajonet e tjera të pranueshme — $300 USD. Këto fonde depozitohen në llogarinë e brokerit, jo si tarifë anëtarësimi BMM. Kapitali është në risk; fitimi nuk garantohet.",
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
    stepTitles: [
      "Regjistrimi te brokeri",
      "My ProTrader / Cypher Scanner",
      "Aktivizimi përfundimtar",
    ],
    scannerSteps: [
      "Kliko START FREE.",
      "Zgjidh një broker të mbështetur (TradeQuo ose PuPrime, sipas disponueshmërisë).",
      "Krijo llogarinë My ProTrader.",
      "Vendos ID e brokerit dhe emailin e kërkuar.",
      "Ndiq udhëzimet zyrtare të ofruesit për lidhjen MT5.",
    ],
    credentials:
      "Mos i dërgo kurrë BMM-së fjalëkalimin MT5 ose kredenciale tregtimi.",
    eligibility:
      "Disponueshmëria varet nga shteti yt dhe kufizimet e brokerit. Konfirmo përshtatshmërinë dhe kushtet aktuale drejtpërdrejt me ofruesin para regjistrimit ose financimit. Ky formular BMM pranon ID të TradeQuo; prania e një brokeri tjetër në My ProTrader nuk konfirmon përshtatshmërinë për BMM.",
    referral:
      "Deklaratë referimi: kjo lidhje TradeQuo është lidhje referimi. BMM mund të marrë kompensim sipas kushteve të ofruesit.",
    requestLabel: "PAS REGJISTRIMIT",
    privacyLink: "Politika e Privatësisë",
  },
};

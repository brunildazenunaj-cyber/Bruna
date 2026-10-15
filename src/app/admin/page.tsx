"use client";
import { GoldAdmin } from "@/components/gold-admin";
import { goldCopy } from "@/lib/gold";
import { useEffect, useState, useCallback } from "react";
import { useLanguage, LanguageSwitch } from "@/components/language";
import { statuses } from "@/lib/validation";
type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  experience: string;
  reason: string;
  duration: string;
  status: (typeof statuses)[number];
  notes: string;
  created_at: string;
  marketing_consent: boolean;
  marketing_consented_at: string | null;
  privacy_acknowledged_at: string;
  admin_email_sent: boolean;
  applicant_email_sent: boolean;
};
const copy = {
  en: {
    title: "Academy applications",
    login: "Private administration",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signOut: "Sign out",
    failed:
      "Unable to complete this action. Check your access and configuration.",
    loading: "Loading…",
    search: "Search name, email, country or phone",
    all: "All statuses",
    export: "Export filtered CSV",
    stats: [
      "Total applications",
      "New applications",
      "Contacted",
      "Joined members",
      "Awaiting follow-up",
    ],
    statuses: [
      "New",
      "Contacted",
      "Interested",
      "Follow-up Required",
      "Joined",
      "Not Ready",
      "Closed",
    ],
    empty: "No applications found.",
    select: "Select an application to see its details.",
    fields: [
      "Email",
      "WhatsApp",
      "Country",
      "Experience",
      "Reason for applying",
      "Preferred duration",
      "Submitted",
      "Marketing consent",
      "Privacy acknowledged",
      "Email delivery",
    ],
    yes: "Yes",
    no: "No",
    notes: "Internal notes",
    status: "Status",
    save: "Save changes",
    remove: "Delete permanently",
    confirm:
      "Permanently delete this applicant and their personal information? This cannot be undone.",
    retry: "Retry pending emails",
    sent: "Sent",
    pending: "Pending",
    saved: "Changes saved.",
    deleted: "Record deleted.",
    emailDone: "Pending emails sent.",
    unsure: "Not sure",
    months: "months",
    experiences: {
      beginner: "Beginner",
      some: "Some experience",
      experienced: "Experienced",
    },
    limit:
      "Shows the latest 1,000 applications. Apply your retention policy regularly.",
    home: "Website",
    refresh: "Refresh",
    clearConsent: "Withdraw marketing consent",
    consentConfirm: "Withdraw marketing consent for this applicant?",
    consentDone: "Marketing consent withdrawn.",
  },
  sq: {
    title: "Aplikimet në Akademi",
    login: "Administrimi privat",
    email: "Email",
    password: "Fjalëkalimi",
    signIn: "Hyr",
    signOut: "Dil",
    failed: "Veprimi nuk u krye. Kontrollo aksesin dhe konfigurimin.",
    loading: "Duke ngarkuar…",
    search: "Kërko emrin, emailin, shtetin ose telefonin",
    all: "Të gjitha statuset",
    export: "Eksporto CSV të filtruar",
    stats: [
      "Aplikime gjithsej",
      "Aplikime të reja",
      "Të kontaktuar",
      "Anëtarë të bashkuar",
      "Në pritje të ndjekjes",
    ],
    statuses: [
      "I ri",
      "I kontaktuar",
      "I interesuar",
      "Kërkon ndjekje",
      "U bashkua",
      "Ende jo gati",
      "I mbyllur",
    ],
    empty: "Nuk u gjetën aplikime.",
    select: "Zgjidh një aplikim për të parë detajet.",
    fields: [
      "Email",
      "WhatsApp",
      "Shteti",
      "Përvoja",
      "Arsyeja e aplikimit",
      "Kohëzgjatja e preferuar",
      "Data e aplikimit",
      "Pëlqimi për marketing",
      "Njohja me privatësinë",
      "Dërgimi i emaileve",
    ],
    yes: "Po",
    no: "Jo",
    notes: "Shënime të brendshme",
    status: "Statusi",
    save: "Ruaj ndryshimet",
    remove: "Fshi përgjithmonë",
    confirm:
      "Ta fshijmë përgjithmonë këtë aplikant dhe të dhënat personale? Ky veprim nuk zhbëhet.",
    retry: "Ridërgo emailet në pritje",
    sent: "Dërguar",
    pending: "Në pritje",
    saved: "Ndryshimet u ruajtën.",
    deleted: "Aplikimi u fshi.",
    emailDone: "Emailet në pritje u dërguan.",
    unsure: "Ende i/e pasigurt",
    months: "muaj",
    experiences: {
      beginner: "Fillestar/e",
      some: "Pak përvojë",
      experienced: "Me përvojë",
    },
    limit:
      "Shfaqen 1 000 aplikimet më të fundit. Zbato rregullisht politikën e ruajtjes së të dhënave.",
    home: "Faqja kryesore",
    refresh: "Rifresko",
    clearConsent: "Tërhiq pëlqimin për marketing",
    consentConfirm: "Të tërhiqet pëlqimi për marketing për këtë aplikant?",
    consentDone: "Pëlqimi për marketing u tërhoq.",
  },
};
export default function Admin() {
  const [tab, setTab] = useState<"academy" | "gold">("academy");
  const [lang, setLang] = useLanguage(),
    t = copy[lang];
  const [logged, setLogged] = useState(false),
    [busy, setBusy] = useState(true),
    [message, setMessage] = useState(""),
    [apps, setApps] = useState<Application[]>([]),
    [selected, setSelected] = useState<Application | null>(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("");
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin", { cache: "no-store" });
      if (!r.ok) {
        setLogged(false);
        return;
      }
      const data = await r.json();
      setApps(data.applications);
      setSelected((previous) =>
        previous
          ? data.applications.find((a: Application) => a.id === previous.id) ||
            null
          : null,
      );
      setLogged(true);
    } catch {
      setMessage("failed");
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f)),
      });
      if (!r.ok) throw Error();
      await load();
    } catch {
      setMessage("failed");
    } finally {
      setBusy(false);
    }
  }
  async function action(method: string, body: unknown, success: string) {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch(
        `/api/admin${method === "DELETE" ? `?id=${selected?.id}` : ""}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: method === "DELETE" ? undefined : JSON.stringify(body),
        },
      );
      if (!r.ok) throw Error();
      setMessage(success);
      if (method === "DELETE") setSelected(null);
      await load();
    } catch {
      setMessage("failed");
    } finally {
      setBusy(false);
    }
  }
  const filtered = apps.filter(
    (a) =>
      (!filter || a.status === filter) &&
      `${a.name} ${a.email} ${a.phone} ${a.country}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function csv() {
    const escape = (v: unknown) =>
      `"${String(v ?? "")
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""')}"`;
    const columns = [
      "name",
      "email",
      "phone",
      "country",
      "experience",
      "duration",
      "status",
      "reason",
      "notes",
      "created_at",
      "marketing_consent",
      "marketing_consented_at",
    ];
    const text = [
      columns.join(","),
      ...filtered.map((a) =>
        columns.map((k) => escape(a[k as keyof Application])).join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "bmm-applications.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <h1>{logged ? t.title : "BMM Academy"}</h1>
        <div>
          <a href="/">{t.home} ↗</a>
          <LanguageSwitch lang={lang} setLang={setLang} />
          {logged && (
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                setApps([]);
                setSelected(null);
                setLogged(false);
              }}
            >
              {t.signOut}
            </button>
          )}
        </div>
      </header>
      {logged && (
        <div
          className="admin-tabs"
          role="tablist"
          aria-label={lang === "en" ? "Request type" : "Lloji i kërkesës"}
        >
          <button
            role="tab"
            aria-selected={tab === "academy"}
            onClick={() => setTab("academy")}
          >
            {t.title}
          </button>
          <button
            role="tab"
            aria-selected={tab === "gold"}
            onClick={() => setTab("gold")}
          >
            {goldCopy[lang].tab}
          </button>
        </div>
      )}
      {message && (tab === "academy" || !logged) && (
        <p
          className={message === "failed" ? "error" : "admin-notice"}
          role="status"
        >
          {
            t[
              message as
                "failed" | "saved" | "deleted" | "emailDone" | "consentDone"
            ]
          }
        </p>
      )}
      {!logged ? (
        <form onSubmit={login} className="admin-login">
          <h1>{t.login}</h1>
          <label>
            {t.email}
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            {t.password}
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="button dark" disabled={busy}>
            {busy ? t.loading : t.signIn}
          </button>
        </form>
      ) : tab === "gold" ? (
        <GoldAdmin lang={lang} />
      ) : (
        <>
          <div className="stats">
            {[
              apps.length,
              ...["New", "Contacted", "Joined", "Follow-up Required"].map(
                (s) => apps.filter((a) => a.status === s).length,
              ),
            ].map((n, i) => (
              <div className="stat" key={i}>
                <strong>{n}</strong>
                <span>{t.stats[i]}</span>
              </div>
            ))}
          </div>
          <p className="muted">{t.limit}</p>
          <div className="admin-filters">
            <input
              aria-label={t.search}
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label={t.status}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">{t.all}</option>
              {statuses.map((s, i) => (
                <option key={s} value={s}>
                  {t.statuses[i]}
                </option>
              ))}
            </select>
            <button onClick={csv}>{t.export}</button>
            <button disabled={busy} onClick={() => void load()}>
              {t.refresh}
            </button>
          </div>
          <div className="admin-columns">
            <div className="app-list">
              {filtered.length ? (
                filtered.map((a) => (
                  <button
                    className="app-row"
                    aria-pressed={selected?.id === a.id}
                    key={a.id}
                    onClick={() => setSelected({ ...a })}
                  >
                    <strong>{a.name}</strong>
                    <span>{a.email}</span>
                    <span>
                      {t.statuses[statuses.indexOf(a.status)]} ·{" "}
                      {new Date(a.created_at).toLocaleDateString(
                        lang === "en" ? "en-GB" : "sq-AL",
                      )}
                    </span>
                  </button>
                ))
              ) : (
                <p className="notice">{t.empty}</p>
              )}
            </div>
            <div className="app-detail">
              {selected ? (
                <>
                  <h2>{selected.name}</h2>
                  <dl>
                    {[
                      <a key="email" href={`mailto:${selected.email}`}>
                        {selected.email}
                      </a>,
                      <a
                        key="phone"
                        href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {selected.phone} ↗
                      </a>,
                      selected.country,
                      t.experiences[
                        selected.experience as keyof typeof t.experiences
                      ],
                      selected.reason,
                      selected.duration === "unsure"
                        ? t.unsure
                        : `${selected.duration} ${t.months}`,
                      new Date(selected.created_at).toLocaleString(
                        lang === "en" ? "en-GB" : "sq-AL",
                      ),
                      `${selected.marketing_consent ? t.yes : t.no}${selected.marketing_consented_at ? " · " + new Date(selected.marketing_consented_at).toLocaleString() : ""}`,
                      new Date(
                        selected.privacy_acknowledged_at,
                      ).toLocaleString(),
                      `${lang === "en" ? "Admin" : "Administratori"}: ${selected.admin_email_sent ? t.sent : t.pending} / ${lang === "en" ? "Applicant" : "Aplikanti"}: ${selected.applicant_email_sent ? t.sent : t.pending}`,
                    ].map((v, i) => (
                      <div key={i}>
                        <dt>{t.fields[i]}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <label>
                    {t.status}
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          status: e.target.value as Application["status"],
                        })
                      }
                    >
                      {statuses.map((s, i) => (
                        <option key={s} value={s}>
                          {t.statuses[i]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t.notes}
                    <textarea
                      rows={5}
                      maxLength={10000}
                      value={selected.notes}
                      onChange={(e) =>
                        setSelected({ ...selected, notes: e.target.value })
                      }
                    />
                  </label>
                  <div className="detail-actions">
                    <button
                      disabled={busy}
                      onClick={() =>
                        void action(
                          "PATCH",
                          {
                            id: selected.id,
                            status: selected.status,
                            notes: selected.notes,
                          },
                          "saved",
                        )
                      }
                    >
                      {t.save}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        void action("POST", { id: selected.id }, "emailDone")
                      }
                    >
                      {t.retry}
                    </button>
                    {selected.marketing_consent && (
                      <button
                        disabled={busy}
                        onClick={() => {
                          if (confirm(t.consentConfirm))
                            void action(
                              "PATCH",
                              {
                                id: selected.id,
                                status: selected.status,
                                notes: selected.notes,
                                withdrawMarketing: true,
                              },
                              "consentDone",
                            );
                        }}
                      >
                        {t.clearConsent}
                      </button>
                    )}
                    <button
                      className="danger"
                      disabled={busy}
                      onClick={() => {
                        if (confirm(t.confirm))
                          void action("DELETE", null, "deleted");
                      }}
                    >
                      {t.remove}
                    </button>
                  </div>
                </>
              ) : (
                <p>{t.select}</p>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

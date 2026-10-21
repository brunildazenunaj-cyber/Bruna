"use client";
import { useCallback, useEffect, useState } from "react";
import { goldCopy, goldStatuses } from "@/lib/gold";
import type { Language } from "@/lib/content";
type GoldRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  broker_id: string;
  status: (typeof goldStatuses)[number];
  created_at: string;
  approved_at: string | null;
  invitation_sent_at: string | null;
  admin_email_sent: boolean;
};
export function GoldAdmin({ lang }: { lang: Language }) {
  const t = goldCopy[lang];
  const [requests, setRequests] = useState<GoldRequest[]>([]),
    [selected, setSelected] = useState<string | null>(null),
    [busy, setBusy] = useState(true),
    [message, setMessage] = useState<"failed" | "saved" | "">(""),
    [verified, setVerified] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("");
  const load = useCallback(async () => {
    const r = await fetch("/api/admin/gold-requests", { cache: "no-store" });
    if (!r.ok) throw Error();
    setRequests((await r.json()).requests);
  }, []);
  useEffect(() => {
    load()
      .catch(() => setMessage("failed"))
      .finally(() => setBusy(false));
  }, [load]);
  const item = requests.find((r) => r.id === selected);
  async function action(action: string) {
    if (!item) return;
    if (action === "invitation_sent" && !confirm(t.markConfirm)) return;
    setBusy(true);
    setMessage("");
    try {
      const retry = action === "retry";
      const r = await fetch("/api/admin/gold-requests", {
        method: retry ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          retry ? { id: item.id } : { id: item.id, action, verified },
        ),
      });
      if (!r.ok) throw Error();
      await load();
      setVerified(false);
      setMessage("saved");
    } catch {
      setMessage("failed");
    } finally {
      setBusy(false);
    }
  }
  const filtered = requests.filter(
    (r) =>
      (!filter || r.status === filter) &&
      `${r.name} ${r.email} ${r.phone || ""} ${r.broker_id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const date = (s: string) =>
    new Date(s).toLocaleString(lang === "en" ? "en-GB" : "sq-AL");
  return (
    <section aria-label={t.tab}>
      <h2>{t.tab}</h2>
      <p className="admin-notice">{t.manual}</p>
      {message && (
        <p role="status" className={message === "failed" ? "error" : "notice"}>
          {t[message]}
        </p>
      )}
      <p className="muted">{t.limit}</p>
      <div className="admin-filters">
        <input
          aria-label={t.search}
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label={t.all}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">{t.all}</option>
          {goldStatuses.map((s, i) => (
            <option key={s} value={s}>
              {t.statuses[i]}
            </option>
          ))}
        </select>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMessage("");
            try {
              await load();
            } catch {
              setMessage("failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          {t.refresh}
        </button>
      </div>
      {busy && <p role="status">{t.loading}</p>}
      <div className="admin-columns">
        <div className="app-list">
          {filtered.length
            ? filtered.map((r) => (
                <button
                  className="app-row"
                  key={r.id}
                  aria-pressed={r.id === selected}
                  onClick={() => {
                    setSelected(r.id);
                    setVerified(false);
                    setMessage("");
                  }}
                >
                  <strong>{r.name}</strong>
                  <span>
                    {r.email} · {r.broker_id}
                  </span>
                  <span>{t.statuses[goldStatuses.indexOf(r.status)]}</span>
                </button>
              ))
            : !busy && <p className="notice">{t.empty}</p>}
        </div>
        <div className="app-detail">
          {item ? (
            <>
              <h3>{item.name}</h3>
              <p>{t.statuses[goldStatuses.indexOf(item.status)]}</p>
              <dl>
                <dt>{t.fields[1]}</dt>
                <dd>
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                </dd>
                <dt>{t.fields[2]}</dt>
                <dd>
                  {item.phone ? (
                    <a
                      href={`https://wa.me/${item.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.phone} ↗
                    </a>
                  ) : (
                    t.notProvided
                  )}
                </dd>
                <dt>{t.fields[3]}</dt>
                <dd>{item.broker_id}</dd>
                <dt>{t.submitted}</dt>
                <dd>{date(item.created_at)}</dd>
                {item.approved_at && (
                  <>
                    <dt>{t.approvedAt}</dt>
                    <dd>{date(item.approved_at)}</dd>
                  </>
                )}
                {item.invitation_sent_at && (
                  <>
                    <dt>{t.sentAt}</dt>
                    <dd>{date(item.invitation_sent_at)}</dd>
                  </>
                )}
                <dt>{t.notification}</dt>
                <dd>{item.admin_email_sent ? t.sent : t.pending}</dd>
              </dl>
              {item.status === "Pending Verification" && (
                <label className="gold-check">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                  />
                  {t.confirm}
                </label>
              )}
              <div className="detail-actions">
                {item.status === "Pending Verification" && (
                  <button
                    disabled={busy || !verified}
                    onClick={() => void action("approve")}
                  >
                    {t.approve}
                  </button>
                )}
                {item.status === "Approved" && (
                  <button
                    disabled={busy}
                    onClick={() => void action("invitation_sent")}
                  >
                    {t.mark}
                  </button>
                )}
                {["Pending Verification", "Approved"].includes(item.status) && (
                  <button disabled={busy} onClick={() => void action("reject")}>
                    {t.reject}
                  </button>
                )}
                {item.status === "Rejected" && (
                  <button disabled={busy} onClick={() => void action("reopen")}>
                    {t.reopen}
                  </button>
                )}
                {!item.admin_email_sent && (
                  <button disabled={busy} onClick={() => void action("retry")}>
                    {t.retry}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>{t.select}</p>
          )}
        </div>
      </div>
    </section>
  );
}

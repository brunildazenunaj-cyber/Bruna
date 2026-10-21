"use client";
import { useCallback, useEffect, useState } from "react";
import { supportCopy } from "@/lib/support";
import type { Language } from "@/lib/content";
type HelpRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "New" | "Resolved";
  created_at: string;
  admin_email_sent: boolean;
};
export function SupportAdmin({ lang }: { lang: Language }) {
  const t = supportCopy[lang];
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const load = useCallback(async () => {
    const res = await fetch("/api/admin/support-requests", {
      cache: "no-store",
    });
    if (!res.ok) throw Error();
    setRequests((await res.json()).requests);
  }, []);
  useEffect(() => {
    load()
      .catch(() => setError(true))
      .finally(() => setBusy(false));
  }, [load]);
  async function act(id?: string, action?: string) {
    if (action === "delete" && !confirm(t.confirmDelete)) return;
    setBusy(true);
    setError(false);
    try {
      if (id) {
        const res = await fetch("/api/admin/support-requests", {
          method: action === "retry" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action === "retry" ? { id } : { id, action }),
        });
        if (!res.ok) throw Error();
      }
      await load();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="support-admin">
      <h2>{t.tab}</h2>
      <p>{t.limit}</p>
      <button
        className="button secondary-button"
        disabled={busy}
        onClick={() => act()}
      >
        {t.refresh}
      </button>
      <label>
        {t.search}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {busy && <p role="status">{t.loading}</p>}
      {error && (
        <p role="alert" className="error">
          {t.failed}
        </p>
      )}
      {!busy && !error && !requests.length && <p>{t.empty}</p>}
      {requests
        .filter((r) =>
          `${r.name} ${r.email} ${r.phone} ${r.message}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .map((r) => (
          <article className="help-card" key={r.id}>
            <h3>{r.name}</h3>
            <p>
              {t.statuses[r.status === "New" ? 0 : 1]} ·{" "}
              {new Date(r.created_at).toLocaleString(
                lang === "en" ? "en-GB" : "sq-AL",
              )}
            </p>
            <p>
              <a href={`mailto:${r.email}`}>{r.email}</a> ·{" "}
              <a
                href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp: {r.phone} ↗
              </a>
            </p>
            <p className="help-message">{r.message}</p>
            <p>{r.admin_email_sent ? t.sent : t.pending}</p>
            <div className="hero-buttons">
              <button
                className="button secondary-button"
                disabled={busy}
                onClick={() =>
                  act(r.id, r.status === "New" ? "resolve" : "reopen")
                }
              >
                {r.status === "New" ? t.resolve : t.reopen}
              </button>
              {!r.admin_email_sent && (
                <button
                  className="button secondary-button"
                  disabled={busy}
                  onClick={() => act(r.id, "retry")}
                >
                  {t.retry}
                </button>
              )}
              <button
                className="button secondary-button"
                disabled={busy}
                onClick={() => act(r.id, "delete")}
              >
                {t.remove}
              </button>
            </div>
          </article>
        ))}
    </section>
  );
}

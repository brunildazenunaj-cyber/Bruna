"use client";
import { useState, useCallback, useEffect } from "react";
import { useLanguage, LanguageSwitch } from "@/components/language";
import { GoldAdmin } from "@/components/gold-admin";
import { SupportAdmin } from "@/components/support-admin";
import { goldCopy } from "@/lib/gold";
import { supportCopy } from "@/lib/support";
const copy = {
  en: {
    login: "Private administration",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signOut: "Sign out",
    home: "Website",
    loading: "Loading…",
    failed:
      "Unable to complete this action. Check your access and configuration.",
  },
  sq: {
    login: "Administrimi privat",
    email: "Email",
    password: "Fjalëkalimi",
    signIn: "Hyr",
    signOut: "Dil",
    home: "Faqja kryesore",
    loading: "Duke ngarkuar…",
    failed: "Veprimi nuk u krye. Kontrollo aksesin dhe konfigurimin.",
  },
};
export default function Admin() {
  const [lang, setLang] = useLanguage();
  const t = copy[lang];
  const [tab, setTab] = useState<"gold" | "support">("gold");
  const [logged, setLogged] = useState(false),
    [busy, setBusy] = useState(true),
    [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin", { cache: "no-store" });
      if (!r.ok) {
        setLogged(false);
        return;
      }
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
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <h1>BMM Gold Group</h1>
        <div>
          <a href="/">{t.home} ↗</a>
          <LanguageSwitch lang={lang} setLang={setLang} />
          {logged && (
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
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
            aria-selected={tab === "gold"}
            onClick={() => setTab("gold")}
          >
            {goldCopy[lang].tab}
          </button>
          <button
            role="tab"
            aria-selected={tab === "support"}
            onClick={() => setTab("support")}
          >
            {supportCopy[lang].tab}
          </button>
        </div>
      )}
      {message && (
        <p role="alert" className="error">
          {t.failed}
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
      ) : tab === "support" ? (
        <SupportAdmin lang={lang} />
      ) : (
        <GoldAdmin lang={lang} />
      )}
    </main>
  );
}

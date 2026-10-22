"use client";
import { useState } from "react";
import { supportCopy } from "@/lib/support";
import { goldCopy } from "@/lib/gold";
import type { Language } from "@/lib/content";
export function SupportForm({ lang }: { lang: Language }) {
  const t = { ...goldCopy[lang], ...supportCopy[lang] };
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(f),
          privacy: f.has("privacy"),
          language: lang,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(
          data.error === "duplicate"
            ? t.duplicate
            : data.error === "rate"
              ? t.rate
              : data.error === "validation"
                ? t.validation
                : t.error,
        );
        setState("idle");
        return;
      }
      setState("success");
    } catch {
      setError(t.error);
      setState("idle");
    }
  }
  return (
    <div id="help" className="gold-request support-request">
      <h3>{t.title}</h3>
      <p>{t.intro}</p>
      <details className="support-details">
        <summary className="button secondary-button">{t.open}</summary>
        {state === "success" ? (
          <p role="status" className="success">
            {t.success}
          </p>
        ) : (
          <form className="application-form support-form" onSubmit={submit}>
            <p className="form-note">{t.required}</p>
            {["name", "email", "phone"].map((name, i) => (
              <label key={name}>
                {t.fields[i]}{" "}
                <span className="required-star" aria-hidden="true">
                  *
                </span>
                <input
                  name={name}
                  type={
                    name === "email"
                      ? "email"
                      : name === "phone"
                        ? "tel"
                        : "text"
                  }
                  autoComplete={name === "phone" ? "tel" : name}
                  minLength={name === "name" ? 2 : 1}
                  maxLength={
                    name === "name" ? 120 : name === "email" ? 254 : 25
                  }
                  pattern={
                    name === "phone"
                      ? String.raw`\+[1-9][0-9 \(\)\-]{6,24}`
                      : undefined
                  }
                  aria-describedby={
                    name === "phone" ? "help-phone-hint" : undefined
                  }
                  placeholder={
                    name === "phone" ? "+355 69 123 4567" : undefined
                  }
                  required
                />
                {name === "phone" && (
                  <span id="help-phone-hint" className="phone-hint">
                    {t.phoneHint}
                  </span>
                )}
              </label>
            ))}
            <label>
              {t.message}{" "}
              <span className="required-star" aria-hidden="true">
                *
              </span>
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                aria-describedby="help-message-hint"
              />
              <span id="help-message-hint" className="phone-hint">
                {t.warning}
              </span>
            </label>
            <div className="honeypot" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <label className="checkbox">
              <input type="checkbox" name="privacy" required />
              <span>
                <span className="required-star" aria-hidden="true">
                  *
                </span>{" "}
                {t.privacy}{" "}
                <a
                  href={`/legal/privacy?lang=${lang}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.privacyLink} ↗
                </a>
              </span>
            </label>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="button dark" disabled={state === "loading"}>
              {state === "loading" ? t.sending : t.submit}
            </button>
          </form>
        )}
      </details>
    </div>
  );
}

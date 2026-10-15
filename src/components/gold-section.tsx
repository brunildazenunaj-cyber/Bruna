"use client";
import { useState } from "react";
import { goldCopy } from "@/lib/gold";
import type { Language } from "@/lib/content";
export function GoldSection({ lang }: { lang: Language }) {
  const t = goldCopy[lang];
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/gold-requests", {
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
    <section id="gold" className="section gold-section">
      <div>
        <p className="eyebrow">BMM GOLD GROUP</p>
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
        <ol className="gold-steps">
          {t.steps.map((s, i) => (
            <li key={s}>
              <strong>0{i + 1}</strong>
              <p>{s}</p>
              {i === 0 && (
                <a
                  className="text-link"
                  target="_blank"
                  rel="sponsored noreferrer"
                  href="https://my.tradequo.com/register?referral=01a1302d-ea82-716d-bfbd-00dc73bd1413"
                >
                  {t.broker} ↗
                </a>
              )}
              {i === 1 && (
                <a
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                  href="https://app.myprotrader.com/"
                >
                  {t.provider} ↗
                </a>
              )}
            </li>
          ))}
        </ol>
        <p>{t.deposit}</p>
      </div>
      <div>
        <h3>{t.formTitle}</h3>
        <p>{t.explain}</p>
        {state === "success" ? (
          <p role="status" className="success">
            {t.success}
          </p>
        ) : (
          <form className="application-form gold-form" onSubmit={submit}>
            {["name", "email", "broker_id"].map((name, i) => (
              <label key={name}>
                {t.fields[i]}
                <input
                  name={name}
                  type={name === "email" ? "email" : "text"}
                  autoComplete={name === "broker_id" ? "off" : name}
                  minLength={name === "name" ? 2 : 1}
                  maxLength={
                    name === "name" ? 120 : name === "email" ? 254 : 80
                  }
                  pattern={
                    name === "broker_id" ? "[A-Za-z0-9_\\-]+" : undefined
                  }
                  required
                />
              </label>
            ))}
            <div className="honeypot" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <label className="checkbox">
              <input type="checkbox" name="privacy" required />
              <span>
                {t.privacy}{" "}
                <a
                  href={`/legal/privacy?lang=${lang}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ↗
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
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";
import { goldCopy } from "@/lib/gold";
import type { Language } from "@/lib/content";
export function GoldRequestForm({ lang }: { lang: Language }) {
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
    <div id="gold-request" className="gold-request">
      <p className="eyebrow">{t.requestLabel}</p>
      <h3>{t.formTitle}</h3>
      <p>{t.explain}</p>
      {state === "success" ? (
        <p role="status" className="success">
          {t.success}
        </p>
      ) : (
        <form className="application-form gold-form" onSubmit={submit}>
          <p className="form-note">{t.required}</p>
          {["name", "email", "phone", "broker_id"].map((name, i) => (
            <label key={name}>
              {t.fields[i]}{" "}
              <span className="required-star" aria-hidden="true">
                *
              </span>
              <input
                name={name}
                type={
                  name === "email" ? "email" : name === "phone" ? "tel" : "text"
                }
                autoComplete={
                  name === "broker_id" ? "off" : name === "phone" ? "tel" : name
                }
                minLength={name === "name" ? 2 : 1}
                maxLength={
                  name === "name"
                    ? 120
                    : name === "email"
                      ? 254
                      : name === "phone"
                        ? 25
                        : 80
                }
                pattern={
                  name === "broker_id"
                    ? "[A-Za-z0-9_\\-]+"
                    : name === "phone"
                      ? String.raw`\+[1-9][0-9 \(\)\-]{6,24}`
                      : undefined
                }
                aria-describedby={
                  name === "phone" ? "gold-phone-hint" : undefined
                }
                placeholder={name === "phone" ? "+355 69 123 4567" : undefined}
                required
              />
              {name === "phone" && (
                <span id="gold-phone-hint" className="phone-hint">
                  {t.phoneHint}
                </span>
              )}
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
    </div>
  );
}

export function GoldSection({ lang }: { lang: Language }) {
  const t = goldCopy[lang];
  return (
    <section id="gold" className="section gold-section">
      <div className="gold-heading">
        <p className="eyebrow">BMM GOLD GROUP</p>
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
      </div>
      <ol className="gold-steps">
        {t.steps.map((s, i) => (
          <li key={s}>
            <span className="step-badge">0{i + 1}</span>
            <h3>{t.stepTitles[i]}</h3>
            <p>{s}</p>
            {i === 0 && (
              <>
                <a
                  className="button gold-button"
                  target="_blank"
                  rel="sponsored noreferrer"
                  href="https://my.tradequo.com/register?referral=01a1302d-ea82-716d-bfbd-00dc73bd1413"
                >
                  {t.broker} ↗
                </a>
                <p className="step-note">{t.referral}</p>
              </>
            )}
            {i === 1 && (
              <>
                <ol className="scanner-steps">
                  {t.scannerSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <a
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                  href="https://app.myprotrader.com/"
                >
                  {t.provider} ↗
                </a>
                <p className="step-note">{t.credentials}</p>
              </>
            )}
            {i === 2 && <p className="deposit-note">{t.deposit}</p>}
          </li>
        ))}
      </ol>
      <p className="eligibility-note">{t.eligibility}</p>
    </section>
  );
}

"use client";
import { useState } from "react";
import { ArrowUpRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { content, Language } from "@/lib/content";
export function ApplicationForm({ lang }: { lang: Language }) {
  const t = content[lang];
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries([
            ...f.entries(),
            ["privacy", f.has("privacy")],
            ["marketing", f.has("marketing")],
            ["language", lang],
          ]),
        ),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error in t.errors ? data.error : "unavailable");
        setState("idle");
        return;
      }
      setState("success");
    } catch {
      setError("unavailable");
      setState("idle");
    }
  }
  return state === "success" ? (
    <div className="success" role="status">
      <CheckCircle2 size={40} />
      <h3>{t.successTitle}</h3>
      <p>{t.success}</p>
    </div>
  ) : (
    <form onSubmit={submit} className="application-form">
      <p className="form-note">{t.required}</p>
      <div className="form-grid">
        {(
          [
            ["name", "text", 120, "name"],
            ["email", "email", 254, "email"],
            ["phone", "tel", 25, "tel"],
            ["country", "text", 80, "country-name"],
          ] as const
        ).map(([name, type, max, auto], i) => (
          <label key={name}>
            {t.fields[i]}
            <input
              name={name}
              type={type as string}
              maxLength={Number(max)}
              minLength={2}
              autoComplete={auto as string}
              placeholder={name === "phone" ? "+355 69 000 0000" : undefined}
              pattern={
                name === "phone"
                  ? String.raw`\+[1-9][0-9 \(\)\-]{6,24}`
                  : undefined
              }
              required
            />
          </label>
        ))}
        <label>
          {t.fields[4]}
          <select name="experience">
            {["beginner", "some", "experienced"].map((v, i) => (
              <option value={v} key={v}>
                {t.experiences[i]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.fields[6]}{" "}
          <span className="optional">
            ({lang === "en" ? "optional" : "opsionale"})
          </span>
          <select name="duration" defaultValue="unsure">
            {["6", "12", "unsure"].map((v, i) => (
              <option key={v} value={v}>
                {t.durations[i]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {t.fields[5]}
        <textarea
          name="reason"
          minLength={10}
          maxLength={2000}
          rows={4}
          required
          placeholder={t.reasonPlaceholder}
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="checkbox">
        <input name="privacy" type="checkbox" required />
        <span>
          {t.privacy}{" "}
          <a
            href={`/legal/privacy?lang=${lang}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.legal[0]} ↗
          </a>
        </span>
      </label>
      <label className="checkbox">
        <input name="marketing" type="checkbox" />
        <span>{t.marketing}</span>
      </label>
      {error && (
        <p role="alert" className="error">
          {t.errors[error as keyof typeof t.errors]}
        </p>
      )}
      <button className="button dark" disabled={state === "loading"}>
        {state === "loading" ? t.sending : t.submit}
        <ArrowUpRight size={18} />
      </button>
      <div className="secure-note">
        <LockKeyhole size={13} />
        {lang === "en"
          ? "Your information is kept private and secure."
          : "Të dhënat e tua trajtohen në mënyrë private dhe të sigurt."}
      </div>
    </form>
  );
}

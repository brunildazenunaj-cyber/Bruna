"use client";
import { useState, useEffect } from "react";
import type { Language } from "@/lib/content";
export function useLanguage() {
  const [lang, setLang] = useState<Language>("sq");
  useEffect(() => {
    const saved = localStorage.getItem("bmm-language");
    if (saved === "en") setLang("en");
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return [
    lang,
    (value: Language) => {
      localStorage.setItem("bmm-language", value);
      setLang(value);
    },
  ] as const;
}
export function LanguageSwitch({
  lang,
  setLang,
}: {
  lang: Language;
  setLang: (l: Language) => void;
}) {
  return (
    <div className="language" aria-label={lang === "en" ? "Language" : "Gjuha"}>
      <button aria-pressed={lang === "sq"} onClick={() => setLang("sq")}>
        SQ
      </button>
      <span>/</span>
      <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );
}

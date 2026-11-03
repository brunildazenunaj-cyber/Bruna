"use client";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { content } from "@/lib/content";
import { useLanguage, LanguageSwitch } from "@/components/language";
import { SupportForm } from "@/components/support-form";
import { supportCopy } from "@/lib/support";
import { GoldSection, GoldRequestForm } from "@/components/gold-section";
import {
  RegistrationTutorial,
  type TutorialAssets,
} from "@/components/registration-tutorial";
export function LandingPage({ tutorial }: { tutorial: TutorialAssets }) {
  const [lang, setLang] = useLanguage(),
    [menu, setMenu] = useState(false);
  const t = content[lang];
  return (
    <div className="launch-page">
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <header className="header">
        <a className="brand" href="#" aria-label={t.home}>
          <span className="brand-mark">
            bmm<span>✦</span>
          </span>
          <span className="brand-name">BEYOND MONEY MINDS</span>
        </a>
        <nav
          className={menu ? "navigation open" : "navigation"}
          aria-label={t.navigation}
        >
          {["gold", "tutorial"].map((id, i) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {t.nav[i]}
            </a>
          ))}
          <a href="#help" onClick={() => setMenu(false)}>
            {supportCopy[lang].open}
          </a>
        </nav>
        <div className="header-actions">
          <LanguageSwitch lang={lang} setLang={setLang} />
          <button
            className="menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label={t.menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <section id="intro" className="launch-hero">
          <h1>{t.hero}</h1>
          <p>{t.intro}</p>
          <div className="hero-buttons">
            <a className="button gold-button" href="#gold">
              {t.goldCta}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <GoldSection lang={lang} />
        <section id="tutorial" className="section tutorial-section">
          <RegistrationTutorial lang={lang} assets={tutorial} />
          <div>
            <GoldRequestForm lang={lang} />
            <SupportForm lang={lang} />
          </div>
        </section>
      </main>
      <footer className="launch-footer">
        <div>
          <span>© {new Date().getFullYear()} Beyond Money Minds</span>
          <a href="mailto:brunildazenunaj@gmail.com">{t.contact} ↗</a>
        </div>
        <p>{t.risk}</p>
        <nav
          aria-label={
            lang === "en" ? "Legal information" : "Informacion ligjor"
          }
        >
          {["privacy", "terms", "risk", "affiliate"].map((p, i) => (
            <a href={`/legal/${p}?lang=${lang}`} key={p}>
              {t.legal[i]}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}

"use client";
import { useState } from "react";
import { ArrowUpRight, Menu, X, Plus, Check } from "lucide-react";
import { content } from "@/lib/content";
import { useLanguage, LanguageSwitch } from "@/components/language";
import { ApplicationForm } from "@/components/application-form";
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
          {["gold", "tutorial", "academy"].map((id, i) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {t.nav[i]}
            </a>
          ))}
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
            <a className="button secondary-button" href="#academy">
              {t.academyCta}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <GoldSection lang={lang} />
        <section id="tutorial" className="section tutorial-section">
          <RegistrationTutorial lang={lang} assets={tutorial} />
          <GoldRequestForm lang={lang} />
        </section>
        <section id="academy" className="section compact-academy">
          <div>
            <h2>{t.academyTitle}</h2>
            <p>{t.academyText}</p>
          </div>
          <div>
            <ul>
              {t.academyFacts.map((f) => (
                <li key={f}>
                  <Check size={16} />
                  {f}
                </li>
              ))}
            </ul>
            <a className="text-link" href="#apply">
              {t.apply}
              <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
        <section id="apply" className="section apply-section">
          <div className="apply-copy">
            <h2>{t.formTitle}</h2>
            <p>{t.formText}</p>
            <a className="text-link" href="mailto:brunildazenunaj@gmail.com">
              {t.help}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <ApplicationForm lang={lang} />
        </section>
        <section id="faq" className="section faq-section">
          <h2>{t.faqTitle}</h2>
          <div className="faq-list">
            {t.faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
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

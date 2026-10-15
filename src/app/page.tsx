"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ChartNoAxesCombined,
  Bitcoin,
  TrendingUp,
  Sparkles,
  Flower2,
  BookOpen,
  Plus,
  Menu,
  X,
  ArrowRight,
  Camera,
} from "lucide-react";
import { content } from "@/lib/content";
import { useLanguage, LanguageSwitch } from "@/components/language";
import { ApplicationForm } from "@/components/application-form";
const icons = [
  ChartNoAxesCombined,
  Bitcoin,
  TrendingUp,
  Sparkles,
  Flower2,
  BookOpen,
];
export default function Home() {
  const [lang, setLang] = useLanguage();
  const [menu, setMenu] = useState(false);
  const t = content[lang];
  return (
    <>
      <a className="skip" href="#main">
        {lang === "en" ? "Skip to content" : "Kalo te përmbajtja"}
      </a>
      <header className="header">
        <a className="brand" href="#" aria-label="Beyond Money Minds home">
          <span className="brand-mark">
            bmm<span>✦</span>
          </span>
          <span className="brand-name">BEYOND MONEY MINDS</span>
        </a>
        <nav
          className={menu ? "navigation open" : "navigation"}
          aria-label={lang === "en" ? "Main navigation" : "Navigimi kryesor"}
        >
          {["academy", "approach", "faq"].map((id, i) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {t.nav[i]}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <LanguageSwitch lang={lang} setLang={setLang} />
          <a className="header-apply" href="#apply">
            {t.apply}
            <ArrowUpRight size={15} />
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label={lang === "en" ? "Toggle menu" : "Hap menynë"}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span />
              {t.eyebrow}
            </p>
            <h1>
              {t.hero[0]}
              <br />
              <em>{t.hero[1]}</em>
            </h1>
            <p className="hero-description">{t.intro}</p>
            <a href="#academy" className="button dark">
              {t.explore}
              <ArrowUpRight size={19} />
            </a>
            <a href="#gold" className="hero-secondary">
              {lang === "en"
                ? "Discover BMM Gold Group"
                : "Zbulo BMM Gold Group"}{" "}
              <ArrowUpRight size={14} />
            </a>
            <p className="hero-note">
              <span className="tiny-star">✧</span>
              {t.heroNote}
            </p>
          </div>
          <div
            className="hero-art"
            role="img"
            aria-label={
              lang === "en"
                ? "Abstract golden arch and sculptural staircase symbolising learning and growth"
                : "Hark i artë dhe shkallë skulpturore që simbolizojnë të mësuarit dhe zhvillimin"
            }
          >
            <div className="art-grain" />
            <div className="arch arch-one" />
            <div className="arch arch-two" />
            <div className="art-sun" />
            <div className="stairs">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="art-caption">A MINDSET BEYOND THE ORDINARY</span>
            <div className="art-tag">
              <Sparkles size={18} />
              <span>
                BEYOND
                <br />
                <strong>possibilities.</strong>
              </span>
            </div>
          </div>
          <a href="#approach" className="scroll-cue">
            <ArrowDown size={14} />
            {t.scroll}
          </a>
          <span className="hero-index">01 — BMM ACADEMY</span>
        </section>
        <div className="topic-strip">
          {t.topics.map((s, i) => (
            <span key={s}>
              {s}
              {i < 5 && <i>✧</i>}
            </span>
          ))}
        </div>
        <section id="approach" className="section founder-section">
          <div className="founder-visual">
            <div className="portrait-placeholder">
              <span className="portrait-monogram">B.</span>
              <Flower2 size={85} strokeWidth={0.6} />
              <span>{t.photo}</span>
            </div>
            <div className="founder-signature">Brunilda</div>
          </div>
          <div className="founder-copy">
            <p className="eyebrow">{t.aboutLabel}</p>
            <h2>{t.aboutTitle}</h2>
            <p>{t.about}</p>
            <div className="founder-byline">
              <strong>{t.founder}</strong>
              <span>{t.founderRole}</span>
            </div>
            <span className="placeholder-link">
              <Camera size={15} />
              {t.instagram}
            </span>
          </div>
        </section>
        <section id="academy" className="section academy-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.academyLabel}</p>
              <h2>
                {t.academyTitle.split("\n").map((l, i) => (
                  <span key={l}>
                    {i === 1 ? <em>{l}</em> : l}
                    <br />
                  </span>
                ))}
              </h2>
            </div>
            <p>{t.academyText}</p>
          </div>
          <div className="topic-grid">
            {t.topics.map((title, i) => {
              const Icon = icons[i];
              return (
                <article className="topic-card" key={title}>
                  <div className="card-top">
                    <Icon size={26} strokeWidth={1.2} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{t.descriptions[i]}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="schedule section">
          <div className="schedule-copy">
            <p className="eyebrow">{t.scheduleLabel}</p>
            <h2>{t.scheduleTitle}</h2>
            <p>{t.scheduleIntro}</p>
            <div className="session-total">
              <strong>10</strong>
              <span>{t.live}</span>
            </div>
          </div>
          <div className="schedule-list">
            {t.sessions.map((s, i) => (
              <div key={s}>
                <span className="session-number">{i < 4 ? "02" : "01"}</span>
                <span>{s}</span>
                <span className="live-dot" />
              </div>
            ))}
          </div>
        </section>
        <section className="section membership">
          <div>
            <p className="eyebrow">{t.membershipLabel}</p>
            <h2>{t.membershipTitle}</h2>
            <p>{t.membershipText}</p>
            <a className="text-link" href="#apply">
              {t.apply}
              <ArrowRight size={17} />
            </a>
          </div>
          <div className="duration-cards">
            {[6, 12].map((n) => (
              <a href="#apply" key={n}>
                <span>BMM ACADEMY</span>
                <strong>
                  {n}
                  <em>{t.months}</em>
                </strong>
                <ArrowUpRight size={22} />
              </a>
            ))}
            <p>{t.membershipNote}</p>
          </div>
        </section>
        <section id="apply" className="section apply-section">
          <div className="apply-copy">
            <p className="eyebrow">{t.formLabel}</p>
            <h2>{t.formTitle}</h2>
            <p>{t.formText}</p>
            <div className="apply-decoration">✧</div>
            <a className="text-link" href="mailto:brunildazenunaj@gmail.com">
              {t.help}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <ApplicationForm lang={lang} />
        </section>
        <section id="faq" className="section faq-section">
          <div>
            <p className="eyebrow">{t.faqLabel}</p>
            <h2>{t.faqTitle}</h2>
          </div>
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
        <section id="gold" className="gold-coming">
          <span>✧</span>
          <div>
            <h3>{t.gold}</h3>
            <p>{t.goldNote}</p>
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a className="brand" href="#">
            <span className="brand-mark">
              bmm<span>✦</span>
            </span>
            <span className="brand-name">BEYOND MONEY MINDS</span>
          </a>
          <p>{t.footerTag}</p>
          <a href="mailto:brunildazenunaj@gmail.com">
            {t.contact}
            <ArrowUpRight size={15} />
          </a>
        </div>
        <p className="risk-note">{t.risk}</p>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Beyond Money Minds. {t.copyright}
          </span>
          <div>
            {["privacy", "terms", "risk", "affiliate"].map((p, i) => (
              <a key={p} href={`/legal/${p}?lang=${lang}`}>
                {t.legal[i]}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

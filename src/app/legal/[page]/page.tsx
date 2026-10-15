import { notFound } from "next/navigation";
import { legal } from "@/lib/legal";
export default async function Legal({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { page } = await params;
  const lang = (await searchParams).lang === "en" ? "en" : "sq";
  if (!["privacy", "terms", "risk", "affiliate"].includes(page)) notFound();
  const t = legal[lang],
    doc = t[page as "privacy" | "terms" | "risk" | "affiliate"];
  return (
    <main className="legal-page" lang={lang}>
      <div className="language">
        <a href={`?lang=sq`}>SQ</a> / <a href={`?lang=en`}>EN</a>
      </div>
      <a className="text-link" href="/">
        ← {t.back}
      </a>
      <h1>{doc.title}</h1>
      <p className="notice">{t.draft}</p>
      {doc.sections.map(([h, p]) => (
        <section key={h}>
          <h2>{h}</h2>
          <p>{p}</p>
        </section>
      ))}
    </main>
  );
}

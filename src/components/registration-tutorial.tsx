"use client";
import { useState } from "react";
import { Film } from "lucide-react";
import { content, type Language } from "@/lib/content";
export type TutorialAssets = { available: boolean; captions: Language[] };
export function RegistrationTutorial({
  lang,
  assets,
}: {
  lang: Language;
  assets: TutorialAssets;
}) {
  const t = content[lang];
  const [failed, setFailed] = useState(false);
  return (
    <div className="tutorial-video">
      <h2>{t.tutorialTitle}</h2>
      <p>{t.tutorialText}</p>
      {assets.available ? (
        <>
          <video
            key={lang}
            controls
            playsInline
            preload="none"
            poster="/videos/bmm-registration-poster.svg"
            aria-label={t.tutorialText}
            onError={() => setFailed(true)}
          >
            <source
              src="/videos/bmm-registration.mp4"
              type="video/mp4"
              onError={() => setFailed(true)}
            />
            {assets.captions.map((l) => (
              <track
                key={l}
                kind="captions"
                src={`/videos/bmm-registration.${l}.vtt`}
                srcLang={l}
                label={l === "sq" ? "Shqip" : "English"}
                default={l === lang}
              />
            ))}
            {t.videoFallback}
          </video>
          {failed && <p role="alert">{t.videoError}</p>}
          <a className="text-link" href="/videos/bmm-registration.mp4">
            {t.videoDownload} ↗
          </a>
        </>
      ) : (
        <div className="tutorial-placeholder">
          <Film size={32} strokeWidth={1.2} />
          <p>{t.videoMissing}</p>
          <a href="mailto:brunildazenunaj@gmail.com">{t.contact} ↗</a>
        </div>
      )}
    </div>
  );
}

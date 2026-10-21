import { existsSync } from "node:fs";
import path from "node:path";
import { LandingPage } from "@/components/landing-page";
import type { Language } from "@/lib/content";
export default function Home() {
  const videos = path.join(process.cwd(), "public", "videos");
  return (
    <LandingPage
      tutorial={{
        available: existsSync(path.join(videos, "bmm-registration.mp4")),
        captions: (["sq", "en"] as Language[]).filter((lang) =>
          existsSync(path.join(videos, `bmm-registration.${lang}.vtt`)),
        ),
      }}
    />
  );
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RegistrationTutorial } from "../src/components/registration-tutorial";
test("configured tutorial uses accessible native controls without autoplay and only supplied captions", () => {
  const html = renderToStaticMarkup(
    createElement(RegistrationTutorial, {
      lang: "sq",
      assets: { available: true, captions: ["sq"] },
    }),
  );
  assert.match(html, /<video[^>]*controls=""/);
  assert.match(html, /playsInline=""/);
  assert.match(html, /preload="none"/);
  assert.match(html, /bmm-registration.mp4/);
  assert.match(html, /bmm-registration.sq.vtt/);
  assert.doesNotMatch(html, /bmm-registration.en.vtt|autoPlay|autoplay/);
});
test("absent tutorial has no video or fake playback control in either language", () => {
  for (const lang of ["sq", "en"] as const) {
    const html = renderToStaticMarkup(
      createElement(RegistrationTutorial, {
        lang,
        assets: { available: false, captions: [] },
      }),
    );
    assert.doesNotMatch(html, /<video|<source|<button/);
    assert.match(html, /mailto:brunildazenunaj@gmail.com/);
  }
});

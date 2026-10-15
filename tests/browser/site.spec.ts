import { test, expect } from "@playwright/test";
test("Albanian default, English switch, persistence and complete landing content", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "sq");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Mëso. Zhvillohu.",
  );
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Learn. Grow.",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".topic-card")).toHaveCount(6);
  await expect(page.locator(".schedule-list>div")).toHaveCount(6);
  await page.locator("summary").first().click();
  await expect(page.locator("details[open] p")).toBeVisible();
  await expect(page.getByText("€900")).toHaveCount(0);
});
test("mobile navigation and no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Hap menynë" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Akademia", exact: true })
    .click();
  await expect(page.getByRole("navigation")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/bmm-mobile.png", fullPage: true });
});
test("application validates and reports missing services without false success", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.locator("[name=name]").fill("Test Applicant");
  await page.locator("[name=email]").fill("test@example.com");
  await page.locator("[name=phone]").fill("+355 69 123 4567");
  await page.locator("[name=country]").fill("Albania");
  await page
    .locator("[name=reason]")
    .fill("I would like to learn about financial markets.");
  await expect(page.locator("[name=marketing]")).not.toBeChecked();
  await page.locator("[name=privacy]").check();
  await page.getByRole("button", { name: "Send application" }).click();
  await expect(page.locator(".application-form [role=alert]")).toContainText(
    "temporarily unavailable",
  );
  await expect(page.getByText("Your application has been saved.")).toHaveCount(
    0,
  );
});
test("admin API denies unauthenticated reads and mutations; cross-origin submissions denied", async ({
  request,
}) => {
  expect((await request.get("/api/admin")).status()).toBe(403);
  for (const method of ["PATCH", "DELETE", "POST"])
    expect(
      (
        await request.fetch("/api/admin", {
          method,
          headers: { Origin: "http://127.0.0.1:3000" },
          data: {},
        })
      ).ok(),
    ).toBe(false);
  expect(
    (
      await request.post("/api/applications", {
        headers: { Origin: "https://other.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/applications", {
        headers: { Origin: "http://127.0.0.1:3000" },
        data: {},
      })
    ).status(),
  ).toBe(400);
});
test("legal translations and desktop screenshot", async ({ page }) => {
  for (const slug of ["privacy", "terms", "risk", "affiliate"]) {
    await page.goto(`/legal/${slug}?lang=en`);
    await expect(page.locator("main")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.screenshot({ path: "/tmp/bmm-desktop.png", fullPage: true });
});

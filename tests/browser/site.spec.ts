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
  await page.locator("#apply [name=name]").fill("Test Applicant");
  await page.locator("#apply [name=email]").fill("test@example.com");
  await page.locator("#apply [name=phone]").fill("+355 69 123 4567");
  await page.locator("#apply [name=country]").fill("Albania");
  await page
    .locator("[name=reason]")
    .fill("I would like to learn about financial markets.");
  await expect(page.locator("#apply [name=marketing]")).not.toBeChecked();
  await page.locator("#apply [name=privacy]").check();
  await page.getByRole("button", { name: "Send application" }).click();
  await expect(page.locator("#apply .application-form [role=alert]")).toContainText(
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

test("Gold request form remains separate and fails honestly without services", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  const form = page.locator(".gold-form");
  await form.locator("[name=name]").fill("Gold Test");
  await form.locator("[name=email]").fill("gold@example.com");
  await form.locator("[name=broker_id]").fill("TQ123");
  await form.locator("[name=privacy]").check();
  await form.getByRole("button", { name: "Submit access request" }).click();
  await expect(form.locator("[role=alert]")).toContainText("could not confirm");
  expect((await request.get("/api/admin/gold-requests")).status()).toBe(403);
  for (const method of ["PATCH", "POST"])
    expect(
      (
        await request.fetch("/api/admin/gold-requests", {
          method,
          headers: { Origin: "http://127.0.0.1:3000" },
          data: {},
        })
      ).status(),
    ).toBe(403);
  await expect(page.locator('a[href*="t.me/"]')).toHaveCount(0);
});

test("Gold dashboard tab and manual controls with isolated UI fixtures", async ({
  page,
}) => {
  let item = {
    id: "123e4567-e89b-42d3-a456-426614174000",
    name: "Fixture Person",
    email: "fixture@example.com",
    broker_id: "TQ123",
    status: "Pending Verification",
    created_at: "2026-10-15T12:00:00Z",
    approved_at: null as string | null,
    invitation_sent_at: null as string | null,
    admin_email_sent: true,
  };
  await page.route("**/api/admin", (r) =>
    r.fulfill({ json: { applications: [] } }),
  );
  await page.route("**/api/admin/gold-requests", async (r) => {
    if (r.request().method() === "GET")
      return r.fulfill({ json: { requests: [item] } });
    const a = r.request().postDataJSON();
    if (a.action === "approve") {
      expect(a.verified).toBe(true);
      item = {
        ...item,
        status: "Approved",
        approved_at: "2026-10-15T13:00:00Z",
      };
    } else if (a.action === "invitation_sent")
      item = {
        ...item,
        status: "Invitation Sent",
        invitation_sent_at: "2026-10-15T14:00:00Z",
      };
    await r.fulfill({ json: { ok: true } });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.getByRole("tab", { name: "Gold Group Requests" }).click();
  await page.getByRole("button", { name: /Fixture Person/ }).click();
  await expect(
    page.getByRole("button", { name: "Approve request" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Mark invitation as sent" }),
  ).toHaveCount(0);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Approve request" }).click();
  await expect(
    page.getByRole("button", { name: "Mark invitation as sent" }),
  ).toBeEnabled();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Mark invitation as sent" }).click();
  await expect(
    page.getByText("Invitation sent at", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Academy applications" }).click();
  await expect(page.getByText("No applications found.")).toBeVisible();
});

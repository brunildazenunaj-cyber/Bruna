import { test, expect } from "@playwright/test";
test("Albanian default, English switch, persistence and complete landing content", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "sq");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Gjithçka që të duhet për të filluar.",
  );
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Everything you need to get started.",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(
    await page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((s) => s.id)),
  ).toEqual(["intro", "gold", "tutorial", "academy", "apply", "faq"]);
  await expect(page.locator(".gold-steps > li")).toHaveCount(3);
  await expect(page.locator(".scanner-steps > li")).toHaveCount(5);
  await expect(
    page.locator(".founder-section,.schedule,.membership,.topic-card"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Get Free Gold Group Access", exact: true }),
  ).toHaveAttribute("href", "#gold");
  await expect(
    page.getByRole("link", { name: "Explore BMM Academy", exact: true }),
  ).toHaveAttribute("href", "#academy");
  await expect(page.locator("#academy")).toContainText(
    "10 scheduled live sessions weekly",
  );
  await expect(page.getByText("Founder", { exact: false })).toHaveCount(0);
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
  await expect(page.locator("header nav")).not.toBeVisible();
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
  await expect(
    page.locator("#apply .application-form [role=alert]"),
  ).toContainText("temporarily unavailable");
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
  await form.locator("[name=phone]").fill("+355 69 123 4567");
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
    phone: "+355 69 123 4567",
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
    page.locator('a[href="https://wa.me/355691234567"]'),
  ).toBeVisible();
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

test("tutorial missing state is honest and provider links match supplied URLs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".tutorial-placeholder")).toContainText(
    "Videoja e regjistrimit nuk është ende e disponueshme",
  );
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator(".tutorial-placeholder")).toContainText(
    "not available yet",
  );
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.locator("#gold a").first()).toHaveAttribute(
    "href",
    "https://my.tradequo.com/register?referral=01a1302d-ea82-716d-bfbd-00dc73bd1413",
  );
  await expect(
    page.getByRole("link", { name: "Open My ProTrader", exact: false }),
  ).toHaveAttribute("href", "https://app.myprotrader.com/");
  await expect(page.locator("#gold")).toContainText("approximately 24 hours");
  await expect(page.locator("#gold")).toContainText("$200 USD");
  await expect(page.locator("#gold")).toContainText("$300 USD");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("both forms keep separate payloads and confirmations using isolated API fixtures", async ({
  page,
}) => {
  const posts: { url: string; data: Record<string, unknown> }[] = [];
  for (const route of ["applications", "gold-requests"])
    await page.route(`**/api/${route}`, async (r) => {
      posts.push({ url: route, data: r.request().postDataJSON() });
      await r.fulfill({ status: 201, json: { ok: true } });
    });
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  const gold = page.locator(".gold-form");
  await gold.locator("[name=name]").fill("Controlled Gold Test");
  await gold.locator("[name=email]").fill("gold@example.com");
  await gold.locator("[name=broker_id]").fill("TQ123");
  await gold.locator("[name=phone]").fill("+355 69 123 4567");
  await gold.locator("[name=privacy]").check();
  await gold.getByRole("button", { name: "Submit access request" }).click();
  await expect(page.locator("#gold-request [role=status]")).toContainText(
    "Pending Verification",
  );
  const academy = page.locator("#apply");
  await academy.locator("[name=name]").fill("Controlled Academy Test");
  await academy.locator("[name=email]").fill("academy@example.com");
  await academy.locator("[name=phone]").fill("+355 69 123 4567");
  await academy.locator("[name=country]").fill("Albania");
  await academy
    .locator("[name=reason]")
    .fill("I want to learn about financial markets.");
  await academy.locator("[name=privacy]").check();
  await academy.getByRole("button", { name: "Send application" }).click();
  await expect(academy.locator("[role=status]")).toContainText(
    "Your application has been saved",
  );
  expect(posts.map((p) => p.url)).toEqual(["gold-requests", "applications"]);
  expect(posts[0].data).toMatchObject({
    broker_id: "TQ123",
    phone: "+355 69 123 4567",
    privacy: true,
    language: "en",
  });
  expect(posts[0].data).not.toHaveProperty("status");
  expect(posts[1].data).toMatchObject({
    marketing: false,
    privacy: true,
    language: "en",
  });
  expect(posts[1].data).not.toHaveProperty("broker_id");
});

test("Gold required fields show red stars and WhatsApp is mandatory", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  const form = page.locator(".gold-form");
  await expect(form.locator(".required-star")).toHaveCount(5);
  for (const name of ["name", "email", "phone", "broker_id"])
    await expect(form.locator(`[name=${name}]`)).toHaveAttribute(
      "required",
      "",
    );
  await expect(form.locator(".required-star").first()).toHaveCSS(
    "color",
    "rgb(180, 35, 24)",
  );
  await form.locator("[name=name]").fill("Test Person");
  await form.locator("[name=email]").fill("test@example.com");
  await form.locator("[name=broker_id]").fill("TQ123");
  await form.locator("[name=privacy]").check();
  expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(
    false,
  );
  await form.locator("[name=phone]").fill("0691234567");
  expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(
    false,
  );
  await form.locator("[name=phone]").fill("+355 69 123 4567");
  expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(
    true,
  );
  await page.getByRole("button", { name: "SQ", exact: true }).click();
  await expect(form.getByText("Numri i WhatsApp")).toBeVisible();
});

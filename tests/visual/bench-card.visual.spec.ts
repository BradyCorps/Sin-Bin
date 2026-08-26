import { expect, test } from "@playwright/test";

const approvedBenchCardStory = "/iframe.html?id=livematch-components-benchcard--selected-violetta-skin-v-01&viewMode=story";

test("Approved Baseline — BenchCard v0.1", async ({ page }) => {
  await page.goto(approvedBenchCardStory, { waitUntil: "domcontentloaded" });

  const card = page.locator(".sb-skin-bench-card");
  await expect(card).toBeVisible();
  await page.locator(".sb-skin-portrait img, .sb-skin-energy-pip").evaluateAll((images: HTMLImageElement[]) =>
    Promise.all(images.map((image) => image.decode())),
  );

  await expect(card).toHaveScreenshot("approved-baseline-bench-card-v0.1.png", {
    animations: "disabled",
    caret: "hide",
    maxDiffPixels: 0,
    scale: "css",
  });
});

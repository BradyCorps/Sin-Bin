import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{arg}{ext}",
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:6006",
    viewport: { width: 400, height: 300 },
    deviceScaleFactor: 1,
  },
  webServer: {
    command: "npm run storybook -- --ci",
    url: "http://127.0.0.1:6006/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

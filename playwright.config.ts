import { defineConfig } from '@playwright/test';
const base = process.env.PUBLIC_BASE_PATH || '/';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 3,
  timeout: 20000,
  expect: { timeout: 5000 },
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:4323${base}`, headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run preview -- --port 4323',
    url: `http://127.0.0.1:4323${base}`,
    reuseExistingServer: false,
    timeout: 30000,
  },
});

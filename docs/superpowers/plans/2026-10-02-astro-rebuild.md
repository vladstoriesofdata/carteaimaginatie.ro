# Cartea Imaginație Astro Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution, or superpowers:subagent-driven-development if the user chooses delegation. Steps use checkbox syntax for tracking.

**Goal:** Recreate Cartea Imaginație as a standalone static Astro website ready for GitHub Pages.

**Architecture:** Native Astro pages share a layout, local assets, and focused styles. A typed gallery manifest drives filtering; small client scripts handle accessible category controls and a native submission dialog. The static build supports both root and repository base paths.

**Tech Stack:** Astro, TypeScript, npm, Playwright, Node.js, GitHub Actions and GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-02-astro-rebuild-design.md` (approved).

## Global Constraints

- The deployed site must have no runtime dependency on the original website.
- All rendered images, fonts, styles, icons, and scripts must be served from this build.
- WordPress, Elementor, Ninja Forms, jQuery, and original-site endpoints must not be used.
- Historical source URLs may appear only in documentation and migration manifests.
- External Gumroad and illustrator-credit links remain ordinary navigation links, not embedded resources.
- Use the original 34 gallery illustrations: 25 in Călătoria, eight in Din carte, and one in Prieteni.
- Călătoria is initially selected. Preserve original image order, captions, and aspect ratios.
- GitHub Pages provides no form-processing backend. Never show simulated submission success.
- Preserve privacy content; document discontinued WordPress references for user review.
- Do not create a CNAME or change DNS implicitly. Publishing follows local site review.
- Do not copy Stories of Data analytics identifiers or locale-specific configuration.

## Review Focus

1. Nested GitHub Pages paths: every internal link and image must work under `/carteaimaginatie.ro/`; covered by Task 5.
2. Missing or failed form service: values remain available after failure and no false success appears; covered by Task 4.
3. Keyboard-only operation: categories and dialog must work with focus returned on dismissal; covered by Tasks 3 and 4.
4. Slow image loading or small screens: dimensions prevent major layout movement and content never overflows horizontally; covered by Tasks 2 and 6.
5. Hidden external dependencies: fonts, CSS backgrounds, scripts, and document-page images must all load locally; covered by Tasks 2 and 6.

## File Structure and Interfaces

| File | Responsibility |
| --- | --- |
| `package.json`, `package-lock.json`, `tsconfig.json` | Locked Astro and test toolchain |
| `astro.config.ts` | Static output, site URL, base path, trailing slashes, sitemap |
| `.gitignore`, `.env.example` | Exclude generated output and document optional configuration |
| `scripts/capture-reference.mjs` | Repeatable public-page and asset capture using built-in fetch |
| `legacy/manifest.json` | Original URLs, categories, image order, dimensions and captions |
| `public/images/`, `public/fonts/`, `public/favicon.svg` | Local production assets |
| `src/data/gallery.ts` | Typed category definitions and gallery records |
| `src/data/project.ts`, `src/data/privacy.ts` | Original project and privacy content |
| `src/lib/urls.ts` | Base-path-aware `sitePath(path: string): string` |
| `src/layouts/BaseLayout.astro` | Metadata, language, favicon and shared CSS |
| `src/components/Gallery.astro`, `src/scripts/gallery.ts` | Category controls, image markup and filtering |
| `src/components/FloatingActions.astro` | Original floating actions and external purchase link |
| `src/components/StoryDialog.astro`, `src/scripts/story-dialog.ts` | Dialog, validation and optional endpoint submission |
| `src/styles/site.css` | Reference-matched responsive styles and local fonts |
| `src/pages/index.astro`, `src/pages/despre-proiect.astro`, `src/pages/politica-de-confidentialitate.astro` | Public content routes |
| `src/pages/404.astro`, `src/pages/robots.txt.ts` | Error page and sitemap discovery |
| `playwright.config.ts`, `tests/site.spec.ts`, `tests/form.spec.ts`, `tests/deployment.spec.ts` | Behavior, rendering and deployment tests |
| `scripts/check-build.mjs` | Check output for forbidden remote assets and legacy runtime |
| `.github/workflows/build.yml`, `.github/workflows/deploy-pages.yml` | Build verification and Pages artifact deployment |
| `README.md`, `docs/verification.md` | Development, form contract, publishing and verification evidence |

### Task 1: Complete the reference capture

**Files:** `scripts/capture-reference.mjs`, `legacy/manifest.json`, existing `legacy/*.html`, `docs/reference-analysis.md`.

**Interfaces:** Produces a manifest with records `{ category, title, sourceUrl, localPath, width, height, order }`, and verified visual observations consumed by Tasks 2–4.

- [x] Inspect the original at desktop and mobile widths using the browser. Record gallery width, columns, spacing, fixed controls, selected-tab styling, image-click behavior, and popup dimensions. Switch all three categories; open the submission dialog without sending data. Inspect About and privacy pages.
- [x] Use the saved HTML to collect gallery items and asset URLs in source order. Capture the required page-specific styles and locally used font files, including document pages. Keep original URLs in the reference manifest.
- [x] Implement a repeatable capture script with an explicit origin allowlist and checked HTTP responses. Never execute captured scripts:

```js
async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}
```

- [x] Download the 34 gallery images, required document images, and fonts. Record image dimensions using a trusted image-metadata package if Node cannot read the format directly. Check each downloaded file is the expected media type rather than an HTML error response.
- [x] Verify category counts are 25/8/1 and compare captions/order to saved HTML. Update the analysis with confirmed image-click behavior and desktop/mobile observations.
- [x] Save this independently reviewable reference capture as a local commit.

### Task 2: Establish a static Astro site with local assets

**Files:** toolchain/config files, `src/lib/urls.ts`, `src/data/*`, `src/layouts/BaseLayout.astro`, `src/styles/site.css`, `public/*`, `playwright.config.ts`, initial `tests/site.spec.ts`.

**Interfaces:** `sitePath(path: string): string`; `Category = 'calatoria' | 'din-carte' | 'prieteni'`; `GalleryImage = { category: Category; title: string; src: string; width: number; height: number; order: number }`; exported `galleryImages: GalleryImage[]` and `categories: { id: Category; label: string }[]`.

- [x] Confirm current official Astro setup guidance and package versions. Install Astro, sitemap support, TypeScript, and Playwright with a committed npm lockfile. Set Node 22 or later as the supported runtime.
- [x] Configure static output, trailing slashes, site URL and base path from `PUBLIC_SITE_URL` and `PUBLIC_BASE_PATH`. Define scripts for `dev`, `build`, `preview`, and `test:e2e`.
- [x] Add an initial failing smoke test and run it against the empty implementation:

```ts
test('home has local content and Romanian metadata', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ro');
  await expect(page.getByRole('button', { name: 'CALATORIA', exact: true })).toBeVisible();
  await expect(page.locator('[data-category="calatoria"] img')).toHaveCount(25);
});
```

- [x] Implement `sitePath` using `import.meta.env.BASE_URL`, normalizing the separator once. All production asset paths and internal links call this helper. Original source URLs remain out of `src/data/gallery.ts`.
- [x] Build the shared layout with local font declarations, title, description, canonical URL, favicon, `lang="ro"`, viewport metadata, and a slot. Derive canonical URLs from the configured public URL and base.
- [x] Generate the typed gallery data from the verified capture, preserving order. Add explicit image dimensions and useful descriptions; first visible image is eager and later images lazy.
- [x] Run the smoke test, build, and local asset-loading check. Confirm no font stylesheet is loaded from Google or the original site.
- [x] Commit the static foundation and local production assets.

### Task 3: Recreate gallery presentation and document routes

**Files:** `Gallery.astro`, `FloatingActions.astro`, `gallery.ts`, `site.css`, all content pages, `404.astro`, `robots.txt.ts`, `tests/site.spec.ts`.

**Interfaces:** Gallery buttons have `data-filter` and `aria-pressed`; each gallery item has `data-category`. Category selection shows one group, updates pressed state, and resets gallery scroll appropriately to the original behavior. Floating submission action exposes `data-open-story` for Task 4.

- [x] Add a failing category test:

```ts
test('gallery switches category without mixing images', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'DIN CARTE', exact: true }).click();
  await expect(page.locator('[data-category="din-carte"]:visible')).toHaveCount(8);
  await expect(page.locator('[data-category="calatoria"]:visible')).toHaveCount(0);
  await page.getByRole('button', { name: 'PRIETENI', exact: true }).press('Enter');
  await expect(page.locator('[data-category="prieteni"]:visible')).toHaveCount(1);
});
```

- [x] Run the test and confirm the missing switching behavior fails. Implement native buttons and minimal filtering script that toggles `hidden` and `aria-pressed`. Maintain useful initial HTML before JavaScript loads.
- [x] Recreate the observed reference gallery sizing, active tabs, captions, fixed amber controls, and About navigation with scoped CSS. Use local SVG icons. Implement a lightbox only if confirmed in Task 1; otherwise images remain plain images.
- [x] Recreate About and privacy pages using captured text and local supporting images. Keep the author and illustrator credit links. Document obsolete privacy passages separately instead of silently rewriting them.
- [x] Add a small 404 page and robots endpoint pointing to the generated sitemap.
- [x] Test category state, Enter/Space activation, About/home/privacy links, and 404 rendering. Compare local and reference screenshots at desktop and mobile widths.
- [x] Commit the public pages and gallery interactions.

### Task 4: Recreate the story dialog with honest submission behavior

**Files:** `StoryDialog.astro`, `story-dialog.ts`, `.env.example`, `site.css`, `tests/form.spec.ts`, `README.md` form contract.

**Interfaces:** Native `dialog#story-dialog`; trigger `[data-open-story]`; form fields named `name`, `email`, `story`, `illustration`, `publicationConsent`; optional HTTPS endpoint stored as `data-endpoint`. Payload is JSON `{ name, email, story, illustration: boolean, publicationConsent: boolean }`. HTTP 2xx confirms receipt; other statuses or network failures produce an error.

- [x] Add failing tests for open/close, required-field validation, unavailable sending, error retention, and success. Example keyboard test:

```ts
test('dialog dismisses with Escape and restores focus', async ({ page }) => {
  await page.goto('./');
  const trigger = page.locator('[data-open-story]');
  await trigger.click();
  await expect(page.locator('#story-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#story-dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
```

- [x] Render original fields, explanatory copy, illustration-price wording, privacy link, and consent choices in a native dialog. Use `showModal()` and native focus management; restore trigger focus after close. Provide a labeled close button and visible focus styling.
- [x] Without a configured endpoint, disable sending and show the Romanian explanation that submission is unavailable. Ensure the form cannot fall back to a GET request containing personal data.
- [x] With a valid HTTPS endpoint, prevent default submission, run native validation, disable duplicate submissions while pending, and post the documented JSON payload. Invalid endpoint configuration also leaves sending unavailable.
- [x] On failure, show an accessible error and preserve all field values. On success, display confirmed receipt; never use unconditional success or local storage. Reenable controls after completion.
- [x] Run tests against two builds: default endpoint absent, and `PUBLIC_FORM_ENDPOINT=https://forms.example.test/submit`. Mock the latter with Playwright route interception for 2xx, 4xx, 5xx and connection failure; never contact a real form service.
- [x] Commit the dialog, submission behavior, and tests.

### Task 5: Prepare and verify GitHub Pages builds

**Files:** `.github/workflows/build.yml`, `.github/workflows/deploy-pages.yml`, `scripts/check-build.mjs`, `tests/deployment.spec.ts`, config and README deployment sections.

**Interfaces:** `PUBLIC_SITE_URL=https://vladstoriesofdata.github.io`; `PUBLIC_BASE_PATH=/carteaimaginatie.ro/` for repository Pages. Root custom-domain builds use the selected custom origin and `/`. No CNAME is generated by default.

- [x] Add a deployment test that uses a base-path-aware Playwright `baseURL`, visits each content page, checks image responses, and follows internal navigation. The first run against hardcoded root paths must fail if any remain.
- [x] Ensure metadata, favicon, CSS, scripts, image URLs, document links, 404 navigation, robots, and sitemap all honor the base path. Build and preview both configurations sequentially.
- [x] Add a build scanner checking emitted asset references and runtime code for the original origin, Google Fonts requests, WordPress plugin scripts, and `/legacy/` references. External Gumroad/credit anchors are permitted; remote resource attributes and fetch calls are not.
- [x] Prepare CI to run `npm ci`, install Playwright Chromium, run behavior tests and both path configurations, scan the output, and upload the verified static build artifact.
- [x] Prepare Pages workflow with checkout, Node setup, clean install, verified static build, `actions/upload-pages-artifact`, and `actions/deploy-pages`. Grant `contents: read`, `pages: write`, and `id-token: write`. Deployment depends on successful checks and can run manually or on a reviewed future push to main.
- [x] Document repository settings needed to use GitHub Actions for Pages. Keep live deployment, custom-domain settings, DNS, and pushing separate from this local rebuild.
- [x] Commit deployment preparation and path verification.

### Task 6: Verify visual fidelity and complete the local handoff

**Files:** `tests/site.spec.ts`, `docs/verification.md`, `README.md`, targeted fixes in owned source files.

**Interfaces:** Verification report records the tested routes, viewport dimensions, build configurations, command outcomes, visual differences, and form-service limitation.

- [x] Track browser network requests while opening all content routes, all categories and the dialog. Confirm same-origin resources only; external anchors do not load until clicked. Include CSS/font/background resources in this check.
- [x] Confirm all 34 images decode and natural dimensions are nonzero. Verify first-paint dimensions and no horizontal overflow at 375px, 768px, and 1440px widths:

```ts
expect(await page.evaluate(() =>
  document.documentElement.scrollWidth <= window.innerWidth
)).toBe(true);
```

- [x] Compare homepage, all categories, popup, About, and privacy views side by side with the captured reference. Fix observed differences, retaining accessibility and honest form behavior. Record any intentional differences.
- [x] Run the complete interaction suite, default and configured-endpoint tests, both static builds, and build scanner. Review fresh output rather than assuming earlier checks still pass.
- [x] Finish README commands, environment configuration, Pages instructions, and the form payload contract. Record any illustration-price/privacy content awaiting publication review.
- [x] Review the full diff against the approved specification. For native execution, request one independent final code review under the executing-plans workflow; resolve actionable findings and rerun affected checks.
- [x] Commit the verified local rebuild. Start and show a working local preview, report test/build results and remaining form-service limitations, and provide the repository handoff without changing the live reference site.

## Plan Self-Review

- Scope/routes/metadata: Tasks 2 and 3.
- Original local assets and reference capture: Tasks 1 and 2.
- Gallery, responsive fidelity, accessibility and dialog: Tasks 3, 4 and 6.
- Submission availability, real-response handling and privacy: Tasks 3 and 4.
- GitHub Pages, base paths, static-only delivery: Task 5.
- Runtime independence, asset integrity, README and preview: Tasks 5 and 6.
- Shared data and DOM names are defined above and used consistently by subsequent tasks.
- All five Review Focus cases are assigned explicit checks in their owning tasks.

## Execution Handoff

Recommended: native execution in this session. The tasks share one small static-site architecture, so keeping implementation in one context avoids unnecessary interface handoffs. Await user review of this plan and selection of native or subagent-driven execution before writing product code.


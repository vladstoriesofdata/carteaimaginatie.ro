# Cartea Imaginație

Standalone Romanian Astro recreation of Cartea Imaginație, ready for static GitHub Pages hosting. The original illustrations, fonts, icons, CSS and scripts are local. Production never loads resources or sends forms to the original WordPress site.

## Local development

Requires Node.js 22.12 or later (CI uses Node 24) and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/`. No environment file is needed for a root-path local preview.

```sh
npm run build
npm run preview
```

Astro 7 tracks the preview server; stop this project's preview with `npx astro preview stop` before changing to another build or port.

## Verification

```sh
npx playwright install chromium
npm run test:build
npm run build
npm run check:build
npm test
```

The browser suite checks category filtering, keyboard controls, dialogs, form behavior, content navigation, all illustrations, local network resources, responsive overflow, and metadata/base-path routes. Tests for the optional endpoint are skipped in the default build and run in a separately configured build using mocked responses only. CI checks both root and repository base paths with and without an endpoint.

PowerShell repository-path verification:

```powershell
$env:PUBLIC_SITE_URL = 'https://vladstoriesofdata.github.io'
$env:PUBLIC_BASE_PATH = '/carteaimaginatie.ro/'
npm run build
npm run check:build
npm test
```

To test the configured form, set `$env:PUBLIC_FORM_ENDPOINT = 'https://forms.example.test/submit'`, rebuild, and run the suite. This address is intercepted by browser tests; it must not be used as a real production endpoint. Clear test environment variables before creating a normal build.

## GitHub Pages

The prepared deployment defaults to `https://vladstoriesofdata.github.io/carteaimaginatie.ro/`.

1. Review and integrate the rebuild into `main`, then push it to GitHub.
2. In repository **Settings → Pages**, select **GitHub Actions** as the build source.
3. Run **Deploy GitHub Pages** manually, or let a push to `main` trigger it.
4. The workflow verifies root/repository builds and form behavior, then uploads the final static build and deploys it.

No backend adapter is used. `.nojekyll` is included. The build outputs only static pages and assets in `dist/`; `legacy/` and documentation are not deployed.

For a later custom domain, set repository variables `PUBLIC_SITE_URL` to the chosen HTTPS origin and `PUBLIC_BASE_PATH` to `/`, configure the Pages custom domain and DNS, then deploy again. The rebuild does not alter DNS or create a CNAME. See [Astro's GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/) for site/base configuration.

## Optional form service

By default the story dialog preserves the original fields and consent choices, but sending is unavailable. GitHub Pages cannot receive form submissions.

Set `PUBLIC_FORM_ENDPOINT` to a separate HTTPS JSON service through an environment file for local builds or a GitHub repository variable for deployment. This public endpoint is visible in HTML; never put a secret in it. The original site and its subdomains are rejected as endpoints. The service must support browser CORS for your deployed origin and accept:

```json
{
  "name": "Reader name",
  "email": "reader@example.test",
  "story": "The child's story",
  "illustration": false,
  "publicationConsent": false
}
```

A 2xx response means the service accepted the story. Non-2xx, network failures and a 15-second timeout show an error and retain the form values. Sending stores nothing in browser storage. The service must provide its own spam protection, consent handling and delivery/persistence; no service is provisioned here.

Review the preserved **12 EUR illustration price** before activating submissions or publishing. The original short privacy text is retained; confirm it still describes your chosen service before activation.

## Reference and structure

- `src/`: native Astro pages, components, scripts, focused CSS and gallery data.
- `public/`: 34 original gallery illustrations, three document illustrations, local fonts, SVG favicon and `.nojekyll`.
- `legacy/`: original HTML/CSS, source provenance and repeatable capture manifests, for inspection only.
- `docs/superpowers/`: approved specification and implementation plan.
- `tests/`: browser checks and build-scanner fixtures.

`npm run capture` re-downloads the publicly referenced assets and regenerates migration data. It is a maintenance command requiring access to the original site, never part of a normal build, CI, or runtime. Original artwork and content credits remain with Vlad Mihanta and Ina Socol; no ownership change is implied by this migration.

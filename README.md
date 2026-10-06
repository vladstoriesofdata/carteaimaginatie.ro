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

The browser suite checks category filtering, keyboard controls, dialogs, form behavior, content navigation, all illustrations, local network resources, responsive overflow, and metadata/base-path routes. Tests for Web3Forms run in a separately configured build using mocked responses only. CI checks both root and repository base paths with and without an access key.

PowerShell repository-path verification:

```powershell
$env:PUBLIC_SITE_URL = 'https://vladstoriesofdata.github.io'
$env:PUBLIC_BASE_PATH = '/carteaimaginatie.ro/'
npm run build
npm run check:build
npm test
```

To test the configured form, set `$env:PUBLIC_WEB3FORMS_ACCESS_KEY = '00000000-0000-4000-8000-000000000000'`, rebuild, and run the suite. Browser tests intercept Web3Forms requests; no email is sent. To test the disabled form when `.env.local` contains a key, set this variable to a single space before building and testing. Clear test environment variables before creating a normal build.

## GitHub Pages

The prepared deployment defaults to `https://vladstoriesofdata.github.io/carteaimaginatie.ro/`.

1. Review and integrate the rebuild into `main`, then push it to GitHub.
2. In repository **Settings → Pages**, select **GitHub Actions** as the build source.
3. Run **Deploy GitHub Pages** manually, or let a push to `main` trigger it.
4. The workflow verifies root/repository builds and form behavior, then uploads the final static build and deploys it.

No backend adapter is used. `.nojekyll` is included. The build outputs only static pages and assets in `dist/`; `legacy/` and documentation are not deployed.

For a later custom domain, set repository variables `PUBLIC_SITE_URL` to the chosen HTTPS origin and `PUBLIC_BASE_PATH` to `/`, configure the Pages custom domain and DNS, then deploy again. The rebuild does not alter DNS or create a CNAME. See [Astro's GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/) for site/base configuration.

## Web3Forms story submissions

The story dialog sends submissions directly from the browser to [Web3Forms](https://docs.web3forms.com/getting-started/api-reference), which delivers them to the email address associated with your access key. GitHub Pages needs no backend. Sending remains unavailable when the key is empty.

For local use, create `.env.local` (excluded from Git) with:

```env
PUBLIC_WEB3FORMS_ACCESS_KEY=your-access-key-here
```

Restart the dev server or rebuild the preview after changing the key. For deployment, add the same `PUBLIC_WEB3FORMS_ACCESS_KEY` under repository **Settings → Secrets and variables → Actions → Variables**, then run **Deploy GitHub Pages**. The workflow supplies it to the Astro build. Web3Forms access keys are designed for public browser use and appear in the generated HTML; use your form access key, not a private account credential.

The form posts JSON to `https://api.web3forms.com/submit`:

```json
{
  "access_key": "your-access-key-here",
  "subject": "O trăznaie nouă — Cartea Imaginație",
  "botcheck": false,
  "name": "Reader name",
  "email": "reader@example.test",
  "story": "The child's story",
  "illustration": false,
  "publicationConsent": false
}
```

A 2xx response with `success: true` confirms the story was accepted. Rejected or malformed responses, non-2xx responses, network failures and a 15-second timeout show an error and retain all form values. A hidden honeypot blocks submissions when checked. Both consent choices are included explicitly, and fields remain locked while sending. Sending stores nothing in browser storage.

After deployment, submit a short test story and check the inbox (including spam) associated with your key to confirm actual email delivery.

Review the preserved **12 EUR illustration price** before activating submissions or publishing. The original short privacy text is retained; confirm it still describes your chosen service before activation.

## Reference and structure

- `src/`: native Astro pages, components, scripts, focused CSS and gallery data.
- `public/`: 34 original gallery illustrations, three document illustrations, local fonts, original JPEG favicon and `.nojekyll`.
- `legacy/`: original HTML/CSS, source provenance and repeatable capture manifests, for inspection only.
- `docs/superpowers/`: approved specification and implementation plan.
- `tests/`: browser checks and build-scanner fixtures.

`npm run capture` re-downloads the publicly referenced assets and regenerates migration data. It is a maintenance command requiring access to the original site, never part of a normal build, CI, or runtime. Original artwork and content credits remain with Vlad Mihanta and Ina Socol; no ownership change is implied by this migration.

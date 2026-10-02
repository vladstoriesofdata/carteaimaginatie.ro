# Rebuild verification

Date: 2026-10-02. Branch: `astro-rebuild`.

## Results

- Static Astro build succeeds and emits four pages, robots.txt, sitemap, bundled client scripts, and local assets.
- Root build without a form service: 9 browser tests passed; 5 endpoint-specific tests skipped because the service is absent.
- Root build with mocked form service: 6 form tests passed; the default-unavailable test skipped.
- GitHub Pages repository base `/carteaimaginatie.ro/`: build and local-resource scanner passed; 9 browser tests passed without a service.
- Repository base with mocked form service: 13 browser tests passed; the default-unavailable test skipped.
- Future custom-domain root `https://carteaimaginatie.ro`: build, scanner and 9 browser tests passed. Metadata for the new hosting origin is allowed; remote resources remain forbidden.
- Build scanner fixtures: 6 passed, including local resources, remote image/font rejection, base paths, runtime references and custom-domain metadata.
- All 34 original gallery illustrations decode locally; all three categories and document pages were checked at 375px, 768px and 1440px without horizontal overflow or external resource requests.
- Form checks cover focus restoration, Escape, close button, unavailable sending, required values, email validity, payload and consent choices, successful response, 400/500 responses, and network failure.
- Local commits contain the source, lockfile, original assets, reference provenance, tests, and GitHub Pages workflows. No remote push or deployment has been performed.

Configuration-specific skips are paired with a separate build that runs those cases. There are 14 browser test cases and 6 build-scanner fixture cases. Platform color-environment warnings do not indicate test failures.

## Visual comparison

Compared the original and rebuilt desktop gallery, category views, About page, privacy illustration, and story popup. At 1280px, the gallery is 1120px wide with 560px masonry columns. Navigation geometry matches the original within subpixel font rounding. Images retain original aspect ratios and shortest-column placement. The original gallery uses 10px horizontal image margins and 20px bottom spacing; the native implementation follows those measurements.

Intentional differences: visible keyboard focus, semantic headings and image descriptions, a generated local favicon, a native dialog with internal scrolling to keep it usable within the viewport, and corrected mobile resizing overflow. The story dialog clearly explains unavailable sending instead of depending on WordPress. Local SVG social/action icons replace icon fonts and third-party widgets.

Preview screenshots are saved in `docs/screenshots/`. They are inspection artifacts and are not included in the deployed `dist/` output.

## Execution decisions

- Used the existing empty application workspace on a feature branch; this keeps delivery in the user's selected folder but does not provide a separate checkout.
- Used native Windows/Node progress bookkeeping instead of Unix-only skill helpers; verification evidence is retained here and in Git history.
- Used the current locked Astro 7 release rather than copying the reference project's older Astro 6 dependency; the static architecture is unchanged.
- Grouped foundation/gallery/dialog source into one runnable application commit to avoid incomplete intermediate imports.
- Corrected the original site's mobile resize overflow to satisfy the approved responsive requirement.

## Remaining activation steps

The GitHub workflows are prepared but cannot be verified on GitHub until pushed. The rebuild is still on a local feature branch. Enable GitHub Actions as the Pages source when publishing. A custom domain/DNS is a separate setting; no CNAME or DNS changes are included.

Sending remains disabled until an independent HTTPS form service is configured. Review the preserved 12 EUR illustration price and the original privacy text before enabling that service. No live form submissions were made during development.

Independent whole-branch review is the final remaining check.

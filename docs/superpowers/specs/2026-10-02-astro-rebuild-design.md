# Cartea Imaginație: standalone Astro rebuild

Date: 2026-10-02
Status: design approach approved; written specification awaiting review

## Goal and constraints

Recreate the public Cartea Imaginație website in this repository using static Astro, ready for GitHub Pages. Preserve the original appearance, Romanian content, artwork, and relevant interactions. Follow the migration workflow in `C:\Misc\storiesofdata.ro\storiesofdata.ro`: archived reference, native components, local assets, focused styling, interaction checks, and GitHub Actions.

The deployed site must have no runtime dependency on the original website. All rendered images, fonts, styles, icons, and scripts must be served from this build. WordPress, Elementor, Ninja Forms, jQuery, and original-site endpoints must not be used. Historical source URLs may appear only in documentation and migration manifests. External Gumroad and illustrator-credit links remain ordinary navigation links, not embedded resources.

## Scope and routes

| Route | Content |
| --- | --- |
| `/` | Original illustration gallery, category controls, floating actions, story dialog, About link |
| `/despre-proiect/` | Original project story, author and illustrator credit, return-to-gallery action |
| `/politica-de-confidentialitate/` | Original privacy text in a readable layout |
| `/404.html` | Small Romanian missing-page message and home link |

Keep trailing slashes for content pages. Include page titles, Romanian document language, descriptions, canonical links, favicon, sitemap, and robots.txt. Preserve privacy content while explicitly documenting any references to discontinued WordPress functionality for user review; do not invent new legal claims.

## Gallery and visual fidelity

Use the original 34 gallery illustrations: 25 in Călătoria, eight in Din carte, and one in Prieteni. Preserve per-category order and captions. Călătoria is initially selected. Preserve the original displayed tab labels, white background, dark active tab, amber floating actions, image aspect ratios, spacing, and responsive composition. The handwritten text embedded in the images stays intact.

Before finalizing CSS, inspect the original desktop and mobile geometry, category changes, hover states, image-click behavior, and popup dimensions. Implement only image-click interactions actually present in the reference. Recreate behavior with native browser controls and small TypeScript modules, without importing the old plugin runtime or its full stylesheet.

Store images and any required fonts locally. Record original source URLs, captions, categories, order, and dimensions in a migration manifest. Supply useful image descriptions. The first visible image loads eagerly; later images load lazily with explicit dimensions to reduce layout shifts. Prefer existing original artwork over generated substitutes.

## Architecture

- Static Astro with TypeScript and npm lockfile.
- Shared base layout owns metadata and local styles.
- Gallery data module owns category definitions and image records.
- Gallery component renders category controls and images.
- Floating-actions component renders submission, Gumroad, and relevant navigation.
- Native dialog component owns the story form and dialog controls.
- Focused styles handle gallery, document pages, dialog, and responsive behavior.
- Small client scripts handle filtering, keyboard navigation, and dialog/form behavior.
- `legacy/` contains original HTML and reference CSS and is never copied into `dist/`.

Use native accessible buttons for category controls. Expose selected state and make switching operable by keyboard. Dialog opening moves focus inside; Escape and close dismiss it; focus returns to the trigger. Controls must work with touch and visible keyboard focus. Respect reduced-motion preferences.

## Submission form

Preserve required name, email, and story fields, illustration-request checkbox, publication-permission checkbox, explanatory copy, and privacy/Gumroad links. GitHub Pages provides no form-processing backend.

Default behavior: the dialog can be opened and read, but sending is visibly unavailable until a separate endpoint is configured. Do not post to the original website, silently retain stories, or display simulated success. Keep original illustration-price wording as reference content, subject to user review before publication.

Optional `PUBLIC_FORM_ENDPOINT` supports a separately configured HTTPS service. An enabled form performs validation, exposes sending/error states, preserves values after errors, and confirms success only on a successful response. Keep this capability minimal and document the expected payload. Tests use a mocked endpoint and never submit data to the live reference site. No backend service setup is included in this rebuild.

## GitHub Pages

Produce static HTML and assets in `dist/`. Support both the repository URL under `/carteaimaginatie.ro/` and a later custom domain at `/`. Use a configured site URL and base path consistently for internal links, asset paths, metadata, and sitemap output. Default deployment targets the repository Pages URL; a custom domain is enabled only after the user supplies the desired host configuration. Do not create a CNAME or change DNS implicitly.

Prepare GitHub Actions with a build check and Pages deployment workflow. Use npm clean install and the committed lockfile. Run meaningful interaction checks and the static build before uploading the Pages artifact. Deployment can be triggered manually or by a future push to main. Actual publishing and repository Pages settings are handled after the rebuilt site has been reviewed.

No dual-language builds, Stories of Data analytics identifiers, unrelated integrations, or runtime hosting platform are required.

## Verification and acceptance

1. All three content routes build and load at both root and repository base paths.
2. Category switching shows exactly the intended images in the original order.
3. Dialog controls, Escape dismissal, focus return, and form validation work.
4. Without an endpoint, the form clearly explains unavailable sending and makes no submission request.
5. With a mocked endpoint, success and error states reflect the response correctly.
6. Local assets load without broken images or fonts; browser requests contain no original-site or asset-CDN requests.
7. Desktop and mobile views match the original gallery composition and controls, with no horizontal overflow.
8. About, privacy, and Gumroad navigation work; internal links honor the configured base path.
9. Build output contains no WordPress runtime, archived HTML, secrets, or dependency on the original site.
10. README explains local development, verification, Pages deployment, custom-domain configuration, and the optional form endpoint.

## Delivery

Deliver the source, original local assets, reference archive, design/implementation documents, automated checks, GitHub Pages workflows, and a working local preview. Report verified results and any remaining visual or form-service limitations. The original live site remains untouched during the rebuild.

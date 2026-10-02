# Cartea Imaginație reference analysis

Inspected: 2026-10-02. Source: https://carteaimaginatie.ro/.

## Existing site

The public site runs WordPress, Twenty Seventeen, Elementor, Essential Addons filterable gallery, and Ninja Forms. Its main content is original illustration images; handwritten story text is embedded in those images and should remain intact.

- Homepage: three gallery filters, with Călătoria selected initially.
- Călătoria: 25 illustrations in their original narrative order.
- Din carte: eight illustrations.
- Prieteni: one illustration, Noah & Luna.
- Floating actions: story submission and Gumroad; About link below the gallery.
- `/despre-proiect/`: Nati si ImagiNatie, project origin, author Vlad Mihanta, and illustrator Ina Socol credit.
- `/politica-de-confidentialitate/`: existing privacy page, linked from submission form.
- Submission popup: required name, email, story; illustration request and publication permission checkboxes; illustration price information; Gumroad and privacy links.

The original page documents have been saved in `legacy/`, together with the homepage Elementor stylesheet. These files are reference material, not production source.

## Workflow inspected

Reference project: `C:\Misc\storiesofdata.ro\storiesofdata.ro`.

It uses static Astro, npm with a lockfile, TypeScript, a legacy reference archive, focused styles and small interaction modules, local assets, documented migration decisions, Playwright interaction checks, and GitHub Actions for builds and GitHub Pages deployment. Its locale duplication and analytics configuration are specific to Stories of Data and do not apply to this Romanian-only site.

## Approved migration design

Rebuild the three public pages in static Astro. Preserve original artwork, gallery sequence, white canvas, dark selected tab, amber floating controls, captions, About copy, credits, Gumroad destination, and privacy text. Download gallery images into local public assets and record source URLs and dimensions in a data manifest. Keep archived WordPress code outside the deployed output.

Use reusable layout, gallery, floating actions, and story-dialog components with focused CSS. Reimplement category switching and popup behavior without WordPress, Elementor, jQuery, or Ninja Forms runtime dependencies. Verify original image-click behavior before deciding whether a lightbox is necessary. Provide keyboard operability, dialog focus management, Escape dismissal, image descriptions, responsive layouts, and lazy loading below the first viewport.

Keep form submission dependent on an explicit `PUBLIC_FORM_ENDPOINT`, as in the reference migration. Without an endpoint, explain that sending is unavailable and never display a false success. Preserve form fields and consent choices. Do not submit test data to the original site.

Provide canonical metadata, sitemap, robots.txt, favicon, a 404 page, local preview, build checks, and GitHub Pages workflow preparation. Test gallery switching, dialog controls, validation, navigation, asset loading, and desktop/mobile rendering. Publishing, DNS changes, and live form activation remain separate steps once the local clone is reviewed.

## Alternatives considered

1. Native Astro recreation (recommended): preserves the presentation while replacing the legacy plugin runtime.
2. Embed the captured WordPress page: initially closer markup, but retains fragile legacy dependencies and form coupling.
3. Redesign: unnecessary for the user's request to clone the existing site.

## Remaining inspection

Confirmed desktop gallery: maximum 1120px, two shortest-height masonry columns, 10px padding per image. Categories stay fixed at the top; selected tab uses #333. Mobile uses one column. Original resizing occasionally overflows; the rebuild corrects this to meet the approved requirement.

Image clicks do not open a lightbox. Hover shows captions and Facebook/Pinterest share controls. Submission popup is approximately 720px wide on desktop, with 48px inputs and a 200px textarea. About has a centered cover image, amber heading/button, and original text; mobile uses alternate cover artwork. Privacy has one illustration and the complete short policy, with no obsolete WordPress clauses. Runtime Google Fonts are replaced by six local TTF files. Reference capture is repeatable with `npm run capture`.

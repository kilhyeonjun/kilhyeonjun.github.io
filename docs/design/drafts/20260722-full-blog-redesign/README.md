# KilPenguin full-blog redesign — 2026-07-22

## Scope

Extended the approved KilPenguin Field Notes homepage system across every public page family without changing post routes or content ordering.

- Blog archive and pagination
- Category and tag indexes/details
- Series index/detail
- Article masthead, prose, mobile/desktop TOC, code copy, Mermaid, tags, navigation, comments
- New indexable About page
- Field Notes 404 page
- Shared header/footer navigation

## Design decisions

- One reusable `ArchiveHeader` establishes eyebrow, title, deck, and factual count hierarchy.
- `BlogCard` is now an editorial row rather than a repeated floating card.
- Article content keeps the existing readable max-width while adding a Field Note masthead and denser prose rhythm.
- No invented metrics, dates, or reading values. Reading time remains derived from post content.
- About uses public-safe identity only; no employer claims or unverified achievements.
- `/about/` is now a real page, eliminating the Pagefind malformed redirect artifact.

## TDD evidence

- RED 1: archive contract failed because `ArchiveHeader.astro` did not exist.
- GREEN 1: all seven archive page families use the shared header and wide editorial layout.
- RED 2: article contract failed because the editorial article shell was absent.
- GREEN 2: masthead, deck, prose treatment, TOC, navigation, comments, and 44px copy control implemented.
- RED 3: supporting-page contract failed because `src/pages/about.astro` did not exist.
- GREEN 3: About, 404, and About navigation implemented; redirect removed.
- Browser RED: article category target measured 126×14px and Giscus CSS was blocked by CSP.
- Browser GREEN: article target is at least 44px; Giscus stylesheet allowed.
- Independent audit RED: mobile hid Categories, Series, Tags, and About; Resume looked selected on every route.
- Independent audit GREEN: a 44px mobile disclosure exposes all primary routes, the current section uses `aria-current`, and Resume is a neutral external action.
- Runtime RED: Mermaid initialization produced an unhandled `firstChild` rejection from duplicate startup calls.
- Runtime GREEN: Mermaid loading is single-flight and render promises are awaited/caught.

## Verification

- `npm run build`: PASS, 182 generated pages.
- Pagefind: 179 indexed pages; previous `/about/` outer-HTML warning removed.
- `npm run verify:blog`: PASS, 112 posts; 71 pre-existing content warnings.
- `scripts/verify-homepage-redesign.py`: PASS.
- `scripts/verify-full-blog-redesign.py`: PASS.
- DESIGN.md lint: 0 errors, 0 warnings.
- Added-line security scan: PASS.
- Browser matrix: 11 representative routes × desktop 1440px and mobile 390px.
  - HTTP 200 on all routes
  - `scrollWidth === clientWidth`
  - visible non-prose targets below 44×44px: 0
  - mobile TOC targets below 44×44px: 0
  - console/page errors: 0
- Visual read completed for Blog, article, Series, About, and 404 at desktop/mobile; no blocking or high-severity issue remained.

## Artifacts

- `blog-{desktop,mobile}.png`
- `article-{desktop,mobile}.png`
- `series-{desktop,mobile}.png`
- `about-{desktop,mobile}.png`
- `404-{desktop,mobile}.png`

## Boundary

Changes are committed locally after design approval. No push or production deployment was performed.

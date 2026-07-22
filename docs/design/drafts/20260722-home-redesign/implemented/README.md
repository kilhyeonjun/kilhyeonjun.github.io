# Implemented Astro preview

## Source changes

- `src/pages/index.astro`: responsive Field Notes homepage using content collection data.
- `src/layouts/BaseLayout.astro`: `wide` opt-in, KilPenguin navigation, shared footer.
- `src/components/SearchDialog.astro`: 44px search target.
- `src/components/ThemeToggle.astro`: 44px theme target.
- `scripts/verify-homepage-redesign.py`: focused TDD contract.

## Data behavior

- `latestPost` always follows the newest published content.
- The exchange article is pinned as the featured system-design deep dive.
- Recent rows exclude the latest and featured entries to avoid duplication.
- No invented metrics or reading times.

## Verification

- TDD RED: focused contract initially failed on the missing hero statement.
- TDD GREEN: homepage contract passes.
- Responsive bug RED: browser QA detected two 40px header buttons; focused contract was extended and failed.
- Responsive bug GREEN: search/theme controls now render at 44×44px and the contract passes.
- `npm run build`: PASS, 181 pages generated, Pagefind indexed 178 pages.
- `npm run verify:blog`: PASS, 112 posts checked; 71 pre-existing content warnings.
- Browser preview at 1440×1000 and 390×844:
  - `scrollWidth === clientWidth`
  - visible page targets below 44×44px: 0
  - visible Pagefind controls/results below 44×44px: 0
  - search dialog opens
  - search returns results and exposes `aria-labelledby="search-dialog-title"`
  - dark-mode toggle applies
  - console/page errors: 0
- `/blog/` and `/series/` preview routes: 200 with no mobile overflow or console errors.
- Resume links use the absolute independently deployed GitHub Pages project URL; live `https://kilhyeonjun.github.io/resume/` returns 200.
- Independent review blockers fixed: external Resume routing, true 44×44 targets, named search dialog, and the featured description typo.
- Static added-line security scan: no hardcoded secret, shell injection, eval/exec, or unsafe deserialization findings.

## Screenshots

- `desktop.png`: 1440px implementation render.
- `mobile.png`: 390px implementation render.

## Boundary

No commit, push, GitHub Pages deployment, or production change was performed.

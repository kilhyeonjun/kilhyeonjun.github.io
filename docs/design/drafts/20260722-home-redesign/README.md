# KilPenguin homepage redesign — 2026-07-22

## Goal

Replace the current centered title + repeated article-card homepage with a credible backend-engineering portfolio and editorial technical notebook.

## Selected direction

**KilPenguin Field Notes**

- Asymmetric 7/5 hero: public-safe role statement + factual latest-note panel.
- One strong featured system-design note instead of five equal cards.
- Compact editorial recent-log rows.
- Inter-style UI hierarchy with monospace metadata.
- Deep ink `#111827`, blue `#2563EB`, paper `#F8FAFC`, tiny amber signal.
- CSS/SVG system-flow motif; no stock imagery, gradients, glass, fake metrics, or fake read times.

## Generator evidence

- Stitch project: `13730139481395053006`
- Model: `GEMINI_3_1_PRO`
- Design system: `assets/142d76301c404b9ca3440ebae1e26aba`
- Desktop R0: `8833e7c9890549f9887c32b480ddd153`
- Mobile R0: `7ce0f5016e224bdda2cd162b97c67e83`
- Desktop R1: `ea5d5d181d4f421ca05c51d475103e52`
- Mobile R1: `af411d321f68468590047ebd72b1e402`
- Independent FAL image lane was attempted but unavailable with HTTP 402; it is not claimed as a completed candidate.
- Taste runtime was not present on this host, so the final independent lane is a local, implementation-friendly HTML synthesis rather than a claimed Taste generation.

## Iteration evidence

- Baseline production: 5 major issues — generic identity, weak first-viewport proof, repeated cards, low editorial rhythm, no distinctive technical motif.
- R0: 8 unique violations — invented/placeholder dates, fake read-time/category metadata, faint diagram, microscopic full-page density, weak focus panel, overlong mobile page, bottom mobile nav, mobile diagram clutter.
- R1: factual data and structure corrected; remaining generated-output risk was implementation fidelity.
- Final local synthesis: 0 blocking visual violations after desktop/mobile image read.

## Final score

- Hierarchy: 10/10
- Composition: 9/10
- Typography & density: 9/10
- Mood originality: 9/10
- Functional fit: 10/10
- Total: **47/50**

## Verification

- `npx -y @google/design.md lint DESIGN.md`: 0 errors, 0 warnings.
- Rendered with Chromium/Playwright at 1440×1100 and 390×844.
- Desktop screenshot: 1440×1904.
- Mobile screenshot: 390×2523.
- DOM metric probe:
  - Desktop: `clientWidth=1425`, `scrollWidth=1425`.
  - Mobile: `clientWidth=375`, `scrollWidth=375`.
  - Mobile undersized visible targets: none; the only `<44px` result is the off-canvas skip link before focus.
- Mobile top navigation visibly includes KP, Blog, Resume, search, and theme.
- No bottom fixed navigation.
- Static mockup has no network/API dependency. Search and theme controls are visual-only at this stage.

## Artifacts

- `DESIGN.md`
- `docs/design/drafts/20260722-home-redesign/final/index.html`
- `docs/design/drafts/20260722-home-redesign/final/desktop-1440.png`
- `docs/design/drafts/20260722-home-redesign/final/mobile-390.png`
- `docs/design/drafts/20260722-home-redesign/stitch/desktop-r0.{html,png}`
- `docs/design/drafts/20260722-home-redesign/stitch/mobile-r0.{html,png}`

## Boundary

This run created local draft artifacts only. It did not modify the Astro production source, commit, push, or deploy.

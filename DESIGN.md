---
version: alpha
name: KilPenguin Field Notes
description: A credible backend-engineering portfolio and technical notebook with editorial clarity, system-diagram cues, and a restrained penguin identity.
colors:
  primary: "#111827"
  secondary: "#475569"
  accent: "#2563EB"
  accent-strong: "#1D4ED8"
  accent-soft: "#DBEAFE"
  signal: "#F59E0B"
  surface: "#F8FAFC"
  surface-raised: "#FFFFFF"

  text-inverse: "#FFFFFF"
typography:
  display:
    fontFamily: Inter
    fontSize: 4rem
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  h1:
    fontFamily: Inter
    fontSize: 2.75rem
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  h2:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  sm: 6px
  md: 12px
  lg: 20px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.pill}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 12px
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  chip:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-strong}"
    rounded: "{rounded.pill}"
    padding: 8px
  badge-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 8px
---

## Overview

KilPenguin Field Notes combines a senior backend engineer's evidence-driven portfolio with an editorial technical notebook. The homepage must explain who Hyeonjun is, what he builds, and what readers can learn within the first viewport. The penguin identity should appear as a compact monogram and subtle geometric motif, not a mascot illustration.

## Colors

- Deep ink `#111827` carries headlines and technical authority.
- Electric blue `#2563EB` is the only primary interaction color.
- Amber `#F59E0B` appears sparingly for live/status or highlighted evidence.
- Cool paper `#F8FAFC` and white create depth without excessive card borders.
- Light blue `#DBEAFE` is reserved for topical labels and selected states.

## Typography

Use Inter for Korean and English UI with tight display spacing. JetBrains Mono is limited to taxonomy, timestamps, issue-style numbers, and system-design metadata. Avoid oversized generic SaaS headlines; the title should feel editorial and concrete.

## Layout

Desktop uses a 1200px container and asymmetric 7/5 hero grid. The hero includes identity and action on the left, current focus/evidence on the right. Below it, feature one flagship article, then a compact list of recent writing and topic routes. Mobile becomes one column with 20px gutters and 44px minimum targets. No horizontal overflow.

## Elevation & Depth

Prefer surface contrast, 1px borders, and one low blue-tinted shadow. Do not stack multiple floating cards or use glassmorphism. The page should read like a maintained engineering notebook.

## Shapes

Use 12–20px radii for containers and pill shapes only for chips/actions. A small square `KP` mark and fine grid lines may reference architecture diagrams.

## Components

- Header: `KP / KilPenguin`, Blog, Series, Resume, search, theme; compact sticky behavior.
- Hero: concrete role statement, proof points, primary resume CTA, secondary writing CTA.
- Focus panel: current study series, article count, last updated date, and a small system-flow motif.
- Featured article: title, thesis, metadata, reading-time cue, and one visual diagram fragment.
- Recent list: editorial rows rather than five identical full-width cards.
- Topic routes: System Design, Backend Engineering, Career & Growth.
- Footer: identity, GitHub, RSS, and concise copyright.

## Do's and Don'ts

- Do lead with Hyeonjun's backend focus and written evidence.
- Do expose latest update and series depth for trust.
- Do preserve current information architecture and URLs.
- Do support light/dark mode and reduced motion.
- Don't use gradients, glass cards, neon, generic dashboard widgets, fake metrics, stock imagery, or oversized empty hero space.
- Don't claim company impact or production metrics not present in public source.

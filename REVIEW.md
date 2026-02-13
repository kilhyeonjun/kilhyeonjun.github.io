# Blog Project Comprehensive Review

> **Date**: 2026-02-13
> **Project**: kilhyeonjun-blog (Astro 5 + Tailwind CSS v4 + MDX)
> **URL**: https://kilhyeonjun.github.io
> **Total Score**: 64 / 80 (80%)

---

## Score Summary

| # | Category | Score | Status |
|---|----------|-------|--------|
| 1 | Code Quality | 7 / 10 | Good |
| 2 | Design / UX | 8 / 10 | Good |
| 3 | SEO | 7 / 10 | Good |
| 4 | Performance | 6 / 10 | Needs Work |
| 5 | Feature Verification | 9 / 10 | Excellent |
| 6 | Content Quality | 6 / 10 | Needs Work |
| 7 | Deployment | 8 / 10 | Good |
| 8 | Bugs / Issues | 5 / 10 | Needs Work |

---

## 1. Code Quality (7/10)

### Strengths
- TypeScript strict mode enabled (`tsconfig.json` extends `astro/tsconfigs/strict`)
- Clean component interfaces with `interface Props` on every component
- Zod schema validation for content collections (`content.config.ts`)
- Single responsibility principle generally followed - components are focused
- Utility functions properly extracted (`src/lib/utils.ts`)

### Issues

#### Critical
| Issue | File | Line | Detail |
|-------|------|------|--------|
| `@ts-ignore` suppressing type check | `SearchDialog.astro` | 42 | Pagefind import lacks type declarations |
| Missing error handling on font fetch | `og/[...slug].png.ts` | 6-12 | Build fails if CDN is down; no try-catch |
| Non-null assertion without validation | `TOC.astro` | 77 | `link.dataset.headingSlug!` could be undefined |
| DOM manipulation without null check | `BlogPostLayout.astro` | 72-88 | `block.parentNode?.insertBefore()` chain |

#### Warning
| Issue | File | Detail |
|-------|------|--------|
| Theme logic duplicated | `BaseLayout.astro` (49-62) + `ThemeToggle.astro` (35-43) | Identical `getTheme()` in two places |
| Post sorting duplicated 5x | `index.astro`, `blog/index.astro`, `[tag].astro`, `[category].astro`, `rss.xml.ts` | Same `.sort()` comparator everywhere |
| Date formatting inline | `series/index.astro` (43), `series/[name].astro` (53), `BlogPostLayout.astro` (18-28) | `formatDate()` utility exists but not always used |
| MutationObserver never disconnected | `Comments.astro` | 50-57 | Memory leak on page transitions |
| Scroll listener never removed | `TOC.astro` | 115-123 | Memory leak on page transitions |
| ThemeToggle listeners never cleaned up | `ThemeToggle.astro` | 60-71 | Event listener accumulation |
| Unsafe type cast | `ThemeToggle.astro` | 37 | `localStorage.getItem('theme') as 'light' \| 'dark'` without validation |
| Unused `slug` prop | `Comments.astro` | 2-6 | Prop accepted but never used in template |

#### Recommendations
1. Create `src/types/pagefind.d.ts` with proper type declarations for `@pagefind/default-ui`
2. Extract `getTheme()` and `sortPostsByDate()` to `src/lib/utils.ts`
3. Wrap font fetches in try-catch with fallback
4. Add Astro lifecycle cleanup for all event listeners: `document.addEventListener('astro:before-swap', cleanup)`

---

## 2. Design / UX (8/10)

### Strengths
- Clean, modern design with Tailwind CSS v4 + Typography plugin
- Dark mode fully implemented with system preference detection and manual toggle
- Responsive navigation (Categories/Series hidden on mobile via `sm:block`)
- Consistent color system using `primary-*` scale (blue-based)
- Smooth transitions (`transition-colors duration-200`)
- Focus-visible styles for accessibility (`global.css` lines 80-84)
- Selection color styling for both light/dark modes
- Sticky header with backdrop blur for modern feel
- Code copy button on hover (progressive enhancement)
- Scroll spy on TOC with active heading highlight

### Issues

#### Warning
| Issue | Detail |
|-------|--------|
| No pagination on blog list | 60+ posts render in a single page (`blog/index.astro`) |
| TOC sidebar uses hardcoded positioning | `style="left: calc(50% + 24rem);"` may break on unusual viewports |
| No loading states | Search dialog and comments have no loading indicators |
| Empty div placeholders | `PostNavigation.astro` uses `<div />` when no prev/next post |

#### Minor
| Issue | Detail |
|-------|--------|
| No skip-to-content link | Keyboard users must tab through full nav |
| No 404 page | Missing custom `src/pages/404.astro` |
| About page is redirect only | `about.astro` just redirects to `/resume/` via meta refresh |

#### Recommendations
1. Add pagination (10-15 posts per page) to `blog/index.astro`
2. Add `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>` before header
3. Create a custom 404 page
4. Replace meta refresh redirect with Astro redirect config

---

## 3. SEO (7/10)

### Strengths
- Canonical URL properly constructed on every page (`BaseLayout.astro` line 14-15, 25)
- Open Graph meta tags comprehensive: `og:type`, `og:url`, `og:title`, `og:description`, `og:image`
- Twitter Card meta tags: `summary_large_image` with title, description, image
- Dynamic OG image generation with satori (1200x630, Korean font support)
- Sitemap auto-generated via `@astrojs/sitemap` integration
- RSS feed at `/rss.xml` with Korean language tag
- RSS link in `<head>` for auto-discovery
- Site URL correctly configured: `https://kilhyeonjun.github.io`

### Missing
| Issue | Impact | Priority |
|-------|--------|----------|
| No `robots.txt` | Search engines use defaults; no sitemap reference | High |
| No JSON-LD structured data | No rich snippets in search results (BlogPosting, BreadcrumbList) | High |
| No `twitter:site` / `twitter:creator` | Twitter cards lack author attribution | Medium |
| No `author` meta tag | Author not identified to search engines | Low |
| og:image missing for non-blog pages | Homepage, tags, categories, series pages have no OG image | Medium |
| No `og:locale` meta tag | Language not signaled to social platforms | Low |

### Recommendations
1. Create `/public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://kilhyeonjun.github.io/sitemap-index.xml
   ```
2. Add JSON-LD schema to `BlogPostLayout.astro`:
   ```html
   <script type="application/ld+json">
   { "@context": "https://schema.org", "@type": "BlogPosting", ... }
   </script>
   ```
3. Add default OG image for non-blog pages
4. Add `<meta name="author" content="kilhyeonjun" />`

---

## 4. Performance (6/10)

### Strengths
- Static site generation (SSG) - optimal for GitHub Pages
- Dynamic import for Pagefind UI (loads only when search opened)
- Giscus comments loaded with `async` + `data-loading="lazy"`
- Preconnect hints for Google Fonts and gstatic
- `display=swap` on Google Fonts (prevents invisible text)
- Tailwind CSS v4 with Vite plugin (efficient tree-shaking)
- Shiki dual-theme syntax highlighting (no extra JS bundle)
- OG images cached with `max-age=31536000, immutable`

### Issues

#### Critical
| Issue | Detail | Impact |
|-------|--------|--------|
| No image optimization | Zero usage of Astro's `<Image>` component; all images are raw `<img>` via markdown | No WebP conversion, no responsive srcset, no lazy loading |
| 62MB of unoptimized images in `/public/images/` | PNG/JPG files served as-is | Slow page loads on image-heavy posts |
| No lazy loading on content images | MDX images load eagerly | Bad LCP/CLS on image-heavy posts |

#### Warning
| Issue | Detail |
|-------|--------|
| Google Fonts loaded render-blocking | `<link rel="stylesheet" href="...fonts.googleapis.com...">` blocks render |
| No font preload | Only `preconnect`, no `preload` for critical fonts |
| No `dns-prefetch` for giscus.app | Giscus script requires DNS lookup on every blog post |
| OG font fetched from CDN at build time | `og/[...slug].png.ts` fetches fonts from jsdelivr; no local fallback |
| No blog list pagination | 60+ posts rendered in single DOM on `/blog/` |

#### Minor
| Issue | Detail |
|-------|--------|
| No service worker | No offline support |
| No resource hints for internal navigation | No `<link rel="prefetch">` for likely next pages |

### Recommendations
1. **High priority**: Convert images to WebP and add responsive sizes
   - Use Astro's `<Image>` component or build-time optimization
   - Add `loading="lazy"` to below-fold images
2. **Medium**: Self-host Inter and JetBrains Mono fonts (remove Google Fonts dependency)
3. **Medium**: Add `<link rel="dns-prefetch" href="https://giscus.app" />`
4. **Low**: Consider Astro prefetch integration for internal links

---

## 5. Feature Verification (9/10)

### Search (Pagefind) - Working
- Build script runs `npx pagefind --site dist` after Astro build
- Lazy-loaded via dynamic import when dialog opens
- Keyboard shortcut `Cmd/Ctrl+K` to toggle
- Dark mode styling via CSS custom properties
- Backdrop click to close
- ESC key to close (native dialog behavior)

### Comments (Giscus) - Working
- Configured with GitHub Discussions (repo: `kilhyeonjun/kilhyeonjun.github.io`)
- Dark mode synced via MutationObserver watching `<html>` class changes
- Korean language (`data-lang="ko"`)
- Lazy loading enabled
- Reactions enabled

### TOC (Table of Contents) - Working
- Mobile: collapsible `<details>` element
- Desktop: fixed sidebar at xl breakpoint with scroll spy
- Filters headings to depth 2-3
- Active heading highlighted with border and color change
- Scroll spy uses `requestAnimationFrame` for performance

### Series / Categories / Tags - Working
- Series: ordered list with numbered badges, sorted by order field
- Categories: grid layout with post counts, supports encoded URLs
- Tags: tag cloud with counts, sorted by frequency
- All pages properly filter draft posts

### RSS - Working
- `/rss.xml` with title, description, language (ko)
- Sorted by publish date, links to blog posts
- Auto-discovery link in `<head>`

### Post Navigation - Working
- Previous/next post links on every blog post
- Chronologically ordered

### OG Image Generation - Working
- Dynamic PNG generation with satori + resvg
- Korean font support (Noto Sans KR 400/700)
- Responsive font size (40px for long titles, 48px for short)
- Category badge and date shown

### Issue
| Issue | Detail |
|-------|--------|
| Mermaid diagrams not rendered | Posts contain mermaid syntax in plain code blocks (no `\`\`\`mermaid` fence), displayed as raw text |

> Found in: `tistory-41` (6 diagrams), `tistory-40` (7 diagrams), `tistory-33` (3 diagrams), `tistory-34` (2 diagrams)
> Total: ~18 mermaid diagrams rendering as plain text

### Recommendation
- Install `rehype-mermaid` or `remark-mermaid` plugin to render diagrams
- Or convert mermaid blocks to use proper ` ```mermaid ` fences and add client-side mermaid.js

---

## 6. Content Quality (6/10)

### Overview
- **Total posts**: ~60+ MDX files
- **Sources**: Tistory migration (~41), Gatsby migration (~20+), Original
- **Schema**: Well-defined with Zod validation

### Strengths
- Frontmatter schema validation catches missing fields at build time
- Tistory posts (recent) have excellent quality: complete frontmatter, structured content, proper headings
- `source` and `originalUrl` fields preserve migration provenance
- Series metadata properly structured with name + order

### Issues

#### Critical
| Issue | Files Affected | Detail |
|-------|---------------|--------|
| Mermaid diagrams as raw text | 4 posts, ~18 diagrams | Fenced as plain code blocks, not rendered as diagrams |
| Markdown table rendering broken | `tistory-41`, `tistory-40` | Tables use raw text format instead of proper markdown tables |
| Minimal/stub posts | `python-2021-09-08-python-base.mdx` (19 lines) | Essentially empty; should be marked as draft |

#### Warning
| Issue | Count | Detail |
|-------|-------|--------|
| Generic image alt text (`![img]`) | 53 occurrences in 15 files | All legacy/Gatsby posts use `![img]` instead of descriptive alt text |
| Code blocks with tilde fences (`~~~`) | Multiple Gatsby-era posts | Should be backtick fences for consistency |
| Code blocks with wrong language | `go-*.mdx` files | Go code labeled as `~~~javascript` |
| Emoji rendering issues | `tistory-33`, `tistory-41` | Emoji characters (`?`, `?`, `?`) not rendering (show as `?`) |

#### Verified Working
| Check | Status |
|-------|--------|
| Image paths exist | All `/images/legacy/*` and `/images/tistory/*` referenced images verified |
| Frontmatter completeness | All required fields present across sampled posts |
| No HTML entity artifacts | No `&amp;`, `&lt;`, `&gt;` found |
| No orphaned HTML tags | No raw `<div>`, `<p>` remnants from migration |
| Date format consistency | All dates use YYYY-MM-DD format |
| Heading hierarchy | Generally correct H1 > H2 > H3 |

### Recommendations
1. Fix mermaid diagrams (install plugin or convert to images)
2. Batch-replace `![img]` with descriptive alt text across 15 files
3. Mark `python-2021-09-08-python-base.mdx` as `draft: true`
4. Fix Go code blocks labeled as `javascript`
5. Convert tilde fences (`~~~`) to backtick fences (` ``` `)

---

## 7. Deployment (8/10)

### Strengths
- GitHub Actions CI/CD pipeline (`deploy.yml`) - clean and well-structured
- Two-job pipeline: `build` -> `deploy` with proper dependency
- `npm ci` for reproducible builds
- Node.js 20 with npm caching
- `actions/configure-pages@v5` for GitHub Pages integration
- `concurrency` group prevents parallel deploys with `cancel-in-progress: false` (safe)
- `workflow_dispatch` for manual deploys
- Proper permissions scoped (`contents: read`, `pages: write`, `id-token: write`)
- Pagefind indexing included in build script

### Issues
| Issue | Priority | Detail |
|-------|----------|--------|
| No type checking in CI | Medium | No `astro check` or `tsc` step before build |
| No linting in CI | Low | No ESLint or similar quality gate |
| No build size monitoring | Low | No size regression detection |
| No preview environment | Low | No staging/preview deployments for PRs |
| No security headers | Low | Missing CSP, HSTS, X-Frame-Options (GitHub Pages limitation) |

### Recommendations
1. Add `astro check` step before build in `deploy.yml`
2. Consider adding Lighthouse CI for performance regression checks
3. Add build artifact size reporting

---

## 8. Bugs / Issues (5/10)

### Active Bugs

| # | Severity | Description | Location |
|---|----------|-------------|----------|
| 1 | **Critical** | 18 mermaid diagrams display as raw text | `tistory-33`, `tistory-34`, `tistory-40`, `tistory-41` |
| 2 | **Critical** | OG image build fails if jsdelivr CDN is down (no error handling) | `og/[...slug].png.ts:6-12` |
| 3 | **High** | Emoji characters rendering as `?` in multiple tistory posts | `tistory-33`, `tistory-41` |
| 4 | **High** | No `robots.txt` - search engines lack crawl directives | Missing file |
| 5 | **Medium** | Memory leaks from uncleared event listeners/observers | `Comments.astro`, `TOC.astro`, `ThemeToggle.astro` |
| 6 | **Medium** | 60+ posts on single page with no pagination | `blog/index.astro` |
| 7 | **Medium** | Go code blocks labeled as `javascript` | `go-*.mdx` files |
| 8 | **Medium** | `about.astro` uses meta refresh redirect instead of proper redirect | `about.astro` |
| 9 | **Low** | `@ts-ignore` in SearchDialog for Pagefind import | `SearchDialog.astro:42` |
| 10 | **Low** | 53 images with generic `![img]` alt text | 15 legacy MDX files |
| 11 | **Low** | No custom 404 page | Missing `src/pages/404.astro` |
| 12 | **Low** | Unused `slug` prop in Comments component | `Comments.astro:2-6` |

---

## Priority Action Plan

### Immediate (P0) - This Week
1. Create `/public/robots.txt` with sitemap reference
2. Add try-catch to font fetches in `og/[...slug].png.ts`
3. Install mermaid plugin or convert diagrams to images
4. Fix emoji encoding issues in tistory posts

### Short-term (P1) - This Month
5. Add JSON-LD structured data to `BlogPostLayout.astro`
6. Add event listener cleanup to `Comments`, `TOC`, `ThemeToggle`
7. Add pagination to blog list page
8. Create custom 404 page
9. Fix Go code block language labels
10. Add `astro check` to CI pipeline

### Medium-term (P2) - Next Sprint
11. Image optimization pipeline (WebP conversion, responsive images)
12. Self-host fonts (remove Google Fonts dependency)
13. Extract duplicated code (theme logic, sort functions, date formatting)
14. Batch-fix generic image alt text in legacy posts
15. Add Pagefind type declarations

### Long-term (P3) - Backlog
16. Add Lighthouse CI to deployment pipeline
17. Mark stub posts as draft or expand content
18. Add skip-to-content link
19. Replace meta refresh redirect with Astro config redirect
20. Consider adding service worker for offline support

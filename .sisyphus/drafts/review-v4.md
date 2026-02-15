# REVIEW-v4 Draft — Findings

## v2 issues resolved
- P0-1 이미지 최적화: RESOLVED (62MB→11MB WebP, src/assets 이동)
- P0-2 View Transitions: RESOLVED (astro:page-load 적용)
- P1-1 Google Fonts: RESOLVED (fontsource 전환)
- P1-2 about.astro redirect: RESOLVED (astro redirects)
- P1-3 formatDate 중복: RESOLVED (utils.ts 통합)
- P1-4 sort mutation: RESOLVED ([...posts].sort 패턴)
- P1-5 RSS content: PARTIALLY (TODO 주석 남아있음, raw body 전달)
- P1-6 OG 폰트: RESOLVED (로컬 fs.readFileSync)
- P1-7 CSP: RESOLVED (meta tag, PROD only)
- P1-8 Skip-to-content: RESOLVED
- P2-1 View Transitions: RESOLVED (ClientRouter 사용)
- P2-2 Pagefind @ts-ignore: RESOLVED (pagefind.d.ts 생성)
- P2-3 Copy 버튼 try-catch: RESOLVED
- P2-4 MDX lazy loading: RESOLVED (rehypeLazyImages 플러그인)
- P2-5 getPublishedPosts: RESOLVED
- P2-6 og:image 비포스트: PARTIALLY (defaultOgImage = /favicon.svg)
- P2-7 WebSite schema: RESOLVED
- P2-8 Node 22: RESOLVED
- P2-9 Giscus strict: RESOLVED (data-strict="1")
- P2-10 resume 통합: N/A (removed from repo)

## New findings
- public/images/tistory/24/img.gif 1.7MB GIF 남아있음
- src/assets/images/tistory/19/ 에 PNG 1개 남아있음 (8KB)
- /images/tistory/24/img.gif - public에서 서빙되는 GIF (MDX에서 참조)
- mermaid 코드블록 3개 파일 — 렌더링 미지원
- 이미지 alt 텍스트 모두 비어있음
- @astrojs/check 미설치 (devDeps 아님, CI에서 npx로 매번 설치)
- RSS content가 raw MDX body
- CSP에 connect-src 'self' — pagefind가 fetch 사용하므로 OK
- Comments cleanup 이벤트 `once: true` 있지만 astro:page-load 밖에서 등록 (potential issue)

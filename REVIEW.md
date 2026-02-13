# Code Review: kil-penguin blog (v2)

> **Date**: 2026-02-13
> **Project**: kilhyeonjun-blog — Astro 5.x + Tailwind CSS v4 + MDX
> **URL**: https://kilhyeonjun.github.io
> **Deployment**: GitHub Pages via Actions
> **Scope**: 전체 소스코드 (src/, public/, .github/, config)

---

## Executive Summary

전반적으로 **잘 구조화된 Astro 5.x 블로그**입니다. Content Collection + Zod 스키마, 동적 OG 이미지 생성(satori), Pagefind 검색, Giscus 댓글, 시리즈/카테고리/태그 시스템 등 기술 블로그에 필요한 기능을 빠짐없이 갖추고 있습니다.

가장 시급한 문제는 **62MB 이미지 미최적화**(P0)와 **View Transitions 미대응 스크립트 패턴**(P0)이며, 그 외 폰트 셀프호스팅, 코드 중복 제거, RSS 개선 등이 필요합니다.

> **이전 리뷰(v1) 오류 정정**:
> - ~~"No robots.txt"~~ → `public/robots.txt` 존재 (sitemap 참조 포함) ✅
> - ~~"No JSON-LD structured data"~~ → `BlogPostLayout.astro`에 `BlogPosting` JSON-LD 완비 ✅
> - ~~"No custom 404 page"~~ → `src/pages/404.astro` 존재 ✅
> - ~~"No pagination on blog list"~~ → `[...page].astro`에 페이지네이션 구현됨 (15개/페이지) ✅
> - ~~"No event listener cleanup"~~ → 3개 컴포넌트 모두 `astro:before-swap` cleanup 구현됨 ✅
> - ~~"OG image build fails if CDN is down"~~ → try-catch + fallback 이미 구현됨 ✅
> - ~~"No astro check in CI"~~ → `deploy.yml`에 `npx astro check` step 존재 ✅
> - ~~"Unused slug prop in Comments"~~ → Comments 컴포넌트에 props 없음 (빈 frontmatter) ✅

| 등급 | 건수 | 설명 |
|------|------|------|
| **P0 (심각)** | 2 | 즉시 수정 필요 — 심각한 성능 문제 |
| **P1 (중요)** | 8 | 조기 수정 권장 — 성능/SEO/접근성에 유의미한 영향 |
| **P2 (개선)** | 10 | 품질 향상 — 코드 정리, 베스트 프랙티스 적용 |

---

## P0 — 심각 (Critical)

### P0-1. 이미지 미최적화 — 62MB PNG 원본 그대로 서빙

**위치**: `public/images/` (143개 이미지 파일)

`public/` 디렉토리의 이미지들이 **최적화 없이 원본 PNG로 서빙**됩니다.

```
5.0M  tistory/1/e68e896a-bd59-40eb-ae1e-45b68e6396db.png
3.4M  tistory/40/Gemini_Generated_Image_ypi3lcypi3lcypi3.png
2.4M  tistory/36/img.png
2.1M  tistory/39/Gemini_Generated_Image_uctcqbuctcqbuctc.png
2.1M  tistory/34/img.png
1.8M  tistory/2/img_3.png
```

**영향**:
- 총 **62MB** 이미지가 최적화/리사이즈 없이 배포
- 5MB PNG → WebP 변환 시 ~200KB 수준으로 감축 가능
- Lighthouse Performance 점수에 직접 악영향 (LCP 지연)
- 모바일 사용자에게 과도한 데이터 소비

**권장 수정**:
1. `public/images/` → `src/assets/images/`로 이동 후 Astro `<Image />` 컴포넌트 사용 (자동 WebP 변환 + 리사이즈 + lazy loading)
2. MDX 내 `![](/images/...)` → `<Image />` 컴포넌트로 마이그레이션
3. 또는 빌드 스크립트에서 `sharp`로 일괄 WebP 변환

---

### P0-2. 클라이언트 스크립트 — View Transitions 비호환 패턴

**위치**: `ThemeToggle.astro`, `SearchDialog.astro`, `TOC.astro`

3개 컴포넌트의 스크립트가 모듈 최상위에서 DOM을 직접 조회합니다:

```typescript
// ThemeToggle.astro (line 31-33)
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');

// SearchDialog.astro (line 31)
function initSearch() {
  const trigger = document.getElementById('search-trigger');
}
initSearch();

// TOC.astro (line 73)
function initScrollSpy() { ... }
initScrollSpy();
```

**문제점**:
- `astro:before-swap` cleanup은 있으나, **`astro:page-load`에서 재초기화 코드가 없음**
- View Transitions 활성화 시 페이지 전환 후 DOM 교체로 모든 참조가 `null`이 됨
- 현재 View Transitions 미사용이라 문제가 숨어 있지만, 활성화 즉시 **테마 토글/검색/TOC 모두 동작 중단**

**권장 수정**:
```typescript
document.addEventListener('astro:page-load', () => {
  // DOM 조회 + 이벤트 리스너 등록을 여기서 수행
});
```

---

## P1 — 중요 (Important)

### P1-1. Google Fonts 렌더 블로킹

**위치**: `src/layouts/BaseLayout.astro` (line 42-47)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

**영향**:
- 외부 CSS `<link>`는 **렌더 블로킹 리소스** — FCP/LCP 지연
- 2개 외부 도메인 연결 필요 (DNS + TLS 핸드셰이크 x2)
- `display=swap`은 FOUT만 허용, CSS 로드 자체는 여전히 블로킹

**권장 수정**:
1. `@fontsource/inter` + `@fontsource/jetbrains-mono`로 셀프호스팅 (외부 의존성 제거)
2. 또는 `<link rel="preload" as="style">` + JS 비동기 로드 패턴

---

### P1-2. `about.astro` — `<meta http-equiv="refresh">` 리다이렉트

**위치**: `src/pages/about.astro`

```html
<meta http-equiv="refresh" content="0;url=/resume/" />
```

**문제점**:
- SEO 비우호적 — 301 리다이렉트보다 약한 시그널
- 접근성 가이드라인 위반 — 사용자 동의 없는 자동 리다이렉트
- BaseLayout 미사용 → `<html lang>`, 다크모드, 공통 스타일 모두 없음

**권장 수정**:
```javascript
// astro.config.mjs
export default defineConfig({
  redirects: { '/about': '/resume/' },
});
```

---

### P1-3. `formatDate` 함수 5곳 중복

**위치**: `src/lib/utils.ts`, `BlogPostLayout.astro`, `BlogCard.astro`, `series/index.astro`, `series/[name].astro`

```typescript
// utils.ts에 이미 존재하는 함수
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// 동일 로직이 4곳에서 인라인으로 반복됨
```

**권장**: `formatDate()`를 import하여 사용. 5곳의 중복을 1곳으로 통합.

---

### P1-4. `Array.sort()` in-place mutation 패턴

**위치**: `[...slug].astro`, `[...page].astro`, `categories/[category].astro`, `tags/[tag].astro`

```typescript
const sortedPosts = posts.sort(
  (a, b) => a.data.publishDate.valueOf() - b.data.publishDate.valueOf()
);
```

**문제점**: `.sort()`는 원본 배열을 **in-place 변경**. SSG에서는 각 페이지가 독립적이라 치명적이진 않지만 위험한 패턴.

**권장**: `[...posts].sort(...)` 또는 `.toSorted(...)` 사용. `utils.ts`에 `sortPostsByDateAsc()` 추가.

---

### P1-5. RSS에 content 필드 미포함

**위치**: `src/pages/rss.xml.ts`

RSS 항목에 본문 content가 없어 RSS 리더에서 요약만 표시.

**권장**: `@astrojs/rss`의 `content` 옵션으로 렌더된 HTML 제공.

---

### P1-6. OG 이미지 — 빌드 시 외부 CDN 의존 + `@latest` 버전

**위치**: `src/pages/og/[...slug].png.ts` (line 18-21)

```typescript
fetchFont('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.woff'),
```

**문제점**:
- try-catch fallback은 있으나 OG 이미지 품질이 저하됨
- `@latest` 태그 → 재현 불가능한 빌드

**권장**: 폰트 파일을 로컬에 포함 후 `fs.readFileSync`로 로드.

---

### P1-7. CSP(Content Security Policy) 헤더 미설정

**위치**: 전역

현재 CSP가 없어 XSS 공격 시 외부 스크립트 주입 방어 불가.

**권장**:
```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
  script-src 'self' 'unsafe-inline' https://giscus.app;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  frame-src https://giscus.app;" />
```

---

### P1-8. Skip-to-content 링크 미구현

**위치**: `src/layouts/BaseLayout.astro`

키보드 사용자가 네비게이션의 모든 링크를 탭해야 본문에 도달. WCAG 2.4.1 위반.

**권장**: `<a href="#main-content" class="sr-only focus:not-sr-only ...">본문으로 건너뛰기</a>` 추가.

---

## P2 — 개선 (Enhancement)

### P2-1. View Transitions 미사용

Astro 5.x의 `<ViewTransitions />` 미사용. 페이지 전환 시 풀 리로드.

**권장**: P0-2 해결 후 도입.

---

### P2-2. Pagefind `@ts-ignore` 사용

**위치**: `src/components/SearchDialog.astro` (line 42)

**권장**: `src/types/pagefind.d.ts` 타입 선언 추가.

---

### P2-3. Copy 버튼 — `navigator.clipboard` 에러 처리 없음

**위치**: `src/layouts/BlogPostLayout.astro` (line 110-114)

HTTP 환경이나 미지원 브라우저에서 무음 실패. try-catch 추가 권장.

---

### P2-4. MDX 이미지에 `loading="lazy"` 미적용

`![](/images/...)` → 일반 `<img>` 태그로 렌더. `loading="lazy"` 자동 적용 안됨.

**권장**: remark/rehype 플러그인으로 자동 주입.

---

### P2-5. `getCollection` 호출 패턴 통합

거의 모든 페이지에서 동일한 호출 반복.

**권장**: `getPublishedPosts()` 유틸 함수 추출.

---

### P2-6. 비포스트 페이지에 og:image 미설정

카테고리, 태그, 시리즈 목록 페이지에 OG 이미지 없음.

**권장**: 기본 OG 이미지 설정.

---

### P2-7. Structured Data 확장 — WebSite schema 미적용

홈페이지에 `WebSite` + `SearchAction` schema 없음.

---

### P2-8. GitHub Actions — Node.js 22 업그레이드

현재 Node 20 → LTS 22로 업데이트 권장.

---

### P2-9. Giscus `data-strict="0"` — 느슨한 URL 매칭

경로 변경 시 댓글 유실 가능. `data-strict="1"` 권장.

---

### P2-10. resume 페이지 — Astro 통합 미완

`public/resume/`는 별도 HTML. Astro 다크모드/스타일 없음.

---

## 잘한 점 (Strengths) ✅

| 항목 | 상세 |
|------|------|
| **Content Collection + Zod** | 타입 안전한 frontmatter 검증. `source`, `series`, `draft`, `cover` 등 유연한 스키마 |
| **Canonical URL** | 모든 페이지에 올바른 설정 |
| **JSON-LD Structured Data** | `BlogPosting` 완비 (author, publisher, keywords, articleSection, wordCount) |
| **다크모드 FOUC 방지** | `is:inline` 스크립트로 렌더 전 클래스 적용 |
| **OG 이미지 자동 생성** | satori + resvg, 한국어 폰트 지원, CDN fallback |
| **Pagefind 검색** | Lazy load, Cmd/Ctrl+K, 다크모드 CSS 변수 대응 |
| **이벤트 cleanup** | `astro:before-swap`에서 모두 리스너 정리 |
| **접근성 기초** | `aria-label`, semantic HTML, `focus-visible` |
| **Sitemap + RSS + robots.txt** | SEO 3종 세트 완비 |
| **페이지네이션** | 15개/페이지 paginate |
| **시리즈/카테고리/태그** | 3가지 분류 체계 완비 |
| **TOC** | 모바일 details + 데스크탑 sidebar + scroll spy |
| **코드 복사 버튼** | 동적 주입, hover 표시, 복사 피드백 |
| **404 페이지** | 커스텀 디자인 |
| **CI/CD** | Type check → Build → Deploy |
| **Tailwind v4** | `@theme`, `@custom-variant`, `@plugin` 네이티브 문법 |
| **Shiki 듀얼 테마** | 라이트/다크 코드 하이라이팅 |

---

## 우선순위 로드맵

```
즉시 (P0):
├── P0-1: 이미지 최적화 (Astro <Image /> 또는 빌드 시 WebP 변환)
└── P0-2: 스크립트를 astro:page-load 패턴으로 전환

1~2주 내 (P1):
├── P1-1: Google Fonts → fontsource 셀프호스팅
├── P1-2: about.astro → Astro redirects 설정
├── P1-3: formatDate 중복 제거 (5곳 → 1곳)
├── P1-4: .sort() → .toSorted() 전환
├── P1-5: RSS content 필드 추가
├── P1-6: OG 폰트 로컬화 + 버전 고정
├── P1-7: CSP 메타 태그 추가
└── P1-8: Skip-to-content 링크 추가

시간 여유 시 (P2):
├── P2-1~10: View Transitions, 타입 선언, lazy loading 등
```

---

## 수치 요약

| 항목 | 값 |
|------|-----|
| 소스 파일 수 (src/) | ~20개 |
| 콘텐츠 파일 수 | ~70개 (.mdx) |
| 이미지 파일 수 | 143개 |
| 이미지 총 크기 | **62MB** (미최적화) |
| 외부 스크립트 | giscus.app |
| 외부 CSS | Google Fonts |
| 빌드 스텝 | astro check → build → pagefind → deploy |
| 배포 | GitHub Pages (Node 20) |

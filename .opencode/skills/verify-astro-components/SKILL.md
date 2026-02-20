---
name: verify-astro-components
description: Astro 컴포넌트, 레이아웃, 페이지의 구조적 패턴과 규칙을 검증합니다. 새 페이지/컴포넌트 추가 또는 레이아웃 변경 후 사용.
---

# Astro 컴포넌트 검증

## Purpose

1. **레이아웃 계층 구조** — 모든 페이지가 BaseLayout을 사용하고, 블로그 포스트가 BlogPostLayout을 사용하는지 검증
2. **컴포넌트 Props 인터페이스** — 컴포넌트가 타입 안전한 Props 인터페이스를 정의하는지 검증
3. **SEO 메타 태그** — 페이지가 적절한 title, description, OG 메타 태그를 포함하는지 검증
4. **다크모드 지원** — Tailwind의 dark: 변형을 사용하여 다크모드가 일관되게 적용되는지 검증
5. **이벤트 리스너 정리** — astro:page-load 이벤트 리스너가 astro:before-swap에서 정리되는지 검증

## When to Run

- 새 Astro 페이지 또는 컴포넌트를 추가한 후
- BaseLayout 또는 BlogPostLayout을 수정한 후
- 글로벌 스타일(`src/styles/global.css`)을 변경한 후
- 네비게이션 또는 SEO 관련 코드를 변경한 후

## Related Files

| File | Purpose |
|------|---------|
| `src/layouts/BaseLayout.astro` | 기본 레이아웃 (HTML head, header, footer, 테마, mermaid) |
| `src/layouts/BlogPostLayout.astro` | 블로그 포스트 레이아웃 (JSON-LD, 코드 복사 버튼) |
| `src/components/BlogCard.astro` | 블로그 목록 카드 컴포넌트 |
| `src/components/TOC.astro` | 목차 컴포넌트 (모바일 collapsible + 데스크탑 사이드바) |
| `src/components/Comments.astro` | Giscus 댓글 컴포넌트 |
| `src/components/ThemeToggle.astro` | 다크모드 토글 버튼 |
| `src/components/SearchDialog.astro` | Pagefind 검색 다이얼로그 |
| `src/components/PostNavigation.astro` | 이전/다음 포스트 네비게이션 |
| `src/pages/index.astro` | 홈페이지 |
| `src/pages/blog/[...slug].astro` | 블로그 포스트 상세 페이지 |
| `src/pages/blog/[...page].astro` | 블로그 목록 페이지 (페이지네이션) |
| `src/pages/categories/index.astro` | 카테고리 목록 |
| `src/pages/categories/[category].astro` | 카테고리별 포스트 목록 |
| `src/pages/tags/index.astro` | 태그 목록 |
| `src/pages/tags/[tag].astro` | 태그별 포스트 목록 |
| `src/pages/series/index.astro` | 시리즈 목록 |
| `src/pages/series/[name].astro` | 시리즈별 포스트 목록 |
| `src/pages/404.astro` | 404 에러 페이지 |
| `src/pages/og/[...slug].png.ts` | OG 이미지 생성 엔드포인트 |
| `src/pages/rss.xml.ts` | RSS 피드 엔드포인트 |
| `src/styles/global.css` | 글로벌 스타일 (Tailwind 설정, 다크모드, prose) |
| `astro.config.mjs` | Astro 설정 (remark/rehype 플러그인, Shiki, sitemap) |

## Workflow

### Step 1: 레이아웃 계층 구조 검증

**파일:** `src/pages/**/*.astro`

**검사:** 모든 .astro 페이지 파일이 BaseLayout 또는 BlogPostLayout을 import하여 사용하는지 확인합니다.

```
Grep: pattern="import BaseLayout" path="src/pages" include="*.astro"
Grep: pattern="import BlogPostLayout" path="src/pages" include="*.astro"
```

모든 페이지가 두 레이아웃 중 하나를 사용해야 합니다. BlogPostLayout은 내부적으로 BaseLayout을 사용합니다.

**PASS:** 모든 페이지가 BaseLayout 또는 BlogPostLayout을 사용
**FAIL:** 레이아웃 없이 직접 HTML을 렌더링하는 페이지 존재

**수정:** 해당 페이지에서 BaseLayout을 import하고 감싸줍니다.

### Step 2: BaseLayout Props 전달 검증

**파일:** `src/pages/**/*.astro`

**검사:** BaseLayout을 사용하는 모든 페이지가 필수 prop인 `title`을 전달하는지 확인합니다.

```
Grep: pattern="<BaseLayout" path="src/pages" include="*.astro"
```

각 매칭에서 `title=` prop이 포함되어 있는지 확인합니다.

**PASS:** 모든 BaseLayout 사용처에 title prop이 존재
**FAIL:** title prop이 누락된 BaseLayout 사용처 존재

### Step 3: 다크모드 일관성 검증

**파일:** `src/components/*.astro`, `src/layouts/*.astro`, `src/pages/**/*.astro`

**검사:** `bg-white` 또는 `bg-gray-*00` 클래스를 사용하는 곳에 대응하는 `dark:bg-*` 클래스가 있는지 확인합니다.

```
Grep: pattern="bg-white(?!.*dark:)" path="src/components" include="*.astro"
Grep: pattern="bg-white(?!.*dark:)" path="src/layouts" include="*.astro"
Grep: pattern="text-gray-900(?!.*dark:)" path="src/components" include="*.astro"
```

**PASS:** 모든 배경색/텍스트색에 다크모드 대응이 존재
**FAIL:** 다크모드 대응이 누락된 스타일 발견

**수정:** 누락된 `dark:` 변형을 추가합니다.

### Step 4: 이벤트 리스너 정리 검증

**파일:** `src/components/*.astro`, `src/layouts/*.astro`

**검사:** `astro:page-load` 이벤트에서 등록하는 이벤트 리스너가 `astro:before-swap`에서 정리되는지 확인합니다. ClientRouter를 사용하므로 메모리 누수 방지를 위해 필수입니다.

```
Grep: pattern="astro:page-load" path="src/components" include="*.astro"
Grep: pattern="astro:before-swap" path="src/components" include="*.astro"
```

`astro:page-load`를 사용하는 파일이 `astro:before-swap`도 사용하는지 비교합니다.

**PASS:** 모든 page-load 리스너에 대응하는 before-swap 정리가 존재
**FAIL:** before-swap 정리가 누락된 이벤트 리스너 존재

**수정:** `document.addEventListener('astro:before-swap', () => { /* cleanup */ }, { once: true })` 패턴을 추가합니다.

### Step 5: getStaticPaths 존재 검증

**파일:** `src/pages/**/*.astro` (동적 경로만)

**검사:** 동적 경로 파일(`[...slug]`, `[tag]`, `[category]`, `[name]`, `[...page]`)이 `getStaticPaths`를 export하는지 확인합니다.

```
Glob: pattern="src/pages/**/*[*.astro"
```

각 동적 경로 파일에서:
```
Grep: pattern="getStaticPaths" path="<file>"
```

**PASS:** 모든 동적 경로 파일이 getStaticPaths를 export
**FAIL:** getStaticPaths가 누락된 동적 경로 파일 존재

### Step 6: BlogCard 사용 일관성 검증

**파일:** `src/pages/**/*.astro`

**검사:** 블로그 포스트 목록을 렌더링하는 페이지가 BlogCard 컴포넌트를 사용하는지 확인합니다.

```
Grep: pattern="import BlogCard" path="src/pages" include="*.astro"
```

블로그 목록 페이지들: `blog/[...page].astro`, `categories/[category].astro`, `tags/[tag].astro`, `index.astro`

**PASS:** 모든 목록 페이지가 BlogCard를 일관되게 사용
**FAIL:** 직접 카드 마크업을 작성하거나 다른 컴포넌트를 사용하는 페이지 존재

### Step 7: Astro 설정 일관성 검증

**파일:** `astro.config.mjs`

**검사:** 필수 설정이 올바르게 구성되어 있는지 확인합니다.

```
Read: astro.config.mjs
```

확인 항목:
- `site` 설정이 존재하고 유효한 URL인지
- `mdx()` 통합이 포함되어 있는지
- `sitemap()` 통합이 포함되어 있는지
- `tailwindcss()` Vite 플러그인이 포함되어 있는지
- Shiki 테마 설정에 light/dark 쌍이 있는지

**PASS:** 모든 필수 설정이 올바르게 구성
**FAIL:** 필수 설정이 누락되거나 잘못됨

## Output Format

| # | 파일 | 검사 | 상태 | 상세 |
|---|------|------|------|------|
| 1 | `src/pages/new-page.astro` | 레이아웃 사용 | FAIL | BaseLayout import 없음 |
| 2 | `src/components/New.astro` | 다크모드 | FAIL | `bg-white`에 대응하는 `dark:` 없음 |

## Exceptions

1. **API 엔드포인트 파일** — `.ts` 파일인 `rss.xml.ts`, `og/[...slug].png.ts`는 HTML을 렌더링하지 않으므로 레이아웃 사용 검증에서 면제
2. **inline 스크립트의 다크모드** — `<script is:inline>` 내부에서 직접 DOM으로 다크모드를 처리하는 것은 Tailwind 패턴과 별개이므로 면제
3. **Pagefind CSS 변수** — SearchDialog의 CSS 변수 기반 테마 처리는 Tailwind dark: 패턴과 다른 방식이지만 정상적인 구현
4. **BlogPostLayout의 BaseLayout 포함** — BlogPostLayout이 내부적으로 BaseLayout을 사용하므로, BlogPostLayout을 사용하는 페이지는 BaseLayout을 직접 import하지 않아도 됨

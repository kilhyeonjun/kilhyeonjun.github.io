# 블로그 마크다운 테이블 렌더링 문제 분석 보고서

> 분석일: 2026-02-14
> 분석 범위: src/content/ 전체 75개 MDX 파일, astro.config.mjs, CSS, 빌드 결과물

---

## 1. 요약 (Executive Summary)

**핵심 문제**: 블로그 글에서 마크다운 테이블이 렌더링되지 않는 이유는 **두 가지 독립적인 문제가 동시에 존재**하기 때문입니다.

| # | 문제 | 심각도 | 상태 |
|---|------|--------|------|
| A | 마이그레이션 스크립트(Turndown)가 HTML `<table>`을 마크다운 표로 변환하지 못함 | **CRITICAL** | 근본 원인 |
| B | Astro MDX 설정에 `remark-gfm` 플러그인이 누락되어 있음 | **HIGH** | 설정 누락 |
| C | CSS에 테이블 전용 스타일이 없음 (prose 기본값에 의존) | **LOW** | 부가적 |

**결론**: 문제 A가 근본 원인입니다. Turndown 라이브러리가 Tistory HTML의 `<table>`을 마크다운 표 문법(`| col | col |`)으로 변환하지 않고, 각 셀을 별도 `<p>` 태그로 출력했습니다. 그 결과 소스 MDX 파일에 마크다운 표 문법이 **전혀 존재하지 않습니다**.

---

## 2. 상세 분석

### 2.1 소스 파일 분석 — 마크다운 표 문법 부재

**검색 방법**: `src/content/` 내 75개 MDX 파일에서 마크다운 표 문법(`| col | col |` + `|---|---|`) 검색

**결과**: **0건**. 마크다운 테이블 문법을 사용하는 글이 단 하나도 없습니다.

파이프(`|`) 문자가 존재하는 곳은 모두:
- Java 코드 블록 내부의 catch문 (`catch (RuntimeException | Error e)`)
- Mermaid 다이어그램 문법 (`A -->|label| B`)
- URL 내 구분자

### 2.2 깨진 테이블 패턴 — 영향받는 글 6개

Tistory 원본에서 HTML `<table>`이었던 콘텐츠가 **각 셀이 별도 문단으로 변환**되어 있습니다.

#### 영향받는 파일 목록

| # | 파일명 | 깨진 테이블 수 | 테이블 내용 |
|---|--------|---------------|------------|
| 1 | `tistory-41-가면사배-시리즈-2-...규모-추정...mdx` | 4개 | 데이터 단위표, 시간 단위표, 응답 지연시간표, 검증 체크리스트표 |
| 2 | `tistory-40-가면사배-시리즈-1-...규모-확장성...mdx` | 1~2개 | 확장성 관련 비교표 |
| 3 | `tistory-18-필터filter-vs-인터셉터interceptor.mdx` | 1개 | Filter vs Interceptor 비교표 (구분/관리 컨테이너/처리 시점/용도) |
| 4 | `tistory-35-bigquery-storage-read-api...mdx` | 1~2개 | API 비교표, 타입 매핑표 |
| 5 | `tistory-36-dependabot으로-의존성-관리...mdx` | 1개 | Dependabot 설정 비교표 |
| 6 | `tistory-37-ai-시대-개발자는-어떻게...mdx` | 1~2개 | 역할/접근법 비교표 |

#### 깨진 형태 예시 (tistory-41, 73~132행)

**현재 소스 (깨진 상태)**:
```
단위

2의 제곱수

대략적인 값

실제 값

실무 예시

1KB

2^10

~1천

1,024

짧은 텍스트 파일, JSON 응답
```

**원래 의도된 형태 (마크다운 테이블)**:
```markdown
| 단위 | 2의 제곱수 | 대략적인 값 | 실제 값 | 실무 예시 |
|------|-----------|-----------|--------|----------|
| 1KB  | 2^10      | ~1천       | 1,024  | 짧은 텍스트 파일, JSON 응답 |
| 1MB  | 2^20      | ~1백만     | 1,048,576 | 고화질 사진, 작은 동영상 |
```

#### 빌드 결과 확인 (dist/)

빌드 후 HTML에서 해당 부분은 `<table>` 태그가 아닌 **연속된 `<p>` 태그**로 출력됩니다:

```html
<p>단위</p>
<p>2의 제곱수</p>
<p>대략적인 값</p>
<p>실제 값</p>
<p>실무 예시</p>
<p>1KB</p>
<p>2^10</p>
...
```

`dist/` 전체에서 `<table>` 태그 검색 결과: **0건**

### 2.3 근본 원인 — Turndown 마이그레이션 스크립트

**파일**: `scripts/migrate-tistory.ts`

**원인**: Turndown 라이브러리는 기본적으로 HTML `<table>`을 **마크다운 테이블로 변환하지 않습니다**. Turndown의 기본 동작은 테이블 내 각 셀의 텍스트만 추출하여 별도 줄로 출력합니다.

마이그레이션 스크립트에는 `tistoryFigure`, `tistoryCodeBlock`, `tistoryParagraph`, `tistoryHr` 등 커스텀 Turndown 규칙이 있지만, **테이블 변환 규칙(`turndown-plugin-gfm`)이 누락**되어 있습니다.

```typescript
// migrate-tistory.ts - 현재 커스텀 규칙들
turndown.addRule('tistoryFigure', ...);      // ✅ 이미지
turndown.addRule('tistoryCodeBlock', ...);   // ✅ 코드 블록
turndown.addRule('tistoryParagraph', ...);   // ✅ 단락
turndown.addRule('tistoryHr', ...);          // ✅ 구분선
// ❌ 테이블 규칙 없음! — turndown-plugin-gfm 미사용
```

### 2.4 Astro 설정 — remark-gfm 누락

**파일**: `astro.config.mjs`

**현재 상태**:
- `markdown.remarkPlugins`: 없음 (remark-gfm 미설정)
- `markdown.rehypePlugins`: `[rehypeLazyImages]`만 존재
- MDX 통합에도 별도 remark 설정 없음

**package.json 분석**:
- `remark-gfm`은 `dependencies`에 **없음**
- `package-lock.json`에만 `remark-gfm@^4.0.1` 존재 (다른 패키지의 간접 의존성)

**영향**: 설령 MDX 파일에 마크다운 표 문법이 있더라도, MDX 파일(.mdx)에서는 remark-gfm이 명시적으로 설정되어야 GFM 테이블이 파싱됩니다. (Astro 5.x의 .md 파일은 기본 GFM 지원, .mdx는 별도 설정 필요)

### 2.5 CSS 스타일 — 테이블 스타일 부재

**파일**: `src/styles/global.css`

- `@tailwindcss/typography` v0.5.19 플러그인이 `@plugin` 지시자로 로드됨
- `prose` 클래스가 `BlogPostLayout.astro:72`에서 적용됨
- **테이블 전용 CSS 규칙은 없음** (prose 기본 스타일에 의존)

이 문제는 심각도가 낮습니다. `@tailwindcss/typography`의 `prose` 클래스는 기본적으로 테이블 스타일을 포함합니다. 다만 반응형(overflow) 처리나 세밀한 스타일링을 위해 추가 CSS가 필요할 수 있습니다.

---

## 3. 수정 방안

### 방안 A: 기존 글 수동/반자동 복구 (필수)

깨진 6개 글의 테이블을 마크다운 표 문법으로 복구해야 합니다.

**접근법 1 — 수동 복구**:
- 6개 파일의 깨진 테이블 섹션을 직접 마크다운 표 문법으로 재작성
- 원본 Tistory URL을 참고하여 정확한 데이터 확인

**접근법 2 — 반자동 복구**:
- Tistory 원본 HTML을 다시 가져와서 `<table>` 부분만 추출
- turndown-plugin-gfm으로 변환하여 해당 섹션 교체

### 방안 B: 마이그레이션 스크립트 수정 (향후 마이그레이션 대비)

```typescript
// migrate-tistory.ts에 추가
import { gfm } from 'turndown-plugin-gfm';

function createTurndownService(): TurndownService {
  const turndown = new TurndownService({ ... });
  
  // GFM 플러그인 적용 (테이블, 취소선, 작업 목록 지원)
  turndown.use(gfm);
  
  // ... 기존 커스텀 규칙들
}
```

**필요 패키지**: `npm install turndown-plugin-gfm`

### 방안 C: remark-gfm 플러그인 설정 (필수)

```bash
npm install remark-gfm
```

```javascript
// astro.config.mjs
import remarkGfm from 'remark-gfm';

export default defineConfig({
  // ...
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeLazyImages],
    // ...
  },
});
```

> **참고**: `@astrojs/mdx` 통합은 기본적으로 글로벌 `markdown` 설정을 상속합니다. 별도의 MDX 설정은 불필요합니다.

### 방안 D: 테이블 CSS 스타일 추가 (권장)

```css
/* src/styles/global.css에 추가 */

/* 테이블 반응형 래퍼 (prose 내부) */
.prose table {
  @apply w-full text-sm;
}

.prose thead th {
  @apply bg-gray-50 dark:bg-gray-800/50;
}

.prose tbody tr {
  @apply border-b border-gray-200 dark:border-gray-700;
}

/* 테이블 가로 스크롤 (모바일 대응) */
.prose :where(table) {
  display: block;
  overflow-x: auto;
}
```

---

## 4. 우선순위 및 실행 순서

| 순서 | 작업 | 우선순위 | 이유 |
|------|------|---------|------|
| 1 | remark-gfm 설치 및 astro.config.mjs 설정 (방안 C) | **HIGH** | MDX에서 GFM 테이블 파싱 가능하게 함 |
| 2 | 깨진 6개 글 테이블 복구 (방안 A) | **HIGH** | 실제 독자에게 보이는 콘텐츠 품질 |
| 3 | 테이블 CSS 스타일 추가 (방안 D) | **MEDIUM** | 시각적 완성도 |
| 4 | 마이그레이션 스크립트 수정 (방안 B) | **LOW** | 향후 마이그레이션 대비 |

---

## 5. 검증 방법

수정 후 다음 명령으로 검증:

```bash
# 1. 빌드
npx astro build

# 2. dist에서 <table> 태그 존재 확인
grep -rl '<table' dist/blog/

# 3. 특정 글에서 테이블 렌더링 확인
grep '<table\|<th\|<td' dist/blog/tistory-41-*/index.html

# 4. 개발 서버에서 시각적 확인
npx astro dev
# → http://localhost:4321/blog/tistory-41-... 접속하여 표 렌더링 확인
```

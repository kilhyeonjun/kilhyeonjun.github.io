---
name: verify-content-schema
description: MDX 블로그 콘텐츠의 frontmatter 스키마 준수 및 파일 명명 규칙을 검증합니다. 새 블로그 포스트 추가 또는 content.config.ts 변경 후 사용.
---

# 콘텐츠 스키마 검증

## Purpose

1. **Frontmatter 필수 필드** — 모든 MDX 파일이 content.config.ts에 정의된 필수 필드를 포함하는지 검증
2. **Frontmatter 값 유효성** — 필드 값이 올바른 타입과 형식인지 검증 (날짜, enum, 배열 등)
3. **시리즈 일관성** — series 필드 사용 시 name/order 쌍이 올바르게 구성되었는지 검증
4. **Draft 필터링 일관성** — draft: true인 포스트가 의도적으로만 사용되는지 확인

## When to Run

- 새 MDX 블로그 포스트를 추가한 후
- `src/content.config.ts`의 스키마를 변경한 후
- 기존 포스트의 frontmatter를 수정한 후
- 마이그레이션 스크립트 실행 후 (migrate:gatsby, migrate:tistory)

## Related Files

| File | Purpose |
|------|---------|
| `src/content.config.ts` | 콘텐츠 컬렉션 스키마 정의 (Zod) |
| `src/content/blog/*.mdx` | 블로그 포스트 파일들 |
| `src/lib/utils.ts` | getPublishedPosts (draft 필터링), sortPostsByDate |
| `scripts/migrate-tistory.ts` | Tistory 마이그레이션 스크립트 |
| `scripts/migrate-gatsby.ts` | Gatsby 마이그레이션 스크립트 |

## Workflow

### Step 1: 스키마 정의 확인

**파일:** `src/content.config.ts`

**검사:** 현재 스키마 정의를 읽어 필수/선택 필드 목록을 파악합니다.

```
Read src/content.config.ts
```

현재 스키마 기준:
- **필수:** `title` (string), `description` (string), `publishDate` (date), `category` (string)
- **기본값 있음:** `tags` (string[], default []), `draft` (boolean, default false), `source` (enum ['tistory','gatsby','original'], default 'original')
- **선택:** `updatedDate` (date), `series` (object: name+order), `cover` (string), `originalUrl` (string)

**PASS:** 스키마 파일이 존재하고 위 구조와 일치
**FAIL:** 스키마 파일이 없거나 필수 필드 정의가 누락됨

### Step 2: Frontmatter 필수 필드 검증

**파일:** `src/content/blog/*.mdx`

**검사:** 모든 MDX 파일에 `title`, `description`, `publishDate`, `category` 필드가 존재하는지 확인합니다.

```
Grep: pattern="^title:" path="src/content/blog" include="*.mdx"
Grep: pattern="^description:" path="src/content/blog" include="*.mdx"
Grep: pattern="^publishDate:" path="src/content/blog" include="*.mdx"
Grep: pattern="^category:" path="src/content/blog" include="*.mdx"
```

각 필드에 대해 매칭 파일 수가 전체 MDX 파일 수와 동일한지 비교합니다.

**PASS:** 모든 MDX 파일이 4개 필수 필드를 모두 포함
**FAIL:** 누락된 필수 필드가 있는 MDX 파일 존재

**수정:** 누락된 필드를 frontmatter에 추가합니다.

### Step 3: publishDate 형식 검증

**파일:** `src/content/blog/*.mdx`

**검사:** publishDate 값이 유효한 날짜 형식인지 확인합니다 (YYYY-MM-DD).

```
Grep: pattern="^publishDate:" path="src/content/blog" include="*.mdx"
```

매칭된 각 라인에서 날짜 값이 `YYYY-MM-DD` 형식인지 검증합니다.

**PASS:** 모든 publishDate가 유효한 날짜 형식
**FAIL:** 유효하지 않은 날짜 형식이 포함된 파일 존재

### Step 4: source 필드 enum 검증

**파일:** `src/content/blog/*.mdx`

**검사:** source 필드가 있는 경우 허용된 값만 사용하는지 확인합니다.

```
Grep: pattern="^source:" path="src/content/blog" include="*.mdx"
```

허용 값: `tistory`, `gatsby`, `original`

**PASS:** 모든 source 값이 허용된 enum 중 하나
**FAIL:** 허용되지 않은 source 값 존재

### Step 5: series 필드 구조 검증

**파일:** `src/content/blog/*.mdx`

**검사:** series 필드를 사용하는 포스트가 name과 order를 모두 갖추고 있는지 확인합니다.

```
Grep: pattern="^series:" path="src/content/blog" include="*.mdx"
```

series가 있는 파일에서 하위에 `name:` 과 `order:` 필드가 모두 존재하는지 확인합니다.

**PASS:** 모든 series 필드가 name + order 쌍을 포함
**FAIL:** name 또는 order가 누락된 series 필드 존재

### Step 6: tags 필드 형식 검증

**파일:** `src/content/blog/*.mdx`

**검사:** tags 필드가 배열 형식으로 올바르게 작성되었는지 확인합니다.

```
Grep: pattern="^tags:" path="src/content/blog" include="*.mdx"
```

**PASS:** 모든 tags 값이 YAML 배열 형식 (`["tag1", "tag2"]` 또는 `- tag1`)
**FAIL:** 잘못된 형식의 tags 값 존재

## Output Format

| # | 파일 | 문제 | 상세 |
|---|------|------|------|
| 1 | `path/to/file.mdx` | 필수 필드 누락 | `title` 필드 없음 |
| 2 | `path/to/file.mdx` | 잘못된 날짜 형식 | publishDate: "invalid" |

## Exceptions

1. **draft: true 포스트** — draft 포스트도 frontmatter 스키마는 준수해야 하므로 면제 대상이 아님
2. **source: 'original' 생략** — source 필드가 없는 경우 기본값 'original'이 적용되므로 위반이 아님
3. **tags: [] 생략** — tags 필드가 없는 경우 기본값 빈 배열이 적용되므로 위반이 아님
4. **cover 필드 미사용** — 선택 필드이므로 없어도 위반이 아님
5. **originalUrl 미사용** — source가 'original'인 경우 originalUrl이 없어도 위반이 아님

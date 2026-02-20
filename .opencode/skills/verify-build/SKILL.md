---
name: verify-build
description: Astro 빌드와 TypeScript 타입 체크가 성공하는지 검증합니다. 코드 변경 후, PR 전 사용.
---

# 빌드 검증

## Purpose

1. **TypeScript 타입 체크** — `astro check`를 실행하여 타입 에러가 없는지 검증
2. **프로덕션 빌드** — `npm run build`가 에러 없이 완료되는지 검증
3. **LSP 진단** — 변경된 파일에 에러 수준의 진단이 없는지 검증

## When to Run

- TypeScript 코드를 변경한 후
- Astro 컴포넌트/페이지를 추가하거나 수정한 후
- package.json 의존성을 변경한 후
- astro.config.mjs를 수정한 후
- PR을 생성하기 전 최종 확인

## Related Files

| File | Purpose |
|------|---------|
| `package.json` | 빌드 스크립트 정의 (`build`, `astro check`) |
| `tsconfig.json` | TypeScript 설정 (astro/tsconfigs/strict 확장) |
| `astro.config.mjs` | Astro 빌드 설정 |
| `.github/workflows/deploy.yml` | CI/CD에서 타입 체크 + 빌드 실행 |

## Workflow

### Step 1: LSP 진단 확인

**파일:** 변경된 `.ts`, `.astro` 파일들

**검사:** 변경된 파일에 대해 LSP 진단을 실행하여 에러가 없는지 확인합니다.

```
lsp_diagnostics: severity="error" filePath="<changed-file>"
```

모든 변경된 `.ts`, `.astro` 파일에 대해 실행합니다.

**PASS:** 에러 수준의 진단이 없음
**FAIL:** 에러 수준의 진단이 존재

**수정:** 진단 메시지에 따라 타입 에러를 수정합니다. `as any`, `@ts-ignore`, `@ts-expect-error`는 사용하지 않습니다.

### Step 2: Astro 타입 체크

**검사:** `npx astro check`를 실행하여 프로젝트 전체 타입 체크를 수행합니다.

```bash
npx astro check
```

**PASS:** exit code 0, 에러 메시지 없음
**FAIL:** 타입 에러 존재

**수정:** 에러 메시지의 파일 경로와 라인 번호를 확인하여 수정합니다.

### Step 3: 프로덕션 빌드

**검사:** `npm run build`를 실행하여 빌드가 성공하는지 확인합니다. 이 명령은 `astro build && npx pagefind --site dist`를 실행합니다.

```bash
npm run build
```

**PASS:** exit code 0, dist 디렉토리 생성, pagefind 인덱스 생성
**FAIL:** 빌드 에러 존재

**수정:** 에러 메시지를 분석하여 원인을 파악합니다. 일반적인 원인:
- 잘못된 import 경로
- MDX frontmatter 스키마 불일치
- 존재하지 않는 이미지 참조
- Remark/Rehype 플러그인 에러

### Step 4: CI 파이프라인 일치 검증

**파일:** `.github/workflows/deploy.yml`

**검사:** CI에서 실행하는 검증 단계가 로컬에서 테스트한 것과 일치하는지 확인합니다.

```
Read: .github/workflows/deploy.yml
```

CI 파이프라인이 다음을 순서대로 실행하는지 확인:
1. `npm ci` (의존성 설치)
2. `npx astro check` (타입 체크)
3. `npm run build` (빌드)

**PASS:** CI 파이프라인이 로컬 검증과 동일한 단계를 포함
**FAIL:** CI에서 누락된 검증 단계가 있거나 순서가 다름

## Output Format

| # | 검사 | 상태 | 상세 |
|---|------|------|------|
| 1 | LSP 진단 | PASS/FAIL | 에러 N개: file.ts:42 ... |
| 2 | astro check | PASS/FAIL | 타입 에러 N개 |
| 3 | 프로덕션 빌드 | PASS/FAIL | 빌드 시간 Xs |
| 4 | CI 일치 | PASS/FAIL | 상세... |

## Exceptions

1. **Pagefind 경고** — Pagefind가 인덱싱 중 출력하는 경고 메시지는 빌드 실패가 아님
2. **Astro 개발 서버 경고** — 개발 모드에서만 나타나는 경고는 프로덕션 빌드와 무관
3. **이미지 최적화 경고** — Sharp 라이브러리의 이미지 처리 경고는 빌드 실패가 아님 (경고 수준)
4. **deprecation 경고** — 의존성의 deprecation 경고는 빌드 실패가 아님

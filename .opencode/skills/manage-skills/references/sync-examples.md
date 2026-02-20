# 스킬 업데이트/생성 예시

> `manage-skills/SKILL.md`의 Step 5~6에서 참조하는 마크다운 예시 모음입니다.

## Step 5: 기존 스킬 업데이트 예시

### Related Files에 파일 추가

```markdown
## Related Files

| File | Purpose |
|------|---------|
| ... 기존 항목 ... |
| `src/server/newHandler.ts` | 유효성 검사가 포함된 새 요청 핸들러 |
```

### 탐지 명령어 추가

````markdown
### Step N: 새 패턴 검증

**파일:** `path/to/file.ts`

**검사:** 검증할 내용에 대한 설명.

```bash
grep -n "pattern" path/to/file.ts
```

**위반:** 잘못된 경우의 모습.
````

## Step 6: 새 스킬 생성 예시

### frontmatter 템플릿

```yaml
---
name: verify-<name>
description: <한 줄 설명>. <트리거 조건> 후 사용.
---
```

### 연관 스킬 파일 업데이트 예시

#### manage-skills/SKILL.md — 등록된 검증 스킬 테이블

```markdown
| 스킬 | 설명 | 커버 파일 패턴 |
|------|------|---------------|
| `verify-<name>` | <설명> | <커버 파일 패턴> |
```

#### verify-implementation/SKILL.md — 실행 대상 스킬 테이블

```markdown
| # | 스킬 | 설명 |
|---|------|------|
| <번호> | `verify-<name>` | <설명> |
```

#### AGENTS.md — Skills 테이블

```markdown
| `verify-<name>` | <한 줄 설명> |
```

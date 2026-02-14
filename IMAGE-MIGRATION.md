# 블로그 Astro `<Image />` 전환 분석 보고서

> 작성일: 2026-02-14

---

## 1. 현재 이미지 사용 현황

### 1.1 이미지 파일 통계

| 항목 | 수치 |
|------|------|
| 총 이미지 파일 | 164개 |
| WebP 파일 | 162개 |
| GIF 파일 | 1개 |
| 확장자 없는 PNG | 1개 (`tistory/19/스크린샷...`) |
| 총 용량 | 13MB |
| tistory/ 디렉토리 | 12MB (40개 하위 디렉토리) |
| legacy/ 디렉토리 | 892KB |

### 1.2 MDX 파일 통계

| 항목 | 수치 |
|------|------|
| 총 MDX 파일 | 75개 |
| 이미지 참조가 있는 MDX | 54개 (72%) |
| 이미지 참조가 없는 MDX | 21개 |

### 1.3 이미지 사용 패턴

**패턴 A: `/images/` 절대 경로 (주요 패턴)**
```markdown
![alt text](/images/tistory/22/image1.webp)
```
- 대부분의 MDX 파일이 이 패턴 사용
- `public/images/` 디렉토리에서 서빙

**패턴 B: `./img/` 상대 경로 (5개 파일 — ⚠️ 깨진 참조)**
```markdown
![alt text](./img/image1.webp)
```
- 해당 파일들:
  - `tistory-17-dispatcher-servlet-디스패처-서블릿.mdx`
  - `tistory-18-필터filter-vs-인터셉터interceptor.mdx`
  - `tistory-19-jpa-비관적-락과-낙관적-락-및-재시도.mdx`
  - `tistory-20-항해-플러스-백엔드-코스-6기-5주차-및-챕터-회고-wil.mdx`
  - `tistory-23-항해-플러스-백엔드-코스-6기-6주차-회고-wil.mdx`
- **`./img/` 디렉토리가 존재하지 않음** → 이미지가 렌더링되지 않는 상태

**패턴 C: Astro 컴포넌트**
- `<Image />`, `<Picture />`, `astro:assets` 사용: **없음** (0건)

### 1.4 프론트매터 `cover` 필드

- `content.config.ts`에 `cover: z.string().optional()` 정의됨
- 실제 사용하는 MDX 파일: **0개**
- 현재 미활용 상태

### 1.5 기존 이미지 최적화

- `scripts/optimize-images.ts` 존재 (수동 최적화 스크립트)
- `sharp` 패키지 설치됨
- Astro 설정(`astro.config.mjs`)에 별도 image 설정 없음

---

## 2. Astro `<Image />` 전환 시 장점

### 2.1 자동 최적화
- **빌드 타임 최적화**: sharp를 통한 자동 리사이즈/포맷 변환
- **반응형 이미지**: `srcset` 자동 생성으로 디바이스별 최적 크기 제공
- **차세대 포맷**: AVIF/WebP 자동 변환 (이미 WebP이므로 AVIF 추가 가능)

### 2.2 성능 개선
- **Lazy loading**: 자동 `loading="lazy"` 적용
- **Layout shift 방지**: `width`/`height` 자동 추출로 CLS 개선
- **`decoding="async"`**: 자동 적용

### 2.3 개발자 경험
- **타입 안전**: import 시 존재하지 않는 이미지 → 빌드 에러 (깨진 참조 방지)
- **자동 크기 추론**: import한 이미지에서 width/height 자동 획득

---

## 3. 전환 작업량 추정

### 3.1 파일 이동
| 작업 | 수량 |
|------|------|
| `public/images/` → `src/assets/images/` 이동 | 164개 파일 |
| 디렉토리 구조 유지 | tistory/, legacy/ 등 |

### 3.2 MDX 파일 수정

**변경이 필요한 MDX 파일: 54개**

변경 패턴:
```mdx
// Before (마크다운 문법)
![alt text](/images/tistory/22/image1.webp)

// After (Astro Image 컴포넌트)
import img1 from '@/assets/images/tistory/22/image1.webp';
<Image src={img1} alt="alt text" />
```

### 3.3 변경 요약

| 작업 | 예상 소요 |
|------|----------|
| 이미지 파일 이동 | 스크립트로 즉시 (< 1분) |
| MDX import 추가 + 문법 변환 | 스크립트로 자동화 가능 (1~2시간 개발) |
| 수동 검증 (빌드 & 확인) | 2~3시간 |
| 깨진 `./img/` 참조 수정 | 30분 |
| **총 예상** | **반나절 (4~6시간)** |

---

## 4. 단계별 마이그레이션 계획

### Phase 0: 사전 정리 (30분)
1. 깨진 `./img/` 상대 경로 5개 파일 수정 (올바른 `/images/` 경로로 변경하거나 이미지 배치)
2. 확장자 없는 PNG 파일에 `.png` 확장자 추가
3. 현재 상태 빌드 & 동작 확인

### Phase 1: 인프라 준비 (30분)
1. `astro.config.mjs`에 image 설정 추가:
   ```js
   image: {
     service: { entrypoint: 'astro/assets/services/sharp' }
   }
   ```
2. `src/assets/images/` 디렉토리 생성
3. tsconfig에 `@/` path alias 확인

### Phase 2: 이미지 파일 이동 (10분)
1. `public/images/` → `src/assets/images/`로 이동
   ```bash
   mv public/images/* src/assets/images/
   ```
2. Git에서 이동 추적 확인

### Phase 3: 자동 변환 스크립트 개발 & 실행 (2시간)
1. MDX 파일 파싱 스크립트 작성:
   - `![alt](/images/path)` → import문 + `<Image>` 변환
   - 중복 파일명 처리 (alias)
   - frontmatter 직후 import 블록 삽입
2. 54개 MDX 파일에 일괄 적용
3. diff 검토

### Phase 4: 검증 (2시간)
1. `astro build` 성공 확인
2. 이미지 렌더링 확인 (주요 페이지 스팟 체크)
3. OG 이미지 경로 영향 확인
4. RSS/사이트맵 이미지 경로 확인

### Phase 5: cover 필드 활용 (선택, 추후)
1. frontmatter `cover`를 `image()` 헬퍼로 변경 (schema 수정)
2. 레이아웃에서 `<Image>` 컴포넌트로 cover 렌더링

---

## 5. 리스크 분석

### 🔴 높은 리스크
| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| **빌드 시간 증가** | 164개 이미지 sharp 처리 → 빌드 시간 2~5배 증가 가능 | `astro.config`에서 `image.domains`, `format` 제한; 캐시 활용 |
| **MDX에서 import 필수** | 마크다운 `![]()`을 사용할 수 없음 → 글 작성 불편 | `remarkPluginImageImport` 커스텀 플러그인 or 하이브리드 접근 |

### 🟡 중간 리스크
| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| **경로 변경** | 외부 링크/SEO에서 기존 `/images/` 경로 깨짐 | `public/images/`에 리다이렉트 유지 or 점진적 전환 |
| **GIF 처리** | sharp가 animated GIF을 제대로 처리 못할 수 있음 | GIF은 `public/`에 유지 |
| **변환 스크립트 버그** | 정규식 파싱 한계 → 일부 누락/오변환 | 수동 diff 검토 필수 |

### 🟢 낮은 리스크
| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| 이미 WebP 최적화됨 | Astro 재최적화 시 품질 저하/용량 증가 가능 | `quality` 설정 조정, `passthrough` 고려 |
| Git diff 크기 | 파일 이동 + MDX 변경 → 큰 커밋 | Phase별 분리 커밋 |

---

## 6. 대안: 하이브리드 접근 (권장 검토)

현재 이미 WebP로 최적화되어 있고, `optimize-images.ts` 스크립트도 있으므로, **전면 전환 대비 비용 대비 이익이 크지 않을 수 있음**.

### 하이브리드 방안
1. **기존 이미지는 `public/`에 유지** (변경 없음)
2. **새 글부터** `src/assets/`에 이미지 저장 + `<Image />` 사용
3. **cover 이미지만** `image()` 헬퍼로 전환 (레이아웃 개선)
4. 점진적으로 오래된 글 마이그레이션

**장점**: 리스크 최소, 즉시 적용 가능, 작업량 최소
**단점**: 두 패턴 공존 → 일관성 부족

---

## 7. 결론 및 권장사항

| 접근 | 작업량 | 리스크 | 이익 |
|------|--------|--------|------|
| 전면 전환 | 4~6시간 | 중간 | 높음 (일관성, 타입 안전, CLS 개선) |
| 하이브리드 | 30분 | 낮음 | 중간 (새 글만 혜택) |
| 현상 유지 | 0 | 없음 | 없음 |

**권장**: 하이브리드 접근으로 시작 → 시간 여유 시 전면 전환.
우선 **깨진 `./img/` 참조 5개 파일 수정**은 즉시 진행 필요.

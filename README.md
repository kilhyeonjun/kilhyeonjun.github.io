# kilhyeonjun.github.io

개인 Astro 블로그입니다.

## 주요 경로

| 경로 | 설명 |
|---|---|
| `src/content/blog/` | 블로그 MD/MDX 글 |
| `src/content.config.ts` | Astro content collection schema |
| `scripts/verify-blog-post.py` | frontmatter/SEO/MDX hazard/series 중복 검증 |
| `scripts/package-blog-review.py` | Telegram 검토용 txt + zip 묶음 생성 |
| `dist/` | `npm run build` 결과물 |

## Commands

```bash
npm run dev
npm run build
npm run verify:blog
npm run verify:blog:post -- src/content/blog/<post>.mdx
npm run package:blog-review -- src/content/blog/<post>.mdx --output-prefix /tmp/blog-review
```

## Blog workflow

1. 소스 확인 및 공개 가능성 분류
2. `src/content/blog/<slug>.mdx` 초안 작성
3. `npm run verify:blog -- <파일>` 또는 `python3 scripts/verify-blog-post.py <파일> --allow-draft --strict` 실행
4. `npm run build` 실행
5. 필요 시 `scripts/package-blog-review.py`로 Telegram 검토 묶음 생성
6. 명시 승인 후 commit/push/publish
7. GitHub Pages workflow 성공과 live URL 200 확인

## Publishing guard

`draft: false` + push는 공개 배포입니다. 사용자가 `퍼블리시해`, `push해`, `배포해`처럼 명시 승인하기 전에는 draft/build/package까지만 진행합니다.

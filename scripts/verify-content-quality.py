#!/usr/bin/env python3
"""Fail when published blog metadata or MDX contains known quality defects."""
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/verify-blog-post.py"
spec = importlib.util.spec_from_file_location("verify_blog_post", MODULE_PATH)
assert spec is not None and spec.loader is not None
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

bad_particles = ["큐을", "집계을", "서비스을", "저장소을", "친구을", "순위표을", "처리을", "Redis을", "설계을", "추적하기을", "허리을"]
issues = []
for path in sorted((ROOT / "src/content/blog").glob("*.mdx")):
    ok, errors, _warnings = module.check_file(path, strict=False, min_lines=40, ai_limit=24, allow_draft=True, legacy_tolerant=True)
    if not ok:
        issues.append(f"{path.name}: {', '.join(errors)}")
    fm = module.frontmatter(path.read_text(encoding="utf-8"))
    title = module.scalar(fm, "title") or ""
    description = module.scalar(fm, "description") or ""
    if not 8 <= len(title) <= 110:
        issues.append(f"{path.name}: title length {len(title)}")
    if not 40 <= len(description) <= 180:
        issues.append(f"{path.name}: description length {len(description)}")
    found = [value for value in bad_particles if value in description]
    if found:
        issues.append(f"{path.name}: invalid description particles {found}")
if issues:
    raise SystemExit("content quality contract failed:\n- " + "\n- ".join(issues))
print("content quality contract: PASS")

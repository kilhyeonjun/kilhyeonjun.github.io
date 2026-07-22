#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

REQUIRED_FRONTMATTER = ["title", "description", "publishDate", "category", "tags"]
AI_PATTERNS = [
    "핵심적인", "필수적인", "획기적인", "중추적인", "근본적인", "혁신적인", "본질적인", "결정적인",
    "살펴보겠습니다", "알아보겠습니다", "이를 통해", "이처럼", "결론적으로", "종합하면", "정리하면",
    "라고 할 수 있습니다", "것으로 보입니다", "측면에서", "에 있어서", "의 경우", "에 해당합니다", "일반적으로", "기본적으로",
    "본 절에서는", "임을 알 수 있다", "할 필요가 있다", "지속적인 학습이 필요합니다", "발전이 기대됩니다",
]
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def frontmatter(text: str) -> str:
    if not text.startswith("---\n"):
        return ""
    end = text.find("\n---\n", 4)
    return text[4:end] if end != -1 else ""


def scalar(fm: str, key: str) -> str | None:
    m = re.search(rf"^{re.escape(key)}:\s*(.+?)\s*$", fm, re.MULTILINE)
    if not m:
        return None
    value = m.group(1).strip()
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        value = value[1:-1]
    return value


def series_name_and_order(fm: str) -> tuple[str | None, int | None]:
    name = None
    order = None
    m = re.search(r"^series:\s*$([\s\S]*?)(?:\n\S|\Z)", fm, re.MULTILINE)
    block = m.group(1) if m else ""
    if block:
        nm = re.search(r"^\s+name:\s*[\"']?(.+?)[\"']?\s*$", block, re.MULTILINE)
        om = re.search(r"^\s+order:\s*(\d+)\s*$", block, re.MULTILINE)
        if nm:
            name = nm.group(1).strip()
        if om:
            order = int(om.group(1))
    return name, order


def tags_count(fm: str) -> int:
    value = scalar(fm, "tags") or ""
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return 0
        return len([x for x in inner.split(",") if x.strip()])
    return 1 if value else 0


def strip_fenced_code(text: str) -> str:
    outside: list[str] = []
    fence_char: str | None = None
    fence_len = 0
    for line in text.splitlines(keepends=True):
        if fence_char is None:
            opener = re.match(r"^ {0,3}(`{3,}|~{3,})", line)
            if opener:
                marker = opener.group(1)
                fence_char = marker[0]
                fence_len = len(marker)
                continue
            outside.append(line)
            continue
        if re.match(rf"^ {{0,3}}{re.escape(fence_char)}{{{fence_len},}}\s*$", line):
            fence_char = None
            fence_len = 0
    return re.sub(r"`[^`\n]*`", "", "".join(outside))


def raw_braces(text: str) -> int:
    body = strip_fenced_code(text)
    body = re.sub(r"^---\n[\s\S]*?\n---\n", "", body, count=1)
    return body.count("{") + body.count("}")


def count(pattern: str, text: str) -> int:
    return len(re.findall(pattern, text, re.MULTILINE))


def check_file(path: Path, *, strict: bool, min_lines: int, ai_limit: int, allow_draft: bool, legacy_tolerant: bool = False) -> tuple[bool, list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    if not path.exists():
        return False, ["missing file"], warnings
    text = path.read_text(encoding="utf-8")
    fm = frontmatter(text)
    lines = text.splitlines()
    if not fm:
        errors.append("frontmatter missing")
        return False, errors, warnings

    for key in REQUIRED_FRONTMATTER:
        if scalar(fm, key) is None:
            errors.append(f"frontmatter missing {key}")

    title = scalar(fm, "title") or ""
    desc = scalar(fm, "description") or ""
    date = scalar(fm, "publishDate") or ""
    draft = scalar(fm, "draft")
    category = scalar(fm, "category") or ""
    ai_total = sum(text.count(pat) for pat in AI_PATTERNS)

    def add_quality(message: str) -> None:
        if legacy_tolerant:
            warnings.append(message)
        else:
            errors.append(message)

    if not (8 <= len(title) <= 110):
        add_quality(f"title length out of range: {len(title)}")
    if not (40 <= len(desc) <= 180):
        add_quality(f"description length out of range: {len(desc)}")
    if not DATE_RE.match(date):
        errors.append(f"publishDate must be YYYY-MM-DD: {date}")
    if draft not in {"true", "false"}:
        errors.append("draft must be true or false")
    if draft == "true" and not allow_draft:
        errors.append("draft true is not publishable without --allow-draft")
    if not category:
        errors.append("category empty")
    tc = tags_count(fm)
    if not (1 <= tc <= 8):
        errors.append(f"tags count out of range: {tc}")
    if len(lines) < min_lines:
        add_quality(f"line count below minimum {min_lines}: {len(lines)}")
    if raw_braces(text) > 0:
        message = f"raw MDX braces outside code fences: {raw_braces(text)}"
        if strict:
            errors.append(message)
        else:
            warnings.append(message)
    if ai_total > ai_limit:
        warnings.append(f"AI pattern count {ai_total} > {ai_limit}")
    if " " in path.name:
        errors.append("filename contains spaces")
    if not path.suffix in {".md", ".mdx"}:
        errors.append("file extension must be .md or .mdx")

    if strict:
        for section in ["## 시작하며", "## 마무리"]:
            if section not in text:
                errors.append(f"required section missing: {section}")
        if count(r"^\|.*\|$", text) < 2:
            warnings.append("no markdown table detected")

    return not errors, errors, warnings


def collect_paths(args: argparse.Namespace, root: Path) -> list[Path]:
    if args.all:
        return sorted((root / "src/content/blog").glob("*.mdx")) + sorted((root / "src/content/blog").glob("*.md"))
    if not args.paths:
        raise SystemExit("provide paths or --all")
    paths = []
    for raw in args.paths:
        p = Path(raw)
        if not p.is_absolute():
            p = root / p
        paths.append(p)
    return paths


def main() -> int:
    ap = argparse.ArgumentParser(description="Verify Astro blog post MD/MDX metadata, SEO shape, and MDX hazards")
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--root", default=".")
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--allow-draft", action="store_true")
    ap.add_argument("--min-lines", type=int, default=40)
    ap.add_argument("--ai-limit", type=int, default=24)
    ap.add_argument("--check-series-duplicates", action="store_true")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    paths = collect_paths(args, root)
    ok_all = True
    series_orders: dict[str, dict[int, list[str]]] = defaultdict(lambda: defaultdict(list))
    checked = 0
    warning_count = 0

    for path in paths:
        ok, errors, warnings = check_file(
            path,
            strict=args.strict,
            min_lines=args.min_lines,
            ai_limit=args.ai_limit,
            allow_draft=args.allow_draft,
            legacy_tolerant=args.all and not args.strict,
        )
        checked += 1
        rel = path.relative_to(root) if path.is_relative_to(root) else path
        print(f"## {rel}")
        if ok:
            print("status: PASS")
        else:
            ok_all = False
            print("status: FAIL")
        for err in errors:
            print(f"error: {err}")
        for warn in warnings:
            warning_count += 1
            print(f"warning: {warn}")

        fm = frontmatter(path.read_text(encoding="utf-8")) if path.exists() else ""
        name, order = series_name_and_order(fm)
        if name and order is not None:
            series_orders[name][order].append(str(rel))

    if args.check_series_duplicates:
        for series, order_map in series_orders.items():
            for order, members in order_map.items():
                if len(members) > 1:
                    ok_all = False
                    print(f"series_duplicate_order: {series} #{order}: {members}")

    print(f"checked: {checked}")
    print(f"warnings: {warning_count}")
    print(f"result: {'PASS' if ok_all else 'FAIL'}")
    return 0 if ok_all else 1


if __name__ == "__main__":
    raise SystemExit(main())

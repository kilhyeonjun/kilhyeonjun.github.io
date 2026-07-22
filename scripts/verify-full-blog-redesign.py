#!/usr/bin/env python3
"""Focused contracts for the full KilPenguin blog redesign."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    target = ROOT / path
    if not target.exists():
        raise AssertionError(f"missing required file: {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"missing {label}: {needle}")


class ArticleInspector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.headings: list[int] = []
        self.in_mermaid = False
        self.mermaid_child_tags = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if re.fullmatch(r"h[1-6]", tag):
            self.headings.append(int(tag[1]))
        if tag == "pre" and "mermaid" in (dict(attrs).get("class") or "").split():
            self.in_mermaid = True
        elif self.in_mermaid:
            self.mermaid_child_tags += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "pre" and self.in_mermaid:
            self.in_mermaid = False


def verify_built_article_contracts() -> None:
    dist = ROOT / "dist"
    if not dist.exists():
        raise AssertionError("dist is required; run npm run build before verify:release")

    article_files = sorted((dist / "blog").glob("*/index.html"))
    if not article_files:
        raise AssertionError("no built article routes found")

    for page in article_files:
        inspector = ArticleInspector()
        built = page.read_text(encoding="utf-8")
        inspector.feed(built)
        if inspector.headings.count(1) != 1:
            raise AssertionError(f"{page.relative_to(ROOT)} must contain exactly one h1")
        if inspector.mermaid_child_tags:
            raise AssertionError(f"{page.relative_to(ROOT)} contains unescaped HTML inside Mermaid source")


    hierarchy_sample = dist / "blog/go-2021-09-29-go-base-4/index.html"
    inspector = ArticleInspector()
    inspector.feed(hierarchy_sample.read_text(encoding="utf-8"))
    if inspector.headings[:5] != [1, 2, 3, 3, 3]:
        raise AssertionError(f"body heading hierarchy was flattened: {inspector.headings[:5]}")

    css = "".join(path.read_text(encoding="utf-8") for path in (dist / "_astro").glob("*.css"))
    if not re.search(r"\[data-article-shell\]\{[^}]*overflow-wrap:anywhere", css):
        raise AssertionError("compiled article CSS is missing overflow-wrap:anywhere")

    sample = article_files[0].read_text(encoding="utf-8")
    if "block.textContent = block.getAttribute('data-mermaid-source')" not in sample:
        raise AssertionError("built Mermaid runtime must restore source as text")
    if not re.search(r"for\s*\(const block of blocks\)[\s\S]{0,1200}?run\(\{\s*nodes:\s*\[block\]\s*\}\)", sample):
        raise AssertionError("built Mermaid runtime does not render blocks independently")


def verify_archives() -> None:
    header = read("src/components/ArchiveHeader.astro")
    card = read("src/components/BlogCard.astro")
    require(header, "Archive", "archive eyebrow support")
    require(header, "count", "archive count support")
    require(card, "data-field-note-row", "editorial post row")
    require(card, "min-h-11", "post row touch targets")

    routes = {
        "src/pages/blog/[...page].astro": "Field Notes",
        "src/pages/categories/index.astro": "Categories",
        "src/pages/categories/[category].astro": "Category",
        "src/pages/tags/index.astro": "Tags",
        "src/pages/tags/[tag].astro": "Tag",
        "src/pages/series/index.astro": "Series",
        "src/pages/series/[name].astro": "Series",
    }
    for path, eyebrow in routes.items():
        source = read(path)
        require(source, "ArchiveHeader", f"shared archive header in {path}")
        require(source, f'eyebrow="{eyebrow}"', f"{eyebrow} eyebrow in {path}")
        require(source, "wide", f"wide editorial archive layout in {path}")


def verify_article() -> None:
    layout = read("src/layouts/BlogPostLayout.astro")
    base = read("src/layouts/BaseLayout.astro")
    toc = read("src/components/TOC.astro")
    navigation = read("src/components/PostNavigation.astro")
    comments = read("src/components/Comments.astro")

    require(layout, "data-article-shell", "editorial article shell")
    require(layout, "Field Note ·", "article eyebrow")
    require(layout, "{description}", "article deck description")
    require(layout, "prose-field-notes", "field-notes prose treatment")
    require(layout, "min-h-11 min-w-11", "44px copy control")
    require(layout, "aria-label", "accessible copy control")
    require(layout, 'class="inline-flex min-h-11 items-center hover:underline"', "44px article category target")
    require(base, "style-src 'self' 'unsafe-inline' https://giscus.app", "Giscus stylesheet CSP allowance")
    require(base, "var mermaidLoading = null", "single-flight Mermaid loader")
    require(base, "Mermaid render failed", "handled Mermaid render failures")
    require(toc, "min-h-11", "44px table-of-contents targets")
    require(navigation, "data-post-navigation", "editorial post navigation")
    require(comments, "Discussion", "field-notes discussion heading")


def verify_supporting_pages() -> None:
    config = read("astro.config.mjs")
    about = read("src/pages/about.astro")
    not_found = read("src/pages/404.astro")
    base = read("src/layouts/BaseLayout.astro")

    if "'/about': '/resume/'" in config:
        raise AssertionError("about must be an indexable page, not an Astro redirect")
    require(about, "data-about-page", "editorial about page")
    require(about, "백엔드 엔지니어", "public-safe professional identity")
    require(about, 'href="/resume/"', "resume project link")
    require(not_found, "이 경로의 기록을", "mobile-safe 404 heading")
    require(not_found, "찾지 못했습니다.", "404 outcome heading")
    require(not_found, "data-not-found", "field-notes 404 treatment")
    require(not_found, "Lost packet", "technical 404 cue")
    require(base, 'href="/about/"', "about navigation")


def verify_navigation() -> None:
    base = read("src/layouts/BaseLayout.astro")
    require(base, "const currentPath = Astro.url.pathname", "route-aware navigation")
    require(base, "aria-current", "current-page navigation semantics")
    require(base, 'id="mobile-navigation"', "mobile primary navigation")
    require(base, 'aria-label="전체 탐색"', "accessible mobile navigation label")
    require(base, "data-resume-link", "non-active external resume action")


def verify_convention_polish() -> None:
    css = read("src/styles/global.css")
    prefix = "/* Convention-preserving polish · P1 */\n"
    if css.count(prefix) != 1:
        raise AssertionError("approved polish layer must appear exactly once")
    polish = css.split(prefix, 1)[1]
    digest = hashlib.sha256(polish.encode()).hexdigest()
    if digest != "e50ba36bbf0c398f328803142c46eccdaef19560b49396f7627b33a9dcaa6922":
        raise AssertionError(f"approved polish layer changed: {digest}")


if __name__ == "__main__":
    verify_archives()
    verify_article()
    verify_built_article_contracts()
    verify_supporting_pages()
    verify_navigation()
    verify_convention_polish()
    print("full blog redesign contract: PASS")

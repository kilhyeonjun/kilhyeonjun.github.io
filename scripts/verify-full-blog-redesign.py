#!/usr/bin/env python3
"""Focused contracts for the full KilPenguin blog redesign."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    target = ROOT / path
    if not target.exists():
        raise AssertionError(f"missing required file: {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"missing {label}: {needle}")


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


if __name__ == "__main__":
    verify_archives()
    verify_article()
    verify_supporting_pages()
    verify_navigation()
    print("full blog redesign contract: PASS")

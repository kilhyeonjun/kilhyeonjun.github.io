#!/usr/bin/env python3
"""Focused contract checks for the KilPenguin homepage redesign."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "src/pages/index.astro"
LAYOUT = ROOT / "src/layouts/BaseLayout.astro"
SEARCH = ROOT / "src/components/SearchDialog.astro"
THEME = ROOT / "src/components/ThemeToggle.astro"
FEATURED_CONTENT = ROOT / "src/content/blog/가면사배2-시리즈-13-증권-거래소.mdx"


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"missing {label}: {needle}")


def main() -> None:
    index = INDEX.read_text(encoding="utf-8")
    layout = LAYOUT.read_text(encoding="utf-8")
    search = SEARCH.read_text(encoding="utf-8")
    theme = THEME.read_text(encoding="utf-8")
    featured_content = FEATURED_CONTENT.read_text(encoding="utf-8")

    require(index, "복잡한 백엔드 시스템을", "concrete hero statement")
    require(index, "Latest Field Note", "latest-note trust cue")
    require(index, "const latestPost = allPosts[0]", "data-driven latest article")
    require(index, "allPosts.find((post) => post.id === '가면사배2-시리즈-13-증권-거래소')", "pinned exchange feature")
    require(index, "recentPosts", "data-driven recent article rows")
    require(index, "ORDER", "exchange flow order stage")
    require(index, "GATEWAY", "exchange flow gateway stage")
    require(index, "MATCH", "exchange flow match stage")
    require(index, "LEDGER", "exchange flow ledger stage")
    require(index, "aria-label=\"주문부터 원장까지의 증권 거래소 처리 흐름\"", "diagram accessible name")
    require(index, "이력서 보기", "resume CTA")
    require(index, "기술 글 읽기", "writing CTA")
    require(layout, "wide", "wide layout opt-in")
    require(layout, "min-h-11 min-w-11", "44px home target")
    require(layout, "https://kilhyeonjun.github.io/resume/", "external resume project route")
    require(index, "https://kilhyeonjun.github.io/resume/", "homepage resume route")
    require(search, "min-h-11 min-w-11", "44px search target")
    if search.count("min-height: 44px !important") < 2:
        raise AssertionError("Pagefind clear and result links must both be at least 44px tall")
    require(search, 'aria-labelledby="search-dialog-title"', "search dialog accessible name")
    require(theme, "min-h-11 min-w-11", "44px theme target")
    if "증권 거래소을" in featured_content:
        raise AssertionError("featured post description contains the grammar typo '증권 거래소을'")

    if "import BlogCard" in index:
        raise AssertionError("homepage must use editorial rows instead of repeated BlogCard cards")
    if "min read" in index.lower():
        raise AssertionError("homepage must not invent reading-time metadata")

    print("homepage redesign contract: PASS")


if __name__ == "__main__":
    main()

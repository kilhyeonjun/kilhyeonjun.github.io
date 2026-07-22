#!/usr/bin/env python3
"""Technical SEO release contract for generated Astro output."""
from pathlib import Path
import re
import struct

ROOT = Path(__file__).resolve().parents[1]

def need(text: str, value: str, label: str) -> None:
    if value not in text:
        raise AssertionError(f"missing {label}: {value}")

base = (ROOT / "src/layouts/BaseLayout.astro").read_text(encoding="utf-8")
post = (ROOT / "src/layouts/BlogPostLayout.astro").read_text(encoding="utf-8")
not_found = (ROOT / "src/pages/404.astro").read_text(encoding="utf-8")
home = (ROOT / "src/pages/index.astro").read_text(encoding="utf-8")
robots = (ROOT / "public/robots.txt").read_text(encoding="utf-8")

need(base, "canonicalPath?: string", "canonical override prop")
need(base, "noindex?: boolean", "noindex prop")
need(base, "ogType?: 'website' | 'article'", "Open Graph type prop")
need(base, '<meta name="robots" content="noindex, follow"', "noindex meta")
need(base, 'content={ogType}', "dynamic Open Graph type")
need(post, 'ogType="article"', "article Open Graph type")
need(not_found, "noindex", "404 noindex")
if "canonicalPath=" in not_found:
    raise AssertionError("404 must not declare a canonical path")
need(home, "text-slate-600", "accessible diagram label contrast")
need(robots, "Sitemap: https://blog.kilpenguin.com/sitemap-index.xml", "robots sitemap declaration")

for path in ["src/pages/index.astro", "src/pages/blog/[...page].astro", "src/pages/about.astro"]:
    text = (ROOT / path).read_text(encoding="utf-8")
    m = re.search(r'description="([^"]+)"', text)
    if not m or not (40 <= len(m.group(1)) <= 180):
        raise AssertionError(f"SEO description length in {path}: {len(m.group(1)) if m else 'missing'}")

png = ROOT / "public/og-default.png"
with png.open("rb") as f:
    sig = f.read(24)
width, height = struct.unpack(">II", sig[16:24])
if (width, height) != (1200, 630):
    raise AssertionError(f"OG image must be 1200x630, got {width}x{height}")

# Validate generated release artifacts; CI must build before this gate.
dist = ROOT / "dist"
if not dist.exists():
    raise AssertionError("dist is missing; run the production build before technical SEO verification")
not_found_html = (dist / "404.html").read_text(encoding="utf-8")
need(not_found_html, 'name="robots" content="noindex, follow"', "generated 404 noindex")
if 'rel="canonical"' in not_found_html:
    raise AssertionError("generated 404 must not declare a canonical URL")
article_html = (dist / "blog/가면사배2-시리즈-13-증권-거래소/index.html").read_text(encoding="utf-8")
need(article_html, 'property="og:type" content="article"', "generated article Open Graph type")
sitemap = (dist / "sitemap-0.xml").read_text(encoding="utf-8")
need(sitemap, "https://blog.kilpenguin.com/about/", "About sitemap entry")
if "404.html" in sitemap:
    raise AssertionError("404 page must not appear in sitemap")

print("technical seo contract: PASS")

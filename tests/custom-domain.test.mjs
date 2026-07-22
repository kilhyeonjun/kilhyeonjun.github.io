import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const expectedOrigin = 'https://blog.kilpenguin.com';
const oldOrigin = 'https://kilhyeonjun.github.io';
const read = (path) => readFileSync(join(root, path), 'utf8');

function files(path, suffix) {
  if (!existsSync(path)) return [];
  return readdirSync(path).flatMap((name) => {
    const child = join(path, name);
    return statSync(child).isDirectory() ? files(child, suffix) : child.endsWith(suffix) ? [child] : [];
  });
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => Object.fromEntries(
    [...tag.matchAll(/([:@\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key.toLowerCase(), value]),
  ));
}

function jsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(([, body]) => JSON.parse(body));
}

function assertCustomUrl(value, label) {
  assert.equal(new URL(value).origin, expectedOrigin, `${label}: ${value}`);
}

function verifyStructuredUrls(value, label) {
  if (Array.isArray(value)) return value.forEach((item, index) => verifyStructuredUrls(item, `${label}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (['url', 'image', 'target', '@id'].includes(key) && typeof child === 'string' && child.startsWith('http')) {
      assertCustomUrl(child, `${label}.${key}`);
    }
    verifyStructuredUrls(child, `${label}.${key}`);
  }
}

test('deployment verifies generated domain artifacts before upload', () => {
  const workflow = read('.github/workflows/deploy.yml').split('\n');
  const activeIndex = (pattern) => workflow.findIndex((line) => pattern.test(line) && !line.trimStart().startsWith('#'));
  const build = activeIndex(/^\s+run:\s+npm run build\s*$/);
  const verify = activeIndex(/^\s+run:\s+npm run test:domain\s*$/);
  const upload = activeIndex(/^\s+uses:\s+actions\/upload-pages-artifact@v\d+\s*$/);
  assert.ok(build >= 0 && verify > build && upload > verify, 'build → domain verification → upload order is required');
});

test('every generated SEO artifact uses the custom origin', () => {
  assert.ok(existsSync(join(dist, 'index.html')), 'run npm run build before this test');
  assert.equal(read('dist/CNAME').trim(), 'blog.kilpenguin.com');
  assert.match(read('dist/robots.txt'), /^Sitemap: https:\/\/blog\.kilpenguin\.com\/sitemap-index\.xml$/m);

  let pages = 0;
  let articles = 0;
  for (const file of files(dist, '.html')) {
    const path = relative(dist, file);
    const html = readFileSync(file, 'utf8');
    if (path === 'about/index.html') continue;
    if (path === '404.html') {
      const robotsTags = tags(html, 'meta').filter((tag) => tag.name === 'robots');
      assert.equal(robotsTags.length, 1, '404: exactly one robots directive required');
      assert.equal(robotsTags[0].content, 'noindex, follow');
      assert.equal(tags(html, 'link').filter((tag) => tag.rel === 'canonical').length, 0);
      continue;
    }

    pages += 1;
    const links = tags(html, 'link');
    const meta = tags(html, 'meta');
    const canonicalTags = links.filter((tag) => tag.rel === 'canonical');
    const ogUrlTags = meta.filter((tag) => tag.property === 'og:url');
    const ogImageTags = meta.filter((tag) => tag.property === 'og:image');
    const ogTypeTags = meta.filter((tag) => tag.property === 'og:type');
    assert.equal(canonicalTags.length, 1, `${path}: one canonical required`);
    assert.equal(ogUrlTags.length, 1, `${path}: one og:url required`);
    assert.equal(ogImageTags.length, 1, `${path}: one og:image required`);
    assert.equal(ogTypeTags.length, 1, `${path}: one og:type required`);
    assertCustomUrl(canonicalTags[0].href, `${path}: canonical`);
    assert.equal(ogUrlTags[0].content, canonicalTags[0].href, `${path}: og:url must equal canonical`);
    assertCustomUrl(ogImageTags[0].content, `${path}: og:image`);

    const structured = jsonLd(html);
    structured.forEach((value, index) => verifyStructuredUrls(value, `${path}: jsonld[${index}]`));
    const isArticle = structured.some((value) => value['@type'] === 'BlogPosting');
    assert.equal(ogTypeTags[0].content, isArticle ? 'article' : 'website', `${path}: og:type`);
    if (isArticle) articles += 1;
  }
  assert.ok(pages >= 170, `expected full site output, got ${pages} pages`);
  assert.ok(articles >= 100, `expected all article outputs, got ${articles}`);

  const sitemapFiles = readdirSync(dist).filter((name) => /^sitemap.*\.xml$/.test(name));
  assert.ok(sitemapFiles.length > 0, 'sitemap output is required');
  for (const name of sitemapFiles) {
    const sitemap = read(`dist/${name}`);
    assert.doesNotMatch(sitemap, /\/404(?:\.html)?<\/loc>/);
    for (const [, location] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) assertCustomUrl(location, `${name}: loc`);
    assert.doesNotMatch(sitemap, /kilhyeonjun\.github\.io/);
  }

  const rss = read('dist/rss.xml');
  const rssUrls = [
    ...[...rss.matchAll(/<(?:link|guid)\b[^>]*>([^<]+)<\/(?:link|guid)>/g)].map(([, url]) => url),
    ...[...rss.matchAll(/<atom:link\b[^>]*href="([^"]+)"/g)].map(([, url]) => url),
  ];
  for (const url of rssUrls) assertCustomUrl(url.replace(/&amp;/g, '&'), 'rss');
  assert.doesNotMatch(rss, /kilhyeonjun\.github\.io/);

  assert.doesNotMatch(read('dist/index.html'), new RegExp(oldOrigin.replaceAll('.', '\\.')));
});

test('Pagefind is pinned in the lockfile', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.match(packageJson.devDependencies?.pagefind ?? '', /^\d+\.\d+\.\d+$/, 'pagefind must be an exact dev dependency');
  assert.ok(JSON.parse(read('package-lock.json')).packages['node_modules/pagefind'], 'pagefind must be locked');
});

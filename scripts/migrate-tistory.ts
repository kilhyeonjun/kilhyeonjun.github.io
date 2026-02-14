import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// ─── Configuration ───────────────────────────────────────────────
const SOURCE_DIR = '/tmp/tistory-backup/penguin-dev-1-1';
const OUTPUT_DIR = path.resolve(import.meta.dirname, '../src/content/blog');
const IMAGE_OUTPUT_DIR = path.resolve(import.meta.dirname, '../public/images/tistory');
const TISTORY_BASE_URL = 'https://penguin-dev.tistory.com';

// ─── Category Mapping ────────────────────────────────────────────
// Strip emoji prefixes from tistory categories and map to clean names
const CATEGORY_CLEANUP: Record<string, string> = {
  'Career & Growth': 'Career & Growth',
  'Backend Development': 'Backend Development',
  'Performance & Optimization': 'Performance & Optimization',
  'Dev Tools & Environment': 'Dev Tools & Environment',
  'Architecture & Design': 'Architecture & Design',
  'Personal': 'Personal',
};

// Subcategory → tags mapping
const SUBCATEGORY_TAGS: Record<string, string[]> = {
  'Learning Journey': ['Learning'],
  'Conference': ['Conference'],
  'Concurrency Control': ['Concurrency', 'Java'],
  'Spring': ['Spring Boot', 'Java'],
  'Java': ['Java'],
  'DB Tuning': ['Database', 'Performance'],
  'Caching': ['Cache', 'Performance'],
  'Server Optimization': ['Performance', 'AWS'],
  'Version Control': ['Git'],
  'Docs': ['Documentation'],
  'Blog Setup': ['Blog'],
  'Clean Architecture': ['Architecture', 'NestJS'],
  'Introduction': [],
};

// ─── Turndown Setup ──────────────────────────────────────────────
function createTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    hr: '---',
    strongDelimiter: '**',
    emDelimiter: '*',
  });

  // GFM plugin (tables, strikethrough, task lists)
  turndown.use(gfm);

  // Custom rule: tistory image blocks
  turndown.addRule('tistoryFigure', {
    filter: (node) => {
      return (
        node.nodeName === 'FIGURE' &&
        node.classList.contains('imageblock')
      );
    },
    replacement: (_content, node) => {
      const img = (node as Element).querySelector('img');
      const figcaption = (node as Element).querySelector('figcaption');
      if (!img) return '';
      const src = img.getAttribute('src') ?? '';
      const alt = figcaption?.textContent?.trim() || '';
      return `\n\n![${alt}](${src})\n\n`;
    },
  });

  // Custom rule: tistory code blocks with language class on <pre>
  turndown.addRule('tistoryCodeBlock', {
    filter: (node) => {
      return (
        node.nodeName === 'PRE' &&
        node.querySelector('code') !== null
      );
    },
    replacement: (_content, node) => {
      const pre = node as Element;
      const code = pre.querySelector('code');
      if (!code) return '';

      // Get language from pre's class or data attribute
      let lang = pre.getAttribute('data-ke-language') || '';
      if (!lang) {
        // The class on <pre> is the language (e.g. class="typescript")
        const classes = Array.from(pre.classList);
        const ignoredClasses = new Set(['language-none', 'code-block']);
        lang = classes.find((c) => !ignoredClasses.has(c)) ?? '';
      }

      // Map tistory language names to standard fence languages
      const langMap: Record<string, string> = {
        angelscript: '',
        routeros: '',
        delphi: '',
        aspectj: 'java',
        kotlin: 'kotlin',
        typescript: 'typescript',
        javascript: 'javascript',
        java: 'java',
        python: 'python',
        sql: 'sql',
        bash: 'bash',
        json: 'json',
        yaml: 'yaml',
        less: 'javascript',
        xml: 'xml',
        html: 'html',
        css: 'css',
        go: 'go',
        swift: 'swift',
        ruby: 'ruby',
        shell: 'bash',
        plaintext: '',
        text: '',
      };

      const mappedLang = langMap[lang.toLowerCase()] ?? lang.toLowerCase();

      // Get raw text content and decode HTML entities
      let codeText = code.textContent ?? '';

      return `\n\n\`\`\`${mappedLang}\n${codeText}\n\`\`\`\n\n`;
    },
  });

  // Remove tistory translation tooltip container
  turndown.addRule('removeMttContainer', {
    filter: (node) => {
      return (
        node.nodeName === 'DIV' &&
        (node as Element).id === 'mttContainer'
      );
    },
    replacement: () => '',
  });

  // Handle tistory-specific <p> tags with data-ke-size
  turndown.addRule('tistoryParagraph', {
    filter: (node) => {
      return (
        node.nodeName === 'P' &&
        (node as Element).hasAttribute('data-ke-size') &&
        // Only match if there's a nested figure (paragraph wrapping figure)
        (node as Element).querySelector('figure') !== null
      );
    },
    replacement: (_content, node) => {
      const figure = (node as Element).querySelector('figure');
      if (!figure) return _content;
      const img = figure.querySelector('img');
      const figcaption = figure.querySelector('figcaption');
      if (!img) return _content;
      const src = img.getAttribute('src') ?? '';
      const alt = figcaption?.textContent?.trim() || '';
      return `\n\n![${alt}](${src})\n\n`;
    },
  });

  // Remove tistory <hr> with data-ke-style
  turndown.addRule('tistoryHr', {
    filter: (node) => {
      return (
        node.nodeName === 'HR' &&
        (node as Element).hasAttribute('data-ke-style')
      );
    },
    replacement: () => '\n\n---\n\n',
  });

  return turndown;
}

// ─── HTML Parsing Helpers ────────────────────────────────────────

function extractBetween(html: string, startTag: string, endTag: string): string {
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) return '';
  const contentStart = startIdx + startTag.length;
  const endIdx = html.indexOf(endTag, contentStart);
  if (endIdx === -1) return '';
  return html.slice(contentStart, endIdx);
}

function extractTagContent(html: string, selector: string): string {
  // Simple extraction for class-based selectors
  if (selector.startsWith('.')) {
    const className = selector.slice(1);
    const regex = new RegExp(
      `<[^>]+class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)</`,
      'i'
    );
    const match = html.match(regex);
    return match?.[1]?.trim() ?? '';
  }
  // Tag selector
  const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)</${selector}>`, 'i');
  const match = html.match(regex);
  return match?.[1]?.trim() ?? '';
}

function parseCategory(rawCategory: string): { category: string; subcategory: string } {
  // Format: "emoji Category/emoji Subcategory" or just "emoji Category"
  // Strip emoji prefixes (any non-ASCII characters at the start)
  const cleaned = rawCategory.replace(/[^\x20-\x7E가-힣a-zA-Z0-9&/() -]/g, '').trim();
  const parts = cleaned.split('/').map((p) => p.trim());

  const mainCat = parts[0] ?? 'Uncategorized';
  const subCat = parts[1] ?? '';

  // Try to find matching category
  const mappedCategory =
    Object.keys(CATEGORY_CLEANUP).find(
      (key) => mainCat.includes(key) || key.includes(mainCat)
    ) ?? mainCat;

  return {
    category: CATEGORY_CLEANUP[mappedCategory] ?? mappedCategory,
    subcategory: subCat,
  };
}

function deriveTags(category: string, subcategory: string, title: string): string[] {
  const tags: string[] = [];

  // Add subcategory-derived tags
  if (subcategory) {
    const subTags = Object.entries(SUBCATEGORY_TAGS).find(
      ([key]) => subcategory.includes(key) || key.includes(subcategory)
    );
    if (subTags) tags.push(...subTags[1]);
  }

  // Derive from title keywords
  const titleLower = title.toLowerCase();
  if (titleLower.includes('spring') && !tags.includes('Spring Boot'))
    tags.push('Spring Boot');
  if (titleLower.includes('redis') && !tags.includes('Redis')) tags.push('Redis');
  if (titleLower.includes('jpa') && !tags.includes('JPA')) tags.push('JPA');
  if (titleLower.includes('lambda') && !tags.includes('AWS Lambda'))
    tags.push('AWS Lambda');
  if (titleLower.includes('nestjs') && !tags.includes('NestJS')) tags.push('NestJS');
  if (titleLower.includes('typeorm') && !tags.includes('TypeORM')) tags.push('TypeORM');
  if (titleLower.includes('bigquery') && !tags.includes('BigQuery'))
    tags.push('BigQuery');
  if (titleLower.includes('dependabot') && !tags.includes('GitHub'))
    tags.push('GitHub');
  if (titleLower.includes('mermaid') && !tags.includes('Mermaid')) tags.push('Mermaid');
  if (titleLower.includes('github') && !tags.includes('GitHub')) tags.push('GitHub');
  if (titleLower.includes('gzip') && !tags.includes('Optimization'))
    tags.push('Optimization');
  if (
    (titleLower.includes('동시성') || titleLower.includes('concurrency')) &&
    !tags.includes('Concurrency')
  )
    tags.push('Concurrency');
  if (titleLower.includes('캐시') || titleLower.includes('cache')) {
    if (!tags.includes('Cache')) tags.push('Cache');
  }
  if (titleLower.includes('가면사배') || titleLower.includes('시스템 설계')) {
    if (!tags.includes('System Design')) tags.push('System Design');
  }
  if (
    titleLower.includes('항해') ||
    titleLower.includes('hanghae')
  ) {
    if (!tags.includes('Bootcamp')) tags.push('Bootcamp');
  }
  if (titleLower.includes('밋업') || titleLower.includes('meetup') || titleLower.includes('후기')) {
    if (!tags.includes('Conference')) tags.push('Conference');
  }

  return [...new Set(tags)];
}

function generateSlug(postNum: string, title: string): string {
  // Create a slug from post number + title
  // Korean-friendly: keep korean chars, transliterate simple mappings
  let slug = title
    .toLowerCase()
    .replace(/[#\[\](){}?!@$%^&*+=<>:;"'`,./\\|~]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();

  // Prefix with post number for uniqueness
  return `tistory-${postNum}-${slug}`;
}

function generateDescription(markdownContent: string): string {
  // Strip headings, code blocks, images, links, bold/italic, and collapse whitespace
  return markdownContent
    .replace(/^#+\s.*/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
    .trim();
}

function detectSeries(
  title: string
): { name: string; order: number } | undefined {
  // Detect series patterns like "[가면사배 시리즈 #2]"
  const seriesMatch = title.match(/\[(.+?시리즈)\s*#?(\d+)\]/);
  if (seriesMatch) {
    return { name: seriesMatch[1], order: parseInt(seriesMatch[2], 10) };
  }

  // Detect architecture series
  if (title.includes('사내에서 새로운 아키텍처 제안하기')) {
    const orderMatch = title.match(/\((\d+)\)\s*$/);
    return {
      name: '사내 아키텍처 개선기',
      order: orderMatch ? parseInt(orderMatch[1], 10) : 1,
    };
  }

  // Detect 항해 weekly series
  const weeklyMatch = title.match(/항해.*?(\d+)주차/);
  if (weeklyMatch) {
    return {
      name: '항해 플러스 백엔드 회고',
      order: parseInt(weeklyMatch[1], 10),
    };
  }

  return undefined;
}

function cleanMarkdown(md: string): string {
  let cleaned = md;

  // Fix double-encoded HTML entities that turndown didn't catch
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  cleaned = cleaned.replace(/&rarr;/g, '→');
  cleaned = cleaned.replace(/&larr;/g, '←');
  cleaned = cleaned.replace(/&darr;/g, '↓');
  cleaned = cleaned.replace(/&uarr;/g, '↑');
  cleaned = cleaned.replace(/&ndash;/g, '–');
  cleaned = cleaned.replace(/&mdash;/g, '—');
  cleaned = cleaned.replace(/&middot;/g, '·');
  cleaned = cleaned.replace(/&hellip;/g, '...');
  cleaned = cleaned.replace(/&lsquo;/g, '\u2018');
  cleaned = cleaned.replace(/&rsquo;/g, '\u2019');
  cleaned = cleaned.replace(/&ldquo;/g, '\u201C');
  cleaned = cleaned.replace(/&rdquo;/g, '\u201D');

  // Remove excessive blank lines (3+ → 2)
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

  // Remove leading/trailing whitespace per line
  cleaned = cleaned
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  // Remove leading blank lines
  cleaned = cleaned.replace(/^\n+/, '');

  // Ensure single trailing newline
  cleaned = cleaned.trimEnd() + '\n';

  return cleaned;
}

function copyImages(
  postDir: string,
  postNum: string
): Map<string, string> {
  const imageMap = new Map<string, string>();
  const imgDir = path.join(postDir, 'img');

  if (!fs.existsSync(imgDir)) return imageMap;

  const targetDir = path.join(IMAGE_OUTPUT_DIR, postNum);
  fs.mkdirSync(targetDir, { recursive: true });

  const files = fs.readdirSync(imgDir);
  for (const file of files) {
    const srcPath = path.join(imgDir, file);
    const destPath = path.join(targetDir, file);

    fs.copyFileSync(srcPath, destPath);

    // Map from relative HTML path to public image path
    const htmlRelPath = `./img/${file}`;
    const publicPath = `/images/tistory/${postNum}/${file}`;
    imageMap.set(htmlRelPath, publicPath);
  }

  return imageMap;
}

function replaceImagePaths(markdown: string, imageMap: Map<string, string>): string {
  let result = markdown;
  for (const [oldPath, newPath] of imageMap) {
    // Replace all occurrences of the old image path
    result = result.replaceAll(oldPath, newPath);
  }
  return result;
}

function escapeYamlString(str: string): string {
  // Escape quotes and backslashes for YAML double-quoted strings
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ─── Main Processing ─────────────────────────────────────────────

function processPost(postDir: string, postNum: string): void {
  // Find the HTML file
  const files = fs.readdirSync(postDir);
  const htmlFile = files.find((f) => f.endsWith('.html'));
  if (!htmlFile) {
    console.warn(`[SKIP] No HTML file in ${postDir}`);
    return;
  }

  const htmlPath = path.join(postDir, htmlFile);
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Extract metadata
  const title = extractTagContent(html, 'title') || `Post ${postNum}`;
  const rawCategory = extractTagContent(html, '.category');
  const dateStr = extractTagContent(html, '.date');
  const { category, subcategory } = parseCategory(rawCategory);

  // Parse date
  let publishDate: string;
  if (dateStr) {
    // Format: "2025-06-30 20:32:13"
    const datePart = dateStr.split(' ')[0];
    publishDate = datePart ?? '2024-01-01';
  } else {
    publishDate = '2024-01-01';
  }

  // Extract content area
  const contentHtml = extractBetween(
    html,
    '<div class="contents_style">',
    '</div>\n                        <br/>'
  ) || extractBetween(
    html,
    '<div class="contents_style">',
    '<div id="mttContainer"'
  ) || extractBetween(
    html,
    '<div class="contents_style">',
    '</div>\n                        \n                        <br/>'
  );

  if (!contentHtml) {
    // Fallback: extract everything between contents_style div
    const fallbackMatch = html.match(
      /<div class="contents_style">([\s\S]*?)<\/div>\s*(?:<br\s*\/?>)?\s*<div class="tags">/
    );
    if (!fallbackMatch) {
      console.warn(`[SKIP] No content found in ${htmlPath}`);
      return;
    }
  }

  // Use the best content extraction
  let finalContentHtml = contentHtml;
  if (!finalContentHtml) {
    const fallbackMatch = html.match(
      /<div class="contents_style">([\s\S]*?)<\/div>\s*(?:<br\s*\/?>)?\s*<div class="tags">/
    );
    finalContentHtml = fallbackMatch?.[1] ?? '';
  }

  // Copy images and get path mapping
  const imageMap = copyImages(postDir, postNum);

  // Convert HTML to Markdown
  const turndown = createTurndownService();
  let markdown = turndown.turndown(finalContentHtml.trim());

  // Replace image paths
  markdown = replaceImagePaths(markdown, imageMap);

  // Clean up markdown
  markdown = cleanMarkdown(markdown);

  // Generate metadata
  const tags = deriveTags(category, subcategory, title);
  const description = generateDescription(markdown);
  const slug = generateSlug(postNum, title);
  const series = detectSeries(title);
  const originalUrl = `${TISTORY_BASE_URL}/${postNum}`;

  // Build frontmatter
  const frontmatterLines = [
    '---',
    `title: "${escapeYamlString(title)}"`,
    `description: "${escapeYamlString(description || title)}"`,
    `publishDate: ${publishDate}`,
    `category: "${escapeYamlString(category)}"`,
    `tags: [${tags.map((t) => `"${t}"`).join(', ')}]`,
  ];

  if (series) {
    frontmatterLines.push(`series:`);
    frontmatterLines.push(`  name: "${escapeYamlString(series.name)}"`);
    frontmatterLines.push(`  order: ${series.order}`);
  }

  frontmatterLines.push(`draft: false`);
  frontmatterLines.push(`source: "tistory"`);
  frontmatterLines.push(`originalUrl: "${originalUrl}"`);
  frontmatterLines.push('---');

  const output = `${frontmatterLines.join('\n')}\n\n${markdown}`;
  const outputPath = path.join(OUTPUT_DIR, `${slug}.mdx`);

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`[OK] ${slug}.mdx (${title})`);
}

function main(): void {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(IMAGE_OUTPUT_DIR, { recursive: true });

  // Get all numbered directories
  const entries = fs.readdirSync(SOURCE_DIR, { withFileTypes: true });
  const postDirs = entries
    .filter((e) => e.isDirectory() && /^\d+$/.test(e.name))
    .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));

  console.log(`Found ${postDirs.length} tistory posts\n`);

  let success = 0;
  let failed = 0;

  for (const dir of postDirs) {
    const postDir = path.join(SOURCE_DIR, dir.name);
    try {
      processPost(postDir, dir.name);
      success++;
    } catch (err) {
      console.error(`[FAIL] Post ${dir.name}: ${err}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} converted, ${failed} failed`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Images: ${IMAGE_OUTPUT_DIR}`);
}

main();

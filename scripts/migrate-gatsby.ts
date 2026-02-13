import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SOURCE_DIR = '/tmp/GitHubPageMaker/_posts';
const OUTPUT_DIR = path.resolve(import.meta.dirname, '../src/content/blog');

const CATEGORY_MAP: Record<string, string> = {
  java: 'Java',
  python: 'Python',
  go: 'Go',
  git: 'Git',
  hadoop: 'Hadoop',
  jekyll: 'Jekyll',
};

const SUBDIR_TAG_MAP: Record<string, string> = {
  springboot: 'Spring Boot',
  security: 'Spring Security',
};

function slugify(filePath: string): string {
  const relative = path.relative(SOURCE_DIR, filePath);
  return relative
    .replace(/\.md$/, '')
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function extractTags(
  category: string,
  subdirs: string[],
  frontmatterTags: string[],
  content: string
): string[] {
  const tags: string[] = [];

  const mapped = CATEGORY_MAP[category] ?? category;
  tags.push(mapped);

  for (const dir of subdirs) {
    const tag = SUBDIR_TAG_MAP[dir];
    if (tag) tags.push(tag);
  }

  for (const t of frontmatterTags) {
    const normalized = SUBDIR_TAG_MAP[t] ?? CATEGORY_MAP[t] ?? t;
    const isDuplicate = tags.some(
      (existing) => existing.toLowerCase() === normalized.toLowerCase()
    );
    if (!isDuplicate) tags.push(normalized);
  }

  if (content.includes('Spring Security') && !tags.includes('Spring Security'))
    tags.push('Spring Security');
  if (content.includes('JWT')) tags.push('JWT');

  return [...new Set(tags)];
}

function deriveCategory(topDir: string, subdirs: string[]): string {
  const mapped = CATEGORY_MAP[topDir] ?? topDir;

  if (topDir === 'java' && subdirs.includes('springboot')) {
    return 'Spring Boot';
  }

  return mapped;
}

function cleanContent(content: string): string {
  let cleaned = content.replace(/\{%\s*include\s+[^%]*%\}/g, '');
  // Convert Jekyll image paths to absolute paths pointing to public/images/legacy/
  // Handles both ./assets/built/images/... and assets/built/images/...
  cleaned = cleaned.replace(
    /!\[([^\]]*)\]\(\.?\/?\/?assets\/built\/images\/([^)]+)\)/g,
    '![$1](/images/legacy/$2)'
  );
  cleaned = cleaned.replace(/^\n+/, '');
  return cleaned;
}

function processFile(filePath: string): void {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  const title = frontmatter.title ?? path.basename(filePath, '.md');

  let date: string;
  if (frontmatter.date) {
    const parsed = new Date(frontmatter.date);
    date = !isNaN(parsed.getTime())
      ? parsed.toISOString().split('T')[0]
      : '2021-01-01';
  } else {
    const match = path.basename(filePath).match(/^(\d{4}-\d{2}-\d{2})/);
    date = match ? match[1] : '2021-01-01';
  }

  const categories: string[] = Array.isArray(frontmatter.categories)
    ? frontmatter.categories
    : frontmatter.category
      ? [frontmatter.category]
      : [];

  const topCategory = categories[0] ?? 'Uncategorized';

  const relative = path.relative(SOURCE_DIR, filePath);
  const parts = relative.split(path.sep);
  parts.pop();
  const subdirs = parts.slice(1);

  const mappedCategory = deriveCategory(topCategory, subdirs);

  const frontmatterTags: string[] = Array.isArray(frontmatter.tags)
    ? frontmatter.tags
    : [];

  const tags = extractTags(topCategory, subdirs, frontmatterTags, content);
  const draft = frontmatter.draft ?? false;
  const slug = slugify(filePath);

  const cleanedContent = cleanContent(content);

  const description = cleanedContent
    .replace(/^#+\s.*/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 150)
    .trim();

  const originalUrl = `https://kilhyeonjun.github.io/${topCategory}/${path.basename(filePath, '.md')}/`;

  const newFrontmatter = [
    '---',
    `title: "${title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
    `description: "${(description || title).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
    `publishDate: ${date}`,
    `category: "${mappedCategory}"`,
    `tags: [${tags.map((t) => `"${t}"`).join(', ')}]`,
    `draft: ${draft}`,
    `source: "gatsby"`,
    `originalUrl: "${originalUrl}"`,
    '---',
  ].join('\n');

  const output = `${newFrontmatter}\n\n${cleanedContent.trim()}\n`;
  const outputPath = path.join(OUTPUT_DIR, `${slug}.mdx`);

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`[OK] ${slug}.mdx`);
}

function main(): void {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files: string[] = [];

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.md')) {
        files.push(full);
      }
    }
  }

  walk(SOURCE_DIR);
  console.log(`Found ${files.length} markdown files\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    try {
      processFile(file);
      success++;
    } catch (err) {
      console.error(`[FAIL] ${file}: ${err}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} converted, ${failed} failed`);
}

main();

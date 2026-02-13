import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SOURCE_DIR = path.resolve(
  import.meta.dirname,
  '../../blog-gatsby-backup/content/blog'
);
const OUTPUT_DIR = path.resolve(import.meta.dirname, '../src/content/blog');

const CATEGORY_MAP: Record<string, string> = {
  aws: 'AWS',
  go: 'Go',
  spring: 'Spring',
  'node.js': 'Node.js',
  hadoop: 'Hadoop',
  git: 'Git',
};

function slugify(filePath: string): string {
  const relative = path.relative(SOURCE_DIR, filePath);
  return relative
    .replace(/\.md$/, '')
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function extractTags(category: string, content: string): string[] {
  const tags: string[] = [];
  const mapped = CATEGORY_MAP[category] ?? category;
  tags.push(mapped);

  if (content.includes('Spring Security')) tags.push('Spring Security');
  if (content.includes('JWT')) tags.push('JWT');
  if (content.includes('SAA') || content.includes('Solution Architect'))
    tags.push('AWS SAA');
  if (content.includes('serverless') || content.includes('Serverless'))
    tags.push('Serverless');

  return [...new Set(tags)];
}

function processFile(filePath: string): void {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  const title = frontmatter.title ?? path.basename(filePath, '.md');
  const date = frontmatter.date
    ? new Date(frontmatter.date).toISOString().split('T')[0]
    : '2021-01-01';
  const category = frontmatter.category ?? 'Uncategorized';
  const draft = frontmatter.draft ?? false;
  const slug = slugify(filePath);
  const tags = extractTags(category, content);
  const mappedCategory = CATEGORY_MAP[category] ?? category;

  const description = content
    .replace(/^#+\s.*/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 150)
    .trim();

  const newFrontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `description: "${(description || title).replace(/"/g, '\\"')}"`,
    `publishDate: ${date}`,
    `category: "${mappedCategory}"`,
    `tags: [${tags.map((t) => `"${t}"`).join(', ')}]`,
    `draft: ${draft}`,
    `source: "gatsby"`,
    `originalUrl: "https://kilhyeonjun.github.io/${category}/${path.basename(filePath, '.md')}/"`,
    '---',
  ].join('\n');

  const output = `${newFrontmatter}\n\n${content.trim()}\n`;
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

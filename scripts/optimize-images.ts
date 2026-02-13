import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const IMAGES_DIR = path.resolve('public/images');
const CONTENT_DIR = path.resolve('src/content/blog');
const SUPPORTED_EXTS = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];

async function findImages(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findImages(fullPath));
    } else if (SUPPORTED_EXTS.includes(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

async function optimizeImages() {
  const images = await findImages(IMAGES_DIR);
  console.log(`Found ${images.length} images to optimize`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let converted = 0;

  for (const imgPath of images) {
    const webpPath = imgPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

    if (fs.existsSync(webpPath)) continue;

    try {
      const originalSize = fs.statSync(imgPath).size;
      totalOriginal += originalSize;

      const webpBuffer = await sharp(imgPath)
        .webp({ quality: 80 })
        .toBuffer();

      if (webpBuffer.length < originalSize) {
        fs.writeFileSync(webpPath, webpBuffer);
        totalOptimized += webpBuffer.length;
        converted++;
      } else {
        totalOptimized += originalSize;
      }
    } catch (err) {
      console.warn(`Failed to optimize ${imgPath}: ${err}`);
      totalOptimized += fs.statSync(imgPath).size;
    }
  }

  console.log(`Converted ${converted}/${images.length} images to WebP`);
  console.log(`Original: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB → Optimized: ${(totalOptimized / 1024 / 1024).toFixed(1)}MB`);

  const mdxFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  let updatedFiles = 0;

  for (const mdxFile of mdxFiles) {
    const filePath = path.join(CONTENT_DIR, mdxFile);
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    content = content.replace(
      /!\[([^\]]*)\]\(\/images\/([^)]+)\.(png|jpg|jpeg)\)/gi,
      (match, alt, imgPath, ext) => {
        const webpPath = path.join(IMAGES_DIR, `${imgPath}.webp`);
        if (fs.existsSync(webpPath)) {
          modified = true;
          return `![${alt}](/images/${imgPath}.webp)`;
        }
        return match;
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      updatedFiles++;
    }
  }

  console.log(`Updated ${updatedFiles} MDX files with WebP references`);
}

optimizeImages().catch(console.error);

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { sortPostsByDate, getPublishedPosts } from '../lib/utils';

export async function GET(context: APIContext) {
  const blog = await getPublishedPosts();
  const sorted = sortPostsByDate(blog);

  // TODO: post.body is raw MDX, not rendered HTML.
  // Ideally use sanitizeHtml(renderToString(post)) or a similar approach
  // to provide rendered HTML via the `content` option.
  // However, Astro's render() is not available in API endpoints.
  // Consider using @astrojs/rss `customData` or a build-time pre-render step.
  return rss({
    title: 'kil-penguin blog',
    description: 'Backend Developer 기술 블로그',
    site: context.site!,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      content: post.body ?? '',
    })),
    customData: '<language>ko</language>',
  });
}

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: 'KHJ Blog',
    description: 'Backend Developer 기술 블로그',
    site: context.site!,
    items: blog
      .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishDate,
        description: post.data.description,
        link: `/blog/${post.id}/`,
      })),
    customData: '<language>ko</language>',
  });
}

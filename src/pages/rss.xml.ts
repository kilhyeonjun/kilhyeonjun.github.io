import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { sortPostsByDate } from '../lib/utils';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: 'kil-penguin blog',
    description: 'Backend Developer 기술 블로그',
    site: context.site!,
    items: sortPostsByDate(blog)
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishDate,
        description: post.data.description,
        link: `/blog/${post.id}/`,
      })),
    customData: '<language>ko</language>',
  });
}

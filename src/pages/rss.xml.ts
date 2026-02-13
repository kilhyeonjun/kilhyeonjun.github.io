import rss from '@astrojs/rss';
import { render } from 'astro:content';
import type { APIContext } from 'astro';
import { sortPostsByDate, getPublishedPosts } from '../lib/utils';

export async function GET(context: APIContext) {
  const blog = await getPublishedPosts();
  const sorted = sortPostsByDate(blog);

  const items = await Promise.all(
    sorted.map(async (post) => {
      const { Content } = await render(post);
      return {
        title: post.data.title,
        pubDate: post.data.publishDate,
        description: post.data.description,
        link: `/blog/${post.id}/`,
        content: post.body ?? '',
      };
    })
  );

  return rss({
    title: 'kil-penguin blog',
    description: 'Backend Developer 기술 블로그',
    site: context.site!,
    items,
    customData: '<language>ko</language>',
  });
}

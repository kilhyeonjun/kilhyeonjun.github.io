import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedPosts, formatDate } from '../../lib/utils';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'node:fs';
import * as path from 'node:path';

let fontData: Buffer | null = null;
let fontRegularData: Buffer | null = null;

try {
  fontData = fs.readFileSync(path.resolve('src/assets/fonts/noto-sans-kr-700-normal.woff'));
  fontRegularData = fs.readFileSync(path.resolve('src/assets/fonts/noto-sans-kr-400-normal.woff'));
} catch {
  console.warn('OG image: Font files not found, will use fallback image');
}

function createFallbackPng(): Uint8Array {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#0f172a"/>
    <text x="60" y="520" font-family="sans-serif" font-size="24" font-weight="bold" fill="#3b82f6">kil-penguin blog</text>
  </svg>`;
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  const { title, category, publishDate } = post.data;

  if (!fontData || !fontRegularData) {
    const pngBuffer = createFallbackPng();
    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  const formattedDate = formatDate(publishDate);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          padding: '60px',
          fontFamily: 'Noto Sans KR',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '18px',
                            color: '#94a3b8',
                            backgroundColor: '#1e293b',
                            padding: '6px 16px',
                            borderRadius: '9999px',
                          },
                          children: category,
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '16px',
                            color: '#64748b',
                          },
                          children: formattedDate,
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: title.length > 40 ? '40px' : '48px',
                      fontWeight: 700,
                      color: '#f1f5f9',
                      lineHeight: 1.3,
                      maxHeight: '250px',
                      overflow: 'hidden',
                    },
                    children: title,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#3b82f6',
                    },
                    children: 'kil-penguin blog',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans KR',
          data: fontRegularData,
          weight: 400 as const,
          style: 'normal' as const,
        },
        {
          name: 'Noto Sans KR',
          data: fontData,
          weight: 700 as const,
          style: 'normal' as const,
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const buffer = new Uint8Array(pngBuffer);
  return new Response(buffer.buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

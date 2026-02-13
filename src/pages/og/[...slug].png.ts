import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch font from ${url}: ${res.status}`);
  }
  return res.arrayBuffer();
}

let fontData: ArrayBuffer;
let fontRegularData: ArrayBuffer;

try {
  [fontData, fontRegularData] = await Promise.all([
    fetchFont('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.woff'),
    fetchFont('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-400-normal.woff'),
  ]);
} catch {
  // Fallback: use empty ArrayBuffers so the build doesn't fail when CDN is down.
  // OG images will render with the default satori font instead of Noto Sans KR.
  console.warn('⚠️ Failed to fetch Korean fonts for OG images. Using fallback.');
  fontData = new ArrayBuffer(0);
  fontRegularData = new ArrayBuffer(0);
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  const { title, category, publishDate } = post.data;

  const formattedDate = publishDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
      fonts: fontData.byteLength > 0
        ? [
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
          ]
        : [],
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

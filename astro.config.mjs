// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

function rehypeLazyImages() {
  /** @param {import('hast').Root} tree */
  return (tree) => {
    /** @param {import('hast').Root | import('hast').Element} node */
    const visit = (node) => {
      if ('tagName' in node && node.tagName === 'img' && node.properties) {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
      }
      if ('children' in node) node.children.forEach((/** @type {any} */ child) => visit(child));
    };
    visit(tree);
  };
}

export default defineConfig({
  site: 'https://kilhyeonjun.github.io',
  redirects: {
    '/about': '/resume/',
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeLazyImages],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
    },
  },
});

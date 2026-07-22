// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';

/** Remark plugin: convert ```mermaid code blocks to <pre class="mermaid"> HTML nodes (bypasses Shiki) */
function remarkMermaid() {
  return (/** @type {import('mdast').Root} */ tree) => {
    /** @param {import('mdast').Root | import('mdast').Content} node @param {number} [index] @param {any} [parent] */
    const visit = (node, index, parent) => {
      if (node.type === 'code' && /** @type {import('mdast').Code} */ (node).lang === 'mermaid') {
        const value = /** @type {import('mdast').Code} */ (node).value;
        /** @type {any} */
        const htmlNode = {
          type: 'html',
          value: `<pre class="mermaid">${value}</pre>`,
        };
        if (parent && typeof index === 'number') {
          parent.children[index] = htmlNode;
        }
        return;
      }
      if ('children' in node) {
        /** @type {any[]} */ (node.children).forEach((/** @type {any} */ child, /** @type {number} */ i) => visit(child, i, node));
      }
    };
    visit(tree, undefined, undefined);
  };
}

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
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMermaid, remarkGfm],
    rehypePlugins: [rehypeLazyImages],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      langAlias: {
        jsp: 'html',
        arduino: 'cpp',
        actionscript: 'javascript',
        livescript: 'javascript',
        livecodeserver: 'plaintext',
        reasonml: 'ocaml',
        vbnet: 'vb',
        pgsql: 'sql',
        delphi: 'pascal',
        dts: 'plaintext',
        fix: 'plaintext',
        clean: 'plaintext',
        maxima: 'plaintext',
        isbl: 'plaintext',
        crmsh: 'plaintext',
      },
    },
  },
});

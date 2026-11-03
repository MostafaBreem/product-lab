import type { StorybookConfig } from '@storybook/react-native-web-vite';
import { fileURLToPath } from 'node:url';
import remarkGfm from 'remark-gfm';

const stub = fileURLToPath(new URL('./stubs/assets-registry.js', import.meta.url));

const config: StorybookConfig = {
  framework: { name: '@storybook/react-native-web-vite', options: {} },
  stories: ['../src/generated/**/*.mdx', '../src/pages/**/*.mdx', '../src/stories/**/*.stories.tsx'],
  addons: [{ name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } }],
  staticDirs: [{ from: '../../../packages/app-kit/assets/fonts', to: '/fonts' }, { from: '../public', to: '/' }],
  core: { disableTelemetry: true },
  // GitHub Pages serves the site under /product-lab/
  viteFinal: async (c) => ({
    ...c,
    base: process.env.SB_BASE ?? c.base,
    // react-native-svg's web build asks for the native asset registry; the kit never loads image assets through it.
    resolve: { ...c.resolve, alias: [...(Array.isArray(c.resolve?.alias) ? c.resolve!.alias : Object.entries(c.resolve?.alias ?? {}).map(([find, replacement]) => ({ find, replacement: replacement as string }))), { find: '@react-native/assets-registry/registry', replacement: stub }] },
  }),
};
export default config;

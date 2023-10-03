import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    //root: path.resolve(__dirname),
    include: ['./test/vitest/**/*.test.ts'],
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
    environment: 'node',
  },

  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});

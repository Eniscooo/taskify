import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolve tsconfig path aliases (incl. ones added by `nest g library`).
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});

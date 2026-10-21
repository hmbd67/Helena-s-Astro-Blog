import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default defineConfig({
  ...getViteConfig({}),
  test: {
    // Vitest configuration options can go here
  },
});
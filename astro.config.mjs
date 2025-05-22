import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [
    // Enable React for interactive components
    react(),
    // Enable Tailwind CSS
    tailwind(),
  ],
  // Enable SSR for dynamic content
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  // Configure server options
  server: {
    port: 3000,
  },
});
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

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
  adapter: vercel({
    // Vercel adapter options
    analytics: true,
    // Explicitly set Node.js version to 18 for Vercel
    nodeVersion: '18',
  }),
  // Configure server options
  server: {
    port: 3000,
  },
});
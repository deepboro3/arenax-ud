import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages hosts this repository under /arenax-ud/; Render uses the site root.
  base: process.env.PUBLIC_BASE_PATH || '/',
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:4000' } },
});

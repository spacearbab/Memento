import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built site works when deployed to
// https://<user>.github.io/<repo>/ (GitHub Pages project sites) without any
// extra configuration. If you deploy to a custom domain or to the root of
// github.io, this still works fine.
export default defineConfig({
  base: './',
  plugins: [react()]
});

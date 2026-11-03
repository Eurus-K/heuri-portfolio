import { defineConfig } from 'vite';

// relative base: the build works at the site root (localhost) and under the
// GitHub Pages project path (/heuri-portfolio/) alike
export default defineConfig({
  base: './',
});

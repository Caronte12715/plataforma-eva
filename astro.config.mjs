import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  integrations: [
    vue(), // <--- Esto es lo que le enseña a Astro a leer tus archivos .vue
    tailwind()
  ],
});
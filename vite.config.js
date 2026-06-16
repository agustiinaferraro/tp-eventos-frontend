import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

dotenv.config();

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ['.onrender.com']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()]
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        experiencia: resolve(__dirname, 'experiencia.html')
      }
    }
  }
});

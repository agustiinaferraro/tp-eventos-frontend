import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

dotenv.config();

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ['.loca.lt', '.lhr.life'],
    https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem')
    }
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
        experience: resolve(__dirname, 'admin.html')
      }
    }
  }
});

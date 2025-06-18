import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vite.dev/config/
export default defineConfig(() => {
  const env = loadEnv(null, process.cwd(), '');

  return {
    base: `/${env.NAME}/`,
    plugins: [
      react(),
      tsconfigPaths(),
      VitePWA({
        injectRegister: 'auto',
        workbox: {
          maximumFileSizeToCacheInBytes: 12582912,
        },
      }),
      ViteImageOptimizer({
        png: {
          quality: 80,
        },
        webp: {
          quality: 80,
        },
      }),
    ],
    root: 'src',
    publicDir: 'public',
    server: {
      port: env.VITE_PORT,
      host: true,
    },
    define: {
      'process.env': env
    },
    build: {
      outDir: '../build',
    }
  };
});

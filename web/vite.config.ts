import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import buildInfo from 'vite-plugin-info';

export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      port: 3001,
      clientPort: 3001,
    },
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    mainFields:
      mode === 'production' ? ['jsnext:main', 'module', 'main'] : undefined,
  },
  build: {
    outDir: './build',
  },
  plugins: [buildInfo(), preact()],
}));
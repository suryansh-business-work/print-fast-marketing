import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// One .env at the monorepo root feeds every app, including this one.
const workspaceRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  envDir: workspaceRoot,
  server: {
    port: Number(process.env.ROAS_CLIENT_PORT || 9002),
    proxy: {
      '/api': {
        target: process.env.ROAS_API_PROXY || 'http://localhost:9003',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: Number(process.env.ROAS_CLIENT_PORT || 9002),
  },
});

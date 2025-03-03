import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  esbuild: {
    jsx: 'automatic',
    jsxInject: `import React from 'react'`,
    include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
  },
});
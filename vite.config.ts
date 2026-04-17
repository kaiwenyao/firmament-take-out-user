import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // React 19 native support, no compatibility mode needed
      // jsxRuntime: 'automatic' is the default, already supporting React 19
      // Temporarily disable React Compiler while investigating issues
      // babel: {
      //   plugins: [['babel-plugin-react-compiler']],
      // },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/user'),
      },
    },
  },
})

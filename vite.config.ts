/// <reference types="vitest/config" />
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Coverage is scoped to the units covered by the unit-test suite:
      // API layer, utilities, shared components and the pages. The app
      // entry (main.tsx) and router glue are excluded as they are thin
      // wiring and not covered by unit tests. See the PR description for
      // the rationale.
      include: [
        'src/api/*.ts',
        'src/lib/*.ts',
        'src/components/**/*.tsx',
        'src/pages/**/*.tsx',
        'src/App.tsx',
      ],
      exclude: [
        'src/test/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
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

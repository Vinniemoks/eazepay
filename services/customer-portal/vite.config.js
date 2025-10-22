import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    port: 3001,
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_GATEWAY_URL || 'http://localhost:80',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    commonjsOptions: {
      include: [/shared/, /node_modules/]
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})

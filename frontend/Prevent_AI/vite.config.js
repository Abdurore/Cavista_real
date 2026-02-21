import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/grok-api': {
        target: 'https://api.x.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/grok-api/, ''),
      },
    },
  },
})

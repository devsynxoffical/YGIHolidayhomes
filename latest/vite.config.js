import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  optimizeDeps: {
    include: ['react-icons/fa', 'react-icons']
  },
  server: {
    fs: {
      strict: false
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    outDir: 'dist',
  },
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
      interval: 10,
    },
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose environment variables to the client
    'process.env.APPSYNC_API_KEY': JSON.stringify(process.env.APPSYNC_API_KEY),
  },
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

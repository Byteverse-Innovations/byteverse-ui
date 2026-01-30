import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      // Expose environment variables to the client
      'import.meta.env.VITE_APPSYNC_API_KEY': JSON.stringify(env.VITE_APPSYNC_API_KEY),
      'import.meta.env.VITE_AWS_REGION': JSON.stringify(env.VITE_AWS_REGION),
      'import.meta.env.VITE_APPSYNC_ENDPOINT': JSON.stringify(env.VITE_APPSYNC_ENDPOINT),
      'import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID': JSON.stringify(env.VITE_COGNITO_IDENTITY_POOL_ID),
      'import.meta.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify(env.VITE_COGNITO_USER_POOL_ID),
      'import.meta.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID': JSON.stringify(env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID),
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
  }
})

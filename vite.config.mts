import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Also merge with process.env to ensure CodeBuild environment variables are available
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const env = {
    ...fileEnv,
    // Override with process.env values (from CodeBuild) if they exist
    VITE_AWS_REGION: process.env.VITE_AWS_REGION || fileEnv.VITE_AWS_REGION,
    VITE_APPSYNC_ENDPOINT: process.env.VITE_APPSYNC_ENDPOINT || fileEnv.VITE_APPSYNC_ENDPOINT,
    VITE_COGNITO_IDENTITY_POOL_ID: process.env.VITE_COGNITO_IDENTITY_POOL_ID || fileEnv.VITE_COGNITO_IDENTITY_POOL_ID,
    VITE_COGNITO_USER_POOL_ID: process.env.VITE_COGNITO_USER_POOL_ID || fileEnv.VITE_COGNITO_USER_POOL_ID,
    VITE_COGNITO_USER_POOL_WEB_CLIENT_ID: process.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID || fileEnv.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID,
    VITE_APPSYNC_API_KEY: process.env.VITE_APPSYNC_API_KEY || fileEnv.VITE_APPSYNC_API_KEY,
  }
  
  return {
    plugins: [react()],
    define: {
      // Expose environment variables to the client
      // These will be replaced at build time with actual values
      'import.meta.env.VITE_APPSYNC_API_KEY': JSON.stringify(env.VITE_APPSYNC_API_KEY || ''),
      'import.meta.env.VITE_AWS_REGION': JSON.stringify(env.VITE_AWS_REGION || 'us-east-1'),
      'import.meta.env.VITE_APPSYNC_ENDPOINT': JSON.stringify(env.VITE_APPSYNC_ENDPOINT || ''),
      'import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID': JSON.stringify(env.VITE_COGNITO_IDENTITY_POOL_ID || ''),
      'import.meta.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify(env.VITE_COGNITO_USER_POOL_ID || ''),
      'import.meta.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID': JSON.stringify(env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID || ''),
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

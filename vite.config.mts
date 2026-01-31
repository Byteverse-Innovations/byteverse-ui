import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const fileEnv = loadEnv(mode, process.cwd(), '')
  
  // Prioritize process.env (from CodeBuild) over file-based env
  // This ensures CodeBuild environment variables take precedence
  const env = {
    VITE_AWS_REGION: process.env.VITE_AWS_REGION || fileEnv.VITE_AWS_REGION,
    VITE_APPSYNC_ENDPOINT: process.env.VITE_APPSYNC_ENDPOINT || fileEnv.VITE_APPSYNC_ENDPOINT,
    VITE_COGNITO_IDENTITY_POOL_ID: process.env.VITE_COGNITO_IDENTITY_POOL_ID || fileEnv.VITE_COGNITO_IDENTITY_POOL_ID,
    VITE_COGNITO_USER_POOL_ID: process.env.VITE_COGNITO_USER_POOL_ID || fileEnv.VITE_COGNITO_USER_POOL_ID,
    VITE_COGNITO_USER_POOL_WEB_CLIENT_ID: process.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID || fileEnv.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID,
    VITE_APPSYNC_API_KEY: process.env.VITE_APPSYNC_API_KEY || fileEnv.VITE_APPSYNC_API_KEY,
  }
  
  // Log environment variables during build (for debugging in CI/CD)
  if (process.env.CI || process.env.CODEBUILD_BUILD_ID) {
    console.log('=== Vite Config - Environment Variables ===')
    console.log('VITE_AWS_REGION:', env.VITE_AWS_REGION ? 'SET' : 'NOT_SET')
    console.log('VITE_APPSYNC_ENDPOINT:', env.VITE_APPSYNC_ENDPOINT ? 'SET' : 'NOT_SET')
    console.log('VITE_COGNITO_IDENTITY_POOL_ID:', env.VITE_COGNITO_IDENTITY_POOL_ID ? 'SET' : 'NOT_SET')
    console.log('VITE_COGNITO_USER_POOL_ID:', env.VITE_COGNITO_USER_POOL_ID ? 'SET' : 'NOT_SET')
    console.log('VITE_COGNITO_USER_POOL_WEB_CLIENT_ID:', env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID ? 'SET' : 'NOT_SET')
    console.log('VITE_APPSYNC_API_KEY:', env.VITE_APPSYNC_API_KEY ? 'SET' : 'NOT_SET')
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

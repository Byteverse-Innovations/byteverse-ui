import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This will read from .env file created in pre_build phase
  const fileEnv = loadEnv(mode, process.cwd(), '')

  // Prioritize fileEnv (from .env file) over process.env
  // The .env file is created in CodeBuild pre_build phase with actual values
  const env = {
    VITE_AWS_REGION: fileEnv.VITE_AWS_REGION || process.env.VITE_AWS_REGION || 'us-east-1',
    VITE_APPSYNC_ENDPOINT: fileEnv.VITE_APPSYNC_ENDPOINT || process.env.VITE_APPSYNC_ENDPOINT || '',
    VITE_COGNITO_IDENTITY_POOL_ID: fileEnv.VITE_COGNITO_IDENTITY_POOL_ID || process.env.VITE_COGNITO_IDENTITY_POOL_ID || '',
    VITE_COGNITO_USER_POOL_ID: fileEnv.VITE_COGNITO_USER_POOL_ID || process.env.VITE_COGNITO_USER_POOL_ID || '',
    VITE_COGNITO_USER_POOL_WEB_CLIENT_ID: fileEnv.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID || process.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID || '',
    VITE_APPSYNC_API_KEY: fileEnv.VITE_APPSYNC_API_KEY || process.env.VITE_APPSYNC_API_KEY || '',
  }

  // Log environment variables during build (for debugging in CI/CD)
  if (process.env.CI || process.env.CODEBUILD_BUILD_ID) {
    console.log('=== Vite Config - Environment Variables ===')
    console.log('From fileEnv (.env file):')
    console.log('  VITE_AWS_REGION:', fileEnv.VITE_AWS_REGION ? `${fileEnv.VITE_AWS_REGION.substring(0, 10)}... (length: ${fileEnv.VITE_AWS_REGION.length})` : 'NOT_SET')
    console.log('  VITE_COGNITO_IDENTITY_POOL_ID:', fileEnv.VITE_COGNITO_IDENTITY_POOL_ID ? `${fileEnv.VITE_COGNITO_IDENTITY_POOL_ID.substring(0, 20)}... (length: ${fileEnv.VITE_COGNITO_IDENTITY_POOL_ID.length})` : 'NOT_SET')
    console.log('Final values being used:')
    console.log('  VITE_AWS_REGION:', env.VITE_AWS_REGION ? `${env.VITE_AWS_REGION.substring(0, 10)}... (length: ${env.VITE_AWS_REGION.length})` : 'NOT_SET')
    console.log('  VITE_COGNITO_IDENTITY_POOL_ID:', env.VITE_COGNITO_IDENTITY_POOL_ID ? `${env.VITE_COGNITO_IDENTITY_POOL_ID.substring(0, 20)}... (length: ${env.VITE_COGNITO_IDENTITY_POOL_ID.length})` : 'NOT_SET')
  }

  return {
    plugins: [react()],
    // Note: Vite automatically exposes VITE_* variables from loadEnv
    // But we explicitly define them to ensure they're embedded correctly
    define: {
      // Expose environment variables to the client
      // These will be replaced at build time with actual values
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

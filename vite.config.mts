import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This will read from .env file created in pre_build phase
  // loadEnv automatically reads from .env, .env.local, .env.[mode], etc.
  const fileEnv = loadEnv(mode, process.cwd(), '')

  // Prioritize fileEnv (from .env file) over process.env
  // The .env file is created in CodeBuild pre_build phase with actual values
  // Trim values to remove any whitespace/newlines that might be in the .env file
  const env = {
    VITE_AWS_REGION: (fileEnv.VITE_AWS_REGION || process.env.VITE_AWS_REGION || 'us-east-1').trim(),
    VITE_APPSYNC_ENDPOINT: (fileEnv.VITE_APPSYNC_ENDPOINT || process.env.VITE_APPSYNC_ENDPOINT || '').trim(),
    VITE_COGNITO_IDENTITY_POOL_ID: (fileEnv.VITE_COGNITO_IDENTITY_POOL_ID || process.env.VITE_COGNITO_IDENTITY_POOL_ID || '').trim(),
    VITE_COGNITO_USER_POOL_ID: (fileEnv.VITE_COGNITO_USER_POOL_ID || process.env.VITE_COGNITO_USER_POOL_ID || '').trim(),
    VITE_COGNITO_USER_POOL_WEB_CLIENT_ID: (fileEnv.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID || process.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID || '').trim(),
    VITE_APPSYNC_API_KEY: (fileEnv.VITE_APPSYNC_API_KEY || process.env.VITE_APPSYNC_API_KEY || '').trim(),
  }

  // Log environment variables during build (for debugging in CI/CD)
  if (process.env.CI || process.env.CODEBUILD_BUILD_ID) {
    console.log('=== Vite Config - Environment Variables ===')
    console.log('Mode:', mode)
    console.log('Working directory:', process.cwd())
    console.log('Checking if .env file exists:')
    try {
      const fs = require('fs')
      const envExists = fs.existsSync('.env')
      console.log('  .env file exists:', envExists)
      if (envExists) {
        const envContent = fs.readFileSync('.env', 'utf8')
        console.log('  .env file lines:', envContent.split('\\n').length)
        console.log('  .env file contains VITE_COGNITO_IDENTITY_POOL_ID:', envContent.includes('VITE_COGNITO_IDENTITY_POOL_ID'))
      }
    } catch (e) {
      console.log('  Error checking .env file:', e.message)
    }
    console.log('From fileEnv (.env file):')
    console.log('  VITE_AWS_REGION:', fileEnv.VITE_AWS_REGION ? `${fileEnv.VITE_AWS_REGION.substring(0, 10)}... (length: ${fileEnv.VITE_AWS_REGION.length})` : 'NOT_SET')
    console.log('  VITE_COGNITO_IDENTITY_POOL_ID:', fileEnv.VITE_COGNITO_IDENTITY_POOL_ID ? `${fileEnv.VITE_COGNITO_IDENTITY_POOL_ID.substring(0, 20)}... (length: ${fileEnv.VITE_COGNITO_IDENTITY_POOL_ID.length})` : 'NOT_SET')
    console.log('Final values being used:')
    console.log('  VITE_AWS_REGION:', env.VITE_AWS_REGION ? `${env.VITE_AWS_REGION.substring(0, 10)}... (length: ${env.VITE_AWS_REGION.length})` : 'NOT_SET')
    console.log('  VITE_COGNITO_IDENTITY_POOL_ID:', env.VITE_COGNITO_IDENTITY_POOL_ID ? `${env.VITE_COGNITO_IDENTITY_POOL_ID.substring(0, 20)}... (length: ${env.VITE_COGNITO_IDENTITY_POOL_ID.length})` : 'NOT_SET')
    console.log('Values being stringified for define:')
    console.log('  VITE_COGNITO_IDENTITY_POOL_ID stringified:', JSON.stringify(env.VITE_COGNITO_IDENTITY_POOL_ID))
    console.log('  VITE_AWS_REGION stringified:', JSON.stringify(env.VITE_AWS_REGION))
    console.log('  VITE_COGNITO_IDENTITY_POOL_ID type:', typeof env.VITE_COGNITO_IDENTITY_POOL_ID)
    console.log('  VITE_COGNITO_IDENTITY_POOL_ID is empty string?', env.VITE_COGNITO_IDENTITY_POOL_ID === '')
    console.log('  VITE_COGNITO_IDENTITY_POOL_ID is undefined?', env.VITE_COGNITO_IDENTITY_POOL_ID === undefined)
  }

  return {
    plugins: [react()],
    // Explicitly define environment variables to ensure they're embedded
    // Even though Vite automatically exposes VITE_* variables, we define them explicitly
    // to ensure they're properly replaced at build time
    define: {
      'import.meta.env.VITE_AWS_REGION': JSON.stringify(env.VITE_AWS_REGION),
      'import.meta.env.VITE_APPSYNC_ENDPOINT': JSON.stringify(env.VITE_APPSYNC_ENDPOINT),
      'import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID': JSON.stringify(env.VITE_COGNITO_IDENTITY_POOL_ID),
      'import.meta.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify(env.VITE_COGNITO_USER_POOL_ID),
      'import.meta.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID': JSON.stringify(env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID),
      'import.meta.env.VITE_APPSYNC_API_KEY': JSON.stringify(env.VITE_APPSYNC_API_KEY),
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

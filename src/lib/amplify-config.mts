import { Amplify } from 'aws-amplify'

// Helper to access Vite environment variables
// Vite replaces import.meta.env at build time, so this is safe despite TypeScript warnings
const getEnv = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key]
  return value || defaultValue
}

// Amplify configuration for Cognito User Pool authentication
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: getEnv('VITE_COGNITO_USER_POOL_ID'),
      userPoolClientId: getEnv('VITE_COGNITO_USER_POOL_WEB_CLIENT_ID'),
      region: getEnv('VITE_AWS_REGION', 'us-east-1'),
      loginWith: {
        email: true,
        username: true,
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: getEnv('VITE_APPSYNC_ENDPOINT', 'https://api.byteverseinnov.com/graphql'),
      region: getEnv('VITE_AWS_REGION', 'us-east-1'),
      defaultAuthMode: 'apiKey' as const,
      apiKey: getEnv('VITE_APPSYNC_API_KEY')
    }
  }
}

// Configure Amplify
try {
  Amplify.configure(amplifyConfig, {
    ssr: true, // Enable SSR support if needed
  })
} catch (error) {
  console.warn('Amplify configuration failed:', error)
}

export default amplifyConfig

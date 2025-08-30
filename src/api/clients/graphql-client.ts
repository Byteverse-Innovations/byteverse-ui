import { GraphQLClient } from 'graphql-request'

// Get API key from environment variables (works in both Node.js and browser)
const getApiKey = () => {
  // For Node.js environment (codegen, SSR, etc.)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.APPSYNC_API_KEY
  }

  // For browser environment (import.meta.env for Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_APPSYNC_API_KEY
  }

  return undefined
}

// Create a GraphQL client instance
const graphqlClient = new GraphQLClient('https://api.byteverseinnov.com/graphql', {
  headers: {
    'Content-Type': 'application/json',
    ...(getApiKey() && { 'x-api-key': getApiKey() }),
  },
})

export default graphqlClient

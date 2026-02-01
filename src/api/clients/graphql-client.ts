import { GraphQLClient, RequestDocument, Variables } from 'graphql-request'
import { print } from 'graphql'

// Configuration - endpoint has default but can be overridden via env vars for local development
// No authentication needed - API key is injected server-side via CloudFront Function/Lambda@Edge
const getAppSyncConfig = () => {
  // Default endpoint - can be overridden via env vars for local development
  const endpoint = import.meta.env.VITE_APPSYNC_ENDPOINT || 'https://api.byteverseinnov.com/graphql'

  // Debug logging in production to verify values are embedded
  if (import.meta.env.PROD || !import.meta.env.DEV) {
    console.log('[AppSync Config] Endpoint:', endpoint)
  }

  return { endpoint }
}

// Simple GraphQL client that makes HTTP requests
// API key is injected server-side, so no authentication needed in the client
class SimpleGraphQLClient {
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async request<TData = any, TVariables = Variables>(
    documentOrOptions: RequestDocument | { document: RequestDocument; variables?: TVariables; requestHeaders?: HeadersInit },
    variables?: TVariables
  ): Promise<TData> {
    // Handle both call signatures:
    // 1. request(document, variables) - separate parameters
    // 2. request({ document, variables, requestHeaders }) - object parameter
    let document: RequestDocument
    let vars: TVariables | undefined
    
    if (typeof documentOrOptions === 'object' && documentOrOptions !== null && 'document' in documentOrOptions) {
      // Object format: { document, variables, requestHeaders }
      document = documentOrOptions.document
      vars = documentOrOptions.variables as TVariables | undefined
    } else {
      // Separate parameters format: (document, variables)
      document = documentOrOptions as RequestDocument
      vars = variables
    }

    // Parse the GraphQL query string
    let query: string
    if (typeof document === 'string') {
      query = document
    } else {
      // DocumentNode - serialize it back to a string using print()
      query = print(document)
    }
    
    // Validate that we have a query
    if (!query || query.trim().length === 0) {
      throw new Error('GraphQL query cannot be empty')
    }

    // Make the request - API key is injected server-side
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: vars || {},
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `GraphQL request failed: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMessage = errorJson.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ')
        } else {
          errorMessage = errorText
        }
      } catch {
        errorMessage = errorText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()

    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ')
      throw new Error(`GraphQL errors: ${errorMessages}`)
    }

    return result.data as TData
  }
}

const { endpoint } = getAppSyncConfig()
const graphqlClient = new SimpleGraphQLClient(endpoint) as unknown as GraphQLClient

export default graphqlClient

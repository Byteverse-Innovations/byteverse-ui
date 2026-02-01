import { GraphQLClient, RequestDocument, Variables } from 'graphql-request'
import { print } from 'graphql'
import { fetchAuthSession } from 'aws-amplify/auth'

// Configuration - endpoint and API key from environment
const getAppSyncConfig = () => {
  const endpoint = import.meta.env.VITE_APPSYNC_ENDPOINT || 'https://api.byteverseinnov.com/graphql'
  const apiKey = import.meta.env.VITE_APPSYNC_API_KEY

  return { endpoint, apiKey }
}

// GraphQL client that handles both public (API key) and authenticated (Cognito) requests
class AppSyncGraphQLClient {
  private endpoint: string
  private apiKey: string | undefined

  constructor(endpoint: string, apiKey?: string) {
    this.endpoint = endpoint
    this.apiKey = apiKey
  }

  async request<TData = any, TVariables = Variables>(
    documentOrOptions: RequestDocument | { document: RequestDocument; variables?: TVariables; requestHeaders?: HeadersInit },
    variables?: TVariables,
    useAuth: boolean = false // Whether to use Cognito authentication
  ): Promise<TData> {
    // Handle both call signatures
    let document: RequestDocument
    let vars: TVariables | undefined
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (typeof documentOrOptions === 'object' && documentOrOptions !== null && 'document' in documentOrOptions) {
      document = documentOrOptions.document
      vars = documentOrOptions.variables as TVariables | undefined
      if (documentOrOptions.requestHeaders) {
        const headers = documentOrOptions.requestHeaders as Record<string, string>
        Object.assign(requestHeaders, headers)
      }
    } else {
      document = documentOrOptions as RequestDocument
      vars = variables
    }

    // Parse the GraphQL query string
    let query: string
    if (typeof document === 'string') {
      query = document
    } else {
      query = print(document)
    }
    
    if (!query || query.trim().length === 0) {
      throw new Error('GraphQL query cannot be empty')
    }

    // Add authentication headers
    if (useAuth) {
      // Use Cognito User Pool authentication
      try {
        const session = await fetchAuthSession()
        if (session.tokens?.idToken) {
          requestHeaders['Authorization'] = `Bearer ${session.tokens.idToken.toString()}`
        } else {
          throw new Error('Not authenticated. Please sign in.')
        }
      } catch (error) {
        throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      // Use API key for public operations
      if (this.apiKey) {
        requestHeaders['x-api-key'] = this.apiKey
      } else {
        console.warn('API key not configured. Public requests may fail.')
      }
    }

    // Make the request
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: requestHeaders,
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

const { endpoint, apiKey } = getAppSyncConfig()
const graphqlClient = new AppSyncGraphQLClient(endpoint, apiKey) as unknown as GraphQLClient

export default graphqlClient

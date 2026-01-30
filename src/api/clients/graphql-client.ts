import { GraphQLClient, RequestDocument, Variables } from 'graphql-request'
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { HttpRequest } from '@aws-sdk/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types'
import { print } from 'graphql'

// Get configuration from environment variables
const getAppSyncConfig = () => {
  const region = import.meta.env.VITE_AWS_REGION || 'us-east-1'
  const endpoint = import.meta.env.VITE_APPSYNC_ENDPOINT || 'https://api.byteverseinnov.com/graphql'
  const identityPoolId = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID

  return { region, endpoint, identityPoolId }
}

// Cache for credentials provider
let credentialsProvider: Provider<AwsCredentialIdentity> | null = null

// Get AWS credentials provider for unauthenticated access
const getCredentialsProvider = (): Provider<AwsCredentialIdentity> | null => {
  if (credentialsProvider) {
    return credentialsProvider
  }

  const { region, identityPoolId } = getAppSyncConfig()

  if (!identityPoolId) {
    console.warn('VITE_COGNITO_IDENTITY_POOL_ID not set. IAM authentication requires Cognito Identity Pool.')
    console.warn('Please set VITE_COGNITO_IDENTITY_POOL_ID in your .env file or environment variables.')
    return null
  }

  try {
    credentialsProvider = fromCognitoIdentityPool({
      clientConfig: { region },
      identityPoolId,
    })
  } catch (error: any) {
    console.error('Failed to create Cognito Identity Pool provider:', error)
    throw error
  }

  return credentialsProvider
}

// Custom request function that signs requests with AWS Signature Version 4
const signedRequest = async <TData = any, TVariables = Variables>(
  document: RequestDocument,
  variables?: TVariables
): Promise<TData> => {
  const { region, endpoint, identityPoolId } = getAppSyncConfig()
  const credentialsProvider = getCredentialsProvider()

  if (!credentialsProvider) {
    throw new Error('Cognito Identity Pool ID is required for IAM authentication. Please set VITE_COGNITO_IDENTITY_POOL_ID environment variable.')
  }

  // Get credentials with better error handling
  let credentials: AwsCredentialIdentity
  try {
    credentials = await credentialsProvider()
  } catch (error: any) {
    const errorMessage = error?.message || String(error)

    if (errorMessage.includes('Invalid identity pool configuration') ||
      errorMessage.includes('identity pool') ||
      errorMessage.includes('IAM roles')) {
      throw new Error(
        `Cognito Identity Pool configuration error: ${errorMessage}\n\n` +
        `Please verify:\n` +
        `1. Identity Pool ID: ${identityPoolId || 'NOT SET'}\n` +
        `2. Unauthenticated access is enabled in the Identity Pool\n` +
        `3. The unauthenticated IAM role exists and has permissions to access AppSync\n` +
        `4. The IAM role has this policy:\n` +
        `   {\n` +
        `     "Effect": "Allow",\n` +
        `     "Action": ["appsync:GraphQL"],\n` +
        `     "Resource": "arn:aws:appsync:${region}:*:apis/*/*"\n` +
        `   }`
      )
    }

    throw new Error(`Failed to get AWS credentials: ${errorMessage}`)
  }

  // Create signature signer
  const signer = new SignatureV4({
    credentials,
    region,
    service: 'appsync',
    sha256: Sha256,
  })

  // Parse the GraphQL query string
  // Handle both string and DocumentNode types
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

  // Create HTTP request
  const url = new URL(endpoint)
  const request = new HttpRequest({
    method: 'POST',
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname,
    headers: {
      'Content-Type': 'application/json',
      host: url.hostname,
    },
    body: JSON.stringify({
      query,
      variables: variables || {},
    }),
  })

  // Sign the request
  const signedRequest = await signer.sign(request)

  // Make the request
  const response = await fetch(endpoint, {
    method: signedRequest.method,
    headers: signedRequest.headers as HeadersInit,
    body: signedRequest.body as string,
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

// Create a GraphQL client instance with IAM authentication
class IAMGraphQLClient {
  request<TData = any, TVariables = Variables>(
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
      // Note: requestHeaders are not used in IAM authentication as we sign the request ourselves
    } else {
      // Separate parameters format: (document, variables)
      document = documentOrOptions as RequestDocument
      vars = variables
    }
    
    return signedRequest<TData, TVariables>(document, vars)
  }
}

const graphqlClient = new IAMGraphQLClient() as unknown as GraphQLClient

export default graphqlClient

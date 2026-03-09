import { graphqlClient } from './clients'
import type { Quote } from './admin-api'

const GET_QUOTE_BY_TOKEN = `
  query getQuoteByToken($token: String!) {
    getQuoteByToken(token: $token) {
      id clientName clientEmail status total token createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`
const ACCEPT_QUOTE = `
  mutation acceptQuote($id: ID!, $token: String!) {
    acceptQuote(id: $id, token: $token) {
      id clientName clientEmail status total token createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`

export async function getQuoteByToken(token: string): Promise<Quote | null> {
  const data = await graphqlClient.request<{ getQuoteByToken: Quote | null }>(GET_QUOTE_BY_TOKEN, {
    token,
  })
  return data.getQuoteByToken ?? null
}

export async function acceptQuote(id: string, token: string): Promise<Quote | null> {
  const data = await graphqlClient.request<{ acceptQuote: Quote | null }>(ACCEPT_QUOTE, {
    id,
    token,
  })
  return data.acceptQuote ?? null
}

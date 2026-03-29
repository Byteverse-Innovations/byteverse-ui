import { graphqlClient } from './clients'
import type { Quote } from './admin-api'

const LINEITEM_TREE = `
  id title description quantity unitPrice amount serviceId
  subLineItems {
    id title description quantity unitPrice amount serviceId
    subLineItems {
      id title description quantity unitPrice amount serviceId
      subLineItems {
        id title description quantity unitPrice amount serviceId
        subLineItems { id title description quantity unitPrice amount serviceId }
      }
    }
  }
`

const GET_QUOTE_BY_TOKEN = `
  query getQuoteByToken($token: String!) {
    getQuoteByToken(token: $token) {
      id clientName clientEmail status total token quoteAssetsPrefix createdAt updatedAt
      lineItems { ${LINEITEM_TREE} }
      timelineEvents { id chartLabel description startDate endDate lineItemId sortOrder }
    }
  }
`
const ACCEPT_QUOTE = `
  mutation acceptQuote($id: ID!, $token: String!) {
    acceptQuote(id: $id, token: $token) {
      id clientName clientEmail status total token quoteAssetsPrefix createdAt updatedAt
      lineItems { ${LINEITEM_TREE} }
      timelineEvents { id chartLabel description startDate endDate lineItemId sortOrder }
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

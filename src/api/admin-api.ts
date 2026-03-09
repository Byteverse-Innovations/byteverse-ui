import { requestWithAuth } from './clients'

export type LineItem = { description: string; quantity: number; unitPrice: number; amount: number }
export type Quote = {
  id: string
  clientName: string
  clientEmail: string
  status: string
  lineItems: LineItem[]
  total: number
  token?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}
export type Invoice = {
  id: string
  quoteId: string
  clientName: string
  clientEmail: string
  status: string
  lineItems: LineItem[]
  total: number
  dueDate?: string | null
  paidAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

const LIST_QUOTES = `
  query listQuotes {
    listQuotes {
      id clientName clientEmail status total token createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`
const GET_QUOTE = `
  query getQuote($id: ID!) {
    getQuote(id: $id) {
      id clientName clientEmail status total token createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`
const CREATE_QUOTE = `
  mutation createQuote($input: CreateQuoteInput!) {
    createQuote(input: $input) {
      id clientName clientEmail status total token createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`
const UPDATE_QUOTE = `
  mutation updateQuote($id: ID!, $input: UpdateQuoteInput!) {
    updateQuote(id: $id, input: $input) {
      id clientName clientEmail status total token createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`
const DELETE_QUOTE = `
  mutation deleteQuote($id: ID!) {
    deleteQuote(id: $id)
  }
`
const CONVERT_QUOTE_TO_INVOICE = `
  mutation convertQuoteToInvoice($quoteId: ID!) {
    convertQuoteToInvoice(quoteId: $quoteId) {
      id quoteId clientName clientEmail status total dueDate paidAt createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`
const LIST_INVOICES = `
  query listInvoices {
    listInvoices {
      id quoteId clientName clientEmail status total dueDate paidAt createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`
const GET_INVOICE = `
  query getInvoice($id: ID!) {
    getInvoice(id: $id) {
      id quoteId clientName clientEmail status total dueDate paidAt createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`
const MARK_INVOICE_PAID = `
  mutation markInvoicePaid($id: ID!) {
    markInvoicePaid(id: $id) {
      id quoteId clientName clientEmail status total dueDate paidAt createdAt updatedAt
      lineItems { description quantity unitPrice amount }
    }
  }
`

export async function listQuotes(): Promise<Quote[]> {
  const data = await requestWithAuth<{ listQuotes: Quote[] }>(LIST_QUOTES)
  return data.listQuotes ?? []
}

export async function getQuote(id: string): Promise<Quote | null> {
  const data = await requestWithAuth<{ getQuote: Quote | null }>(GET_QUOTE, { id })
  return data.getQuote ?? null
}

export async function createQuote(input: {
  clientName: string
  clientEmail: string
  status: string
  lineItems: LineItem[]
  total: number
}): Promise<Quote> {
  const data = await requestWithAuth<{ createQuote: Quote }>(CREATE_QUOTE, { input })
  if (!data.createQuote) throw new Error('Failed to create quote')
  return data.createQuote
}

export async function updateQuote(
  id: string,
  input: Partial<{ clientName: string; clientEmail: string; status: string; lineItems: LineItem[]; total: number }>
): Promise<Quote> {
  const data = await requestWithAuth<{ updateQuote: Quote | null }>(UPDATE_QUOTE, { id, input })
  if (!data.updateQuote) throw new Error('Failed to update quote')
  return data.updateQuote
}

export async function deleteQuote(id: string): Promise<boolean> {
  const data = await requestWithAuth<{ deleteQuote: boolean }>(DELETE_QUOTE, { id })
  return data.deleteQuote === true
}

export async function convertQuoteToInvoice(quoteId: string): Promise<Invoice> {
  const data = await requestWithAuth<{ convertQuoteToInvoice: Invoice }>(CONVERT_QUOTE_TO_INVOICE, { quoteId })
  if (!data.convertQuoteToInvoice) throw new Error('Failed to convert to invoice')
  return data.convertQuoteToInvoice
}

export async function listInvoices(): Promise<Invoice[]> {
  const data = await requestWithAuth<{ listInvoices: Invoice[] }>(LIST_INVOICES)
  return data.listInvoices ?? []
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const data = await requestWithAuth<{ getInvoice: Invoice | null }>(GET_INVOICE, { id })
  return data.getInvoice ?? null
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  const data = await requestWithAuth<{ markInvoicePaid: Invoice }>(MARK_INVOICE_PAID, { id })
  if (!data.markInvoicePaid) throw new Error('Failed to mark invoice paid')
  return data.markInvoicePaid
}

export type ContactSubmission = {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  subject: string
  message: string
  createdAt?: string | null
}

const LIST_CONTACT_SUBMISSIONS = `
  query listContactSubmissions {
    listContactSubmissions {
      id name email phone company subject message createdAt
    }
  }
`

export async function listContactSubmissions(): Promise<ContactSubmission[]> {
  const data = await requestWithAuth<{ listContactSubmissions: ContactSubmission[] }>(
    LIST_CONTACT_SUBMISSIONS
  )
  return data.listContactSubmissions ?? []
}

export type Service = {
  id: string
  name: string
  description?: string | null
  price?: number | null
  category?: string | null
  servicePillar?: string | null
  pricingModel?: string | null
  targetClient?: string[] | null
  estimatedDuration?: string | null
  showOnMainSite?: boolean | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

const CREATE_SERVICE = `
  mutation createService($input: CreateServiceInput!) {
    createService(input: $input) {
      id name description price category servicePillar pricingModel targetClient estimatedDuration showOnMainSite isActive createdAt updatedAt
    }
  }
`
const UPDATE_SERVICE = `
  mutation updateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id name description price category servicePillar pricingModel targetClient estimatedDuration showOnMainSite isActive createdAt updatedAt
    }
  }
`
const DELETE_SERVICE = `
  mutation deleteService($id: ID!) {
    deleteService(id: $id)
  }
`

export async function createService(input: Record<string, unknown>): Promise<Service> {
  const data = await requestWithAuth<{ createService: Service }>(CREATE_SERVICE, { input })
  if (!data.createService) throw new Error('Failed to create service')
  return data.createService
}

export async function updateService(
  id: string,
  input: Record<string, unknown>
): Promise<Service> {
  const data = await requestWithAuth<{ updateService: Service }>(UPDATE_SERVICE, { id, input })
  if (!data.updateService) throw new Error('Failed to update service')
  return data.updateService
}

export async function deleteService(id: string): Promise<boolean> {
  const data = await requestWithAuth<{ deleteService: boolean }>(DELETE_SERVICE, { id })
  return data.deleteService === true
}

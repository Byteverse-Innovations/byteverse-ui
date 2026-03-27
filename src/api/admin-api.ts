import { requestWithAuth } from './clients'

export type LineItem = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  serviceId?: string | null
}
export type TimelineEvent = {
  id: string
  chartLabel: string
  description?: string | null
  startDate: string
  endDate: string
  lineItemId?: string | null
  sortOrder?: number | null
}
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
  timelineEvents?: TimelineEvent[] | null
  quoteAssetsPrefix?: string | null
}

export type QuoteClientPackageFile = {
  key: string
  fileName: string
  contentType: string
  downloadUrl: string
}

export type QuoteClientPackageDownload = {
  quoteId: string
  prefix: string
  files: QuoteClientPackageFile[]
  expiresAt: string
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
  timelineEvents?: TimelineEvent[] | null
  quoteAssetsPrefix?: string | null
}

const QUOTE_SELECTION = `
  id clientName clientEmail status total token quoteAssetsPrefix createdAt updatedAt
  lineItems { id description quantity unitPrice amount serviceId }
  timelineEvents { id chartLabel description startDate endDate lineItemId sortOrder }
`
const INVOICE_SELECTION = `
  id quoteId clientName clientEmail status total dueDate paidAt createdAt updatedAt quoteAssetsPrefix
  lineItems { id description quantity unitPrice amount serviceId }
  timelineEvents { id chartLabel description startDate endDate lineItemId sortOrder }
`

const LIST_QUOTES = `
  query listQuotes {
    listQuotes {
      ${QUOTE_SELECTION}
    }
  }
`
const GET_QUOTE = `
  query getQuote($id: ID!) {
    getQuote(id: $id) {
      ${QUOTE_SELECTION}
    }
  }
`
const GET_QUOTE_CLIENT_PACKAGE_DOWNLOAD = `
  query getQuoteClientPackageDownload($quoteId: ID!) {
    getQuoteClientPackageDownload(quoteId: $quoteId) {
      quoteId
      prefix
      expiresAt
      files {
        key
        fileName
        contentType
        downloadUrl
      }
    }
  }
`
const CREATE_QUOTE = `
  mutation createQuote($input: CreateQuoteInput!) {
    createQuote(input: $input) {
      ${QUOTE_SELECTION}
    }
  }
`
const UPDATE_QUOTE = `
  mutation updateQuote($id: ID!, $input: UpdateQuoteInput!) {
    updateQuote(id: $id, input: $input) {
      ${QUOTE_SELECTION}
    }
  }
`
const GENERATE_QUOTE_CLIENT_PACKAGE = `
  mutation generateQuoteClientPackage($quoteId: ID!) {
    generateQuoteClientPackage(quoteId: $quoteId) {
      ${QUOTE_SELECTION}
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
      ${INVOICE_SELECTION}
    }
  }
`
const LIST_INVOICES = `
  query listInvoices {
    listInvoices {
      ${INVOICE_SELECTION}
    }
  }
`
const GET_INVOICE = `
  query getInvoice($id: ID!) {
    getInvoice(id: $id) {
      ${INVOICE_SELECTION}
    }
  }
`
const MARK_INVOICE_PAID = `
  mutation markInvoicePaid($id: ID!) {
    markInvoicePaid(id: $id) {
      ${INVOICE_SELECTION}
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

export async function getQuoteClientPackageDownload(
  quoteId: string
): Promise<QuoteClientPackageDownload> {
  const data = await requestWithAuth<{ getQuoteClientPackageDownload: QuoteClientPackageDownload }>(
    GET_QUOTE_CLIENT_PACKAGE_DOWNLOAD,
    { quoteId }
  )
  if (!data.getQuoteClientPackageDownload) {
    throw new Error('Failed to get quote package download')
  }
  return data.getQuoteClientPackageDownload
}

export async function createQuote(input: {
  clientName: string
  clientEmail: string
  status: string
  lineItems: LineItem[]
  total: number
  timelineEvents?: TimelineEvent[]
}): Promise<Quote> {
  const data = await requestWithAuth<{ createQuote: Quote }>(CREATE_QUOTE, { input })
  if (!data.createQuote) throw new Error('Failed to create quote')
  return data.createQuote
}

export async function updateQuote(
  id: string,
  input: Partial<{
    clientName: string
    clientEmail: string
    status: string
    lineItems: LineItem[]
    total: number
    timelineEvents: TimelineEvent[]
  }>
): Promise<Quote> {
  const data = await requestWithAuth<{ updateQuote: Quote | null }>(UPDATE_QUOTE, { id, input })
  if (!data.updateQuote) throw new Error('Failed to update quote')
  return data.updateQuote
}

export async function deleteQuote(id: string): Promise<boolean> {
  const data = await requestWithAuth<{ deleteQuote: boolean }>(DELETE_QUOTE, { id })
  return data.deleteQuote === true
}

export async function generateQuoteClientPackage(quoteId: string): Promise<Quote> {
  const data = await requestWithAuth<{ generateQuoteClientPackage: Quote | null }>(
    GENERATE_QUOTE_CLIENT_PACKAGE,
    { quoteId }
  )
  if (!data.generateQuoteClientPackage) throw new Error('Failed to generate client package')
  return data.generateQuoteClientPackage
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

export type NotionOAuthUrl = { url: string; state: string }
export type NotionIntegrationStatus = {
  connected: boolean
  workspaceName?: string | null
  usesOAuth: boolean
}
export type NotionSyncJob = {
  jobId: string
  tenantId: string
  type: string
  status: string
  serviceId?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  errorMessage?: string | null
}

const NOTION_OAUTH_URL = `
  mutation notionOAuthUrl {
    notionOAuthUrl { url state }
  }
`

const COMPLETE_NOTION_OAUTH = `
  mutation completeNotionOAuth($input: CompleteNotionOAuthInput!) {
    completeNotionOAuth(input: $input) {
      connected
      workspaceName
      usesOAuth
    }
  }
`

const NOTION_INTEGRATION_STATUS = `
  query notionIntegrationStatus {
    notionIntegrationStatus {
      connected
      workspaceName
      usesOAuth
    }
  }
`

const NOTION_SYNC_JOB = `
  query notionSyncJob($id: ID!) {
    notionSyncJob(id: $id) {
      jobId
      tenantId
      type
      status
      serviceId
      createdAt
      updatedAt
      errorMessage
    }
  }
`

const QUEUE_SYNC_SERVICES_FROM_NOTION = `
  mutation queueSyncServicesFromNotion {
    queueSyncServicesFromNotion {
      jobId
      tenantId
      type
      status
      serviceId
      createdAt
      updatedAt
      errorMessage
    }
  }
`

const QUEUE_PUSH_SERVICE_TO_NOTION = `
  mutation queuePushServiceToNotion($serviceId: ID!) {
    queuePushServiceToNotion(serviceId: $serviceId) {
      jobId
      tenantId
      type
      status
      serviceId
      createdAt
      updatedAt
      errorMessage
    }
  }
`

export async function notionOAuthUrl(): Promise<NotionOAuthUrl> {
  const data = await requestWithAuth<{ notionOAuthUrl: NotionOAuthUrl }>(NOTION_OAUTH_URL)
  if (!data.notionOAuthUrl) throw new Error('Failed to start Notion OAuth')
  return data.notionOAuthUrl
}

export async function completeNotionOAuth(input: {
  code: string
  state: string
}): Promise<NotionIntegrationStatus> {
  const data = await requestWithAuth<{ completeNotionOAuth: NotionIntegrationStatus }>(
    COMPLETE_NOTION_OAUTH,
    { input }
  )
  if (!data.completeNotionOAuth) throw new Error('Failed to complete Notion OAuth')
  return data.completeNotionOAuth
}

export async function notionIntegrationStatus(): Promise<NotionIntegrationStatus> {
  const data = await requestWithAuth<{ notionIntegrationStatus: NotionIntegrationStatus }>(
    NOTION_INTEGRATION_STATUS
  )
  return data.notionIntegrationStatus
}

export async function notionSyncJob(id: string): Promise<NotionSyncJob | null> {
  const data = await requestWithAuth<{ notionSyncJob: NotionSyncJob | null }>(NOTION_SYNC_JOB, { id })
  return data.notionSyncJob ?? null
}

export async function queueSyncServicesFromNotion(): Promise<NotionSyncJob> {
  const data = await requestWithAuth<{ queueSyncServicesFromNotion: NotionSyncJob }>(
    QUEUE_SYNC_SERVICES_FROM_NOTION
  )
  if (!data.queueSyncServicesFromNotion) throw new Error('Failed to queue sync')
  return data.queueSyncServicesFromNotion
}

export async function queuePushServiceToNotion(serviceId: string): Promise<NotionSyncJob> {
  const data = await requestWithAuth<{ queuePushServiceToNotion: NotionSyncJob }>(
    QUEUE_PUSH_SERVICE_TO_NOTION,
    { serviceId }
  )
  if (!data.queuePushServiceToNotion) throw new Error('Failed to queue push to Notion')
  return data.queuePushServiceToNotion
}

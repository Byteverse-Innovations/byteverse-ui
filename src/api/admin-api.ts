import { requestWithAuth } from './clients'

export type LineItem = {
  id: string
  title?: string | null
  description: string
  quantity: number
  unitPrice: number
  amount: number
  serviceId?: string | null
  subLineItems?: LineItem[]
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
  /** JSON string — ongoing monthly cost estimate (v1). */
  monthlyCostEstimate?: string | null
  /** Plain text; shown on client quote before line items. */
  quoteSummary?: string | null
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

const LINEITEM_SELECTION = `
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

const QUOTE_SELECTION = `
  id clientName clientEmail status total token quoteAssetsPrefix monthlyCostEstimate quoteSummary createdAt updatedAt
  lineItems { ${LINEITEM_SELECTION} }
  timelineEvents { id chartLabel description startDate endDate lineItemId sortOrder }
`
const INVOICE_SELECTION = `
  id quoteId clientName clientEmail status total dueDate paidAt createdAt updatedAt quoteAssetsPrefix
  lineItems { ${LINEITEM_SELECTION} }
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
  monthlyCostEstimate?: string | null
  quoteSummary?: string | null
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
    monthlyCostEstimate: string | null
    quoteSummary: string | null
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
  quotePushConfigured: boolean
}
export type NotionSyncJob = {
  jobId: string
  tenantId: string
  type: string
  status: string
  serviceId?: string | null
  quoteId?: string | null
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
      quotePushConfigured
    }
  }
`

const NOTION_INTEGRATION_STATUS = `
  query notionIntegrationStatus {
    notionIntegrationStatus {
      connected
      workspaceName
      usesOAuth
      quotePushConfigured
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
      quoteId
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
      quoteId
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
      quoteId
      createdAt
      updatedAt
      errorMessage
    }
  }
`

const QUEUE_PUSH_QUOTE_TO_NOTION = `
  mutation queuePushQuoteToNotion($quoteId: ID!) {
    queuePushQuoteToNotion(quoteId: $quoteId) {
      jobId
      tenantId
      type
      status
      serviceId
      quoteId
      createdAt
      updatedAt
      errorMessage
    }
  }
`

const QUEUE_SYNC_QUOTES_TO_NOTION = `
  mutation queueSyncQuotesToNotion {
    queueSyncQuotesToNotion {
      jobId
      tenantId
      type
      status
      serviceId
      quoteId
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

export async function queuePushQuoteToNotion(quoteId: string): Promise<NotionSyncJob> {
  const data = await requestWithAuth<{ queuePushQuoteToNotion: NotionSyncJob }>(
    QUEUE_PUSH_QUOTE_TO_NOTION,
    { quoteId }
  )
  if (!data.queuePushQuoteToNotion) throw new Error('Failed to queue quote push to Notion')
  return data.queuePushQuoteToNotion
}

export async function queueSyncQuotesToNotion(): Promise<NotionSyncJob> {
  const data = await requestWithAuth<{ queueSyncQuotesToNotion: NotionSyncJob }>(
    QUEUE_SYNC_QUOTES_TO_NOTION
  )
  if (!data.queueSyncQuotesToNotion) throw new Error('Failed to queue Notion quotes sync job')
  return data.queueSyncQuotesToNotion
}

// ---------------- Audit checklists ----------------

export type AuditItem = {
  id: string
  label: string
  description?: string | null
  referenceUrl?: string | null
  remediation?: string | null
  sortOrder?: number | null
}

export type AuditSection = {
  id: string
  title: string
  description?: string | null
  sortOrder?: number | null
  items: AuditItem[]
}

export type AuditTemplate = {
  id: string
  name: string
  description?: string | null
  category?: string | null
  version?: number | null
  sections: AuditSection[]
  createdAt?: string | null
  updatedAt?: string | null
  createdBy?: string | null
}

export type AuditRunItem = {
  id: string
  label: string
  description?: string | null
  referenceUrl?: string | null
  remediation?: string | null
  sortOrder?: number | null
  status?: string | null
  severity?: string | null
  note?: string | null
  evidenceUrl?: string | null
  dueDate?: string | null
  assignee?: string | null
}

export type AuditRunSection = {
  id: string
  title: string
  description?: string | null
  sortOrder?: number | null
  items: AuditRunItem[]
}

export type Audit = {
  id: string
  title: string
  target: string
  clientName?: string | null
  clientEmail?: string | null
  summary?: string | null
  auditor?: string | null
  auditedAt?: string | null
  status: string
  templateId?: string | null
  templateName?: string | null
  templateVersion?: number | null
  sections: AuditRunSection[]
  createdAt?: string | null
  updatedAt?: string | null
  createdBy?: string | null
}

export type AuditItemInput = {
  id?: string | null
  label: string
  description?: string | null
  referenceUrl?: string | null
  remediation?: string | null
  sortOrder?: number | null
}

export type AuditSectionInput = {
  id?: string | null
  title: string
  description?: string | null
  sortOrder?: number | null
  items: AuditItemInput[]
}

export type CreateAuditTemplateInput = {
  name: string
  description?: string | null
  category?: string | null
  sections: AuditSectionInput[]
}

export type UpdateAuditTemplateInput = Partial<CreateAuditTemplateInput>

export type AuditRunItemInput = {
  id?: string | null
  label: string
  description?: string | null
  referenceUrl?: string | null
  remediation?: string | null
  sortOrder?: number | null
  status?: string | null
  severity?: string | null
  note?: string | null
  evidenceUrl?: string | null
  dueDate?: string | null
  assignee?: string | null
}

export type AuditRunSectionInput = {
  id?: string | null
  title: string
  description?: string | null
  sortOrder?: number | null
  items: AuditRunItemInput[]
}

export type CreateAuditInput = {
  title: string
  target: string
  clientName?: string | null
  clientEmail?: string | null
  summary?: string | null
  auditor?: string | null
  auditedAt?: string | null
  status?: string | null
  templateId?: string | null
  templateName?: string | null
  templateVersion?: number | null
  sections?: AuditRunSectionInput[]
}

export type UpdateAuditInput = Partial<CreateAuditInput>

export type UpdateAuditRunItemInput = {
  label?: string
  description?: string | null
  referenceUrl?: string | null
  remediation?: string | null
  status?: string | null
  severity?: string | null
  note?: string | null
  evidenceUrl?: string | null
  dueDate?: string | null
  assignee?: string | null
}

const AUDIT_TEMPLATE_SELECTION = `
  id name description category version createdAt updatedAt createdBy
  sections {
    id title description sortOrder
    items { id label description referenceUrl remediation sortOrder }
  }
`

const AUDIT_SELECTION = `
  id title target clientName clientEmail summary auditor auditedAt status
  templateId templateName templateVersion createdAt updatedAt createdBy
  sections {
    id title description sortOrder
    items {
      id label description referenceUrl remediation sortOrder
      status severity note evidenceUrl dueDate assignee
    }
  }
`

const LIST_AUDIT_TEMPLATES = `
  query listAuditTemplates {
    listAuditTemplates { ${AUDIT_TEMPLATE_SELECTION} }
  }
`
const GET_AUDIT_TEMPLATE = `
  query getAuditTemplate($id: ID!) {
    getAuditTemplate(id: $id) { ${AUDIT_TEMPLATE_SELECTION} }
  }
`
const CREATE_AUDIT_TEMPLATE = `
  mutation createAuditTemplate($input: CreateAuditTemplateInput!) {
    createAuditTemplate(input: $input) { ${AUDIT_TEMPLATE_SELECTION} }
  }
`
const UPDATE_AUDIT_TEMPLATE = `
  mutation updateAuditTemplate($id: ID!, $input: UpdateAuditTemplateInput!) {
    updateAuditTemplate(id: $id, input: $input) { ${AUDIT_TEMPLATE_SELECTION} }
  }
`
const DELETE_AUDIT_TEMPLATE = `
  mutation deleteAuditTemplate($id: ID!) {
    deleteAuditTemplate(id: $id)
  }
`
const SEED_DEFAULT_AUDIT_TEMPLATES = `
  mutation seedDefaultAuditTemplates {
    seedDefaultAuditTemplates { ${AUDIT_TEMPLATE_SELECTION} }
  }
`
const LIST_AUDITS = `
  query listAudits {
    listAudits { ${AUDIT_SELECTION} }
  }
`
const GET_AUDIT = `
  query getAudit($id: ID!) {
    getAudit(id: $id) { ${AUDIT_SELECTION} }
  }
`
const CREATE_AUDIT = `
  mutation createAudit($input: CreateAuditInput!) {
    createAudit(input: $input) { ${AUDIT_SELECTION} }
  }
`
const CREATE_AUDIT_FROM_TEMPLATE = `
  mutation createAuditFromTemplate($templateId: ID!, $input: CreateAuditInput!) {
    createAuditFromTemplate(templateId: $templateId, input: $input) { ${AUDIT_SELECTION} }
  }
`
const UPDATE_AUDIT = `
  mutation updateAudit($id: ID!, $input: UpdateAuditInput!) {
    updateAudit(id: $id, input: $input) { ${AUDIT_SELECTION} }
  }
`
const UPDATE_AUDIT_ITEM = `
  mutation updateAuditItem($auditId: ID!, $sectionId: ID!, $itemId: ID!, $input: UpdateAuditRunItemInput!) {
    updateAuditItem(auditId: $auditId, sectionId: $sectionId, itemId: $itemId, input: $input) { ${AUDIT_SELECTION} }
  }
`
const SET_AUDIT_STATUS = `
  mutation setAuditStatus($id: ID!, $status: AuditStatus!) {
    setAuditStatus(id: $id, status: $status) { ${AUDIT_SELECTION} }
  }
`
const DELETE_AUDIT = `
  mutation deleteAudit($id: ID!) {
    deleteAudit(id: $id)
  }
`

export async function listAuditTemplates(): Promise<AuditTemplate[]> {
  const data = await requestWithAuth<{ listAuditTemplates: AuditTemplate[] }>(LIST_AUDIT_TEMPLATES)
  return data.listAuditTemplates ?? []
}

export async function getAuditTemplate(id: string): Promise<AuditTemplate | null> {
  const data = await requestWithAuth<{ getAuditTemplate: AuditTemplate | null }>(GET_AUDIT_TEMPLATE, { id })
  return data.getAuditTemplate ?? null
}

export async function createAuditTemplate(input: CreateAuditTemplateInput): Promise<AuditTemplate> {
  const data = await requestWithAuth<{ createAuditTemplate: AuditTemplate }>(CREATE_AUDIT_TEMPLATE, { input })
  if (!data.createAuditTemplate) throw new Error('Failed to create audit template')
  return data.createAuditTemplate
}

export async function updateAuditTemplate(
  id: string,
  input: UpdateAuditTemplateInput
): Promise<AuditTemplate> {
  const data = await requestWithAuth<{ updateAuditTemplate: AuditTemplate | null }>(UPDATE_AUDIT_TEMPLATE, {
    id,
    input,
  })
  if (!data.updateAuditTemplate) throw new Error('Failed to update audit template')
  return data.updateAuditTemplate
}

export async function deleteAuditTemplate(id: string): Promise<boolean> {
  const data = await requestWithAuth<{ deleteAuditTemplate: boolean }>(DELETE_AUDIT_TEMPLATE, { id })
  return data.deleteAuditTemplate === true
}

export async function seedDefaultAuditTemplates(): Promise<AuditTemplate[]> {
  const data = await requestWithAuth<{ seedDefaultAuditTemplates: AuditTemplate[] }>(
    SEED_DEFAULT_AUDIT_TEMPLATES
  )
  return data.seedDefaultAuditTemplates ?? []
}

export async function listAudits(): Promise<Audit[]> {
  const data = await requestWithAuth<{ listAudits: Audit[] }>(LIST_AUDITS)
  return data.listAudits ?? []
}

export async function getAudit(id: string): Promise<Audit | null> {
  const data = await requestWithAuth<{ getAudit: Audit | null }>(GET_AUDIT, { id })
  return data.getAudit ?? null
}

export async function createAudit(input: CreateAuditInput): Promise<Audit> {
  const data = await requestWithAuth<{ createAudit: Audit }>(CREATE_AUDIT, { input })
  if (!data.createAudit) throw new Error('Failed to create audit')
  return data.createAudit
}

export async function createAuditFromTemplate(
  templateId: string,
  input: CreateAuditInput
): Promise<Audit> {
  const data = await requestWithAuth<{ createAuditFromTemplate: Audit }>(CREATE_AUDIT_FROM_TEMPLATE, {
    templateId,
    input,
  })
  if (!data.createAuditFromTemplate) throw new Error('Failed to create audit from template')
  return data.createAuditFromTemplate
}

export async function updateAudit(id: string, input: UpdateAuditInput): Promise<Audit> {
  const data = await requestWithAuth<{ updateAudit: Audit | null }>(UPDATE_AUDIT, { id, input })
  if (!data.updateAudit) throw new Error('Failed to update audit')
  return data.updateAudit
}

export async function updateAuditItem(
  auditId: string,
  sectionId: string,
  itemId: string,
  input: UpdateAuditRunItemInput
): Promise<Audit> {
  const data = await requestWithAuth<{ updateAuditItem: Audit | null }>(UPDATE_AUDIT_ITEM, {
    auditId,
    sectionId,
    itemId,
    input,
  })
  if (!data.updateAuditItem) throw new Error('Failed to update audit item')
  return data.updateAuditItem
}

export async function setAuditStatus(id: string, status: string): Promise<Audit> {
  const data = await requestWithAuth<{ setAuditStatus: Audit | null }>(SET_AUDIT_STATUS, { id, status })
  if (!data.setAuditStatus) throw new Error('Failed to set audit status')
  return data.setAuditStatus
}

export async function deleteAudit(id: string): Promise<boolean> {
  const data = await requestWithAuth<{ deleteAudit: boolean }>(DELETE_AUDIT, { id })
  return data.deleteAudit === true
}

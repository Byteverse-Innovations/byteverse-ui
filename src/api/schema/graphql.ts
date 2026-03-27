/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CompleteNotionOAuthInput = {
  code: Scalars['String']['input'];
  state: Scalars['String']['input'];
};

export type ContactFormInput = {
  company?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  subject: Scalars['String']['input'];
};

export type ContactFormResponse = {
  __typename?: 'ContactFormResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ContactSubmission = {
  __typename?: 'ContactSubmission';
  company?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  subject: Scalars['String']['output'];
};

export type CreateInvoiceInput = {
  clientEmail: Scalars['String']['input'];
  clientName: Scalars['String']['input'];
  dueDate?: InputMaybe<Scalars['String']['input']>;
  lineItems: Array<LineItemInput>;
  quoteId: Scalars['String']['input'];
  total: Scalars['Float']['input'];
};

export type CreateQuoteInput = {
  clientEmail: Scalars['String']['input'];
  clientName: Scalars['String']['input'];
  lineItems: Array<LineItemInput>;
  status: QuoteStatus;
  total: Scalars['Float']['input'];
};

export type CreateServiceInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDuration?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  price?: InputMaybe<Scalars['Float']['input']>;
  pricingModel?: InputMaybe<Scalars['String']['input']>;
  servicePillar?: InputMaybe<Scalars['String']['input']>;
  showOnMainSite?: InputMaybe<Scalars['Boolean']['input']>;
  targetClient?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Invoice = {
  __typename?: 'Invoice';
  clientEmail: Scalars['String']['output'];
  clientName: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lineItems: Array<LineItem>;
  paidAt?: Maybe<Scalars['String']['output']>;
  quoteId: Scalars['String']['output'];
  status: InvoiceStatus;
  total: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum InvoiceStatus {
  Overdue = 'OVERDUE',
  Paid = 'PAID',
  Pending = 'PENDING'
}

export type LineItem = {
  __typename?: 'LineItem';
  amount: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type LineItemInput = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
  unitPrice: Scalars['Float']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptQuote?: Maybe<Quote>;
  completeNotionOAuth: NotionIntegrationStatus;
  convertQuoteToInvoice?: Maybe<Invoice>;
  createQuote?: Maybe<Quote>;
  createService?: Maybe<Service>;
  deleteQuote?: Maybe<Scalars['Boolean']['output']>;
  deleteService?: Maybe<Scalars['Boolean']['output']>;
  markInvoicePaid?: Maybe<Invoice>;
  notionOAuthUrl: NotionOAuthUrl;
  persistContactSubmission: ContactSubmission;
  queuePushServiceToNotion: NotionSyncJob;
  queueSyncServicesFromNotion: NotionSyncJob;
  submitContactForm: ContactFormResponse;
  updateQuote?: Maybe<Quote>;
  updateService?: Maybe<Service>;
};


export type MutationAcceptQuoteArgs = {
  id: Scalars['ID']['input'];
  token: Scalars['String']['input'];
};


export type MutationCompleteNotionOAuthArgs = {
  input: CompleteNotionOAuthInput;
};


export type MutationConvertQuoteToInvoiceArgs = {
  quoteId: Scalars['ID']['input'];
};


export type MutationCreateQuoteArgs = {
  input: CreateQuoteInput;
};


export type MutationCreateServiceArgs = {
  input: CreateServiceInput;
};


export type MutationDeleteQuoteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteServiceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkInvoicePaidArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPersistContactSubmissionArgs = {
  input: ContactFormInput;
};


export type MutationQueuePushServiceToNotionArgs = {
  serviceId: Scalars['ID']['input'];
};


export type MutationSubmitContactFormArgs = {
  input: ContactFormInput;
};


export type MutationUpdateQuoteArgs = {
  id: Scalars['ID']['input'];
  input: UpdateQuoteInput;
};


export type MutationUpdateServiceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateServiceInput;
};

export type NotionIntegrationStatus = {
  __typename?: 'NotionIntegrationStatus';
  connected: Scalars['Boolean']['output'];
  usesOAuth: Scalars['Boolean']['output'];
  workspaceName?: Maybe<Scalars['String']['output']>;
};

export type NotionOAuthUrl = {
  __typename?: 'NotionOAuthUrl';
  state: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type NotionSyncJob = {
  __typename?: 'NotionSyncJob';
  createdAt?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  jobId: Scalars['ID']['output'];
  serviceId?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  type: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  getIndividualItem?: Maybe<Service>;
  getInvoice?: Maybe<Invoice>;
  getQuote?: Maybe<Quote>;
  getQuoteByToken?: Maybe<Quote>;
  listAllServices: Array<Service>;
  listContactSubmissions: Array<ContactSubmission>;
  listInvoices: Array<Invoice>;
  listQuotes: Array<Quote>;
  notionIntegrationStatus: NotionIntegrationStatus;
  notionSyncJob?: Maybe<NotionSyncJob>;
};


export type QueryGetIndividualItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetQuoteArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetQuoteByTokenArgs = {
  token: Scalars['String']['input'];
};


export type QueryNotionSyncJobArgs = {
  id: Scalars['ID']['input'];
};

export type Quote = {
  __typename?: 'Quote';
  clientEmail: Scalars['String']['output'];
  clientName: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lineItems: Array<LineItem>;
  status: QuoteStatus;
  token?: Maybe<Scalars['String']['output']>;
  total: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum QuoteStatus {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  Draft = 'DRAFT',
  Sent = 'SENT'
}

export type Service = {
  __typename?: 'Service';
  category?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  estimatedDuration?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  pricingModel?: Maybe<Scalars['String']['output']>;
  servicePillar?: Maybe<Scalars['String']['output']>;
  showOnMainSite?: Maybe<Scalars['Boolean']['output']>;
  targetClient?: Maybe<Array<Scalars['String']['output']>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type UpdateInvoiceInput = {
  paidAt?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<InvoiceStatus>;
};

export type UpdateQuoteInput = {
  clientEmail?: InputMaybe<Scalars['String']['input']>;
  clientName?: InputMaybe<Scalars['String']['input']>;
  lineItems?: InputMaybe<Array<LineItemInput>>;
  status?: InputMaybe<QuoteStatus>;
  total?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateServiceInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDuration?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  pricingModel?: InputMaybe<Scalars['String']['input']>;
  servicePillar?: InputMaybe<Scalars['String']['input']>;
  showOnMainSite?: InputMaybe<Scalars['Boolean']['input']>;
  targetClient?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SubmitContactFormMutationVariables = Exact<{
  input: ContactFormInput;
}>;


export type SubmitContactFormMutation = { __typename?: 'Mutation', submitContactForm: { __typename?: 'ContactFormResponse', success: boolean, message: string } };

export type GetIndividualItemQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetIndividualItemQuery = { __typename?: 'Query', getIndividualItem?: { __typename?: 'Service', category?: string | null, createdAt?: string | null, description?: string | null, isActive?: boolean | null, id: string, name: string, price?: number | null, updatedAt?: string | null, estimatedDuration?: string | null, pricingModel?: string | null, servicePillar?: string | null, showOnMainSite?: boolean | null, targetClient?: Array<string> | null } | null };

export type ListAllServicesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAllServicesQuery = { __typename?: 'Query', listAllServices: Array<{ __typename?: 'Service', category?: string | null, createdAt?: string | null, description?: string | null, isActive?: boolean | null, id: string, name: string, price?: number | null, updatedAt?: string | null, estimatedDuration?: string | null, pricingModel?: string | null, servicePillar?: string | null, showOnMainSite?: boolean | null, targetClient?: Array<string> | null }> };


export const SubmitContactFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"submitContactForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ContactFormInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitContactForm"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<SubmitContactFormMutation, SubmitContactFormMutationVariables>;
export const GetIndividualItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getIndividualItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getIndividualItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedDuration"}},{"kind":"Field","name":{"kind":"Name","value":"pricingModel"}},{"kind":"Field","name":{"kind":"Name","value":"servicePillar"}},{"kind":"Field","name":{"kind":"Name","value":"showOnMainSite"}},{"kind":"Field","name":{"kind":"Name","value":"targetClient"}}]}}]}}]} as unknown as DocumentNode<GetIndividualItemQuery, GetIndividualItemQueryVariables>;
export const ListAllServicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"listAllServices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listAllServices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedDuration"}},{"kind":"Field","name":{"kind":"Name","value":"pricingModel"}},{"kind":"Field","name":{"kind":"Name","value":"servicePillar"}},{"kind":"Field","name":{"kind":"Name","value":"showOnMainSite"}},{"kind":"Field","name":{"kind":"Name","value":"targetClient"}}]}}]}}]} as unknown as DocumentNode<ListAllServicesQuery, ListAllServicesQueryVariables>;
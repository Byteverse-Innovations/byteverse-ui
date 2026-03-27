import { GraphQLClient } from 'graphql-request';
import { RequestInit } from 'graphql-request/dist/types.dom';
import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

function fetcher<TData, TVariables extends { [key: string]: any }>(client: GraphQLClient, query: string, variables?: TVariables, requestHeaders?: RequestInit['headers']) {
  return async (): Promise<TData> => client.request({
    document: query,
    variables,
    requestHeaders
  });
}
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
  timelineEvents?: InputMaybe<Array<TimelineEventInput>>;
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
  quoteAssetsPrefix?: Maybe<Scalars['String']['output']>;
  quoteId: Scalars['String']['output'];
  status: InvoiceStatus;
  timelineEvents?: Maybe<Array<TimelineEvent>>;
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
  id: Scalars['ID']['output'];
  quantity: Scalars['Float']['output'];
  serviceId?: Maybe<Scalars['ID']['output']>;
  unitPrice: Scalars['Float']['output'];
};

export type LineItemInput = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  quantity: Scalars['Float']['input'];
  serviceId?: InputMaybe<Scalars['ID']['input']>;
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
  generateQuoteClientPackage?: Maybe<Quote>;
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


export type MutationGenerateQuoteClientPackageArgs = {
  quoteId: Scalars['ID']['input'];
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
  getQuoteClientPackageDownload: QuoteClientPackageDownload;
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


export type QueryGetQuoteClientPackageDownloadArgs = {
  quoteId: Scalars['ID']['input'];
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
  quoteAssetsPrefix?: Maybe<Scalars['String']['output']>;
  status: QuoteStatus;
  timelineEvents?: Maybe<Array<TimelineEvent>>;
  token?: Maybe<Scalars['String']['output']>;
  total: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type QuoteClientPackageDownload = {
  __typename?: 'QuoteClientPackageDownload';
  expiresAt: Scalars['String']['output'];
  files: Array<QuoteClientPackageFile>;
  prefix: Scalars['String']['output'];
  quoteId: Scalars['ID']['output'];
};

export type QuoteClientPackageFile = {
  __typename?: 'QuoteClientPackageFile';
  contentType: Scalars['String']['output'];
  downloadUrl: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  key: Scalars['String']['output'];
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

export type TimelineEvent = {
  __typename?: 'TimelineEvent';
  chartLabel: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lineItemId?: Maybe<Scalars['ID']['output']>;
  sortOrder?: Maybe<Scalars['Int']['output']>;
  startDate: Scalars['String']['output'];
};

export type TimelineEventInput = {
  chartLabel: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  lineItemId?: InputMaybe<Scalars['ID']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startDate: Scalars['String']['input'];
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
  timelineEvents?: InputMaybe<Array<TimelineEventInput>>;
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



export const SubmitContactFormDocument = `
    mutation submitContactForm($input: ContactFormInput!) {
  submitContactForm(input: $input) {
    success
    message
  }
}
    `;

export const useSubmitContactFormMutation = <
      TError = unknown,
      TContext = unknown
    >(
      client: GraphQLClient,
      options?: UseMutationOptions<SubmitContactFormMutation, TError, SubmitContactFormMutationVariables, TContext>,
      headers?: RequestInit['headers']
    ) => {
    
    return useMutation<SubmitContactFormMutation, TError, SubmitContactFormMutationVariables, TContext>(
      {
    mutationKey: ['submitContactForm'],
    mutationFn: (variables?: SubmitContactFormMutationVariables) => fetcher<SubmitContactFormMutation, SubmitContactFormMutationVariables>(client, SubmitContactFormDocument, variables, headers)(),
    ...options
  }
    )};

export const GetIndividualItemDocument = `
    query getIndividualItem($id: ID!) {
  getIndividualItem(id: $id) {
    category
    createdAt
    description
    isActive
    id
    name
    price
    updatedAt
    estimatedDuration
    pricingModel
    servicePillar
    showOnMainSite
    targetClient
  }
}
    `;

export const useGetIndividualItemQuery = <
      TData = GetIndividualItemQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: GetIndividualItemQueryVariables,
      options?: Omit<UseQueryOptions<GetIndividualItemQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetIndividualItemQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<GetIndividualItemQuery, TError, TData>(
      {
    queryKey: ['getIndividualItem', variables],
    queryFn: fetcher<GetIndividualItemQuery, GetIndividualItemQueryVariables>(client, GetIndividualItemDocument, variables, headers),
    ...options
  }
    )};

export const ListAllServicesDocument = `
    query listAllServices {
  listAllServices {
    category
    createdAt
    description
    isActive
    id
    name
    price
    updatedAt
    estimatedDuration
    pricingModel
    servicePillar
    showOnMainSite
    targetClient
  }
}
    `;

export const useListAllServicesQuery = <
      TData = ListAllServicesQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: ListAllServicesQueryVariables,
      options?: Omit<UseQueryOptions<ListAllServicesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ListAllServicesQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ListAllServicesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['listAllServices'] : ['listAllServices', variables],
    queryFn: fetcher<ListAllServicesQuery, ListAllServicesQueryVariables>(client, ListAllServicesDocument, variables, headers),
    ...options
  }
    )};

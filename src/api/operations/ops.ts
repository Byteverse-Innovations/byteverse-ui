import { GraphQLClient } from 'graphql-request';
import { RequestInit } from 'graphql-request/dist/types.dom';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
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

export type Query = {
  __typename?: 'Query';
  getIndividualItem?: Maybe<Service>;
  listAllServices: Array<Service>;
};


export type QueryGetIndividualItemArgs = {
  id: Scalars['ID']['input'];
};

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

export type GetIndividualItemQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetIndividualItemQuery = { __typename?: 'Query', getIndividualItem?: { __typename?: 'Service', category?: string | null, createdAt?: string | null, description?: string | null, isActive?: boolean | null, id: string, name: string, price?: number | null, updatedAt?: string | null, estimatedDuration?: string | null, pricingModel?: string | null, servicePillar?: string | null, showOnMainSite?: boolean | null, targetClient?: Array<string> | null } | null };

export type ListAllServicesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAllServicesQuery = { __typename?: 'Query', listAllServices: Array<{ __typename?: 'Service', category?: string | null, createdAt?: string | null, description?: string | null, isActive?: boolean | null, id: string, name: string, price?: number | null, updatedAt?: string | null, estimatedDuration?: string | null, pricingModel?: string | null, servicePillar?: string | null, showOnMainSite?: boolean | null, targetClient?: Array<string> | null }> };



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

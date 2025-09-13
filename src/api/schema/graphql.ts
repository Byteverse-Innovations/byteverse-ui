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


export const GetIndividualItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getIndividualItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getIndividualItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedDuration"}},{"kind":"Field","name":{"kind":"Name","value":"pricingModel"}},{"kind":"Field","name":{"kind":"Name","value":"servicePillar"}},{"kind":"Field","name":{"kind":"Name","value":"showOnMainSite"}},{"kind":"Field","name":{"kind":"Name","value":"targetClient"}}]}}]}}]} as unknown as DocumentNode<GetIndividualItemQuery, GetIndividualItemQueryVariables>;
export const ListAllServicesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"listAllServices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listAllServices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedDuration"}},{"kind":"Field","name":{"kind":"Name","value":"pricingModel"}},{"kind":"Field","name":{"kind":"Name","value":"servicePillar"}},{"kind":"Field","name":{"kind":"Name","value":"showOnMainSite"}},{"kind":"Field","name":{"kind":"Name","value":"targetClient"}}]}}]}}]} as unknown as DocumentNode<ListAllServicesQuery, ListAllServicesQueryVariables>;
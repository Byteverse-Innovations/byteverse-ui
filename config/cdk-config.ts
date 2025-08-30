export interface EnvironmentConfig {
  env: {
    account: string
    region: string
  }
  domainName: string
  subdomain: string
}

export const environments: Record<string, EnvironmentConfig> = {
  prod: {
    env: {
      account: '696623242599', // Replace with your AWS account ID
      region: 'us-east-1',
    },
    domainName: 'byteverseinnov.com',
    subdomain: '',
  },
}

export const apiKey = 'da2-zcwrxag3evhdjgpih6ltmnilmm'

// Default config for backward compatibility
export const cdkConfig = environments.prod 
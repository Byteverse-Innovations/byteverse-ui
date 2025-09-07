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
      account: '560873111080', // Replace with your AWS account ID
      region: 'us-east-1',
    },
    domainName: 'byteverseinnov.com',
    subdomain: '',
  },
}

// Default config for backward compatibility
export const cdkConfig = environments.prod 
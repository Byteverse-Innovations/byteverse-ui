#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ByteverseUIStack } from '../lib/byteverse-ui-stack'
import { UIPipelineStack } from '../lib/ui-pipeline-stack'
import { environments } from '../config/cdk-config'

const app = new cdk.App()

// Get environment from command line arguments, default to 'prod'
const environmentName = app.node.tryGetContext('env') || 'prod'
const isPipelineDeploy = app.node.tryGetContext('pipeline') === 'true'

console.log(`Environment: ${environmentName}`)
console.log(`Pipeline deploy: ${isPipelineDeploy}`)

// Get the environment configuration
const environment = environments[environmentName]

if (!environment) {
  throw new Error(`Environment '${environmentName}' not found. Available environments: ${Object.keys(environments).join(', ')}`)
}

const env = {
  account: environment.env.account,
  region: environment.env.region,
}

// Deploy the UI stack
new ByteverseUIStack(app, `ByteverseUIStack-${environmentName}`, {
  env,
  environment,
  stackName: `ByteverseUIStack-${environmentName}`
})

// Deploy the pipeline stack if requested
if (isPipelineDeploy) {
  new UIPipelineStack(app, 'UIPipelineStack', {
    env,
    stackName: 'UIPipelineStack'
  })
}

app.synth() 
# Byteverse UI Deployment Guide

This guide explains how to deploy the Byteverse UI application using AWS CDK and CI/CD pipeline.

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **Domain**: The domain `byteverseinnov.com` should be registered and managed in Route53
3. **GitHub Repository**: The code should be in a GitHub repository
4. **AWS CLI**: Configured with appropriate credentials

## Initial Setup

### 1. Update Configuration

Edit `config/cdk-config.ts` and update the AWS account ID:

```typescript
export const environments: Record<string, EnvironmentConfig> = {
  prod: {
    env: {
      account: 'YOUR_AWS_ACCOUNT_ID', // Replace with your actual AWS account ID
      region: 'us-east-1',
    },
    domainName: 'byteverseinnov.com',
    subdomain: '',
  },
}
```

### 2. Update Pipeline Configuration

Edit `lib/ui-pipeline-stack.ts` and update the GitHub repository details:

```typescript
new codepipeline_actions.CodeStarConnectionsSourceAction({
  actionName: 'GitHub_Source',
  owner: 'your-github-username', // Replace with your GitHub username
  repo: 'byteverse-ui', // Replace with your repository name
  branch: 'main',
  connectionArn: connectionResource.getResponseField('ConnectionArn'),
  output: sourceOutput,
}),
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Bootstrap CDK (First time only)

```bash
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

## Deployment Options

### Option 1: Manual Deployment

Deploy the infrastructure manually:

```bash
# Deploy to production
npm run deploy:prod

# Or use CDK directly
npx cdk deploy --context env=prod --require-approval never
```

### Option 2: GitHub Actions (Recommended)

1. **Set up GitHub Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `AWS_ACCESS_KEY_ID`: Your AWS access key
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
     - `AWS_ACCOUNT_ID`: Your AWS account ID

2. **Push to main branch**:
   - The GitHub Actions workflow will automatically trigger on pushes to the main branch
   - It will build, test, and deploy your application

### Option 3: AWS CodePipeline

Deploy the pipeline infrastructure first:

```bash
npx cdk deploy UIPipelineStack
```

Then set up the GitHub connection in the AWS Console:
1. Go to AWS CodePipeline console
2. Find your pipeline and click on the source action
3. Click "Connect" to set up the GitHub connection
4. Authorize the connection

## Infrastructure Components

The deployment creates the following AWS resources:

- **S3 Bucket**: Hosts the static website files
- **CloudFront Distribution**: CDN for fast global delivery
- **Route53 Records**: DNS configuration for your domain
- **ACM Certificate**: SSL certificate for HTTPS
- **CodePipeline**: CI/CD pipeline for automated deployments
- **CodeBuild Projects**: Build and deployment automation

## URLs

After deployment, your application will be available at:
- Main domain: `https://byteverseinnov.com`
- WWW subdomain: `https://www.byteverseinnov.com`

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Error**: Run `npx cdk bootstrap` first
2. **Permission Errors**: Ensure your AWS credentials have the necessary permissions
3. **Domain Not Found**: Make sure the domain is registered in Route53
4. **Certificate Validation**: Ensure DNS records are properly configured

### Useful Commands

```bash
# Check CDK diff before deployment
npm run diff:prod

# Destroy infrastructure
npm run destroy:prod

# View CDK outputs
npx cdk list

# Check CloudFormation status
aws cloudformation describe-stacks --stack-name ByteverseUIStack-prod
```

## Security Notes

- The S3 bucket is private and only accessible through CloudFront
- HTTPS is enforced for all traffic
- The infrastructure uses AWS best practices for security

## Cost Optimization

- CloudFront is configured for cost optimization (Price Class 100)
- S3 lifecycle policies are configured for automatic cleanup
- Consider setting up CloudWatch alarms for monitoring costs 
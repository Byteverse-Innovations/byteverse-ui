import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as path from 'path'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import { EnvironmentConfig } from '../config/cdk-config'
import { HostedZone, CnameRecord, ARecord, RecordTarget, IHostedZone } from 'aws-cdk-lib/aws-route53'
import * as cdk_route53_targets from 'aws-cdk-lib/aws-route53-targets'

export interface ByteverseUIStackProps extends StackProps {
  environment: EnvironmentConfig
}

export class ByteverseUIStack extends Stack {
  constructor(scope: Construct, id: string, props: ByteverseUIStackProps) {
    super(scope, id, props)
    const { account, region } = props.environment.env
    const { domainName, subdomain } = props.environment

    // Determine the full domain name based on subdomain
    const fullDomainName = subdomain ? `${subdomain}.${domainName}` : domainName
    const wwwDomainName = subdomain ? `www.${subdomain}.${domainName}` : `www.${domainName}`

    // Create Hosted Zone for the domain
    const hostedZone = new HostedZone(this, 'HostedZone', {
      zoneName: domainName,
    })

    // Create certificate
    const certificateName = `WildcardCertificate-${domainName.replace(/\./g, '-')}`

    const certificate = new acm.Certificate(this, 'Certificate', {
      certificateName: certificateName,
      domainName: fullDomainName,
      subjectAlternativeNames: [
        wwwDomainName,
        `*.${domainName}`, // Wildcard for all subdomains
      ],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    })

    // S3 bucket to host the UI
    const uiBucket = new s3.Bucket(this, 'UiBucket', {
      bucketName: `byteverse-ui-${subdomain || 'prod'}-${account}`,
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // CloudFront distribution for the UI
    const distribution = new cloudfront.Distribution(this, `${subdomain || 'prod'}-UiDistribution`, {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(uiBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      domainNames: [fullDomainName, wwwDomainName],
      certificate: certificate,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ]
    })

    // Add a CNAME record for www subdomain
    new CnameRecord(this, 'WwwCnameRecord', {
      zone: hostedZone,
      recordName: wwwDomainName,
      domainName: distribution.distributionDomainName,
    })

    // Add an A record alias for the main domain pointing to CloudFront
    new ARecord(this, 'ApexAliasRecord', {
      zone: hostedZone,
      recordName: fullDomainName,
      target: RecordTarget.fromAlias(
        new cdk_route53_targets.CloudFrontTarget(distribution)
      ),
    })

    // Deploy the built UI code to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployUi', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '..', 'dist'))],
      destinationBucket: uiBucket,
      distribution,
      distributionPaths: ['/*'],
    })

    new CfnOutput(this, 'CloudFrontUrl', {
      value: distribution.distributionDomainName,
      description: 'The CloudFront distribution URL for the UI',
    })

    new CfnOutput(this, 'DomainUrl', {
      value: `https://${fullDomainName}`,
      description: 'The domain URL for the UI',
    })

    new CfnOutput(this, 'WwwDomainUrl', {
      value: `https://${wwwDomainName}`,
      description: 'The www domain URL for the UI',
    })

    new CfnOutput(this, 'S3BucketName', {
      value: uiBucket.bucketName,
      description: 'The S3 bucket name for the UI',
    })

    new CfnOutput(this, 'Environment', {
      value: subdomain || 'prod',
      description: 'The environment name',
    })
  }
} 
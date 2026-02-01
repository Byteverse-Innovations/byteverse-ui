import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { aws_iam, custom_resources } from 'aws-cdk-lib'
import { environments } from '../config/cdk-config'

export class UIPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Artifact buckets
    const artifactBucket = new s3.Bucket(this, 'PipelineArtifactBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    })

    // Source artifact
    const sourceOutput = new codepipeline.Artifact()
    // Build artifact
    const buildOutput = new codepipeline.Artifact()
    // CDK artifacts for each environment
    const cdkOutputProd = new codepipeline.Artifact()

    // Reference the secret in Secrets Manager created by AppsyncStack
    // The secret name is 'byteverse-ui/appsync-config'
    const uiConfigSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'UIConfigSecret',
      'byteverse-ui/env-vars'
    )

    // CodeBuild project for building the UI
    const buildProject = new codebuild.PipelineProject(this, 'UiBuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      // Note: We're not using CodeBuild environment variables anymore
      // Instead, we fetch the secret directly in pre_build phase using AWS CLI
      // This avoids issues with CodeBuild's JSON key resolution
      environmentVariables: {},
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 20
            },
            commands: [
              'npm i --force',
              'echo "Installing jq for JSON parsing..."',
              'yum install -y jq || apt-get update && apt-get install -y jq || echo "jq installation failed, will try without it"'
            ]
          },
          pre_build: {
            commands: [
              'echo "=== Fetching configuration from Secrets Manager ==="',
              'SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id byteverse-ui/env-vars --region us-east-1 --query SecretString --output text)',
              'echo "=== Creating .env file from Secrets Manager ==="',
              'printf "VITE_COGNITO_IDENTITY_POOL_ID=%s\\n" "$(echo $SECRET_JSON | jq -r .VITE_COGNITO_IDENTITY_POOL_ID)" > .env',
              'echo "=== Verifying .env file ==="',
              'cat .env | sed "s/=.*/=***/" || echo ".env file not created"'
            ]
          },
          build: {
            commands: [
              'echo "=== Starting Build ==="',
              'npm run build'
            ]
          }
        },
        artifacts: {
          'base-directory': 'dist',
          files: [
            '**/*'
          ]
        }
      })
    })

    // CodeBuild project for CDK deployment to prod
    const cdkBuildProjectProd = new codebuild.PipelineProject(this, 'CdkBuildProjectProd', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 20
            },
            commands: [
              'npm i --force',
              'npm install -g aws-cdk cdk-assets@latest --force'
            ]
          },
          build: {
            commands: [
              'cdk synth --context env=prod',
              'cdk-assets --path ./cdk.out/ByteverseUIStack-prod.assets.json --verbose publish'
            ]
          }
        },
        artifacts: {
          'base-directory': 'cdk.out',
          files: [
            '**/*'
          ]
        }
      })
    })

    // Grant CDK permissions to build projects
    const cdkPermissions = [cdkBuildProjectProd]

    cdkPermissions.forEach((project, index) => {
      (project.role as aws_iam.Role).attachInlinePolicy(new aws_iam.Policy(this, `CdkBuildProjectPolicy${index}`, {
        statements: [
          new aws_iam.PolicyStatement({
            actions: ['sts:AssumeRole'],
            resources: [`arn:aws:iam::${this.account}:role/cdk-*-file-publishing-role-${this.account}-${this.region}`]
          }),
          new aws_iam.PolicyStatement({
            actions: [
              'route53:ListHostedZonesByName',
              'route53:GetHostedZone',
              'route53:ListHostedZones',
              'route53:ChangeResourceRecordSets',
              'route53:ListResourceRecordSets',
            ],
            resources: ['*']
          })
        ]
      }))
    })

    // Grant permissions to the build projects to access the artifact bucket
    artifactBucket.grantReadWrite(buildProject)
    artifactBucket.grantReadWrite(cdkBuildProjectProd)

    // Grant permissions to read secrets from Secrets Manager
    // This allows the build script to fetch values from the secret created by AppsyncStack
    buildProject?.role?.addToPrincipalPolicy(new aws_iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [uiConfigSecret.secretArn],
    }))

    // Pipeline definition
    const pipeline = new codepipeline.Pipeline(this, 'UIPipeline', {
      artifactBucket,
      pipelineName: 'Byteverse-UI-Pipeline',
      restartExecutionOnUpdate: true,
      pipelineType: codepipeline.PipelineType.V2,
    })

    // Create a custom resource to manage the CodeStar connection
    const connectionResource = new custom_resources.AwsCustomResource(this, 'CodeStarConnection', {
      onCreate: {
        service: 'CodeStarConnections',
        action: 'createConnection',
        parameters: {
          ConnectionName: 'GitHub-Connection',
          ProviderType: 'GitHub'
        },
        physicalResourceId: custom_resources.PhysicalResourceId.fromResponse('ConnectionArn')
      },
      onUpdate: {
        service: 'CodeStarConnections',
        action: 'createConnection',
        parameters: {
          ConnectionName: 'GitHub-Connection',
          ProviderType: 'GitHub'
        },
        physicalResourceId: custom_resources.PhysicalResourceId.fromResponse('ConnectionArn')
      },
      onDelete: {
        service: 'CodeStarConnections',
        action: 'deleteConnection',
        parameters: {
          ConnectionArn: new custom_resources.PhysicalResourceIdReference()
        }
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
        resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE
      })
    })

    // Source stage using CodeStar connection
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.CodeStarConnectionsSourceAction({
          actionName: 'GitHub_Source',
          owner: 'Byteverse-Innovations', // Replace with your GitHub username
          repo: 'byteverse-ui', // Replace with your repository name
          branch: 'main',
          connectionArn: connectionResource.getResponseField('ConnectionArn'),
          output: sourceOutput,
        }),
      ],
    })

    // Build stage
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build_UI',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    })

    // CDK Deploy stage for prod
    pipeline.addStage({
      stageName: 'Deploy_Prod',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'CDK_Deploy_Prod',
          project: cdkBuildProjectProd,
          input: sourceOutput,
          outputs: [cdkOutputProd],
        }),
      ],
    })

    // CloudFormation Deploy stage for prod
    pipeline.addStage({
      stageName: 'Deploy_CloudFormation_Prod',
      actions: [
        new codepipeline_actions.CloudFormationCreateUpdateStackAction({
          actionName: 'Deploy_Stack_Prod',
          stackName: 'ByteverseUIStack-prod',
          templatePath: cdkOutputProd.atPath('ByteverseUIStack-prod.template.json'),
          adminPermissions: true,
        }),
      ],
    })
  }
} 
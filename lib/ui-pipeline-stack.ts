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

    const uiSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      'UISecrets',
      'byteverse-ui/env-vars'
    )

    // CodeBuild project for building the UI
    const buildProject = new codebuild.PipelineProject(this, 'UiBuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      environmentVariables: {
        // All environment variables are now stored in Secrets Manager
        // The secret should contain a JSON object with all VITE_* variables
        // Format: secretArn:jsonKey::
        VITE_AWS_REGION: {
          value: `${uiSecrets.secretArn}:VITE_AWS_REGION::`,
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
        },
        VITE_APPSYNC_ENDPOINT: {
          value: `${uiSecrets.secretArn}:VITE_APPSYNC_ENDPOINT::`,
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
        },
        VITE_COGNITO_IDENTITY_POOL_ID: {
          value: `${uiSecrets.secretArn}:VITE_COGNITO_IDENTITY_POOL_ID::`,
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
        },
        VITE_COGNITO_USER_POOL_ID: {
          value: `${uiSecrets.secretArn}:VITE_COGNITO_USER_POOL_ID::`,
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
        },
        VITE_COGNITO_USER_POOL_WEB_CLIENT_ID: {
          value: `${uiSecrets.secretArn}:VITE_COGNITO_USER_POOL_WEB_CLIENT_ID::`,
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
        },
        VITE_APPSYNC_API_KEY: {
          value: `${uiSecrets.secretArn}:VITE_APPSYNC_API_KEY::`,
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
        },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 20
            },
            commands: [
              'npm i --force'
            ]
          },
          build: {
            commands: [
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
    cdkPermissions.forEach(project => {
      artifactBucket.grantReadWrite(project)
    })

    // Grant permissions to read secrets from Secrets Manager
    uiSecrets.grantRead(buildProject.role as aws_iam.Role)

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
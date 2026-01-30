#!/bin/bash

# Script to update the AWS Secrets Manager secret for Byteverse UI environment variables
# Usage: ./scripts/update-secrets.sh

SECRET_NAME="byteverse-ui/env-vars"
REGION="us-east-1"

# Read values from .env file if it exists
if [ -f .env ]; then
  source .env
fi

# Create JSON object from environment variables
SECRET_JSON=$(cat <<EOF
{
  "VITE_AWS_REGION": "${VITE_AWS_REGION:-us-east-1}",
  "VITE_APPSYNC_ENDPOINT": "${VITE_APPSYNC_ENDPOINT:-https://api.byteverseinnov.com/graphql}",
  "VITE_COGNITO_IDENTITY_POOL_ID": "${VITE_COGNITO_IDENTITY_POOL_ID}",
  "VITE_COGNITO_USER_POOL_ID": "${VITE_COGNITO_USER_POOL_ID}",
  "VITE_COGNITO_USER_POOL_WEB_CLIENT_ID": "${VITE_COGNITO_USER_POOL_WEB_CLIENT_ID}",
  "VITE_APPSYNC_API_KEY": "${VITE_APPSYNC_API_KEY}"
}
EOF
)

# Update the secret
echo "Updating secret: $SECRET_NAME"
aws secretsmanager put-secret-value \
  --secret-id "$SECRET_NAME" \
  --secret-string "$SECRET_JSON" \
  --region "$REGION"

if [ $? -eq 0 ]; then
  echo "Secret updated successfully!"
else
  echo "Error updating secret. Make sure:"
  echo "1. AWS CLI is configured"
  echo "2. You have permissions to update secrets"
  echo "3. The secret exists (it will be created when you deploy the CDK stack)"
fi

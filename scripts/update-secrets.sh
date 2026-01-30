#!/bin/bash

# Script to create or update the AWS Secrets Manager secret for Byteverse UI environment variables
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

# Check if secret exists
echo "Checking if secret exists: $SECRET_NAME"
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$REGION" >/dev/null 2>&1; then
  # Secret exists, update it
  echo "Secret exists. Updating..."
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
    exit 1
  fi
else
  # Secret doesn't exist, create it
  echo "Secret does not exist. Creating new secret..."
  aws secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --description "Environment variables for Byteverse UI build process" \
    --secret-string "$SECRET_JSON" \
    --region "$REGION"
  
  if [ $? -eq 0 ]; then
    echo "Secret created successfully!"
  else
    echo "Error creating secret. Make sure:"
    echo "1. AWS CLI is configured"
    echo "2. You have permissions to create secrets"
    exit 1
  fi
fi

#!/bin/bash

# Deploy infrastructure and services to AWS
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
AWS_REGION=${2:-us-east-1}
PROJECT_NAME="finsight"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying FinSight to AWS${NC}"
echo "Environment: $ENVIRONMENT"
echo "AWS Region: $AWS_REGION"

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Navigate to terraform directory
cd "$(dirname "$0")/../terraform"

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init

# Plan the deployment
echo -e "${YELLOW}Planning Terraform deployment...${NC}"
terraform plan \
    -var="environment=$ENVIRONMENT" \
    -var="aws_region=$AWS_REGION" \
    -out=tfplan

# Ask for confirmation
read -p "Do you want to apply these changes? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Apply the deployment
echo -e "${YELLOW}Applying Terraform changes...${NC}"
terraform apply tfplan

# Get outputs
echo -e "${GREEN}Deployment completed!${NC}"
echo ""
echo "Outputs:"
terraform output

# Clean up plan file
rm -f tfplan

echo -e "${GREEN}Deployment finished successfully!${NC}"


#!/bin/bash

# Update a specific ECS service
# Usage: ./update-service.sh [service-name] [aws-region]

set -e

SERVICE=${1}
AWS_REGION=${2:-us-east-1}
PROJECT_NAME="finsight"
ENVIRONMENT="production"
CLUSTER_NAME="${PROJECT_NAME}-${ENVIRONMENT}-cluster"
SERVICE_NAME="${PROJECT_NAME}-${ENVIRONMENT}-${SERVICE}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$SERVICE" ]; then
    echo -e "${RED}Error: Service name is required${NC}"
    echo "Usage: ./update-service.sh [service-name] [aws-region]"
    exit 1
fi

echo -e "${GREEN}Updating ECS service: ${SERVICE_NAME}${NC}"

# Force new deployment
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --force-new-deployment \
    --region $AWS_REGION

echo -e "${YELLOW}Waiting for service to stabilize...${NC}"

# Wait for service to stabilize
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION

echo -e "${GREEN}Service ${SERVICE_NAME} updated successfully!${NC}"


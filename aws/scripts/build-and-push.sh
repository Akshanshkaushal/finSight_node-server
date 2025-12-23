#!/bin/bash

# Build and push Docker images to ECR
# Usage: ./build-and-push.sh [service-name] [aws-region] [aws-account-id]

set -e

SERVICE=${1:-all}
AWS_REGION=${2:-us-east-1}
AWS_ACCOUNT_ID=${3:-$(aws sts get-caller-identity --query Account --output text)}
PROJECT_NAME="finsight"
ENVIRONMENT="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building and pushing Docker images to ECR${NC}"
echo "AWS Region: $AWS_REGION"
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "Service: $SERVICE"

# Login to ECR
echo -e "${YELLOW}Logging in to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Function to build and push a service
build_and_push() {
    local service=$1
    local ecr_repo="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-${ENVIRONMENT}-${service}"
    
    echo -e "${GREEN}Building ${service}...${NC}"
    
    # Build the image
    docker build -t ${service}:latest \
        -f ${service}/Dockerfile \
        --build-arg SERVICE=${service} \
        .
    
    # Tag the image
    docker tag ${service}:latest ${ecr_repo}:latest
    docker tag ${service}:latest ${ecr_repo}:$(date +%Y%m%d-%H%M%S)
    
    # Push the image
    echo -e "${GREEN}Pushing ${service} to ECR...${NC}"
    docker push ${ecr_repo}:latest
    docker push ${ecr_repo}:$(date +%Y%m%d-%H%M%S)
    
    echo -e "${GREEN}Successfully pushed ${service}${NC}"
}

# Services list
SERVICES=(
    "api-gateway"
    "auth-service"
    "user-service"
    "news-service"
    "finance-engine"
    "advisory-service"
    "notification-service"
    "subscription-service"
    "payment-service"
    "ml-service"
)

if [ "$SERVICE" == "all" ]; then
    for service in "${SERVICES[@]}"; do
        build_and_push $service
    done
else
    if [[ " ${SERVICES[@]} " =~ " ${SERVICE} " ]]; then
        build_and_push $SERVICE
    else
        echo -e "${RED}Error: Service '$SERVICE' not found${NC}"
        echo "Available services: ${SERVICES[@]}"
        exit 1
    fi
fi

echo -e "${GREEN}All images built and pushed successfully!${NC}"


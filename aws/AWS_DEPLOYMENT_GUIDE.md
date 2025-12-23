# AWS Deployment Guide for FinSight

This guide provides step-by-step instructions for deploying the FinSight microservices application to AWS using production-grade infrastructure.

## Architecture Overview

The deployment uses:
- **VPC** with public and private subnets across multiple availability zones
- **ECS Fargate** for containerized microservices
- **RDS PostgreSQL** (6 instances) for relational databases
- **ElastiCache Redis** for caching
- **MSK (Managed Streaming for Kafka)** for event streaming
- **Application Load Balancer** for traffic distribution
- **API Gateway** as the entry point
- **CloudWatch** for monitoring and logging
- **Secrets Manager** for secure credential storage

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Terraform** >= 1.0 installed
4. **Docker** installed (for building images)
5. **Domain name** (optional, for custom domain)

## Step 1: Initial Setup

### 1.1 Configure AWS CLI

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, region, and output format.

### 1.2 Create S3 Bucket for Terraform State

```bash
aws s3 mb s3://finsight-terraform-state --region us-east-1
aws s3api put-bucket-versioning \
    --bucket finsight-terraform-state \
    --versioning-configuration Status=Enabled
```

### 1.3 Create SSL Certificate (Optional but Recommended)

1. Go to AWS Certificate Manager (ACM)
2. Request a public certificate for your domain
3. Complete DNS validation
4. Copy the certificate ARN

## Step 2: Configure Terraform Variables

1. Copy the example variables file:

```bash
cd aws/terraform
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` with your values:

```hcl
aws_region = "us-east-1"
project_name = "finsight"
environment = "production"
vpc_cidr = "10.0.0.0/16"

# RDS Configuration
rds_instance_class = "db.t3.medium"
rds_allocated_storage = 100
rds_multi_az = true

# ElastiCache Configuration
redis_node_type = "cache.t3.medium"

# MSK Configuration
kafka_instance_type = "kafka.t3.small"
kafka_storage_size = 100

# SSL Certificate ARN (from Step 1.3)
certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/xxxxx"

# Secrets (use AWS Secrets Manager in production)
jwt_secret = "your-super-secret-jwt-key"
db_password = "your-secure-database-password"
```

## Step 3: Deploy Infrastructure

### 3.1 Initialize Terraform

```bash
cd aws/terraform
terraform init
```

### 3.2 Review the Plan

```bash
terraform plan
```

Review the changes that will be made.

### 3.3 Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will create:
- VPC with subnets
- Security groups
- RDS instances
- ElastiCache Redis
- MSK Kafka cluster
- ECR repositories
- ECS cluster
- Application Load Balancer
- API Gateway

**Note:** This process takes 20-30 minutes, especially for RDS and MSK.

### 3.4 Save Outputs

```bash
terraform output > ../outputs.txt
```

## Step 4: Build and Push Docker Images

### 4.1 Make Scripts Executable

```bash
chmod +x aws/scripts/*.sh
```

### 4.2 Build and Push All Images

```bash
cd aws/scripts
./build-and-push.sh all us-east-1
```

Or build a specific service:

```bash
./build-and-push.sh api-gateway us-east-1
```

This script will:
1. Login to ECR
2. Build Docker images
3. Tag images with latest and timestamp
4. Push to ECR repositories

## Step 5: Deploy Services to ECS

After infrastructure is deployed, services will be automatically created. However, you need to ensure images are pushed first.

### 5.1 Verify ECS Services

```bash
aws ecs list-services --cluster finsight-production-cluster
```

### 5.2 Check Service Status

```bash
aws ecs describe-services \
    --cluster finsight-production-cluster \
    --services finsight-production-api-gateway
```

### 5.3 View Service Logs

```bash
aws logs tail /ecs/finsight/api-gateway --follow
```

## Step 6: Configure MongoDB

You have two options:

### Option A: MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas cluster
2. Get the connection string
3. Update the ECS task definition with `MONGO_URI` environment variable

### Option B: DocumentDB (AWS Managed)

1. Create a DocumentDB cluster in AWS
2. Update security groups to allow access from ECS
3. Update the ECS task definition

## Step 7: Update ECS Task Definitions

After pushing new images, update services:

```bash
cd aws/scripts
./update-service.sh api-gateway us-east-1
```

## Step 8: Access the Application

### 8.1 Get API Gateway URL

```bash
terraform output api_gateway_url
```

### 8.2 Get ALB DNS Name

```bash
terraform output alb_dns_name
```

### 8.3 Test the API

```bash
curl https://<api-gateway-url>/health
```

## Step 9: Configure Custom Domain (Optional)

1. Create a Route 53 hosted zone (or use existing)
2. Update `domain_name` in `terraform.tfvars`
3. Run `terraform apply`
4. Create DNS record pointing to API Gateway domain

## Security Groups Overview

The deployment creates the following security groups:

1. **ALB Security Group**: Allows HTTP (80) and HTTPS (443) from internet
2. **Application Security Group**: Allows traffic from ALB on ports 3000-3009
3. **RDS Security Group**: Allows PostgreSQL (5432) from application
4. **Redis Security Group**: Allows Redis (6379) from application
5. **Kafka Security Group**: Allows Kafka (9092-9096) from application

## Network Architecture

```
Internet
  │
  ├─ Public Subnets (ALB, NAT Gateways)
  │
  ├─ Private Subnets (ECS Tasks)
  │
  └─ Database Subnets (RDS, ElastiCache, MSK)
```

## Service Communication

- **External → API Gateway → ALB → ECS Services**
- **ECS Services → RDS** (via private subnets)
- **ECS Services → Redis** (via private subnets)
- **ECS Services → Kafka** (via private subnets)
- **ECS Services → ECS Services** (via Service Discovery)

## Monitoring and Logging

### CloudWatch Logs

All services log to CloudWatch:
- `/ecs/finsight/{service-name}`

### CloudWatch Metrics

ECS automatically sends metrics:
- CPU utilization
- Memory utilization
- Task count

### View Logs

```bash
# View logs for a service
aws logs tail /ecs/finsight/api-gateway --follow

# View all logs
aws logs tail /ecs/finsight --follow
```

## Scaling

### Manual Scaling

Update desired count in ECS service:

```bash
aws ecs update-service \
    --cluster finsight-production-cluster \
    --service finsight-production-api-gateway \
    --desired-count 4
```

### Auto Scaling

Configure auto-scaling policies in AWS Console or via Terraform.

## Backup and Recovery

### RDS Backups

- Automated backups enabled (7-day retention)
- Snapshots created before major changes
- Point-in-time recovery available

### Manual Snapshot

```bash
aws rds create-db-snapshot \
    --db-instance-identifier finsight-production-auth \
    --db-snapshot-identifier finsight-auth-manual-$(date +%Y%m%d)
```

## Cost Optimization

1. **Use Fargate Spot** for non-critical services
2. **Reserved Instances** for RDS (if long-term)
3. **S3 Lifecycle Policies** for log retention
4. **CloudWatch Log Retention** (30 days default)

## Troubleshooting

### Service Not Starting

1. Check CloudWatch logs
2. Verify security groups
3. Check task definition
4. Verify ECR image exists

### Database Connection Issues

1. Verify security group rules
2. Check RDS endpoint
3. Verify credentials in Secrets Manager

### Kafka Connection Issues

1. Verify MSK security group
2. Check broker endpoints
3. Verify IAM permissions for MSK

## Cleanup

To destroy all resources:

```bash
cd aws/terraform
terraform destroy
```

**Warning:** This will delete all resources including databases. Ensure you have backups!

## Production Checklist

- [ ] SSL certificate configured
- [ ] Secrets stored in Secrets Manager
- [ ] Database backups enabled
- [ ] Multi-AZ enabled for RDS
- [ ] CloudWatch alarms configured
- [ ] Auto-scaling configured
- [ ] Custom domain configured
- [ ] CORS configured properly
- [ ] Rate limiting configured
- [ ] WAF rules configured (optional)
- [ ] CloudFront distribution (optional)
- [ ] Backup strategy documented
- [ ] Disaster recovery plan

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review Terraform outputs
3. Check AWS service health dashboards
4. Review security group rules

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
2. Configure auto-scaling policies
3. Set up CloudWatch alarms
4. Configure WAF rules
5. Set up CloudFront for CDN
6. Implement blue-green deployments


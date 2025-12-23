# AWS Infrastructure for FinSight

This directory contains all the infrastructure-as-code and deployment scripts needed to deploy FinSight to AWS in a production-grade manner.

## Directory Structure

```
aws/
├── terraform/              # Terraform infrastructure code
│   ├── main.tf            # Main Terraform configuration
│   ├── variables.tf       # Variable definitions
│   ├── outputs.tf         # Output definitions
│   ├── terraform.tfvars.example  # Example variables
│   └── modules/           # Reusable Terraform modules
│       ├── vpc/           # VPC and networking
│       ├── security-groups/  # Security groups
│       ├── rds/           # RDS PostgreSQL instances
│       ├── elasticache/   # ElastiCache Redis
│       ├── msk/           # MSK Kafka cluster
│       ├── ecr/           # ECR repositories
│       ├── ecs/           # ECS cluster and services
│       ├── alb/           # Application Load Balancer
│       └── api-gateway/   # API Gateway
├── scripts/               # Deployment scripts
│   ├── build-and-push.sh  # Build and push Docker images
│   ├── deploy.sh          # Deploy infrastructure
│   └── update-service.sh  # Update ECS service
├── AWS_DEPLOYMENT_GUIDE.md  # Detailed deployment guide
└── README.md             # This file
```

## Quick Start

1. **Configure AWS CLI**
   ```bash
   aws configure
   ```

2. **Create S3 bucket for Terraform state**
   ```bash
   aws s3 mb s3://finsight-terraform-state --region us-east-1
   ```

3. **Configure variables**
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

4. **Deploy infrastructure**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

5. **Build and push images**
   ```bash
   cd ../scripts
   chmod +x *.sh
   ./build-and-push.sh all
   ```

6. **Access your application**
   ```bash
   terraform output api_gateway_url
   ```

## Architecture

### Network Layer
- **VPC** with CIDR 10.0.0.0/16
- **Public Subnets** (ALB, NAT Gateways)
- **Private Subnets** (ECS Tasks)
- **Database Subnets** (RDS, ElastiCache, MSK)

### Compute Layer
- **ECS Fargate** cluster
- **10 Microservices** running as ECS tasks
- **Auto-scaling** ready

### Data Layer
- **6 RDS PostgreSQL** instances (one per service)
- **ElastiCache Redis** cluster (2 nodes, Multi-AZ)
- **MSK Kafka** cluster (3 brokers)

### Application Layer
- **Application Load Balancer** (HTTPS)
- **API Gateway** (HTTP API v2)
- **Service Discovery** (Private DNS)

### Security
- **Security Groups** with least privilege
- **Secrets Manager** for credentials
- **Encryption at rest** and in transit
- **IAM Roles** with minimal permissions

## Services

| Service | Port | CPU | Memory | Desired Count |
|---------|------|-----|--------|---------------|
| api-gateway | 3000 | 512 | 1024 | 2 |
| auth-service | 3001 | 256 | 512 | 2 |
| user-service | 3002 | 256 | 512 | 2 |
| news-service | 3003 | 512 | 1024 | 2 |
| finance-engine | 3004 | 512 | 1024 | 2 |
| advisory-service | 3005 | 256 | 512 | 2 |
| notification-service | 3006 | 256 | 512 | 2 |
| subscription-service | 3007 | 256 | 512 | 2 |
| payment-service | 3008 | 256 | 512 | 2 |
| ml-service | 3009 | 512 | 1024 | 1 |

## Security Groups

1. **ALB SG**: HTTP (80), HTTPS (443) from internet
2. **App SG**: Ports 3000-3009 from ALB
3. **RDS SG**: PostgreSQL (5432) from App SG
4. **Redis SG**: Redis (6379) from App SG
5. **Kafka SG**: Kafka (9092-9096) from App SG

## Cost Estimation

Approximate monthly costs (us-east-1):

- **ECS Fargate**: ~$150-300 (depending on usage)
- **RDS**: ~$200-400 (6 instances, Multi-AZ)
- **ElastiCache**: ~$50-100
- **MSK**: ~$150-300
- **ALB**: ~$20-30
- **API Gateway**: ~$3.50 per million requests
- **Data Transfer**: Variable
- **CloudWatch**: ~$10-20

**Total**: ~$600-1200/month (estimate)

## Monitoring

- **CloudWatch Logs**: All service logs
- **CloudWatch Metrics**: CPU, Memory, Request counts
- **ECS Container Insights**: Enabled
- **RDS Performance Insights**: Enabled

## Backup Strategy

- **RDS**: Automated daily backups (7-day retention)
- **ElastiCache**: Snapshot before changes
- **MSK**: Data replication (3 brokers)

## Scaling

### Manual Scaling
```bash
aws ecs update-service \
    --cluster finsight-production-cluster \
    --service finsight-production-api-gateway \
    --desired-count 4
```

### Auto Scaling
Configure in AWS Console or add Terraform resources for auto-scaling policies.

## Troubleshooting

### Service won't start
1. Check CloudWatch logs: `/ecs/finsight/{service-name}`
2. Verify security groups
3. Check task definition
4. Verify ECR image exists

### Database connection issues
1. Check security group rules
2. Verify RDS endpoint
3. Check Secrets Manager

### High costs
1. Use Fargate Spot for non-critical services
2. Review RDS instance sizes
3. Check CloudWatch log retention
4. Review data transfer costs

## Cleanup

```bash
cd terraform
terraform destroy
```

**Warning**: This deletes all resources including databases!

## Documentation

See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.

## Support

For issues:
1. Check CloudWatch logs
2. Review Terraform outputs
3. Check AWS service health
4. Review security group rules


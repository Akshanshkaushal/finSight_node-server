# Quick Start Guide - AWS Deployment

This is a condensed quick start guide. For detailed instructions, see [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md).

## Prerequisites Checklist

- [ ] AWS Account with admin access
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Terraform >= 1.0 installed
- [ ] Docker installed
- [ ] Domain name (optional)

## 5-Minute Setup

### 1. Create S3 Bucket for Terraform State

```bash
aws s3 mb s3://finsight-terraform-state --region us-east-1
aws s3api put-bucket-versioning \
    --bucket finsight-terraform-state \
    --versioning-configuration Status=Enabled
```

### 2. Configure Variables

```bash
cd aws/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
- Set `jwt_secret` (generate a secure random string)
- Set `db_password` (generate a secure password)
- Set `certificate_arn` (if you have SSL certificate)

### 3. Deploy Infrastructure

```bash
terraform init
terraform plan  # Review changes
terraform apply # Type 'yes' when prompted
```

**Wait 20-30 minutes** for infrastructure to be created.

### 4. Build and Push Docker Images

```bash
cd ../scripts
chmod +x *.sh
./build-and-push.sh all
```

### 5. Get Your API URL

```bash
cd ../terraform
terraform output api_gateway_url
```

### 6. Test Your API

```bash
curl https://<api-gateway-url>/health
```

## Common Commands

### View Service Logs

```bash
aws logs tail /ecs/finsight/api-gateway --follow
```

### Update a Service

```bash
cd aws/scripts
./update-service.sh api-gateway
```

### Scale a Service

```bash
aws ecs update-service \
    --cluster finsight-production-cluster \
    --service finsight-production-api-gateway \
    --desired-count 4
```

### View All Services

```bash
aws ecs list-services --cluster finsight-production-cluster
```

## Troubleshooting

### Service Not Starting
```bash
# Check logs
aws logs tail /ecs/finsight/{service-name} --follow

# Check service status
aws ecs describe-services \
    --cluster finsight-production-cluster \
    --services finsight-production-{service-name}
```

### Database Connection Issues
```bash
# Get RDS endpoints
terraform output rds_endpoints

# Check security groups
aws ec2 describe-security-groups --filters "Name=tag:Name,Values=finsight-production-rds-sg"
```

## Cleanup

```bash
cd aws/terraform
terraform destroy
```

**Warning**: This deletes everything including databases!

## Next Steps

1. Configure MongoDB (DocumentDB or MongoDB Atlas)
2. Set up custom domain
3. Configure auto-scaling
4. Set up CloudWatch alarms
5. Configure CI/CD pipeline

For detailed information, see [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md).


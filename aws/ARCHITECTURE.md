# AWS Architecture for FinSight

## High-Level Architecture

```
Internet
  │
  ├─ AWS API Gateway (HTTP API v2)
  │     │
  │     └─ Application Load Balancer (HTTPS)
  │           │
  │           ├─ ECS Fargate Cluster
  │           │   ├─ API Gateway Service (Port 3000)
  │           │   ├─ Auth Service (Port 3001)
  │           │   ├─ User Service (Port 3002)
  │           │   ├─ News Service (Port 3003)
  │           │   ├─ Finance Engine (Port 3004)
  │           │   ├─ Advisory Service (Port 3005)
  │           │   ├─ Notification Service (Port 3006)
  │           │   ├─ Subscription Service (Port 3007)
  │           │   ├─ Payment Service (Port 3008)
  │           │   └─ ML Service (Port 3009)
  │           │
  │           └─ Service Discovery (Private DNS)
  │
  ├─ VPC (10.0.0.0/16)
  │   ├─ Public Subnets (ALB, NAT)
  │   ├─ Private Subnets (ECS Tasks)
  │   └─ Database Subnets
  │       ├─ RDS PostgreSQL (6 instances)
  │       ├─ ElastiCache Redis
  │       └─ MSK Kafka Cluster
  │
  └─ AWS Services
      ├─ Secrets Manager (JWT, DB passwords)
      ├─ CloudWatch (Logs, Metrics)
      ├─ ECR (Docker images)
      └─ S3 (ALB logs, Terraform state)
```

## Network Architecture

### VPC Structure

```
VPC: 10.0.0.0/16
│
├─ Availability Zone 1
│   ├─ Public Subnet: 10.0.0.0/24
│   ├─ Private Subnet: 10.0.10.0/24
│   └─ Database Subnet: 10.0.20.0/24
│
├─ Availability Zone 2
│   ├─ Public Subnet: 10.0.1.0/24
│   ├─ Private Subnet: 10.0.11.0/24
│   └─ Database Subnet: 10.0.21.0/24
│
└─ Availability Zone 3
    ├─ Public Subnet: 10.0.2.0/24
    ├─ Private Subnet: 10.0.12.0/24
    └─ Database Subnet: 10.0.22.0/24
```

## Security Groups

### ALB Security Group
- **Inbound**: HTTP (80), HTTPS (443) from 0.0.0.0/0
- **Outbound**: All traffic

### Application Security Group
- **Inbound**: Ports 3000-3009 from ALB Security Group
- **Outbound**: All traffic

### RDS Security Group
- **Inbound**: PostgreSQL (5432) from Application Security Group
- **Outbound**: All traffic

### Redis Security Group
- **Inbound**: Redis (6379) from Application Security Group
- **Outbound**: All traffic

### Kafka Security Group
- **Inbound**: Kafka (9092-9096) from Application Security Group
- **Outbound**: All traffic

## Service Communication Flow

### External Request Flow
```
Client → API Gateway → ALB → API Gateway Service → Backend Services
```

### Internal Service Communication
```
Service A → Service Discovery → Service B
```

### Database Access
```
Service → RDS (via Private Subnet)
```

### Cache Access
```
Service → ElastiCache Redis (via Private Subnet)
```

### Event Streaming
```
Service → MSK Kafka (via Private Subnet)
```

## Data Flow

### Authentication Flow
```
1. Client → API Gateway → Auth Service
2. Auth Service → RDS (auth database)
3. Auth Service → JWT Token Generation
4. Response → Client
```

### News Processing Flow
```
1. News Service → External API (cron)
2. News Service → MongoDB (store)
3. News Service → Redis (deduplication)
4. News Service → Kafka (publish event)
5. Finance Engine → Kafka (consume event)
6. Finance Engine → User Service (fetch profiles)
7. Finance Engine → Redis (cache)
8. Finance Engine → Kafka (publish advisory)
9. Advisory Service → Kafka (consume)
10. Advisory Service → RDS (store)
11. Notification Service → Kafka (consume)
12. Notification Service → Email/SMS
```

### Payment Flow
```
1. Client → API Gateway → Payment Service
2. Payment Service → RDS (store payment)
3. Payment Service → Subscription Service (REST)
4. Subscription Service → RDS (update subscription)
5. Subscription Service → Kafka (publish event)
6. Notification Service → Kafka (consume)
7. Notification Service → Email confirmation
```

## High Availability

### Multi-AZ Deployment
- **RDS**: Multi-AZ enabled (automatic failover)
- **ElastiCache**: Multi-AZ with automatic failover
- **MSK**: 3 brokers across 3 AZs
- **ECS**: Tasks distributed across AZs
- **ALB**: Multi-AZ by default

### Auto-Scaling
- **ECS Services**: Configured for auto-scaling based on CPU/Memory
- **RDS**: Can scale vertically (instance class)
- **ElastiCache**: Can scale horizontally (add nodes)

## Disaster Recovery

### Backup Strategy
- **RDS**: Automated daily backups (7-day retention)
- **ElastiCache**: Manual snapshots before changes
- **MSK**: Data replication across brokers
- **Terraform State**: Stored in S3 with versioning

### Recovery Procedures
1. **RDS**: Point-in-time recovery available
2. **ECS**: Redeploy from ECR images
3. **MSK**: Data replicated across brokers
4. **Configuration**: Infrastructure as Code (Terraform)

## Monitoring and Observability

### CloudWatch Logs
- All services log to `/ecs/finsight/{service-name}`
- API Gateway logs to `/aws/apigateway/finsight-production`
- MSK logs to `/aws/msk/finsight-production`

### CloudWatch Metrics
- **ECS**: CPU, Memory, Task count
- **RDS**: CPU, Memory, Connections, IOPS
- **ElastiCache**: CPU, Memory, Evictions
- **MSK**: Broker metrics, Topic metrics
- **ALB**: Request count, Response time, Error rate

### Alarms (Recommended)
- High CPU utilization
- High memory utilization
- Service unhealthy
- Database connection failures
- High error rates

## Cost Optimization

### Compute
- Use Fargate Spot for non-critical services
- Right-size ECS tasks (CPU/Memory)
- Auto-scale based on demand

### Database
- Use Reserved Instances for long-term RDS
- Enable RDS Performance Insights only when needed
- Use appropriate instance classes

### Storage
- S3 lifecycle policies for logs
- CloudWatch log retention (30 days)
- RDS automated backups (7 days)

### Network
- Use VPC endpoints for AWS services (reduce data transfer)
- Optimize ALB routing rules

## Security Best Practices

### Network Security
- Services in private subnets (no direct internet access)
- Security groups with least privilege
- Network ACLs (default deny)

### Data Security
- Encryption at rest (RDS, ElastiCache, MSK)
- Encryption in transit (TLS/SSL)
- Secrets in AWS Secrets Manager
- No hardcoded credentials

### Access Control
- IAM roles with minimal permissions
- No root access
- MFA for console access
- Audit logging enabled

## Scalability

### Horizontal Scaling
- **ECS Services**: Scale tasks based on load
- **ALB**: Automatically scales
- **API Gateway**: Automatically scales

### Vertical Scaling
- **RDS**: Change instance class
- **ElastiCache**: Change node type
- **MSK**: Change instance type

### Performance Optimization
- **Redis**: Caching layer
- **Connection Pooling**: RDS connection pooling
- **CDN**: CloudFront (optional)
- **Database Indexing**: Optimized queries

## Deployment Strategy

### Blue-Green Deployment
1. Deploy new version to new task definition
2. Update service to use new task definition
3. Monitor new tasks
4. Rollback if issues detected

### Canary Deployment
1. Deploy 10% traffic to new version
2. Monitor metrics
3. Gradually increase traffic
4. Full rollout if successful

### Rolling Deployment
1. Update service with new task definition
2. ECS replaces tasks gradually
3. Health checks ensure stability

## Compliance and Governance

### Compliance
- Data encryption (at rest and in transit)
- Audit logging
- Access controls
- Backup and recovery

### Governance
- Infrastructure as Code (Terraform)
- Version control
- Change management
- Documentation

## Future Enhancements

1. **CloudFront CDN** for static assets
2. **WAF** for API protection
3. **Route 53** for DNS management
4. **AWS X-Ray** for distributed tracing
5. **AWS App Mesh** for service mesh
6. **AWS CodePipeline** for CI/CD
7. **AWS Systems Manager** for parameter management
8. **AWS Backup** for centralized backup management


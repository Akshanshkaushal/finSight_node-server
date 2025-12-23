terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "finsight-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "FinSight"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  project_name     = var.project_name
  environment      = var.environment
  vpc_cidr         = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
}

# Security Groups Module
module "security_groups" {
  source = "./modules/security-groups"

  vpc_id              = module.vpc.vpc_id
  project_name        = var.project_name
  environment         = var.environment
  alb_security_group_id = module.alb.alb_security_group_id
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
  db_security_group_id = module.security_groups.rds_security_group_id
  db_instance_class = var.rds_instance_class
  db_allocated_storage = var.rds_allocated_storage
  db_multi_az = var.rds_multi_az
}

# ElastiCache Module
module "elasticache" {
  source = "./modules/elasticache"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
  cache_security_group_id = module.security_groups.redis_security_group_id
  cache_node_type = var.redis_node_type
}

# MSK Module
module "msk" {
  source = "./modules/msk"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
  kafka_security_group_id = module.security_groups.kafka_security_group_id
  kafka_instance_type = var.kafka_instance_type
  kafka_storage_size = var.kafka_storage_size
}

# ECR Repositories
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  services     = var.microservices
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  private_subnets     = module.vpc.private_subnet_ids
  public_subnets      = module.vpc.public_subnet_ids
  alb_security_group_id = module.security_groups.alb_security_group_id
  app_security_group_id = module.security_groups.app_security_group_id
  ecr_repositories    = module.ecr.repository_urls

  # Database endpoints
  rds_endpoints = module.rds.endpoints
  redis_endpoint = module.elasticache.redis_endpoint
  kafka_brokers = module.msk.broker_endpoints
  mongo_uri = var.mongo_uri

  # Secrets
  jwt_secret_arn = aws_secretsmanager_secret.jwt_secret.arn
  db_password_arn = aws_secretsmanager_secret.db_password.arn

  # ALB Listeners
  https_listener_arn = module.alb.https_listener_arn
  http_listener_arn = module.alb.http_listener_arn

  # Services list
  services = var.microservices

  depends_on = [
    module.rds,
    module.elasticache,
    module.msk
  ]
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnet_ids
  certificate_arn = var.certificate_arn
}

# API Gateway
module "api_gateway" {
  source = "./modules/api-gateway"

  project_name    = var.project_name
  environment     = var.environment
  alb_dns_name    = module.alb.alb_dns_name
  alb_listener_arn = module.alb.https_listener_arn
  certificate_arn = var.certificate_arn
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "ecs_logs" {
  for_each = toset(var.microservices)
  name              = "/ecs/${var.project_name}/${each.key}"
  retention_in_days = var.log_retention_days
}

# Secrets Manager
resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.project_name}-${var.environment}-jwt-secret"
  description             = "JWT secret for authentication"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id = aws_secretsmanager_secret.jwt_secret.id
  secret_string = jsonencode({
    jwt_secret = var.jwt_secret
  })
}

resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.project_name}-${var.environment}-db-password"
  description             = "Database password"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    password = var.db_password
  })
}

# Outputs
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "api_gateway_url" {
  value = module.api_gateway.api_gateway_url
}

output "rds_endpoints" {
  value = module.rds.endpoints
}

output "redis_endpoint" {
  value = module.elasticache.redis_endpoint
}

output "kafka_brokers" {
  value = module.msk.broker_endpoints
}

output "ecr_repositories" {
  value = module.ecr.repository_urls
}


variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "finsight"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 100
}

variable "rds_multi_az" {
  description = "Enable RDS Multi-AZ"
  type        = bool
  default     = true
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "kafka_instance_type" {
  description = "MSK Kafka instance type"
  type        = string
  default     = "kafka.t3.small"
}

variable "kafka_storage_size" {
  description = "MSK Kafka storage size in GB"
  type        = number
  default     = 100
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}

variable "jwt_secret" {
  description = "JWT secret (will be stored in Secrets Manager)"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password (will be stored in Secrets Manager)"
  type        = string
  sensitive   = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "microservices" {
  description = "List of microservices"
  type        = list(string)
  default = [
    "api-gateway",
    "auth-service",
    "user-service",
    "news-service",
    "finance-engine",
    "advisory-service",
    "notification-service",
    "subscription-service",
    "payment-service",
    "ml-service"
  ]
}

variable "mongo_uri" {
  description = "MongoDB connection URI (DocumentDB or MongoDB Atlas)"
  type        = string
  default     = ""
}


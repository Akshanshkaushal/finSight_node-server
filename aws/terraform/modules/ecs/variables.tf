variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnets" {
  type = list(string)
}

variable "public_subnets" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "app_security_group_id" {
  type = string
}

variable "ecr_repositories" {
  type = map(string)
}

variable "rds_endpoints" {
  type = map(object({
    address  = string
    port     = number
    database = string
  }))
}

variable "redis_endpoint" {
  type = object({
    primary_endpoint = string
    port             = number
  })
}

variable "kafka_brokers" {
  type = list(string)
}

variable "mongo_uri" {
  type        = string
  description = "MongoDB connection URI (can be DocumentDB or MongoDB Atlas)"
  default     = ""
}

variable "jwt_secret_arn" {
  type = string
}

variable "db_password_arn" {
  type = string
}

variable "https_listener_arn" {
  type        = string
  description = "HTTPS listener ARN (optional)"
  default     = ""
}

variable "http_listener_arn" {
  type        = string
  description = "HTTP listener ARN (fallback if HTTPS not available)"
  default     = ""
}

variable "services" {
  type = list(string)
}


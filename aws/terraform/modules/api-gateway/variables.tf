variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "alb_dns_name" {
  type = string
}

variable "alb_listener_arn" {
  type        = string
  description = "ALB listener ARN (not used but kept for consistency)"
  default     = ""
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN for custom domain"
  default     = ""
}

variable "domain_name" {
  type        = string
  description = "Custom domain name for API Gateway"
  default     = ""
}

